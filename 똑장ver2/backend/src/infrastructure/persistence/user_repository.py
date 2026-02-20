from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4
from zoneinfo import ZoneInfo

import aiosqlite

from src.domain.models.basket import Basket


DEFAULT_PREFERENCES = {"like": [], "dislike": []}


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _to_iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def _from_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _normalize_list(values: list[str] | None) -> list[str]:
    if not values:
        return []
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        normalized = str(value).strip()
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(normalized)
    return result


def _normalize_preferences(raw: dict[str, Any] | None) -> dict[str, list[str]]:
    source = raw or DEFAULT_PREFERENCES
    return {
        "like": _normalize_list(list(source.get("like", []))),
        "dislike": _normalize_list(list(source.get("dislike", []))),
    }


def _safe_timezone(name: str | None) -> ZoneInfo:
    if not name:
        return ZoneInfo("Asia/Seoul")
    try:
        return ZoneInfo(name)
    except Exception:
        return ZoneInfo("Asia/Seoul")


def compute_next_weekly_run(
    *,
    weekday: str,
    time_str: str,
    timezone_name: str,
    base_utc: datetime | None = None,
) -> str:
    weekday_map = {
        "mon": 0,
        "tue": 1,
        "wed": 2,
        "thu": 3,
        "fri": 4,
        "sat": 5,
        "sun": 6,
    }
    target_weekday = weekday_map.get((weekday or "").lower(), 0)
    hour = 9
    minute = 0
    try:
        parts = (time_str or "09:00").split(":")
        hour = max(0, min(23, int(parts[0])))
        minute = max(0, min(59, int(parts[1])))
    except Exception:
        hour = 9
        minute = 0

    tz = _safe_timezone(timezone_name)
    now_local = (base_utc or _now_utc()).astimezone(tz)

    days_ahead = (target_weekday - now_local.weekday()) % 7
    candidate = now_local.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if days_ahead == 0 and candidate <= now_local:
        days_ahead = 7
    candidate = candidate + timedelta(days=days_ahead)
    return _to_iso(candidate.astimezone(timezone.utc))


def compute_next_one_time_run(next_run_at: str | None, timezone_name: str) -> str:
    provided = _from_iso(next_run_at)
    if provided and provided > _now_utc():
        return _to_iso(provided)

    tz = _safe_timezone(timezone_name)
    future = _now_utc().astimezone(tz) + timedelta(minutes=5)
    rounded = future.replace(second=0, microsecond=0)
    return _to_iso(rounded.astimezone(timezone.utc))


class UserRepository:
    """사용자별 데이터 SoR를 위한 sqlite repository."""

    def __init__(self, db: aiosqlite.Connection):
        self.db = db

    async def _fetchone(self, query: str, params: tuple[Any, ...] = ()) -> aiosqlite.Row | None:
        cursor = await self.db.execute(query, params)
        row = await cursor.fetchone()
        await cursor.close()
        return row

    async def _fetchall(self, query: str, params: tuple[Any, ...] = ()) -> list[aiosqlite.Row]:
        cursor = await self.db.execute(query, params)
        rows = await cursor.fetchall()
        await cursor.close()
        return rows

    # --- User / Auth -------------------------------------------------

    async def get_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        row = await self._fetchone("SELECT * FROM users WHERE user_id = ?", (user_id,))
        return dict(row) if row else None

    async def get_user_by_email(self, email: str) -> dict[str, Any] | None:
        row = await self._fetchone("SELECT * FROM users WHERE email = ?", (email.lower(),))
        return dict(row) if row else None

    async def ensure_user(self, email: str, name: str | None = None) -> dict[str, Any]:
        normalized_email = email.strip().lower()
        existing = await self.get_user_by_email(normalized_email)
        now = _to_iso(_now_utc())

        if existing:
            if name and (existing.get("name") or "") != name.strip():
                await self.db.execute(
                    "UPDATE users SET name = ?, updated_at = ? WHERE user_id = ?",
                    (name.strip(), now, existing["user_id"]),
                )
                await self.db.commit()
                existing = await self.get_user_by_id(existing["user_id"])
            await self.ensure_user_defaults(existing["user_id"])
            return existing or {}

        user_id = f"usr-{uuid4().hex[:20]}"
        await self.db.execute(
            """
            INSERT INTO users (user_id, email, name, is_active, created_at, updated_at)
            VALUES (?, ?, ?, 1, ?, ?)
            """,
            (user_id, normalized_email, (name or "").strip() or None, now, now),
        )
        await self.db.commit()
        await self.ensure_user_defaults(user_id)
        created = await self.get_user_by_id(user_id)
        return created or {}

    async def ensure_user_defaults(self, user_id: str) -> None:
        now = _to_iso(_now_utc())
        user = await self.get_user_by_id(user_id)
        email = (user or {}).get("email", "")
        name = (user or {}).get("name", "") or "사용자"

        await self.db.execute(
            """
            INSERT OR IGNORE INTO user_baskets (user_id, basket_json, updated_at)
            VALUES (?, ?, ?)
            """,
            (user_id, json.dumps({"items": []}, ensure_ascii=False), now),
        )
        await self.db.execute(
            """
            INSERT OR IGNORE INTO user_preferences (user_id, preferences_json, updated_at)
            VALUES (?, ?, ?)
            """,
            (user_id, json.dumps(DEFAULT_PREFERENCES, ensure_ascii=False), now),
        )
        await self.db.execute(
            """
            INSERT OR IGNORE INTO user_profiles (user_id, profile_json, updated_at)
            VALUES (?, ?, ?)
            """,
            (
                user_id,
                json.dumps(
                    {
                        "name": name,
                        "email": email,
                        "phone": "",
                        "addresses": [],
                    },
                    ensure_ascii=False,
                ),
                now,
            ),
        )
        await self.db.commit()

    async def create_session(
        self,
        *,
        session_id: str,
        user_id: str,
        refresh_token_hash: str,
        refresh_expires_at: str,
        user_agent: str | None,
        ip_address: str | None,
    ) -> None:
        now = _to_iso(_now_utc())
        await self.db.execute(
            """
            INSERT INTO auth_sessions (
                session_id, user_id, refresh_token_hash, refresh_expires_at,
                revoked_at, user_agent, ip_address, created_at, last_used_at
            ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)
            """,
            (session_id, user_id, refresh_token_hash, refresh_expires_at, user_agent, ip_address, now, now),
        )
        await self.db.commit()

    async def get_session(self, session_id: str) -> dict[str, Any] | None:
        row = await self._fetchone("SELECT * FROM auth_sessions WHERE session_id = ?", (session_id,))
        return dict(row) if row else None

    async def touch_session(self, session_id: str) -> None:
        await self.db.execute(
            "UPDATE auth_sessions SET last_used_at = ? WHERE session_id = ?",
            (_to_iso(_now_utc()), session_id),
        )
        await self.db.commit()

    async def rotate_refresh_token(
        self,
        *,
        session_id: str,
        refresh_token_hash: str,
        refresh_expires_at: str,
    ) -> None:
        now = _to_iso(_now_utc())
        await self.db.execute(
            """
            UPDATE auth_sessions
            SET refresh_token_hash = ?, refresh_expires_at = ?, last_used_at = ?, revoked_at = NULL
            WHERE session_id = ?
            """,
            (refresh_token_hash, refresh_expires_at, now, session_id),
        )
        await self.db.commit()

    async def revoke_session(self, session_id: str) -> None:
        await self.db.execute(
            "UPDATE auth_sessions SET revoked_at = ?, last_used_at = ? WHERE session_id = ?",
            (_to_iso(_now_utc()), _to_iso(_now_utc()), session_id),
        )
        await self.db.commit()

    # --- Basket / Preferences ---------------------------------------

    async def get_basket(self, user_id: str) -> Basket:
        await self.ensure_user_defaults(user_id)
        row = await self._fetchone("SELECT basket_json FROM user_baskets WHERE user_id = ?", (user_id,))
        if not row:
            return Basket(items=[])

        try:
            payload = json.loads(row["basket_json"])
            return Basket.model_validate(payload)
        except Exception:
            return Basket(items=[])

    async def save_basket(self, user_id: str, basket: Basket) -> None:
        await self.ensure_user_defaults(user_id)
        payload = json.dumps(basket.model_dump(mode="json"), ensure_ascii=False)
        await self.db.execute(
            """
            INSERT INTO user_baskets (user_id, basket_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE
            SET basket_json = excluded.basket_json,
                updated_at = excluded.updated_at
            """,
            (user_id, payload, _to_iso(_now_utc())),
        )
        await self.db.commit()

    async def get_preferences(self, user_id: str) -> dict[str, list[str]]:
        await self.ensure_user_defaults(user_id)
        row = await self._fetchone(
            "SELECT preferences_json FROM user_preferences WHERE user_id = ?",
            (user_id,),
        )
        if not row:
            return dict(DEFAULT_PREFERENCES)

        try:
            payload = json.loads(row["preferences_json"])
        except Exception:
            payload = DEFAULT_PREFERENCES
        return _normalize_preferences(payload)

    async def save_preferences(self, user_id: str, preferences: dict[str, Any]) -> dict[str, list[str]]:
        normalized = _normalize_preferences(preferences)
        await self.ensure_user_defaults(user_id)
        await self.db.execute(
            """
            INSERT INTO user_preferences (user_id, preferences_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE
            SET preferences_json = excluded.preferences_json,
                updated_at = excluded.updated_at
            """,
            (user_id, json.dumps(normalized, ensure_ascii=False), _to_iso(_now_utc())),
        )
        await self.db.commit()
        return normalized

    # --- Profile / Orders -------------------------------------------

    async def get_profile(self, user_id: str) -> dict[str, Any]:
        await self.ensure_user_defaults(user_id)
        row = await self._fetchone("SELECT profile_json FROM user_profiles WHERE user_id = ?", (user_id,))
        if not row:
            user = await self.get_user_by_id(user_id)
            return {
                "name": (user or {}).get("name") or "사용자",
                "email": (user or {}).get("email") or "",
                "phone": "",
                "addresses": [],
            }

        try:
            profile = json.loads(row["profile_json"])
            if not isinstance(profile, dict):
                raise ValueError("invalid profile")
            profile.setdefault("addresses", [])
            profile.setdefault("phone", "")
            return profile
        except Exception:
            return {"name": "사용자", "email": "", "phone": "", "addresses": []}

    async def save_profile(self, user_id: str, profile: dict[str, Any]) -> dict[str, Any]:
        await self.ensure_user_defaults(user_id)
        current = await self.get_profile(user_id)
        merged = {
            "name": str(profile.get("name", current.get("name", "사용자"))).strip() or "사용자",
            "email": str(profile.get("email", current.get("email", ""))).strip().lower(),
            "phone": str(profile.get("phone", current.get("phone", ""))).strip(),
            "addresses": list(profile.get("addresses", current.get("addresses", []))),
        }

        await self.db.execute(
            """
            INSERT INTO user_profiles (user_id, profile_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE
            SET profile_json = excluded.profile_json,
                updated_at = excluded.updated_at
            """,
            (user_id, json.dumps(merged, ensure_ascii=False), _to_iso(_now_utc())),
        )
        await self.db.execute(
            "UPDATE users SET name = ?, updated_at = ? WHERE user_id = ?",
            (merged["name"], _to_iso(_now_utc()), user_id),
        )
        await self.db.commit()
        return merged

    async def list_orders(self, user_id: str, *, limit: int = 200) -> list[dict[str, Any]]:
        rows = await self._fetchall(
            """
            SELECT order_json FROM user_orders
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (user_id, max(1, limit)),
        )
        result: list[dict[str, Any]] = []
        for row in rows:
            try:
                payload = json.loads(row["order_json"])
                if isinstance(payload, dict):
                    result.append(payload)
            except Exception:
                continue
        return result

    async def upsert_order(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        now = _to_iso(_now_utc())
        order_id = str(payload.get("id") or f"ORD-{int(_now_utc().timestamp() * 1000)}")
        stored = dict(payload)
        stored["id"] = order_id
        await self.db.execute(
            """
            INSERT INTO user_orders (order_id, user_id, order_json, created_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(order_id) DO UPDATE
            SET order_json = excluded.order_json
            """,
            (order_id, user_id, json.dumps(stored, ensure_ascii=False), now),
        )
        await self.db.commit()
        return stored

    # --- Reservations ------------------------------------------------

    async def list_reservations(self, user_id: str) -> list[dict[str, Any]]:
        rows = await self._fetchall(
            """
            SELECT * FROM user_reservations
            WHERE user_id = ?
            ORDER BY
                CASE
                    WHEN enabled = 1 AND next_run_at IS NOT NULL THEN 0
                    ELSE 1
                END ASC,
                datetime(next_run_at) ASC,
                created_at DESC
            """,
            (user_id,),
        )

        reservations: list[dict[str, Any]] = []
        for row in rows:
            record = dict(row)
            try:
                record["planned_items"] = json.loads(record.get("planned_items_json") or "[]")
            except Exception:
                record["planned_items"] = []
            record.pop("planned_items_json", None)
            reservations.append(record)
        return reservations

    async def get_reservation(self, user_id: str, reservation_id: str) -> dict[str, Any] | None:
        row = await self._fetchone(
            "SELECT * FROM user_reservations WHERE user_id = ? AND reservation_id = ?",
            (user_id, reservation_id),
        )
        if not row:
            return None

        record = dict(row)
        try:
            record["planned_items"] = json.loads(record.get("planned_items_json") or "[]")
        except Exception:
            record["planned_items"] = []
        record.pop("planned_items_json", None)
        return record

    async def create_reservation(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        reservation_id = str(payload.get("reservation_id") or f"resv-{uuid4().hex[:12]}")
        schedule_type = str(payload.get("schedule_type") or "weekly")
        timezone_name = str(payload.get("timezone") or "Asia/Seoul")
        weekday = str(payload.get("weekday") or "mon").lower()
        time_str = str(payload.get("time") or "09:00")
        next_run_at = payload.get("next_run_at")

        if schedule_type == "weekly":
            normalized_next_run_at = compute_next_weekly_run(
                weekday=weekday,
                time_str=time_str,
                timezone_name=timezone_name,
                base_utc=_from_iso(next_run_at) or _now_utc(),
            )
        else:
            normalized_next_run_at = compute_next_one_time_run(
                next_run_at=next_run_at,
                timezone_name=timezone_name,
            )

        now = _to_iso(_now_utc())
        planned_items = _normalize_list(list(payload.get("planned_items") or []))

        await self.db.execute(
            """
            INSERT INTO user_reservations (
                reservation_id, user_id, label, weekday, time, enabled, status,
                schedule_type, next_run_at, timezone, channel,
                source_order_id, source_mart_name, planned_items_json,
                last_run_at, last_result_status, retry_count,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                reservation_id,
                user_id,
                str(payload.get("label") or "장보기 예약").strip()[:100],
                weekday,
                time_str,
                int(bool(payload.get("enabled", True))),
                str(payload.get("status") or "active"),
                schedule_type,
                normalized_next_run_at,
                timezone_name,
                str(payload.get("channel") or "in_app"),
                payload.get("source_order_id"),
                payload.get("source_mart_name"),
                json.dumps(planned_items, ensure_ascii=False),
                payload.get("last_run_at"),
                payload.get("last_result_status"),
                int(payload.get("retry_count") or 0),
                now,
                now,
            ),
        )
        await self.db.commit()
        created = await self.get_reservation(user_id, reservation_id)
        return created or {}

    async def update_reservation(
        self,
        user_id: str,
        reservation_id: str,
        patch: dict[str, Any],
    ) -> dict[str, Any] | None:
        current = await self.get_reservation(user_id, reservation_id)
        if not current:
            return None

        next_record = dict(current)
        next_record.update({k: v for k, v in patch.items() if v is not None})

        schedule_type = str(next_record.get("schedule_type") or "weekly")
        timezone_name = str(next_record.get("timezone") or "Asia/Seoul")
        weekday = str(next_record.get("weekday") or "mon").lower()
        time_str = str(next_record.get("time") or "09:00")

        if patch.get("next_run_at") is not None or patch.get("weekday") is not None or patch.get("time") is not None:
            if schedule_type == "weekly":
                next_record["next_run_at"] = compute_next_weekly_run(
                    weekday=weekday,
                    time_str=time_str,
                    timezone_name=timezone_name,
                    base_utc=_from_iso(next_record.get("next_run_at")) or _now_utc(),
                )
            else:
                next_record["next_run_at"] = compute_next_one_time_run(
                    next_run_at=next_record.get("next_run_at"),
                    timezone_name=timezone_name,
                )

        planned_items = _normalize_list(list(next_record.get("planned_items") or []))

        await self.db.execute(
            """
            UPDATE user_reservations
            SET label = ?, weekday = ?, time = ?, enabled = ?, status = ?,
                schedule_type = ?, next_run_at = ?, timezone = ?, channel = ?,
                source_order_id = ?, source_mart_name = ?, planned_items_json = ?,
                last_run_at = ?, last_result_status = ?, retry_count = ?, updated_at = ?
            WHERE user_id = ? AND reservation_id = ?
            """,
            (
                str(next_record.get("label") or "장보기 예약").strip()[:100],
                weekday,
                time_str,
                int(bool(next_record.get("enabled", True))),
                str(next_record.get("status") or "active"),
                schedule_type,
                next_record.get("next_run_at"),
                timezone_name,
                str(next_record.get("channel") or "in_app"),
                next_record.get("source_order_id"),
                next_record.get("source_mart_name"),
                json.dumps(planned_items, ensure_ascii=False),
                next_record.get("last_run_at"),
                next_record.get("last_result_status"),
                int(next_record.get("retry_count") or 0),
                _to_iso(_now_utc()),
                user_id,
                reservation_id,
            ),
        )
        await self.db.commit()
        return await self.get_reservation(user_id, reservation_id)

    async def delete_reservation(self, user_id: str, reservation_id: str) -> None:
        await self.db.execute(
            "DELETE FROM user_reservations WHERE user_id = ? AND reservation_id = ?",
            (user_id, reservation_id),
        )
        await self.db.commit()

    async def dispatch_due_reservations(self, now_utc: datetime | None = None) -> int:
        now = now_utc or _now_utc()
        rows = await self._fetchall(
            """
            SELECT * FROM user_reservations
            WHERE enabled = 1
              AND status = 'active'
              AND next_run_at IS NOT NULL
              AND datetime(next_run_at) <= datetime(?)
            ORDER BY next_run_at ASC
            """,
            (_to_iso(now),),
        )

        dispatched_count = 0
        for row in rows:
            record = dict(row)
            reservation_id = str(record.get("reservation_id"))
            retry_count = int(record.get("retry_count") or 0)
            schedule_type = str(record.get("schedule_type") or "weekly")
            timezone_name = str(record.get("timezone") or "Asia/Seoul")
            weekday = str(record.get("weekday") or "mon")
            time_str = str(record.get("time") or "09:00")

            try:
                if schedule_type == "weekly":
                    next_run_at = compute_next_weekly_run(
                        weekday=weekday,
                        time_str=time_str,
                        timezone_name=timezone_name,
                        base_utc=now + timedelta(minutes=1),
                    )
                    status = "active"
                else:
                    next_run_at = None
                    status = "awaiting_approval"

                await self.db.execute(
                    """
                    UPDATE user_reservations
                    SET status = ?,
                        next_run_at = ?,
                        last_run_at = ?,
                        last_result_status = ?,
                        retry_count = ?,
                        updated_at = ?
                    WHERE reservation_id = ?
                    """,
                    (
                        status,
                        next_run_at,
                        _to_iso(now),
                        "approval_required",
                        retry_count,
                        _to_iso(now),
                        reservation_id,
                    ),
                )
                dispatched_count += 1
            except Exception:
                next_retry = _to_iso(now + timedelta(minutes=5))
                next_retry_count = retry_count + 1
                failed_status = "expired" if next_retry_count >= 3 else "active"
                await self.db.execute(
                    """
                    UPDATE user_reservations
                    SET status = ?,
                        next_run_at = ?,
                        last_result_status = ?,
                        retry_count = ?,
                        updated_at = ?
                    WHERE reservation_id = ?
                    """,
                    (
                        failed_status,
                        next_retry,
                        "dispatch_failed",
                        next_retry_count,
                        _to_iso(now),
                        reservation_id,
                    ),
                )

        if rows:
            await self.db.commit()
        return dispatched_count

    # --- Plan request storage ---------------------------------------

    async def save_plan_request(
        self,
        *,
        request_id: str,
        user_id: str,
        mode: str,
        response: dict[str, Any],
        ttl_hours: int = 24,
    ) -> None:
        now = _now_utc()
        await self.db.execute(
            """
            INSERT INTO plan_requests (request_id, user_id, mode, response_json, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                request_id,
                user_id,
                mode,
                json.dumps(response, ensure_ascii=False),
                _to_iso(now),
                _to_iso(now + timedelta(hours=max(1, ttl_hours))),
            ),
        )
        await self.db.commit()

    async def get_plan_request(self, *, request_id: str, user_id: str, mode: str) -> dict[str, Any] | None:
        row = await self._fetchone(
            """
            SELECT * FROM plan_requests
            WHERE request_id = ? AND user_id = ? AND mode = ?
              AND datetime(expires_at) > datetime(?)
            """,
            (request_id, user_id, mode, _to_iso(_now_utc())),
        )
        if not row:
            return None

        payload = dict(row)
        try:
            payload["response"] = json.loads(payload.get("response_json") or "{}")
        except Exception:
            payload["response"] = {}
        return payload

    # --- Payment intents (sandbox) ---------------------------------

    async def find_payment_intent_by_idempotency(
        self,
        *,
        user_id: str,
        idempotency_key: str,
    ) -> dict[str, Any] | None:
        row = await self._fetchone(
            """
            SELECT * FROM payment_intents
            WHERE user_id = ? AND idempotency_key = ?
            LIMIT 1
            """,
            (user_id, idempotency_key),
        )
        if not row:
            return None

        payload = dict(row)
        try:
            payload["payload"] = json.loads(payload.get("payload_json") or "{}")
        except Exception:
            payload["payload"] = {}
        try:
            payload["result"] = json.loads(payload.get("result_json") or "{}")
        except Exception:
            payload["result"] = {}
        return payload

    async def create_payment_intent(
        self,
        *,
        intent_id: str,
        user_id: str,
        request_id: str | None,
        amount_won: int,
        currency: str,
        mall_name: str,
        plan_type: str | None,
        status: str,
        idempotency_key: str | None,
        payload: dict[str, Any],
    ) -> None:
        now = _to_iso(_now_utc())
        await self.db.execute(
            """
            INSERT INTO payment_intents (
                intent_id, user_id, request_id, amount_won, currency, mall_name, plan_type,
                status, idempotency_key, payload_json, result_json, created_at, updated_at, confirmed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
            """,
            (
                intent_id,
                user_id,
                request_id,
                amount_won,
                currency,
                mall_name,
                plan_type,
                status,
                idempotency_key,
                json.dumps(payload, ensure_ascii=False),
                json.dumps({}, ensure_ascii=False),
                now,
                now,
            ),
        )
        await self.db.commit()

    async def get_payment_intent(self, *, intent_id: str, user_id: str) -> dict[str, Any] | None:
        row = await self._fetchone(
            """
            SELECT * FROM payment_intents
            WHERE intent_id = ? AND user_id = ?
            LIMIT 1
            """,
            (intent_id, user_id),
        )
        if not row:
            return None
        payload = dict(row)
        try:
            payload["payload"] = json.loads(payload.get("payload_json") or "{}")
        except Exception:
            payload["payload"] = {}
        try:
            payload["result"] = json.loads(payload.get("result_json") or "{}")
        except Exception:
            payload["result"] = {}
        return payload

    async def update_payment_intent_status(
        self,
        *,
        intent_id: str,
        user_id: str,
        status: str,
        result: dict[str, Any],
        confirmed: bool = False,
    ) -> dict[str, Any] | None:
        now = _to_iso(_now_utc())
        await self.db.execute(
            """
            UPDATE payment_intents
            SET status = ?,
                result_json = ?,
                updated_at = ?,
                confirmed_at = CASE WHEN ? THEN ? ELSE confirmed_at END
            WHERE intent_id = ? AND user_id = ?
            """,
            (
                status,
                json.dumps(result, ensure_ascii=False),
                now,
                int(confirmed),
                now,
                intent_id,
                user_id,
            ),
        )
        await self.db.commit()
        return await self.get_payment_intent(intent_id=intent_id, user_id=user_id)
