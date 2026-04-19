import asyncio
import inspect
import json
import random
import time
from asyncio.log import logger
from typing import Any, Callable, Dict, List, Optional

import websockets
from kcp import DataType, ListenerType, SubType


class KcpWebSocketClient:
    def __init__(
        self,
        url: str,
        token: str = "",
        connState: Callable[[bool], Any] = lambda x: None,
    ):
        self.url = url
        self.token = token
        self._last_token = ""
        self._onConn = connState
        self.ws = None
        self.pending_ids: Dict[int, asyncio.Future] = {}
        self.sub_callbacks: Dict[str, List[ListenerType]] = {}
        asyncio.create_task(self._connect())

    # --- KCP Standard Implementation ---

    async def getter(self, key: str) -> Optional[DataType]:
        return await self._request(key)

    async def setter(
        self, key: str, value: Optional[DataType] = None
    ) -> Optional[DataType]:
        return await self._request(key, value, has_value=True)

    async def subber(
        self, key: Optional[str], listener: ListenerType, sub_type: SubType
    ) -> None:
        if key is None:
            if self.ws:
                await self.ws.close()
            return

        if sub_type == "never":
            if key in self.sub_callbacks and listener in self.sub_callbacks[key]:
                self.sub_callbacks[key].remove(listener)
        else:
            self.sub_callbacks.setdefault(key, []).append(listener)

        await self.send_raw_data(0, key, sub_type)

    # --- Internal Logic ---

    async def _connect(self):
        """Main connection loop with auto-reconnect."""
        # 'async for' yields the connection object for each successful connection
        async for websocket in websockets.connect(self.url):
            # CRITICAL: Assign the yielded connection to our instance variable
            self.ws = websocket
            self._onConn(True)

            try:
                # Now _receive_loop can actually use self.ws
                await self._receive_loop()
            except websockets.exceptions.ConnectionClosed:
                logger.warning("Lost connection, reconnecting...")
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
            finally:
                self.ws = None
                self._onConn(False)

    async def _request(self, key: str, value: Any = None, has_value: bool = False):
        id_val = int(time.time() * 1e6 + random.randint(0, int(1e6)))
        if has_value:
            id_val *= -1

        loop = asyncio.get_running_loop()
        future = loop.create_future()
        self.pending_ids[id_val] = future

        payload = [id_val, key, value] if has_value else [id_val, key]
        await self.send_raw_data(*payload)
        return await asyncio.wait_for(future, timeout=60.0)

    async def send_raw_data(self, *data):
        if not self.ws:
            return
        if self.token != self._last_token:
            self._last_token = self.token
            await self.ws.send(json.dumps([0, "$token", self.token]))
        await self.ws.send(json.dumps(list(data)))

    async def _receive_loop(self):
        """Processes [key, value] pairs from server."""
        if self.ws is None:
            return

        self._last_token = ""

        for key in self.sub_callbacks:
            # TODO: sub-type should be respected, not just hard-coded.
            await self.send_raw_data(0, key, "now+future")

        async for message in self.ws:
            # print(f"msg: {message}")
            if message == "pong":
                continue
            data = json.loads(message)
            key = data[0]
            value = data[1] if len(data) > 1 else None
            err = data[2] if len(data) > 2 else None
            if err is not None:
                print(f"Received Error: {err}")
            if isinstance(key, (int, float)):
                fut = self.pending_ids.pop(int(key), None)
                if fut:
                    fut.set_result(value)
            elif key in self.sub_callbacks:
                for cb in self.sub_callbacks[key]:
                    res = cb(value, key)
                    if inspect.isawaitable(res):
                        await res
