from typing import Any, Callable, Dict, List, Optional, Protocol, TypeAlias, Union

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
