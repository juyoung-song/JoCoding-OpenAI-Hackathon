import aiosqlite
from pathlib import Path
from src.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def get_app_db() -> aiosqlite.Connection:
    """애플리케이션 DB 연결 (WAL 모드)"""
    db_path = Path(settings.db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    db = await aiosqlite.connect(str(db_path))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db

async def get_cache_db() -> aiosqlite.Connection:
    """캐시 DB 연결"""
    db_path = Path(settings.cache_db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    db = await aiosqlite.connect(str(db_path))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    return db

INIT_SQL = """
-- 오프라인 매장 마스터
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

-- 상품 표준화 테이블
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

-- 오프라인 가격 스냅샷
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

-- 캐시 테이블
CREATE TABLE IF NOT EXISTS cache_entries (
    cache_key  TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);

-- 사용자 계정
CREATE TABLE IF NOT EXISTS users (
    user_id     TEXT PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    name        TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL,
    updated_at  DATETIME NOT NULL
);

-- 인증 세션 (서버 저장)
CREATE TABLE IF NOT EXISTS auth_sessions (
    session_id          TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    refresh_token_hash  TEXT NOT NULL,
    refresh_expires_at  DATETIME NOT NULL,
    revoked_at          DATETIME,
    user_agent          TEXT,
    ip_address          TEXT,
    created_at          DATETIME NOT NULL,
    last_used_at        DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);

-- 사용자 장바구니 SoR
CREATE TABLE IF NOT EXISTS user_baskets (
    user_id     TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    basket_json TEXT NOT NULL,
    updated_at  DATETIME NOT NULL
);

-- 사용자 선호 SoR
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id           TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    preferences_json  TEXT NOT NULL,
    updated_at        DATETIME NOT NULL
);

-- 사용자 프로필 SoR
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id        TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    profile_json   TEXT NOT NULL,
    updated_at     DATETIME NOT NULL
);

-- 사용자 주문 이력 SoR
CREATE TABLE IF NOT EXISTS user_orders (
    order_id      TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    order_json    TEXT NOT NULL,
    created_at    DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_orders_user_created ON user_orders(user_id, created_at DESC);

-- 예약 SoR + 실행 상태
CREATE TABLE IF NOT EXISTS user_reservations (
    reservation_id      TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    label               TEXT NOT NULL,
    weekday             TEXT,
    time                TEXT,
    enabled             INTEGER NOT NULL DEFAULT 1,
    status              TEXT NOT NULL DEFAULT 'active',
    schedule_type       TEXT NOT NULL DEFAULT 'weekly',
    next_run_at         DATETIME,
    timezone            TEXT NOT NULL DEFAULT 'Asia/Seoul',
    channel             TEXT NOT NULL DEFAULT 'in_app',
    source_order_id     TEXT,
    source_mart_name    TEXT,
    planned_items_json  TEXT NOT NULL DEFAULT '[]',
    last_run_at         DATETIME,
    last_result_status  TEXT,
    retry_count         INTEGER NOT NULL DEFAULT 0,
    created_at          DATETIME NOT NULL,
    updated_at          DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_reservations_due ON user_reservations(enabled, status, next_run_at);
CREATE INDEX IF NOT EXISTS idx_user_reservations_user ON user_reservations(user_id, created_at DESC);

-- 플랜 생성 결과 저장 (select 검증용)
CREATE TABLE IF NOT EXISTS plan_requests (
    request_id      TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    mode            TEXT NOT NULL,
    response_json   TEXT NOT NULL,
    created_at      DATETIME NOT NULL,
    expires_at      DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_plan_requests_user_mode ON plan_requests(user_id, mode, created_at DESC);

-- 결제 샌드박스 intent
CREATE TABLE IF NOT EXISTS payment_intents (
    intent_id         TEXT PRIMARY KEY,
    user_id           TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    request_id        TEXT,
    amount_won        INTEGER NOT NULL,
    currency          TEXT NOT NULL DEFAULT 'KRW',
    mall_name         TEXT NOT NULL,
    plan_type         TEXT,
    status            TEXT NOT NULL,
    idempotency_key   TEXT,
    payload_json      TEXT NOT NULL,
    result_json       TEXT NOT NULL DEFAULT '{}',
    created_at        DATETIME NOT NULL,
    updated_at        DATETIME NOT NULL,
    confirmed_at      DATETIME
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_intents_user_idempotency
ON payment_intents(user_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_created
ON payment_intents(user_id, created_at DESC);
"""

async def init_db():
    """DB 테이블 초기화"""
    # 디렉토리 자동 생성
    Path(settings.db_path).parent.mkdir(parents=True, exist_ok=True)
    Path(settings.cache_db_path).parent.mkdir(parents=True, exist_ok=True)

    async with aiosqlite.connect(settings.db_path) as db:
        await db.executescript(INIT_SQL)
        await db.commit()
    
    async with aiosqlite.connect(settings.cache_db_path) as cache_db:
        await cache_db.execute("""
            CREATE TABLE IF NOT EXISTS cache_entries (
                cache_key  TEXT PRIMARY KEY,
                value_json TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL
            );
        """)
        await cache_db.commit()
    logger.info("DB initialized.")
