import aiosqlite
import json
import time
from typing import Optional

class CacheService:
    def __init__(self, db: aiosqlite.Connection):
        self.db = db

    async def get(self, key: str) -> Optional[dict]:
        async with self.db.execute(
            "SELECT value_json, expires_at FROM cache_entries WHERE cache_key = ?", (key,)
        ) as cursor:
            row = await cursor.fetchone()
            if row:
                value_json, expires_at = row
                if expires_at > time.time():
                    return json.loads(value_json)
                else:
                    # Expired
                    await self.delete(key)
        return None

    async def set(self, key: str, value: dict, ttl_seconds: int):
        expires_at = time.time() + ttl_seconds
        value_json = json.dumps(value, ensure_ascii=False)
        await self.db.execute(
            """
            INSERT OR REPLACE INTO cache_entries (cache_key, value_json, expires_at, created_at)
            VALUES (?, ?, ?, datetime('now'))
            """,
            (key, value_json, expires_at)
        )
        await self.db.commit()

    async def delete(self, key: str):
        await self.db.execute("DELETE FROM cache_entries WHERE cache_key = ?", (key,))
        await self.db.commit()
