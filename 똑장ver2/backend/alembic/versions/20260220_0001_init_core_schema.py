"""init core schema for closed beta

Revision ID: 20260220_0001
Revises:
Create Date: 2026-02-20 18:40:00
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260220_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "store_master",
        sa.Column("store_id", sa.String(length=64), nullable=False),
        sa.Column("store_name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.String(length=500), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("source", sa.String(length=120), nullable=False),
        sa.Column("is_active", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("updated_at", sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint("store_id"),
    )

    op.create_table(
        "product_norm",
        sa.Column("product_norm_key", sa.String(length=128), nullable=False),
        sa.Column("normalized_name", sa.String(length=255), nullable=False),
        sa.Column("brand", sa.String(length=255), nullable=True),
        sa.Column("size_value", sa.Float(), nullable=True),
        sa.Column("size_unit", sa.String(length=20), nullable=True),
        sa.Column("size_display", sa.String(length=60), nullable=True),
        sa.Column("category", sa.String(length=120), nullable=True),
        sa.Column("aliases_json", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint("product_norm_key"),
    )

    op.create_table(
        "offline_price_snapshot",
        sa.Column("price_snapshot_key", sa.String(length=160), nullable=False),
        sa.Column("store_id", sa.String(length=64), nullable=False),
        sa.Column("product_norm_key", sa.String(length=128), nullable=False),
        sa.Column("price_won", sa.Integer(), nullable=False),
        sa.Column("observed_at", sa.String(length=64), nullable=False),
        sa.Column("source", sa.String(length=120), nullable=False),
        sa.Column("notice", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.String(length=64), nullable=False),
        sa.CheckConstraint("price_won > 0", name="ck_offline_price_snapshot_price_won_positive"),
        sa.ForeignKeyConstraint(["product_norm_key"], ["product_norm.product_norm_key"]),
        sa.ForeignKeyConstraint(["store_id"], ["store_master.store_id"]),
        sa.PrimaryKeyConstraint("price_snapshot_key"),
    )

    op.create_table(
        "cache_entries",
        sa.Column("cache_key", sa.String(length=255), nullable=False),
        sa.Column("value_json", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint("cache_key"),
    )
    op.create_index("idx_cache_expires", "cache_entries", ["expires_at"], unique=False)

    op.create_table(
        "users",
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=True),
        sa.Column("is_active", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.String(length=64), nullable=False),
        sa.Column("updated_at", sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint("user_id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "auth_sessions",
        sa.Column("session_id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("refresh_token_hash", sa.String(length=255), nullable=False),
        sa.Column("refresh_expires_at", sa.String(length=64), nullable=False),
        sa.Column("revoked_at", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(length=80), nullable=True),
        sa.Column("created_at", sa.String(length=64), nullable=False),
        sa.Column("last_used_at", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("session_id"),
    )
    op.create_index("idx_auth_sessions_user_id", "auth_sessions", ["user_id"], unique=False)

    op.create_table(
        "user_baskets",
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("basket_json", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "user_preferences",
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("preferences_json", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "user_profiles",
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("profile_json", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "user_orders",
        sa.Column("order_id", sa.String(length=80), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("order_json", sa.Text(), nullable=False),
        sa.Column("created_at", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("order_id"),
    )
    op.create_index("idx_user_orders_user_created", "user_orders", ["user_id", "created_at"], unique=False)

    op.create_table(
        "user_reservations",
        sa.Column("reservation_id", sa.String(length=80), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=False),
        sa.Column("weekday", sa.String(length=10), nullable=True),
        sa.Column("time", sa.String(length=10), nullable=True),
        sa.Column("enabled", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="active"),
        sa.Column("schedule_type", sa.String(length=20), nullable=False, server_default="weekly"),
        sa.Column("next_run_at", sa.String(length=64), nullable=True),
        sa.Column("timezone", sa.String(length=50), nullable=False, server_default="Asia/Seoul"),
        sa.Column("channel", sa.String(length=20), nullable=False, server_default="in_app"),
        sa.Column("source_order_id", sa.String(length=80), nullable=True),
        sa.Column("source_mart_name", sa.String(length=120), nullable=True),
        sa.Column("planned_items_json", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("last_run_at", sa.String(length=64), nullable=True),
        sa.Column("last_result_status", sa.String(length=40), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.String(length=64), nullable=False),
        sa.Column("updated_at", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("reservation_id"),
    )
    op.create_index(
        "idx_user_reservations_due",
        "user_reservations",
        ["enabled", "status", "next_run_at"],
        unique=False,
    )
    op.create_index(
        "idx_user_reservations_user",
        "user_reservations",
        ["user_id", "created_at"],
        unique=False,
    )

    op.create_table(
        "plan_requests",
        sa.Column("request_id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("mode", sa.String(length=20), nullable=False),
        sa.Column("response_json", sa.Text(), nullable=False),
        sa.Column("created_at", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("request_id"),
    )
    op.create_index(
        "idx_plan_requests_user_mode",
        "plan_requests",
        ["user_id", "mode", "created_at"],
        unique=False,
    )

    op.create_table(
        "payment_intents",
        sa.Column("intent_id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("request_id", sa.String(length=64), nullable=True),
        sa.Column("amount_won", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="KRW"),
        sa.Column("mall_name", sa.String(length=200), nullable=False),
        sa.Column("plan_type", sa.String(length=40), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("idempotency_key", sa.String(length=160), nullable=True),
        sa.Column("payload_json", sa.Text(), nullable=False),
        sa.Column("result_json", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.String(length=64), nullable=False),
        sa.Column("updated_at", sa.String(length=64), nullable=False),
        sa.Column("confirmed_at", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("intent_id"),
        sa.UniqueConstraint("user_id", "idempotency_key", name="uq_payment_intents_user_idempotency"),
    )
    op.create_index(
        "idx_payment_intents_user_created",
        "payment_intents",
        ["user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_payment_intents_user_created", table_name="payment_intents")
    op.drop_table("payment_intents")

    op.drop_index("idx_plan_requests_user_mode", table_name="plan_requests")
    op.drop_table("plan_requests")

    op.drop_index("idx_user_reservations_user", table_name="user_reservations")
    op.drop_index("idx_user_reservations_due", table_name="user_reservations")
    op.drop_table("user_reservations")

    op.drop_index("idx_user_orders_user_created", table_name="user_orders")
    op.drop_table("user_orders")

    op.drop_table("user_profiles")
    op.drop_table("user_preferences")
    op.drop_table("user_baskets")

    op.drop_index("idx_auth_sessions_user_id", table_name="auth_sessions")
    op.drop_table("auth_sessions")
    op.drop_table("users")

    op.drop_index("idx_cache_expires", table_name="cache_entries")
    op.drop_table("cache_entries")

    op.drop_table("offline_price_snapshot")
    op.drop_table("product_norm")
    op.drop_table("store_master")

