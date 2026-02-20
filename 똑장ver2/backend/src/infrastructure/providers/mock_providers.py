from typing import List, Dict
import math
from src.infrastructure.providers.base import OfflinePriceProvider, WeatherProvider, RoutingProvider, PlaceProvider
from src.domain.models.basket import BasketItem
from src.domain.models.plan import PlanItem

MOCK_STORE_PRICES = {
    "이마트":   {"계란": 7480, "우유": 2980, "두부": 3200, "삼겹살": 2580, "신라면": 4100, "참이슬": 1680, "비타500": 980},
    "홈플러스": {"계란": 7200, "우유": 3100, "두부": 2900, "삼겹살": 2650, "신라면": 4150, "참이슬": 1710, "비타500": 1050},
    "롯데마트": {"계란": 7600, "우유": 2850, "두부": 3100, "삼겹살": 2480, "신라면": 4050, "참이슬": 1650, "비타500": 1020},
}

class MockOfflineProvider(OfflinePriceProvider):
    async def get_store_prices(self, item: BasketItem, lat: float, lng: float, radius_km: float = 3.0) -> List[PlanItem]:
        # 품목명에 매칭되는 가격 찾기 (간단한 포함 검색)
        results = []
        key_name = item.item_name
        
        # 간단한 매핑
        if "계란" in key_name or "달걀" in key_name: key_name = "계란"
        elif "우유" in key_name: key_name = "우유"
        elif "두부" in key_name: key_name = "두부"
        elif "삼겹살" in key_name: key_name = "삼겹살"
        elif "라면" in key_name: key_name = "신라면"
        elif "참이슬" in key_name or "소주" in key_name: key_name = "참이슬"
        elif "비타500" in key_name.replace(" ", "") or "비타" in key_name: key_name = "비타500"

        for store, prices in MOCK_STORE_PRICES.items():
            price = prices.get(key_name)
            if price:
                results.append(PlanItem(
                    item_name=item.item_name,
                    brand=item.brand,
                    size=item.size or "1개",
                    quantity=item.quantity,
                    price=price * item.quantity,
                    store_name=store,
                    is_sold_out=False
                ))
        return results

class MockWeatherProvider(WeatherProvider):
    async def get_current_weather(self, lat: float, lng: float) -> Dict:
        return {
            "sky": "맑음",
            "temp": 22.5,
            "rain_prob": 0,
            "condition": "Good"
        }

class MockRoutingProvider(RoutingProvider):
    async def estimate_route(self, origin: Dict, destination: Dict, mode: str) -> Dict:
        origin_lat = float(origin.get("lat", 0.0))
        origin_lng = float(origin.get("lng", 0.0))
        dest_lat = float(destination.get("lat", 0.0))
        dest_lng = float(destination.get("lng", 0.0))
        distance_km = _haversine_km(origin_lat, origin_lng, dest_lat, dest_lng)

        if mode == "walk":
            duration = round(distance_km * 1000 * 1.3 / 66.7)
        elif mode == "transit":
            duration = round(distance_km * 4)
        else:
            duration = max(1, round(distance_km / 0.5))

        return {
            "duration_min": max(1, int(duration)),
            "distance_km": round(distance_km, 1),
            "mode": mode
        }

class MockPlaceProvider(PlaceProvider):
    async def search_nearby_stores(self, lat: float, lng: float, keyword: str = "마트", radius_km: float = 3.0) -> List[Dict]:
        return [
            {"name": "이마트 역삼점", "lat": lat + 0.01, "lng": lng + 0.01, "category": "대형마트"},
            {"name": "홈플러스 강남점", "lat": lat - 0.01, "lng": lng - 0.01, "category": "대형마트"},
        ]


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
