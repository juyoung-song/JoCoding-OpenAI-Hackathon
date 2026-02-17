from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

import aiosqlite


class CacheService:
    """SQLite 기반 캐시 서비스."""

    def __init__(self, db: aiosqlite.Connection) -> None:
        self._db = db

    async def get(self, key: str) -> Optional[str]:
        row = await self._db.execute(
            "SELECT value_json, expires_at FROM cache_entries WHERE cache_key = ?",
            (key,),
        )
        record = await row.fetchone()
        if not record:
            return None

        expires_at = datetime.fromisoformat(record["expires_at"])
        now = datetime.now(timezone.utc)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= now:
            await self._db.execute("DELETE FROM cache_entries WHERE cache_key = ?", (key,))
            await self._db.commit()
            return None

        return record["value_json"]

    async def set(self, key: str, value_json: str, ttl_seconds: int) -> None:
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=ttl_seconds)
        await self._db.execute(
            """INSERT INTO cache_entries (cache_key, value_json, expires_at, created_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(cache_key) DO UPDATE SET
                 value_json = excluded.value_json,
                 expires_at = excluded.expires_at,
                 created_at = excluded.created_at""",
            (key, value_json, expires_at.isoformat(), now.isoformat()),
        )
        await self._db.commit()

    async def delete_pattern(self, prefix: str) -> int:
        await self._db.execute(
            "DELETE FROM cache_entries WHERE cache_key LIKE ?",
            (f"{prefix}%",),
        )
        row = await self._db.execute("SELECT changes() AS count")
        changes = await row.fetchone()
        await self._db.commit()
        return int(changes["count"])

    async def cleanup_expired(self) -> int:
        await self._db.execute(
            "DELETE FROM cache_entries WHERE expires_at <= ?",
            (datetime.now(timezone.utc).isoformat(),),
        )
        row = await self._db.execute("SELECT changes() AS count")
        changes = await row.fetchone()
        await self._db.commit()
        return int(changes["count"])
