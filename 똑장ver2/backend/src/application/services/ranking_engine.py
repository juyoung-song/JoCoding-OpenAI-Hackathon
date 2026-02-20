"""랭킹 엔진 — Top3 플랜 선정 (TRD 12절 기반)."""
from __future__ import annotations

from typing import List, Optional

from src.domain.models.plan import Plan, PlanType


class RankingEngine:
    """3종 플랜(Cheapest/Nearest/Balanced) 정책으로 Top3 선정."""

    MIN_COVERAGE = 0.6
    FALLBACK_MIN_COVERAGE = 0.4

    # ── public ──────────────────────────────────────────────────────

    def rank_plans(self, candidates: List[Plan]) -> List[Plan]:
        """
        수집된 플랜 후보군에서 Cheapest / Nearest / Balanced Top3 선정.

        1. 커버리지 필터 (60%, 부족 시 40%)
        2. 각 유형별 최적 1개 선정
        3. BALANCED가 다른 유형과 매장 중복 시 차선책 교체
        """
        if not candidates:
            return []

        # 1) 커버리지 필터
        filtered = self._filter_by_coverage(candidates, self.MIN_COVERAGE)
        if len(filtered) < 3:
            filtered = self._filter_by_coverage(candidates, self.FALLBACK_MIN_COVERAGE)
        if not filtered:
            return []

        # 2) 유형별 최적 선정
        cheapest = self._pick_cheapest(filtered)
        nearest = self._pick_nearest(filtered)
        balanced = self._pick_balanced(filtered)

        # 3) 결과 조립 + 중복 제거
        result = []
        if cheapest:
            result.append(cheapest)
        if nearest:
            result.append(nearest)
        if balanced:
            balanced = self._deduplicate(balanced, result, filtered)
            if balanced:
                result.append(balanced)

        return result[:3]

    # ── private ─────────────────────────────────────────────────────

    @staticmethod
    def _filter_by_coverage(candidates: List[Plan], min_ratio: float) -> List[Plan]:
        return [p for p in candidates if p.coverage_ratio >= min_ratio]

    @staticmethod
    def _pick_cheapest(candidates: List[Plan]) -> Optional[Plan]:
        """total_price ASC → coverage DESC → travel_minutes ASC."""
        if not candidates:
            return None
        best = sorted(
            candidates,
            key=lambda p: (p.estimated_total, -p.coverage, p.travel_minutes or 999),
        )
        plan = best[0].model_copy(update={"plan_type": PlanType.CHEAPEST, "badges": ["최저가"]})
        return plan

    @staticmethod
    def _pick_nearest(candidates: List[Plan]) -> Optional[Plan]:
        """travel_minutes ASC → total_price ASC → coverage DESC."""
        if not candidates:
            return None
        best = sorted(
            candidates,
            key=lambda p: (p.travel_minutes or 999, p.estimated_total, -p.coverage),
        )
        plan = best[0].model_copy(update={"plan_type": PlanType.NEAREST, "badges": ["가까움"]})
        return plan

    def _pick_balanced(self, candidates: List[Plan]) -> Optional[Plan]:
        """0.5*norm_price + 0.3*norm_travel - 0.2*norm_coverage (낮을수록 좋음)."""
        if not candidates:
            return None

        prices = [p.estimated_total for p in candidates]
        travels = [p.travel_minutes or 999 for p in candidates]
        coverages = [p.coverage_ratio for p in candidates]

        price_min, price_max = min(prices), max(prices)
        travel_min, travel_max = min(travels), max(travels)
        cov_min, cov_max = min(coverages), max(coverages)
        price_range = price_max - price_min or 1
        travel_range = travel_max - travel_min or 1
        cov_range = cov_max - cov_min or 1

        scored: list[tuple[float, Plan]] = []
        for p in candidates:
            norm_price = (p.estimated_total - price_min) / price_range
            norm_travel = ((p.travel_minutes or 999) - travel_min) / travel_range
            norm_cov = (p.coverage_ratio - cov_min) / cov_range
            score = 0.5 * norm_price + 0.3 * norm_travel - 0.2 * norm_cov
            scored.append((score, p))

        scored.sort(key=lambda x: x[0])
        plan = scored[0][1].model_copy(update={"plan_type": PlanType.BALANCED, "badges": ["추천"]})
        return plan

    @staticmethod
    def _deduplicate(
        balanced: Plan,
        existing: List[Plan],
        candidates: List[Plan],
    ) -> Optional[Plan]:
        """BALANCED가 기존 선정 결과와 같은 매장이면 차선책으로 교체."""
        existing_marts = {p.mart_name for p in existing}
        if balanced.mart_name not in existing_marts:
            return balanced

        # 차선책 검색
        for p in candidates:
            if p.mart_name not in existing_marts and p.mart_name != balanced.mart_name:
                return p.model_copy(update={"plan_type": PlanType.BALANCED, "badges": ["추천"]})

        # 대안 없으면 그냥 반환
        return balanced
