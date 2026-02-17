# Mock 데이터를 SQLite DB에 적재하는 스크립트 (기획서 섹션 6.3~6.4)
from __future__ import annotations

import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path

import aiosqlite

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MOCK_DIR = PROJECT_ROOT / "mock"
DB_PATH = PROJECT_ROOT / "app.db"


async def seed() -> None:
    # DB 초기화
    sys.path.insert(0, str(PROJECT_ROOT))
    from src.infrastructure.persistence.database import APP_SCHEMA

    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.executescript(APP_SCHEMA)

        # 매장 적재
        stores_path = MOCK_DIR / "stores.json"
        if not stores_path.exists():
            print(f"[ERROR] {stores_path} 파일이 없습니다.")
            return
        stores = json.loads(stores_path.read_text(encoding="utf-8"))
        for s in stores:
            await db.execute(
                """INSERT OR REPLACE INTO store_master
                   (store_id, store_name, address, category, lat, lng, source, is_active, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (s["store_id"], s["store_name"], s["address"], s["category"],
                 s["lat"], s["lng"], s["source"], int(s.get("is_active", True)), s["updated_at"]),
            )
        print(f"[OK] 매장 {len(stores)}건 적재 완료")

        # 품목 적재
        products_path = MOCK_DIR / "products.json"
        if not products_path.exists():
            print(f"[ERROR] {products_path} 파일이 없습니다.")
            return
        products = json.loads(products_path.read_text(encoding="utf-8"))
        for p in products:
            await db.execute(
                """INSERT OR REPLACE INTO product_norm
                   (product_norm_key, normalized_name, brand, size_value, size_unit, size_display, category, aliases_json, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (p["product_norm_key"], p["normalized_name"], p.get("brand"),
                 p.get("size_value"), p.get("size_unit"), p.get("size_display"),
                 p.get("category"), p.get("aliases_json"), p["updated_at"]),
            )
        print(f"[OK] 품목 {len(products)}건 적재 완료")

        # 가격 스냅샷 적재
        prices_path = MOCK_DIR / "prices.json"
        if not prices_path.exists():
            print(f"[ERROR] {prices_path} 파일이 없습니다.")
            return
        prices = json.loads(prices_path.read_text(encoding="utf-8"))
        for pr in prices:
            await db.execute(
                """INSERT OR REPLACE INTO offline_price_snapshot
                   (price_snapshot_key, store_id, product_norm_key, price_won, observed_at, source, notice, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (pr["price_snapshot_key"], pr["store_id"], pr["product_norm_key"],
                 pr["price_won"], pr["observed_at"], pr["source"], pr["notice"], pr["created_at"]),
            )
        print(f"[OK] 가격 스냅샷 {len(prices)}건 적재 완료")

        await db.commit()
        print("[DONE] Mock 데이터 적재 완료!")


if __name__ == "__main__":
    asyncio.run(seed())
