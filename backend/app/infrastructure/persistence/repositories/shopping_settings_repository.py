import json
from datetime import datetime, timezone
import aiosqlite
from app.domain.models.user_preferences import ShoppingContext
from app.core.config import settings

class ShoppingSettingsRepository:
    def __init__(self, db_path: str = "app.db"):
        self.db_path = db_path

    async def _init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS shopping_settings (
                    key TEXT PRIMARY KEY,
                    data TEXT,
                    updated_at TEXT
                )
            """)
            await db.commit()

    async def get_context(self) -> ShoppingContext:
        await self._init_db()
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("SELECT data FROM shopping_settings WHERE key = 'default'") as cursor:
                row = await cursor.fetchone()
                if row:
                    try:
                        data = json.loads(row[0])
                        return ShoppingContext(**data)
                    except json.JSONDecodeError:
                        pass
        
        # 기본값 반환
        return ShoppingContext()

    async def save_context(self, context: ShoppingContext):
        await self._init_db()
        context.updated_at = datetime.now(timezone.utc).isoformat()
        data_json = context.model_dump_json()
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT OR REPLACE INTO shopping_settings (key, data, updated_at)
                VALUES ('default', ?, ?)
            """, (data_json, context.updated_at))
            await db.commit()
