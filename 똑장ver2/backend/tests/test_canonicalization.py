"""CanonicalizationService 테스트."""
import pytest
from src.application.services.canonicalization import CanonicalizationService


@pytest.fixture
def svc():
    return CanonicalizationService()


class TestCanonicalization:
    def test_egg(self, svc):
        assert svc.get_canonical_id("계란", "30구") == "EGG_30"

    def test_egg_alias(self, svc):
        assert svc.get_canonical_id("달걀", None) == "EGG_30"

    def test_milk(self, svc):
        assert svc.get_canonical_id("우유", "1L") == "MILK_1L"

    def test_tofu(self, svc):
        assert svc.get_canonical_id("두부", "300g") == "TOFU_300"

    def test_ramen(self, svc):
        assert svc.get_canonical_id("신라면", "5봉") == "RAMEN_5"

    def test_ramen_generic(self, svc):
        assert svc.get_canonical_id("라면", None) == "RAMEN_5"

    def test_unknown_item(self, svc):
        assert svc.get_canonical_id("치약", None) == "UNKNOWN_ITEM"

    def test_partial_match(self, svc):
        """'신선한 계란' → 'EGG_30' (부분 매칭)."""
        assert svc.get_canonical_id("신선한 계란", "30구") == "EGG_30"
