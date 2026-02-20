"""루트 backend mock 데이터를 ver2 DB에 주입하는 시더."""
from __future__ import annotations

import json
import logging
from pathlib import Path

import aiosqlite

logger = logging.getLogger(__name__)


def _find_mock_dir() -> Path | None:
    here = Path(__file__).resolve()
    candidates = [
        # e:\AI\똑장\backend\mock
        here.parents[5] / "backend" / "mock",
        # e:\AI\똑장\똑장ver2\backend\mock (향후 추가 가능)
        here.parents[3] / "mock",
    ]
    for candidate in candidates:
        if (candidate / "stores.json").exists() and (candidate / "products.json").exists() and (candidate / "prices.json").exists():
            return candidate
    return None


async def seed_offline_mock_data(db: aiosqlite.Connection) -> dict[str, int]:
    """테이블이 비어있을 때만 mock 데이터를 적재한다."""
    counts = {}
    for table in ("store_master", "product_norm", "offline_price_snapshot"):
        row = await db.execute(f"SELECT COUNT(*) AS cnt FROM {table}")
        result = await row.fetchone()
        counts[table] = int(result["cnt"]) if result else 0

    if all(counts[table] > 0 for table in counts):
        logger.info("오프라인 mock seed 생략 (이미 데이터 존재): %s", counts)
        return counts

    mock_dir = _find_mock_dir()
    if not mock_dir:
        logger.warning("mock 데이터 경로를 찾지 못해 seed를 건너뜁니다.")
        return counts

    stores = json.loads((mock_dir / "stores.json").read_text(encoding="utf-8"))
    products = json.loads((mock_dir / "products.json").read_text(encoding="utf-8"))
    prices = json.loads((mock_dir / "prices.json").read_text(encoding="utf-8"))

    await db.execute("BEGIN")
    try:
        for s in stores:
            await db.execute(
                """INSERT OR REPLACE INTO store_master
                   (store_id, store_name, address, category, lat, lng, source, is_active, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    s["store_id"],
                    s["store_name"],
                    s["address"],
                    s["category"],
                    s["lat"],
                    s["lng"],
                    s.get("source", "mock"),
                    int(s.get("is_active", True)),
                    s["updated_at"],
                ),
            )

        for p in products:
            await db.execute(
                """INSERT OR REPLACE INTO product_norm
                   (product_norm_key, normalized_name, brand, size_value, size_unit, size_display, category, aliases_json, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    p["product_norm_key"],
                    p["normalized_name"],
                    p.get("brand"),
                    p.get("size_value"),
                    p.get("size_unit"),
                    p.get("size_display"),
                    p.get("category"),
                    p.get("aliases_json"),
                    p["updated_at"],
                ),
            )

        for pr in prices:
            await db.execute(
                """INSERT OR REPLACE INTO offline_price_snapshot
                   (price_snapshot_key, store_id, product_norm_key, price_won, observed_at, source, notice, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    pr["price_snapshot_key"],
                    pr["store_id"],
                    pr["product_norm_key"],
                    pr["price_won"],
                    pr["observed_at"],
                    pr.get("source", "mock"),
                    pr.get("notice", "테스트용 데이터"),
                    pr["created_at"],
                ),
            )

        await db.commit()
    except Exception:
        await db.rollback()
        raise

    counts = {"store_master": len(stores), "product_norm": len(products), "offline_price_snapshot": len(prices)}
    logger.info("오프라인 mock seed 완료: %s (source=%s)", counts, mock_dir)
    return counts

