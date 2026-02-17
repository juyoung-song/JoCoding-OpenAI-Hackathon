from __future__ import annotations

from datetime import datetime, timezone

import aiosqlite

from src.infrastructure.persistence.database import APP_SCHEMA, CACHE_SCHEMA


async def create_test_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(":memory:")
    db.row_factory = aiosqlite.Row
    await db.executescript(APP_SCHEMA)

    now = datetime.now(timezone.utc).isoformat()
    stores = [
        ("s1", "강남마트", "서울 강남구 역삼동", "mart", 37.498, 127.028, "mock", 1, now),
        ("s2", "역삼슈퍼", "서울 강남구 역삼동", "supermarket", 37.501, 127.025, "mock", 1, now),
        ("s3", "선릉할인점", "서울 강남구 대치동", "discount", 37.505, 127.050, "mock", 1, now),
    ]
    await db.executemany(
        """INSERT INTO store_master
           (store_id, store_name, address, category, lat, lng, source, is_active, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        stores,
    )

    products = [
        ("p_milk_1l", "우유", "서울우유", 1.0, "L", "1L", "유제품", '["흰우유"]', now),
        ("p_milk_900", "우유", "매일", 0.9, "L", "900ml", "유제품", '["흰우유"]', now),
        ("p_egg_10", "계란", "자연란", 10, "EA", "10구", "축산", '["달걀"]', now),
        ("p_apple_1kg", "사과", None, 1.0, "kg", "1kg", "과일", '["부사"]', now),
    ]
    await db.executemany(
        """INSERT INTO product_norm
           (product_norm_key, normalized_name, brand, size_value, size_unit, size_display, category, aliases_json, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        products,
    )

    snapshots = [
        ("ps1", "s1", "p_milk_1l", 2900, now, "mock", "test", now),
        ("ps2", "s1", "p_egg_10", 5300, now, "mock", "test", now),
        ("ps3", "s1", "p_apple_1kg", 6200, now, "mock", "test", now),
        ("ps4", "s2", "p_milk_1l", 3100, now, "mock", "test", now),
        ("ps5", "s2", "p_egg_10", 4900, now, "mock", "test", now),
        ("ps6", "s2", "p_apple_1kg", 6400, now, "mock", "test", now),
        ("ps7", "s3", "p_milk_1l", 3200, now, "mock", "test", now),
        ("ps8", "s3", "p_egg_10", 5400, now, "mock", "test", now),
    ]
    await db.executemany(
        """INSERT INTO offline_price_snapshot
           (price_snapshot_key, store_id, product_norm_key, price_won, observed_at, source, notice, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        snapshots,
    )
    await db.commit()
    return db


async def create_cache_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(":memory:")
    db.row_factory = aiosqlite.Row
    await db.executescript(CACHE_SCHEMA)
    await db.commit()
    return db
