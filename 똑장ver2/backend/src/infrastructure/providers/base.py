from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from src.domain.models.basket import BasketItem
from src.domain.models.plan import PlanItem

class OnlinePriceProvider(ABC):
    @abstractmethod
    async def search_products(self, item: BasketItem, max_results: int = 5) -> List[PlanItem]:
        pass

class OfflinePriceProvider(ABC):
    @abstractmethod
    async def get_store_prices(self, item: BasketItem, lat: float, lng: float, radius_km: float = 3.0) -> List[PlanItem]:
        pass

class STTProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        pass

class PlaceProvider(ABC):
    @abstractmethod
    async def search_nearby_stores(self, lat: float, lng: float, keyword: str = "마트", radius_km: float = 3.0) -> List[Dict]:
        pass

class WeatherProvider(ABC):
    @abstractmethod
    async def get_current_weather(self, lat: float, lng: float) -> Dict:
        pass

class RoutingProvider(ABC):
    @abstractmethod
    async def estimate_route(self, origin: Dict, destination: Dict, mode: str) -> Dict:
        pass
