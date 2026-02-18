"""오프라인 가격 Mock Provider (MVP 용)."""

import random

from app.domain.models.basket import BasketItem
from app.domain.models.plan import PlanItem
from app.infrastructure.providers.base import OfflinePriceProvider

# MVP용 Mock 데이터
MOCK_STORE_PRICES: dict[str, dict[str, int]] = {
    "이마트": {"계란": 7480, "우유": 2980, "두부": 3200, "라면": 4500, "김치": 8900},
    "홈플러스": {"계란": 7200, "우유": 3100, "두부": 2900, "라면": 4200, "김치": 9200},
    "롯데마트": {"계란": 7600, "우유": 2850, "두부": 3100, "라면": 4800, "김치": 8500},
}


class MockOfflineProvider(OfflinePriceProvider):
    """Mock 오프라인 가격 Provider."""

    async def get_store_prices(
        self,
        item: BasketItem,
        lat: float,
        lng: float,
        radius_km: float = 3.0,
    ) -> list[PlanItem]:
        """Mock 데이터에서 가격을 조회."""
        results = []
        for store_name, prices in MOCK_STORE_PRICES.items():
            base_price = prices.get(item.item_name)
            if base_price is None:
                # 모를 경우 랜덤 가격 생성 (일관성 유지를 위해 hash 사용)
                # item_name의 hash를 기반으로 2000~15000 사이 값 생성
                seed = sum(ord(c) for c in item.item_name)
                base_price = 2000 + (seed * 100) % 13000

            results.append(
                PlanItem(
                    item_name=item.item_name,
                    product_name=f"{item.item_name} {item.size or ''}".strip(),
                    brand=item.brand,
                    price=base_price,
                    link=None,
                    source=store_name,
                    available=True,
                )
            )
        return results
