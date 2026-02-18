"""몰별 최저가 비교 서비스."""

from app.domain.models.basket import BasketItem
from app.domain.models.plan import Plan, PlanItem
from app.infrastructure.providers.naver_shopping import NaverShoppingProvider

# 몰 별칭 매핑 (정규화)
MALL_ALIASES = {
    "kurly": ["컬리", "마켓컬리", "Kurly", "뷰티컬리"],
    "homeplus": ["홈플러스", "Homeplus", "Homeplus Special"],
    "emart": ["이마트", "이마트몰", "SSG", "SSG.COM", "신세계몰", "트레이더스", "노브랜드"],
    "coupang": ["쿠팡", "Coupang", "쿠팡로켓"],
    "lotte": ["롯데마트", "롯데ON", "롯데온"],
}

# 분석 대상 몰 (Top 3)
TARGET_MALL_KEYS = ["emart", "homeplus", "kurly"]


class MallComparisonService:
    def __init__(self):
        self.provider = NaverShoppingProvider()

    async def compare_basket(self, basket_items: list[BasketItem]) -> list[Plan]:
        """장바구니 품목을 각 몰별로 검색하여 비교 플랜을 생성한다."""
        
        # 1. 모든 아이템에 대해 검색 수행 (병렬 처리 가능하지만 일단 순차)
        # item_name -> search_results
        search_cache = {}
        
        for item in basket_items:
            # 각 아이템별 80개 검색 (NaverShoppingProvider가 이미 로직 가짐)
            # 주요 3사 몰을 최대한 찾도록 요청
            results = await self.provider.search_products(
                item, 
                max_results=80,
                required_keywords=["이마트", "홈플러스", "컬리"] 
            )
            search_cache[item.item_name] = results

        # 2. 몰별 플랜 생성
        plans = []
        
        for mall_key in TARGET_MALL_KEYS:
            plan = self._create_mall_plan(mall_key, basket_items, search_cache)
            plans.append(plan)

        # 총액 순 정렬
        plans.sort(key=lambda p: p.estimated_total)
        
        return plans

    def _create_mall_plan(
        self, 
        mall_key: str, 
        items: list[BasketItem], 
        search_cache: dict[str, list[PlanItem]]
    ) -> Plan:
        """특정 몰에 대한 플랜 생성."""
        aliases = MALL_ALIASES.get(mall_key, [])
        plan_items = []
        total_cost = 0
        missing_count = 0
        
        mall_display_names = {
            "emart": "이마트몰 (SSG)",
            "homeplus": "홈플러스",
            "kurly": "마켓컬리",
            "coupang": "쿠팡",
            "lotte": "롯데마트"
        }
        mall_name = mall_display_names.get(mall_key, mall_key)

        for item in items:
            candidates = search_cache.get(item.item_name, [])
            
            # 해당 몰의 상품만 필터링
            mall_candidates = [
                c for c in candidates 
                if any(alias in c.source for alias in aliases)
            ]
            
            if mall_candidates:
                # 최저가 선택 (이미 정렬되어 있다고 가정 or 재정렬)
                mall_candidates.sort(key=lambda x: x.price)
                best = mall_candidates[0]
                
                # 수량 반영
                final_price = best.price * item.quantity
                
                # PlanItem 복제 및 수량/총액 조정
                # (PlanItem은 Pydantic 모델이라 copy 필요, 여기선 재생성)
                selected = best.model_copy(update={"price": final_price}) 
                # 주의: PlanItem.price는 '단가'인가 '총액'인가? 
                # 기존 로직은 PlanItem에 quantity 필드가 없었음. 
                # 하지만 UI는 Total Price를 보여줌. 
                # 여기서는 '해당 품목의 총 구매가'로 설정.
                
                plan_items.append(selected)
                total_cost += final_price
            else:
                missing_count += 1
                # 누락된 경우... 표시?
                # 현재 PlanItem 구조상 'unavailable' 표시 가능
                # unavailable item 추가
                plan_items.append(PlanItem(
                    item_name=item.item_name,
                    product_name=f"{item.item_name} (미판매)",
                    brand=item.brand,
                    price=0,
                    link=None,
                    source=mall_name,
                    available=False
                ))

        # 커버리지 계산
        total_count = len(items)
        # coverage = (total_count - missing_count) # logic was: int(...) if ...
        coverage = total_count - missing_count

        from app.domain.models.plan import PlanType

        # 마트별 장바구니/메인 URL 매핑 (MVP)
        # 딥링크(Universal Link)가 있다면 좋겠지만, 우선 웹 URL 기준
        cart_links = {
            "emart": "https://m.ssg.com/cart/dcart.ssg",
            "homeplus": "https://front.homeplus.co.kr/cart",
            "kurly": "https://www.kurly.com/cart",
            "coupang": "https://mc.coupang.com/",
            "lotte": "https://www.lotteon.com/display/ec/m/cart/cartList"
        }
        
        return Plan(
            plan_type=PlanType.CHEAPEST, # Default type for simple mart comparison
            mart_name=mall_name,
            # mart_icon logic needed? generate_plans has it. 
            # We can leave icon logic to generate_plans or move it here. 
            # For now, let's keep basic fields.
            items=plan_items,
            estimated_total=total_cost,
            coverage=coverage,
            total_basket_items=total_count,
            cart_url=cart_links.get(mall_key),
            badges=[f"{mall_name} 최저가"],
            explanation=f"{mall_name}에서 {total_count}개 중 {coverage}개 품목을 구매할 수 있습니다. 예상 총액은 {total_cost:,}원입니다."
        )
