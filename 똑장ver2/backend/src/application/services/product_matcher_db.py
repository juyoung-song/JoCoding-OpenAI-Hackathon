"""DB 기반 품목 매칭 서비스.

`E:\\AI\\똑장\\backend`의 ProductMatcher 구조를 `ver2` 모델에 맞게 이식한 버전.
"""
from __future__ import annotations

import difflib
import json
import re
from dataclasses import dataclass
from typing import Optional

import aiosqlite

from src.domain.models.basket import BasketItem


@dataclass
class MatchResult:
    product_norm_key: str
    normalized_name: str
    brand: Optional[str]
    size_display: Optional[str]
    category: Optional[str]
    score: float


class ProductMatcherDB:
    """BasketItem을 product_norm_key에 매칭."""

    _MIN_MATCH_SCORE = 0.35
    _TOKEN_RE = re.compile(r"[0-9a-zA-Z가-힣]+")
    _SIZE_RE = re.compile(
        r"(\d+(?:\.\d+)?)\s*(kg|g|mg|l|ml|ea|구|리터|밀리리터|모|포기|단)",
        re.IGNORECASE,
    )

    def __init__(self, db: aiosqlite.Connection) -> None:
        self._db = db

    async def match(
        self,
        item: BasketItem,
        preferred_brands: Optional[list[str]] = None,
        disliked_brands: Optional[list[str]] = None,
    ) -> Optional[MatchResult]:
        """BasketItem을 product_norm에서 검색 기반으로 매칭."""
        candidates = await self._fetch_candidates(item.item_name)
        if not candidates:
            return None

        scored = sorted(
            candidates,
            key=lambda c: self._score_candidate(c, item, preferred_brands, disliked_brands),
            reverse=True,
        )
        best = scored[0]
        score = self._score_candidate(best, item, preferred_brands, disliked_brands)
        if score < self._MIN_MATCH_SCORE:
            return None

        # 브랜드 지정 시 브랜드 우선
        if item.brand:
            brand_filtered = [c for c in scored if self._is_brand_match(c.get("brand"), item.brand)]
            if brand_filtered:
                best = brand_filtered[0]
                score = self._score_candidate(best, item, preferred_brands, disliked_brands)

        # 사이즈 지정 시 사이즈 우선
        if item.size:
            size_filtered = [c for c in scored if self._is_size_match(c.get("size_display"), item.size)]
            if size_filtered:
                best = size_filtered[0]
                score = self._score_candidate(best, item, preferred_brands, disliked_brands)

        return MatchResult(
            product_norm_key=best["product_norm_key"],
            normalized_name=best["normalized_name"],
            brand=best.get("brand"),
            size_display=best.get("size_display"),
            category=best.get("category"),
            score=round(score, 4),
        )

    async def _fetch_candidates(self, query: str) -> list[dict]:
        tokens = [t for t in self._tokenize(query) if len(t) >= 2]
        patterns = [query, *tokens[:3]]
        seen: set[str] = set()
        results: list[dict] = []

        for pattern in patterns:
            rows = await self._db.execute(
                """SELECT * FROM product_norm
                   WHERE normalized_name LIKE ? OR aliases_json LIKE ?
                   ORDER BY normalized_name LIMIT 80""",
                (f"%{pattern}%", f"%{pattern}%"),
            )
            for row in await rows.fetchall():
                row_dict = dict(row)
                key = row_dict["product_norm_key"]
                if key in seen:
                    continue
                seen.add(key)
                results.append(row_dict)

        if results:
            return results

        rows = await self._db.execute("SELECT * FROM product_norm ORDER BY normalized_name LIMIT 200")
        return [dict(row) for row in await rows.fetchall()]

    def _score_candidate(
        self,
        candidate: dict,
        item: BasketItem,
        preferred_brands: Optional[list[str]] = None,
        disliked_brands: Optional[list[str]] = None,
    ) -> float:
        query = self._normalize(item.item_name)
        name = self._normalize(candidate.get("normalized_name"))
        aliases = [self._normalize(a) for a in self._parse_aliases(candidate.get("aliases_json"))]

        name_sim = difflib.SequenceMatcher(None, query, name).ratio() if query and name else 0.0
        alias_sim = max((difflib.SequenceMatcher(None, query, a).ratio() for a in aliases), default=0.0)
        max_sim = max(name_sim, alias_sim)

        query_tokens = set(self._tokenize(item.item_name))
        text_tokens = set(self._tokenize(candidate.get("normalized_name")))
        for alias in self._parse_aliases(candidate.get("aliases_json")):
            text_tokens.update(self._tokenize(alias))
        token_overlap = (len(query_tokens & text_tokens) / len(query_tokens)) if query_tokens else 0.0

        contains_bonus = 0.0
        if query and (query in name or any(query in a for a in aliases)):
            contains_bonus += 0.18
        if name and query and name in query:
            contains_bonus += 0.1

        score = 0.55 * max_sim + 0.25 * token_overlap + contains_bonus

        if item.brand:
            score += 0.25 if self._is_brand_match(candidate.get("brand"), item.brand) else -0.15
        if item.size:
            score += 0.2 if self._is_size_match(candidate.get("size_display"), item.size) else -0.1

        candidate_brand = self._normalize(candidate.get("brand"))
        preferred = {self._normalize(v) for v in (preferred_brands or []) if v}
        disliked = {self._normalize(v) for v in (disliked_brands or []) if v}
        if candidate_brand and preferred and candidate_brand in preferred:
            score += 0.12
        if candidate_brand and disliked and candidate_brand in disliked:
            score -= 0.2

        return score

    def _parse_aliases(self, aliases_raw: Optional[str]) -> list[str]:
        if not aliases_raw:
            return []
        try:
            parsed = json.loads(aliases_raw)
            if isinstance(parsed, list):
                return [str(v) for v in parsed if isinstance(v, str)]
            return []
        except (json.JSONDecodeError, TypeError):
            return []

    def _normalize(self, text: Optional[str]) -> str:
        if not text:
            return ""
        lowered = text.lower()
        return "".join(self._TOKEN_RE.findall(lowered))

    def _tokenize(self, text: Optional[str]) -> list[str]:
        if not text:
            return []
        return [t.lower() for t in self._TOKEN_RE.findall(text)]

    def _is_brand_match(self, candidate_brand: Optional[str], requested_brand: str) -> bool:
        c = self._normalize(candidate_brand)
        r = self._normalize(requested_brand)
        if not c or not r:
            return False
        return c == r or r in c or c in r

    def _is_size_match(self, candidate_size: Optional[str], requested_size: str) -> bool:
        c_norm = self._normalize(candidate_size)
        r_norm = self._normalize(requested_size)
        if not c_norm or not r_norm:
            return False

        c_metric = self._size_metric(candidate_size)
        r_metric = self._size_metric(requested_size)
        if c_metric and r_metric:
            c_value, c_unit = c_metric
            r_value, r_unit = r_metric
            if c_unit != r_unit or r_value <= 0:
                return False
            return abs(c_value - r_value) / r_value <= 0.2
        return c_norm == r_norm

    def _size_metric(self, text: Optional[str]) -> Optional[tuple[float, str]]:
        if not text:
            return None
        match = self._SIZE_RE.search(text)
        if not match:
            return None

        value = float(match.group(1))
        unit = match.group(2).lower()
        if unit in {"kg"}:
            return value * 1000.0, "g"
        if unit in {"g"}:
            return value, "g"
        if unit in {"mg"}:
            return value / 1000.0, "g"
        if unit in {"l", "리터"}:
            return value * 1000.0, "ml"
        if unit in {"ml", "밀리리터"}:
            return value, "ml"
        if unit in {"ea", "구"}:
            return value, "ea"
        if unit in {"모"}:
            return value, "tofu_block"
        if unit in {"포기"}:
            return value, "head"
        if unit in {"단"}:
            return value, "bundle"
        return None
