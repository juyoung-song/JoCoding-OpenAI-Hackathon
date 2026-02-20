"""도메인 모델 테스트."""
import pytest
from src.domain.models.basket import BasketItem, Basket, ItemMode
from src.domain.models.plan import Plan, PlanItem, PlanType


class TestBasketItem:
    def test_create_default(self):
        item = BasketItem(item_name="계란")
        assert item.item_name == "계란"
        assert item.quantity == 1
        assert item.mode == ItemMode.RECOMMEND
        assert item.brand is None

    def test_create_fixed_mode(self):
        item = BasketItem(item_name="우유", brand="서울우유", mode=ItemMode.FIXED)
        assert item.mode == ItemMode.FIXED
        assert item.brand == "서울우유"

    def test_quantity_validation(self):
        item = BasketItem(item_name="두부", quantity=3)
        assert item.quantity == 3


class TestBasket:
    def test_empty_basket(self):
        b = Basket()
        assert len(b.items) == 0

    def test_basket_with_items(self):
        items = [
            BasketItem(item_name="계란", size="30구"),
            BasketItem(item_name="우유", quantity=2),
        ]
        b = Basket(items=items)
        assert len(b.items) == 2


class TestPlanItem:
    def test_create(self):
        pi = PlanItem(
            item_name="계란", brand=None, size="30구",
            quantity=1, price=7480, store_name="이마트",
        )
        assert pi.price == 7480
        assert pi.is_sold_out is False


class TestPlan:
    def test_create_and_coverage(self):
        items = [
            PlanItem(item_name="계란", brand=None, size="30구",
                     quantity=1, price=7480, store_name="이마트"),
            PlanItem(item_name="우유", brand=None, size="1L",
                     quantity=1, price=2980, store_name="이마트"),
        ]
        plan = Plan(
            plan_type=PlanType.CHEAPEST,
            mart_name="이마트",
            items=items,
            estimated_total=10460,
            coverage=2,
            total_basket_items=3,
            coverage_ratio=0.67,
            explanation="최저가 테스트",
        )
        assert plan.estimated_total == 10460
        assert plan.coverage_ratio == 0.67

    def test_calculate_coverage(self):
        items = [
            PlanItem(item_name="계란", brand=None, size="30구",
                     quantity=1, price=7480, store_name="이마트"),
        ]
        plan = Plan(
            plan_type=PlanType.CHEAPEST,
            mart_name="이마트",
            items=items,
            estimated_total=7480,
            coverage=0,
            total_basket_items=5,
            coverage_ratio=0.0,
            explanation="test",
        )
        plan.calculate_coverage()
        assert plan.coverage == 1
        assert plan.coverage_ratio == 0.2
