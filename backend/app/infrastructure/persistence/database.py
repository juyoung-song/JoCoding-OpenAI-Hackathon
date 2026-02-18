"""SQLite DB 연결 관리 — app.db / cache.db 물리적 분리."""

import aiosqlite

from app.core.config import settings

# ── 메인 DB 스키마 ──
MAIN_DB_SCHEMA = """
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT DEFAULT '',
    lat REAL DEFAULT 0.0,
    lng REAL DEFAULT 0.0,
    transport TEXT DEFAULT 'transit',
    max_travel_minutes INTEGER DEFAULT 30,
    online_malls_json TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS basket_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    brand TEXT,
    size TEXT,
    quantity INTEGER DEFAULT 1,
    category TEXT,
    mode TEXT DEFAULT 'recommend',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS preferred_brands (
    user_id TEXT NOT NULL,
    canonical_item_id TEXT NOT NULL,
    preferred_brand TEXT NOT NULL,
    preferred_variant TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, canonical_item_id)
);
"""

# ── 캐시 DB 스키마 ──
CACHE_DB_SCHEMA = """
CREATE TABLE IF NOT EXISTS price_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    source TEXT NOT NULL,
    price INTEGER,
    product_name TEXT,
    link TEXT,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
"""


async def get_main_db() -> aiosqlite.Connection:
    """메인 DB 연결을 반환한다."""
    db = await aiosqlite.connect(settings.db_path)
    db.row_factory = aiosqlite.Row
    await db.executescript(MAIN_DB_SCHEMA)
    return db


async def get_cache_db() -> aiosqlite.Connection:
    """캐시 DB 연결을 반환한다."""
    db = await aiosqlite.connect(settings.cache_db_path)
    db.row_factory = aiosqlite.Row
    await db.executescript(CACHE_DB_SCHEMA)
    return db


async def init_db() -> None:
    """서버 시작 시 DB 초기화."""
    main_db = await get_main_db()
    await main_db.close()
    cache_db = await get_cache_db()
    await cache_db.close()
