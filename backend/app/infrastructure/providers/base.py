"""Provider 인터페이스 정의 (ABC 기반).

모든 외부 API 연동은 이 인터페이스를 구현하여
교체 가능한 구조를 유지한다.
"""

from abc import ABC, abstractmethod

from app.domain.models.basket import BasketItem
from app.domain.models.plan import PlanItem


class OnlinePriceProvider(ABC):
    """온라인 가격 수집 Provider 인터페이스."""

    @abstractmethod
    async def search_products(
        self,
        item: BasketItem,
        max_results: int = 5,
    ) -> list[PlanItem]:
        """품목에 대한 온라인 상품 후보를 검색한다."""
        ...


class OfflinePriceProvider(ABC):
    """오프라인 가격 수집 Provider 인터페이스."""

    @abstractmethod
    async def get_store_prices(
        self,
        item: BasketItem,
        lat: float,
        lng: float,
        radius_km: float = 3.0,
    ) -> list[PlanItem]:
        """주변 매장의 상품 가격을 조회한다."""
        ...


class STTProvider(ABC):
    """음성 인식(STT) Provider 인터페이스."""

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        """음성 데이터를 텍스트로 변환한다."""
        ...


class PlaceProvider(ABC):
    """장소 검색 Provider 인터페이스."""

    @abstractmethod
    async def search_nearby_stores(
        self,
        lat: float,
        lng: float,
        keyword: str = "마트",
        radius_km: float = 3.0,
    ) -> list[dict]:
        """주변 매장을 검색한다."""
        ...


class WeatherProvider(ABC):
    """날씨 Provider 인터페이스."""

    @abstractmethod
    async def get_current_weather(
        self,
        lat: float,
        lng: float,
    ) -> dict:
        """현재 날씨 정보를 조회한다."""
        ...
