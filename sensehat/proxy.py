from typing import Any, Optional

from kcp import DataType, KCPHandle, ListenerType


class KcpProxyViewer:
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

    def __getattr__(self, name: str) -> "KcpProxyViewer":
        """Allows DB.path.to.key syntax."""
        return KcpProxyViewer(self._handler, f"{self._path}.{name}")

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
