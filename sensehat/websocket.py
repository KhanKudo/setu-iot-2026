import asyncio
import inspect
import json
import random
import time
from asyncio.log import logger
from typing import Any, Callable, Dict, List, Optional, Protocol, TypeAlias, Union

import websockets

# Type Aliases for KCP Standard
DataType: TypeAlias = Union[str, int, float, bool, None, Dict[str, Any], List[Any]]
ResultType: TypeAlias = DataType  # In Python, the Promise is represented by the 'await'
SubType: TypeAlias = str  # 'future' | 'now+future' | 'next' | 'now+next' | 'never'
ListenerType: TypeAlias = Callable[[Optional[DataType], str], Any]


class KCPHandle(Protocol):
    """Explicitly defines the KCPHandle standard."""

    async def getter(self, key: str) -> Optional[DataType]: ...
    async def setter(
        self, key: str, value: Optional[DataType] = None
    ) -> Optional[DataType]: ...
    async def subber(
        self, key: Optional[str], listener: ListenerType, sub_type: SubType
    ) -> None: ...


class KisDBClient:
    def __init__(self, url: str, token: str = ""):
        self.url, self.token = url, token
        self._last_token, self.ws = "", None
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

            try:
                # Now _receive_loop can actually use self.ws
                await self._receive_loop()
            except websockets.exceptions.ConnectionClosed:
                logger.warning("Lost connection, reconnecting...")
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
            finally:
                self.ws = None

    async def _request(self, key: str, value: Any = None, has_value: bool = False):
        id_val = int(time.time() * 1e6 + random.randint(0, 1000000))
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
            if isinstance(key, (int, float)):
                fut = self.pending_ids.pop(int(key), None)
                if fut:
                    fut.set_result(value)
            elif key in self.sub_callbacks:
                for cb in self.sub_callbacks[key]:
                    res = cb(value, key)
                    if inspect.isawaitable(res):
                        await res


class KisDBViewer:
    """
    A Python-friendly KisDB path builder.
    Usage:
       await DB.users.count        # Getter
       await DB.users.set(new_map) # Setter
       DB.users.on(callback)       # Subber
    """

    def __init__(self, handler: KCPHandle, path: str = ""):
        self._handler = handler
        self._path = path

    def __getattr__(self, name: str) -> "KisDBViewer":
        """Allows DB.path.to.key syntax."""
        return KisDBViewer(self._handler, f"{self._path}.{name}")

    # def __setattr__(self, name: str, value: Any):
    #     """Allows DB.path.to.key = value syntax."""
    #     asyncio.run(self._handler.setter(f"{self._path}.{name}", value))

    def __await__(self):
        """Allows 'await DB.path.key'."""
        return self._handler.getter(self._path).__await__()

    def __call__(self, value: Optional[DataType] = None) -> Any:
        """Alternative syntax: DB.path(value) to set, DB.path() to get."""
        if value is not None:
            return self._handler.setter(self._path, value)
        return self._handler.getter(self._path)

    # Subscription Helpers (KCP subber wrappers)
    def on(self, callback: ListenerType):
        return self._handler.subber(self._path, callback, "future")

    def onnow(self, callback: ListenerType):
        return self._handler.subber(self._path, callback, "now+future")

    def once(self, callback: ListenerType):
        return self._handler.subber(self._path, callback, "next")

    def oncenow(self, callback: ListenerType):
        return self._handler.subber(self._path, callback, "now+next")

    def off(self, callback: ListenerType):
        return self._handler.subber(self._path, callback, "never")

    def __repr__(self):
        return f"<KisDBViewer path='{self._path}'>"


async def main():
    print("started")
    client = KisDBClient(
        "ws://192.168.0.20:3000/kisdb-ws",
        "94de889064a147c3a960d289356858dc6a384b2a90c04f078a47bd87ddef7137",
    )
    await asyncio.sleep(1)
    DB = KisDBViewer(client)

    # GET
    print(f"DB.x -> {await DB.x}")

    # SET
    await DB.x(99)

    # SUB
    def my_listener(val, key):
        print(f"Changed: {key} -> {val}")

    await DB.x.onnow(my_listener)

    while 1:
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())
