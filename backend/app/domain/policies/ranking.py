"""플랜 랭킹 정책 — 정렬 기준: 총액 → 커버리지 → 이동시간."""

from app.domain.models.plan import Plan


def rank_plans(plans: list[Plan]) -> list[Plan]:
    """플랜을 정렬 기준에 따라 랭킹.

    정렬 우선순위:
    1. 총액(estimated_total) 오름차순
    2. 커버리지(coverage) 내림차순
    3. (확장) 이동시간 오름차순
    """
    return sorted(
        plans,
        key=lambda p: (p.estimated_total, -p.coverage),
    )
