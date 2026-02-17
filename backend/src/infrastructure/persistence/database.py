# SQLite 데이터베이스 초기화 및 연결 관리 (기획서 섹션 6.1 스키마)
from __future__ import annotations

import aiosqlite

_APP_DB_PATH = "app.db"
_CACHE_DB_PATH = "cache.db"

APP_SCHEMA = """
CREATE TABLE IF NOT EXISTS store_master (
    store_id   TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    address    TEXT NOT NULL,
    category   TEXT NOT NULL,
    lat        REAL NOT NULL,
    lng        REAL NOT NULL,
    source     TEXT NOT NULL,
    is_active  INTEGER DEFAULT 1,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS product_norm (
    product_norm_key TEXT PRIMARY KEY,
    normalized_name  TEXT NOT NULL,
    brand            TEXT,
    size_value       REAL,
    size_unit        TEXT,
    size_display     TEXT,
    category         TEXT,
    aliases_json     TEXT,
    updated_at       DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_price_snapshot (
    price_snapshot_key TEXT PRIMARY KEY,
    store_id           TEXT NOT NULL REFERENCES store_master(store_id),
    product_norm_key   TEXT NOT NULL REFERENCES product_norm(product_norm_key),
    price_won          INTEGER NOT NULL CHECK(price_won > 0),
    observed_at        DATETIME NOT NULL,
    source             TEXT NOT NULL,
    notice             TEXT NOT NULL,
    created_at         DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_price_store ON offline_price_snapshot(store_id);
CREATE INDEX IF NOT EXISTS idx_price_product ON offline_price_snapshot(product_norm_key);

CREATE TABLE IF NOT EXISTS offline_plan_execution_log (
    execution_id         TEXT PRIMARY KEY,
    request_id           TEXT NOT NULL,
    item_count           INTEGER NOT NULL,
    candidate_store_count INTEGER NOT NULL,
    filtered_store_count INTEGER NOT NULL,
    selected_plan_types  TEXT NOT NULL,
    latency_ms           INTEGER NOT NULL,
    degraded             INTEGER DEFAULT 0,
    created_at           DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_provider_call_log (
    call_id       TEXT PRIMARY KEY,
    provider_name TEXT NOT NULL,
    endpoint_key  TEXT NOT NULL,
    status_code   INTEGER,
    latency_ms    INTEGER NOT NULL,
    cache_hit     INTEGER DEFAULT 0,
    error_class   TEXT,
    created_at    DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_plan_selection_log (
    selection_id     TEXT PRIMARY KEY,
    request_id       TEXT NOT NULL,
    selected_plan_type TEXT NOT NULL,
    store_id         TEXT NOT NULL,
    selected_at      DATETIME NOT NULL
);
"""

CACHE_SCHEMA = """
CREATE TABLE IF NOT EXISTS cache_entries (
    cache_key  TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);
"""


async def get_app_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(_APP_DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def get_cache_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(_CACHE_DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db() -> None:
    """앱 시작 시 DB 테이블 생성."""
    async with aiosqlite.connect(_APP_DB_PATH) as db:
        await db.executescript(APP_SCHEMA)

    async with aiosqlite.connect(_CACHE_DB_PATH) as db:
        await db.executescript(CACHE_SCHEMA)
