from __future__ import annotations

from src.application.ranking_engine import RankingEngine, StoreScore
from src.domain.types import PlanType


def _score(
    store_id: str,
    total: int,
    travel: int,
    coverage: float,
) -> StoreScore:
    return StoreScore(
        store_id=store_id,
        store_name=store_id,
        store_address=f"{store_id}-addr",
        total_price_won=total,
        coverage_ratio=coverage,
        travel_minutes=travel,
        distance_km=1.0,
        matched_items=[],
        missing_items=[],
        price_source="mock",
        price_observed_at="2026-02-16T00:00:00+00:00",
    )


def test_lowest_selects_cheapest_store() -> None:
    engine = RankingEngine()
    result = engine.rank([_score("a", 10000, 20, 0.9), _score("b", 9000, 30, 0.9)])
    assert result[PlanType.LOWEST]
    assert result[PlanType.LOWEST].store_id == "b"


def test_nearest_selects_closest_store() -> None:
    engine = RankingEngine()
    result = engine.rank([_score("a", 12000, 15, 0.9), _score("b", 9000, 10, 0.9)])
    assert result[PlanType.NEAREST]
    assert result[PlanType.NEAREST].store_id == "b"


def test_balanced_uses_weighted_score() -> None:
    engine = RankingEngine()
    result = engine.rank(
        [
            _score("cheap_far", 8000, 40, 0.8),
            _score("mid_balanced", 9000, 15, 0.95),
            _score("near_expensive", 12000, 8, 0.9),
        ]
    )
    assert result[PlanType.BALANCED]
    assert result[PlanType.BALANCED].store_id == "mid_balanced"


def test_coverage_below_06_excluded() -> None:
    engine = RankingEngine()
    result = engine.rank([_score("a", 10000, 20, 0.59), _score("b", 11000, 21, 0.7)])
    assert result[PlanType.LOWEST]
    assert result[PlanType.LOWEST].store_id == "b"


def test_coverage_04_fallback_when_no_06() -> None:
    engine = RankingEngine()
    result = engine.rank([_score("a", 10000, 20, 0.45), _score("b", 9000, 30, 0.39)])
    assert result[PlanType.LOWEST]
    assert result[PlanType.LOWEST].store_id == "a"


def test_deduplication_replaces_balanced() -> None:
    engine = RankingEngine()
    result = engine.rank(
        [
            _score("winner", 9000, 10, 0.95),
            _score("backup", 9500, 13, 0.94),
            _score("other", 12000, 40, 0.92),
        ]
    )
    assert result[PlanType.LOWEST]
    assert result[PlanType.NEAREST]
    assert result[PlanType.BALANCED]
    assert result[PlanType.BALANCED].store_id != result[PlanType.LOWEST].store_id
    assert result[PlanType.BALANCED].store_id != result[PlanType.NEAREST].store_id
