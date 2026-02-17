from __future__ import annotations

import asyncio
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv

from src.config import get_settings
from src.infrastructure.persistence.database import get_app_db, init_db

KAMIS_ENDPOINT = "https://www.kamis.or.kr/service/price/xml.do"
CATEGORY_CODES = ["100", "200", "300", "400", "500", "600"]
NON_DIGIT = re.compile(r"[^0-9]")
UNIT_PARSER = re.compile(r"^\s*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z가-힣]+)\s*$")


@dataclass
class KamisItem:
    item_name: str
    unit_display: str
    price_won: int
    category_code: str
    source_name: str = "참가격"


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _parse_price(value: Any) -> int | None:
    text = _clean_text(value)
    if not text or text in {"-", "0"}:
        return None
    digits = NON_DIGIT.sub("", text)
    if not digits:
        return None
    price = int(digits)
    if price <= 0:
        return None
    return price


def _normalize_name(name: str) -> str:
    text = _clean_text(name)
    text = re.sub(r"\s+", " ", text)
    return text


def _parse_unit(unit: str) -> tuple[float | None, str | None, str]:
    unit_text = _clean_text(unit)
    if not unit_text:
        return None, None, ""

    matched = UNIT_PARSER.match(unit_text.replace(" ", ""))
    if not matched:
        return None, None, unit_text
    value = float(matched.group(1))
    raw_unit = matched.group(2).lower()
    normalized = {
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
    return value, normalized, unit_text


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

        name = (
            _clean_text(row.get("item_name"))
            or _clean_text(row.get("itemname"))
            or _clean_text(row.get("productName"))
        )
        if not name:
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
                item_name=_normalize_name(name),
                unit_display=unit,
                price_won=price,
                category_code=category_code,
            )
        )
    return items


async def _fetch_category(
    client: httpx.AsyncClient,
    cert_key: str,
    cert_id: str,
    category_code: str,
) -> list[KamisItem]:
    regday = datetime.now().strftime("%Y-%m-%d")
    params = {
        "action": "dailyPriceByCategoryList",
        "p_cert_key": cert_key,
        "p_cert_id": cert_id,
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
    elif isinstance(data_obj, list) and data_obj and all(isinstance(v, str) for v in data_obj):
        # 인증/요청 오류 시 ["200"] 같은 코드 배열이 내려오는 케이스 처리
        error_code = _clean_text(data_obj[0])
        error_msg = _clean_text(payload.get("message")) or "KAMIS returned non-tabular error payload"
    else:
        error_code = _clean_text(payload.get("error_code"))
        error_msg = _clean_text(payload.get("error_msg"))
    if error_code and error_code != "000":
        message = error_msg or "unknown error"
        raise RuntimeError(f"KAMIS returned error_code={error_code}, message={message}")

    return _extract_items(payload, category_code)


async def sync_kamis() -> None:
    load_dotenv(PROJECT_ROOT / ".env")
    settings = get_settings()
    if not settings.kamis_api_key:
        raise RuntimeError("KAMIS_API_KEY is required.")
    if not settings.kamis_cert_id:
        raise RuntimeError("KAMIS_CERT_ID is required. (공공데이터포털 인증 ID)")

    await init_db()
    db = await get_app_db()

    try:
        row = await db.execute("SELECT store_id FROM store_master WHERE is_active = 1")
        stores = [r["store_id"] for r in await row.fetchall()]
        if not stores:
            raise RuntimeError("No active stores found in store_master.")

        all_items: list[KamisItem] = []
        async with httpx.AsyncClient(timeout=15.0) as client:
            for category_code in CATEGORY_CODES:
                items = await _fetch_category(client, settings.kamis_api_key, settings.kamis_cert_id, category_code)
                all_items.extend(items)

        if not all_items:
            raise RuntimeError("No items fetched from KAMIS API.")

        now = datetime.now(timezone.utc)
        observed_at = now.isoformat()
        observed_date = now.strftime("%Y-%m-%d")

        seen_keys: set[str] = set()
        product_rows: list[tuple[Any, ...]] = []
        price_by_product_key: dict[str, int] = {}
        for item in all_items:
            size_value, size_unit, size_display = _parse_unit(item.unit_display)
            product_norm_key = f"{item.item_name}|참가격|{size_display or 'std'}"
            if product_norm_key not in price_by_product_key:
                price_by_product_key[product_norm_key] = item.price_won
            if product_norm_key in seen_keys:
                continue
            seen_keys.add(product_norm_key)
            product_rows.append(
                (
                    product_norm_key,
                    item.item_name,
                    "참가격",
                    size_value,
                    size_unit,
                    size_display,
                    item.category_code,
                    None,
                    observed_at,
                )
            )

        await db.executemany(
            """INSERT OR REPLACE INTO product_norm
               (product_norm_key, normalized_name, brand, size_value, size_unit, size_display, category, aliases_json, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            product_rows,
        )

        snapshot_rows: list[tuple[Any, ...]] = []
        for store_id in stores:
            for product_key, price_won in price_by_product_key.items():
                snapshot_key = f"{store_id}|{product_key}|{observed_date}|kamis"
                snapshot_rows.append(
                    (
                        snapshot_key,
                        store_id,
                        product_key,
                        int(price_won),
                        observed_at,
                        "참가격",
                        "공공데이터 참가격 기준, 매장 실판매가와 차이 가능",
                        observed_at,
                    )
                )

        await db.executemany(
            """INSERT OR REPLACE INTO offline_price_snapshot
               (price_snapshot_key, store_id, product_norm_key, price_won, observed_at, source, notice, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            snapshot_rows,
        )
        await db.commit()

        print(f"[OK] stores: {len(stores)}")
        print(f"[OK] unique products upserted: {len(product_rows)}")
        print(f"[OK] price snapshots upserted: {len(snapshot_rows)}")
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(sync_kamis())
