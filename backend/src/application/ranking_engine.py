# 매장 랭킹 엔진 (기획서 섹션 7.2 랭킹 정책)
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from src.domain.types import MatchedItem, MissingItem, PlanType


@dataclass
class StoreScore:
    """매장별 평가 결과."""

    store_id: str
    store_name: str
    store_address: str
    total_price_won: int
    coverage_ratio: float
    travel_minutes: int
    distance_km: float
    matched_items: list[MatchedItem]
    missing_items: list[MissingItem]
    price_source: str
    price_observed_at: str
    balanced_score: float = 0.0


class RankingEngine:
    """Top3 플랜 선정 엔진.

    기획서 7.2 정책:
    - lowest: total_price_won ASC, coverage_ratio DESC, travel_minutes ASC
    - nearest: travel_minutes ASC, total_price_won ASC, coverage_ratio DESC
    - balanced: 0.5*norm_price + 0.3*norm_travel - 0.2*norm_coverage (낮을수록 좋음)

    기획서 7.3: coverage < 0.6이면 기본 제외 (후보 부족 시 0.4까지 허용)
    """

    MIN_COVERAGE = 0.6
    FALLBACK_MIN_COVERAGE = 0.4

    def rank(self, candidates: list[StoreScore]) -> dict[PlanType, Optional[StoreScore]]:
        """후보 매장들을 3종 랭킹 정책으로 평가하여 Top1씩 반환."""
        if not candidates:
            return {PlanType.LOWEST: None, PlanType.NEAREST: None, PlanType.BALANCED: None}

        # 커버리지 필터
        filtered = [c for c in candidates if c.coverage_ratio >= self.MIN_COVERAGE]
        if not filtered:
            # 후보 부족 시 0.4까지 허용 (기획서 7.3)
            filtered = [c for c in candidates if c.coverage_ratio >= self.FALLBACK_MIN_COVERAGE]
        if not filtered:
            return {PlanType.LOWEST: None, PlanType.NEAREST: None, PlanType.BALANCED: None}

        # balanced 점수 계산을 위한 정규화
        self._compute_balanced_scores(filtered)

        # lowest: 가격 오름차순 → 커버리지 내림차순 → 이동시간 오름차순
        lowest = sorted(
            filtered,
            key=lambda c: (c.total_price_won, -c.coverage_ratio, c.travel_minutes),
        )

        # nearest: 이동시간 오름차순 → 가격 오름차순 → 커버리지 내림차순
        nearest = sorted(
            filtered,
            key=lambda c: (c.travel_minutes, c.total_price_won, -c.coverage_ratio),
        )

        # balanced: balanced_score 오름차순
        balanced = sorted(filtered, key=lambda c: c.balanced_score)

        result = {
            PlanType.LOWEST: lowest[0],
            PlanType.NEAREST: nearest[0],
            PlanType.BALANCED: balanced[0],
        }

        # 동일 매장 중복 제거: balanced가 lowest/nearest와 같으면 차선책으로 교체
        self._deduplicate(result, filtered)

        return result

    def _compute_balanced_scores(self, candidates: list[StoreScore]) -> None:
        """기획서 7.2 balanced 점수 계산.

        score = 0.5 * norm_price + 0.3 * norm_travel - 0.2 * norm_coverage
        정규화: min-max (0~1), 후보가 1개면 모두 0.5 처리
        """
        if len(candidates) <= 1:
            for c in candidates:
                c.balanced_score = 0.0
            return

        prices = [c.total_price_won for c in candidates]
        travels = [c.travel_minutes for c in candidates]
        coverages = [c.coverage_ratio for c in candidates]

        price_range = max(prices) - min(prices) or 1
        travel_range = max(travels) - min(travels) or 1
        coverage_range = max(coverages) - min(coverages) or 1

        for c in candidates:
            norm_price = (c.total_price_won - min(prices)) / price_range
            norm_travel = (c.travel_minutes - min(travels)) / travel_range
            norm_coverage = (c.coverage_ratio - min(coverages)) / coverage_range
            c.balanced_score = 0.5 * norm_price + 0.3 * norm_travel - 0.2 * norm_coverage

    def _deduplicate(
        self, result: dict[PlanType, Optional[StoreScore]], candidates: list[StoreScore]
    ) -> None:
        """같은 매장이 여러 플랜에 선정된 경우 balanced를 차선책으로 교체."""
        if not result[PlanType.BALANCED]:
            return

        used_stores = set()
        if result[PlanType.LOWEST]:
            used_stores.add(result[PlanType.LOWEST].store_id)
        if result[PlanType.NEAREST]:
            used_stores.add(result[PlanType.NEAREST].store_id)

        if result[PlanType.BALANCED].store_id in used_stores:
            # balanced 차선책 찾기
            balanced_sorted = sorted(candidates, key=lambda c: c.balanced_score)
            for candidate in balanced_sorted:
                if candidate.store_id not in used_stores:
                    result[PlanType.BALANCED] = candidate
                    break
