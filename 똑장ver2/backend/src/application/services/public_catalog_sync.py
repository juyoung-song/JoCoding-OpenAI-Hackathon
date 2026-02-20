from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Sequence

import aiosqlite
import httpx

logger = logging.getLogger(__name__)

KAMIS_ENDPOINT = "https://www.kamis.or.kr/service/price/xml.do"
DEFAULT_CATEGORY_CODES = ("100", "200", "300", "400", "500", "600")
PUBLIC_DATA_BRAND = "참가격"
_PLACEHOLDER_PREFIX = "__SET_IN_SECRET_MANAGER__"
_NON_DIGIT = re.compile(r"[^0-9]")
_UNIT_PARSER = re.compile(r"^\s*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z가-힣]+)\s*$")


@dataclass(frozen=True)
class KamisItem:
    item_name: str
    unit_display: str
    price_won: int
    category_code: str


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _normalize_name(name: str) -> str:
    normalized = re.sub(r"\s+", " ", _clean_text(name))
    return normalized.strip()


def _parse_price(value: Any) -> int | None:
    text = _clean_text(value)
    if not text or text in {"-", "0"}:
        return None
    digits = _NON_DIGIT.sub("", text)
    if not digits:
        return None
    price = int(digits)
    return price if price > 0 else None


def _parse_unit(unit_display: str) -> tuple[float | None, str | None, str]:
    text = _clean_text(unit_display)
    if not text:
        return None, None, ""

    matched = _UNIT_PARSER.match(text.replace(" ", ""))
    if not matched:
        return None, None, text

    value = float(matched.group(1))
    raw_unit = matched.group(2).lower()
    normalized_unit = {
        "kg": "kg",
        "g": "g",
        "ml": "ml",
        "l": "l",
        "개": "ea",
        "ea": "ea",
        "입": "ea",
        "봉": "pack",
        "pack": "pack",
    }.get(raw_unit, raw_unit)
    return value, normalized_unit, text


def _extract_items(payload: dict[str, Any], category_code: str) -> list[KamisItem]:
    rows: Any = []
    data_obj = payload.get("data")
    if isinstance(data_obj, dict):
        rows = data_obj.get("item") or []
    elif isinstance(data_obj, list):
        rows = data_obj
    else:
        rows = payload.get("item") or []

    if isinstance(rows, dict):
        rows = [rows]
    if not isinstance(rows, list):
        return []

    items: list[KamisItem] = []
    for row in rows:
        if not isinstance(row, dict):
            continue

        item_name = (
            _clean_text(row.get("item_name"))
            or _clean_text(row.get("itemname"))
            or _clean_text(row.get("productName"))
        )
        if not item_name:
            continue

        unit = (
            _clean_text(row.get("unit"))
            or _clean_text(row.get("unit_name"))
            or _clean_text(row.get("kind_name"))
            or "1ea"
        )
        price = (
            _parse_price(row.get("price"))
            or _parse_price(row.get("dpr1"))
            or _parse_price(row.get("dpr2"))
            or _parse_price(row.get("dpr3"))
            or _parse_price(row.get("dpr4"))
            or _parse_price(row.get("dpr5"))
            or _parse_price(row.get("dpr6"))
            or _parse_price(row.get("dpr7"))
            or _parse_price(row.get("value"))
        )
        if price is None:
            continue

        items.append(
            KamisItem(
                item_name=_normalize_name(item_name),
                unit_display=unit,
                price_won=price,
                category_code=category_code,
            )
        )
    return items


def _is_secret_configured(value: str | None) -> bool:
    normalized = _clean_text(value)
    return bool(normalized) and not normalized.startswith(_PLACEHOLDER_PREFIX)


def _normalize_category_codes(category_codes: Sequence[str] | None) -> list[str]:
    if not category_codes:
        return list(DEFAULT_CATEGORY_CODES)
    normalized: list[str] = []
    seen: set[str] = set()
    for code in category_codes:
        value = _clean_text(code)
        if not value or value in seen:
            continue
        seen.add(value)
        normalized.append(value)
    return normalized if normalized else list(DEFAULT_CATEGORY_CODES)


class PublicCatalogSyncService:
    def __init__(
        self,
        *,
        db: aiosqlite.Connection,
        cert_key: str,
        cert_id: str,
        timeout_seconds: float = 12.0,
    ) -> None:
        self._db = db
        self._cert_key = cert_key
        self._cert_id = cert_id
        self._timeout_seconds = max(3.0, float(timeout_seconds))

    @property
    def is_configured(self) -> bool:
        return _is_secret_configured(self._cert_key) and _is_secret_configured(self._cert_id)

    async def sync_catalog(
        self,
        *,
        category_codes: Sequence[str] | None = None,
    ) -> dict[str, Any]:
        normalized_categories = _normalize_category_codes(category_codes)
        if not self.is_configured:
            return {
                "status": "skipped",
                "reason": "KAMIS credentials are not configured",
                "categories": normalized_categories,
                "fetched_items": 0,
                "upserted_products": 0,
                "upserted_snapshots": 0,
                "stores": 0,
                "errors": [],
            }

        store_rows = await self._db.execute("SELECT store_id FROM store_master WHERE is_active = 1")
        stores = [str(row["store_id"]) for row in await store_rows.fetchall()]
        await store_rows.close()
        if not stores:
            return {
                "status": "skipped",
                "reason": "No active stores available",
                "categories": normalized_categories,
                "fetched_items": 0,
                "upserted_products": 0,
                "upserted_snapshots": 0,
                "stores": 0,
                "errors": [],
            }

        fetched_items: list[KamisItem] = []
        errors: list[str] = []

        async with httpx.AsyncClient(timeout=self._timeout_seconds) as client:
            tasks = [
                self._fetch_category_safe(client=client, category_code=category)
                for category in normalized_categories
            ]
            results = await asyncio.gather(*tasks)
            for category_code, category_items, error in results:
                if error:
                    errors.append(f"{category_code}:{error}")
                    continue
                fetched_items.extend(category_items)

        if not fetched_items:
            return {
                "status": "skipped",
                "reason": "No items fetched from KAMIS",
                "categories": normalized_categories,
                "fetched_items": 0,
                "upserted_products": 0,
                "upserted_snapshots": 0,
                "stores": len(stores),
                "errors": errors,
            }

        now = datetime.now(timezone.utc)
        observed_at = now.isoformat()
        observed_date = now.strftime("%Y-%m-%d")

        product_rows, latest_price_by_product = self._build_product_rows(
            fetched_items=fetched_items,
            observed_at=observed_at,
        )
        snapshot_rows = self._build_snapshot_rows(
            stores=stores,
            latest_price_by_product=latest_price_by_product,
            observed_at=observed_at,
            observed_date=observed_date,
        )

        await self._db.execute("BEGIN")
        try:
            await self._db.executemany(
                """INSERT OR REPLACE INTO product_norm
                   (product_norm_key, normalized_name, brand, size_value, size_unit, size_display, category, aliases_json, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                product_rows,
            )
            await self._db.executemany(
                """INSERT OR REPLACE INTO offline_price_snapshot
                   (price_snapshot_key, store_id, product_norm_key, price_won, observed_at, source, notice, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                snapshot_rows,
            )
            await self._db.commit()
        except Exception:
            await self._db.rollback()
            raise

        status = "ok" if not errors else "partial"
        return {
            "status": status,
            "reason": None if status == "ok" else "Some categories failed",
            "categories": normalized_categories,
            "fetched_items": len(fetched_items),
            "upserted_products": len(product_rows),
            "upserted_snapshots": len(snapshot_rows),
            "stores": len(stores),
            "errors": errors,
            "observed_at": observed_at,
        }

    async def _fetch_category_safe(
        self,
        *,
        client: httpx.AsyncClient,
        category_code: str,
    ) -> tuple[str, list[KamisItem], str | None]:
        try:
            items = await self._fetch_category(client=client, category_code=category_code)
            return category_code, items, None
        except Exception as exc:
            logger.warning("KAMIS category fetch failed (%s): %s", category_code, exc)
            return category_code, [], str(exc)

    async def _fetch_category(
        self,
        *,
        client: httpx.AsyncClient,
        category_code: str,
    ) -> list[KamisItem]:
        regday = datetime.now().strftime("%Y-%m-%d")
        params = {
            "action": "dailyPriceByCategoryList",
            "p_cert_key": self._cert_key,
            "p_cert_id": self._cert_id,
            "p_returntype": "json",
            "p_product_cls_code": "01",
            "p_category_code": category_code,
            "p_regday": regday,
        }
        response = await client.get(KAMIS_ENDPOINT, params=params)
        response.raise_for_status()
        payload = response.json()

        data_obj = payload.get("data")
        if isinstance(data_obj, dict):
            error_code = _clean_text(data_obj.get("error_code"))
            error_msg = _clean_text(data_obj.get("error_msg"))
        elif isinstance(data_obj, list) and data_obj and all(isinstance(value, str) for value in data_obj):
            error_code = _clean_text(data_obj[0])
            error_msg = _clean_text(payload.get("message")) or "KAMIS returned non-tabular error payload"
        else:
            error_code = _clean_text(payload.get("error_code"))
            error_msg = _clean_text(payload.get("error_msg"))

        if error_code and error_code != "000":
            raise RuntimeError(f"KAMIS error_code={error_code}, message={error_msg or 'unknown'}")

        return _extract_items(payload, category_code)

    def _build_product_rows(
        self,
        *,
        fetched_items: list[KamisItem],
        observed_at: str,
    ) -> tuple[list[tuple[Any, ...]], dict[str, int]]:
        seen: set[str] = set()
        product_rows: list[tuple[Any, ...]] = []
        latest_price_by_product: dict[str, int] = {}

        for item in fetched_items:
            size_value, size_unit, size_display = _parse_unit(item.unit_display)
            product_key = f"{item.item_name}|{PUBLIC_DATA_BRAND}|{size_display or 'std'}"
            latest_price_by_product[product_key] = int(item.price_won)
            if product_key in seen:
                continue
            seen.add(product_key)

            product_rows.append(
                (
                    product_key,
                    item.item_name,
                    PUBLIC_DATA_BRAND,
                    size_value,
                    size_unit,
                    size_display,
                    item.category_code,
                    None,
                    observed_at,
                )
            )
        return product_rows, latest_price_by_product

    def _build_snapshot_rows(
        self,
        *,
        stores: list[str],
        latest_price_by_product: dict[str, int],
        observed_at: str,
        observed_date: str,
    ) -> list[tuple[Any, ...]]:
        rows: list[tuple[Any, ...]] = []
        for store_id in stores:
            for product_key, price_won in latest_price_by_product.items():
                snapshot_key = f"{store_id}|{product_key}|{observed_date}|kamis"
                rows.append(
                    (
                        snapshot_key,
                        store_id,
                        product_key,
                        int(price_won),
                        observed_at,
                        PUBLIC_DATA_BRAND,
                        "공공데이터 참가격 기준, 매장 실판매가와 차이 가능",
                        observed_at,
                    )
                )
        return rows

    async def list_catalog_items(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
        query: str | None = None,
    ) -> dict[str, Any]:
        safe_limit = max(1, min(200, int(limit)))
        safe_offset = max(0, int(offset))
        q = _clean_text(query)

        where_clause = "brand = ?"
        count_params: list[Any] = [PUBLIC_DATA_BRAND]
        if q:
            where_clause += " AND normalized_name LIKE ?"
            count_params.append(f"%{q}%")

        count_cursor = await self._db.execute(
            f"SELECT COUNT(*) AS cnt FROM product_norm WHERE {where_clause}",
            tuple(count_params),
        )
        count_row = await count_cursor.fetchone()
        await count_cursor.close()
        total = int(count_row["cnt"]) if count_row else 0

        list_params = [*count_params, safe_limit, safe_offset]
        cursor = await self._db.execute(
            f"""
            SELECT
                product_norm_key,
                normalized_name,
                brand,
                size_display,
                category,
                updated_at,
                (
                    SELECT MIN(price_won)
                    FROM offline_price_snapshot ps
                    WHERE ps.product_norm_key = product_norm.product_norm_key
                ) AS min_price_won,
                (
                    SELECT MAX(observed_at)
                    FROM offline_price_snapshot ps
                    WHERE ps.product_norm_key = product_norm.product_norm_key
                ) AS latest_observed_at
            FROM product_norm
            WHERE {where_clause}
            ORDER BY datetime(updated_at) DESC, normalized_name ASC
            LIMIT ? OFFSET ?
            """,
            tuple(list_params),
        )
        rows = await cursor.fetchall()
        await cursor.close()

        items = [
            {
                "product_norm_key": str(row["product_norm_key"]),
                "normalized_name": str(row["normalized_name"]),
                "brand": str(row["brand"] or ""),
                "size_display": row["size_display"],
                "category": row["category"],
                "updated_at": row["updated_at"],
                "min_price_won": row["min_price_won"],
                "latest_observed_at": row["latest_observed_at"],
            }
            for row in rows
        ]
        return {
            "items": items,
            "total": total,
            "limit": safe_limit,
            "offset": safe_offset,
            "query": q or None,
        }
