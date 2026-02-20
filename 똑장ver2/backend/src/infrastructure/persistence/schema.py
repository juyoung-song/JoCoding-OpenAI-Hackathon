"""SQLAlchemy 메타데이터 (Alembic PostgreSQL 마이그레이션 전용)."""
from __future__ import annotations

from sqlalchemy import (
    CheckConstraint,
    Column,
    Float,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    UniqueConstraint,
)

metadata = MetaData()


store_master = Table(
    "store_master",
    metadata,
    Column("store_id", String(64), primary_key=True),
    Column("store_name", String(255), nullable=False),
    Column("address", String(500), nullable=False),
    Column("category", String(120), nullable=False),
    Column("lat", Float, nullable=False),
    Column("lng", Float, nullable=False),
    Column("source", String(120), nullable=False),
    Column("is_active", Integer, nullable=False, server_default="1"),
    Column("updated_at", String(64), nullable=False),
)

product_norm = Table(
    "product_norm",
    metadata,
    Column("product_norm_key", String(128), primary_key=True),
    Column("normalized_name", String(255), nullable=False),
    Column("brand", String(255)),
    Column("size_value", Float),
    Column("size_unit", String(20)),
    Column("size_display", String(60)),
    Column("category", String(120)),
    Column("aliases_json", Text),
    Column("updated_at", String(64), nullable=False),
)

offline_price_snapshot = Table(
    "offline_price_snapshot",
    metadata,
    Column("price_snapshot_key", String(160), primary_key=True),
    Column("store_id", String(64), ForeignKey("store_master.store_id"), nullable=False),
    Column("product_norm_key", String(128), ForeignKey("product_norm.product_norm_key"), nullable=False),
    Column("price_won", Integer, nullable=False),
    Column("observed_at", String(64), nullable=False),
    Column("source", String(120), nullable=False),
    Column("notice", String(255), nullable=False),
    Column("created_at", String(64), nullable=False),
    CheckConstraint("price_won > 0", name="ck_offline_price_snapshot_price_won_positive"),
)

cache_entries = Table(
    "cache_entries",
    metadata,
    Column("cache_key", String(255), primary_key=True),
    Column("value_json", Text, nullable=False),
    Column("expires_at", String(64), nullable=False),
    Column("created_at", String(64), nullable=False),
)
Index("idx_cache_expires", cache_entries.c.expires_at)

users = Table(
    "users",
    metadata,
    Column("user_id", String(64), primary_key=True),
    Column("email", String(255), nullable=False, unique=True),
    Column("name", String(120)),
    Column("is_active", Integer, nullable=False, server_default="1"),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
)

auth_sessions = Table(
    "auth_sessions",
    metadata,
    Column("session_id", String(64), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
    Column("refresh_token_hash", String(255), nullable=False),
    Column("refresh_expires_at", String(64), nullable=False),
    Column("revoked_at", String(64)),
    Column("user_agent", Text),
    Column("ip_address", String(80)),
    Column("created_at", String(64), nullable=False),
    Column("last_used_at", String(64), nullable=False),
)
Index("idx_auth_sessions_user_id", auth_sessions.c.user_id)

user_baskets = Table(
    "user_baskets",
    metadata,
    Column("user_id", String(64), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True),
    Column("basket_json", Text, nullable=False),
    Column("updated_at", String(64), nullable=False),
)

user_preferences = Table(
    "user_preferences",
    metadata,
    Column("user_id", String(64), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True),
    Column("preferences_json", Text, nullable=False),
    Column("updated_at", String(64), nullable=False),
)

user_profiles = Table(
    "user_profiles",
    metadata,
    Column("user_id", String(64), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True),
    Column("profile_json", Text, nullable=False),
    Column("updated_at", String(64), nullable=False),
)

user_orders = Table(
    "user_orders",
    metadata,
    Column("order_id", String(80), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
    Column("order_json", Text, nullable=False),
    Column("created_at", String(64), nullable=False),
)
Index("idx_user_orders_user_created", user_orders.c.user_id, user_orders.c.created_at)

user_reservations = Table(
    "user_reservations",
    metadata,
    Column("reservation_id", String(80), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
    Column("label", String(120), nullable=False),
    Column("weekday", String(10)),
    Column("time", String(10)),
    Column("enabled", Integer, nullable=False, server_default="1"),
    Column("status", String(30), nullable=False, server_default="active"),
    Column("schedule_type", String(20), nullable=False, server_default="weekly"),
    Column("next_run_at", String(64)),
    Column("timezone", String(50), nullable=False, server_default="Asia/Seoul"),
    Column("channel", String(20), nullable=False, server_default="in_app"),
    Column("source_order_id", String(80)),
    Column("source_mart_name", String(120)),
    Column("planned_items_json", Text, nullable=False, server_default="[]"),
    Column("last_run_at", String(64)),
    Column("last_result_status", String(40)),
    Column("retry_count", Integer, nullable=False, server_default="0"),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
)
Index(
    "idx_user_reservations_due",
    user_reservations.c.enabled,
    user_reservations.c.status,
    user_reservations.c.next_run_at,
)
Index(
    "idx_user_reservations_user",
    user_reservations.c.user_id,
    user_reservations.c.created_at,
)

plan_requests = Table(
    "plan_requests",
    metadata,
    Column("request_id", String(64), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
    Column("mode", String(20), nullable=False),
    Column("response_json", Text, nullable=False),
    Column("created_at", String(64), nullable=False),
    Column("expires_at", String(64), nullable=False),
)
Index(
    "idx_plan_requests_user_mode",
    plan_requests.c.user_id,
    plan_requests.c.mode,
    plan_requests.c.created_at,
)

payment_intents = Table(
    "payment_intents",
    metadata,
    Column("intent_id", String(64), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
    Column("request_id", String(64)),
    Column("amount_won", Integer, nullable=False),
    Column("currency", String(10), nullable=False, server_default="KRW"),
    Column("mall_name", String(200), nullable=False),
    Column("plan_type", String(40)),
    Column("status", String(40), nullable=False),
    Column("idempotency_key", String(160)),
    Column("payload_json", Text, nullable=False),
    Column("result_json", Text, nullable=False, server_default="{}"),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
    Column("confirmed_at", String(64)),
    UniqueConstraint("user_id", "idempotency_key", name="uq_payment_intents_user_idempotency"),
)
Index("idx_payment_intents_user_created", payment_intents.c.user_id, payment_intents.c.created_at)
