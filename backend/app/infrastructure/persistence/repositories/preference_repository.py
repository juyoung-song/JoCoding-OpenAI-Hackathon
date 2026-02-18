"""선호 브랜드 저장소 (SQLite)."""

import aiosqlite
from app.core.config import settings
from app.domain.models.preferences import PreferredBrand

class PreferredBrandRepository:
    """PreferredBrand CRUD Operations."""

    async def get(self, user_id: str, canonical_id: str) -> PreferredBrand | None:
        """선호 브랜드를 조회한다."""
        query = """
            SELECT user_id, canonical_item_id, preferred_brand, preferred_variant, created_at, updated_at
            FROM preferred_brands
            WHERE user_id = ? AND canonical_item_id = ?
        """
        async with aiosqlite.connect(settings.db_path) as db: 
            db.row_factory = aiosqlite.Row
            async with db.execute(query, (user_id, canonical_id)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return PreferredBrand(
                        user_id=row["user_id"],
                        canonical_item_id=row["canonical_item_id"],
                        preferred_brand=row["preferred_brand"],
                        preferred_variant=row["preferred_variant"],
                        created_at=row["created_at"],
                        updated_at=row["updated_at"]
                    )
        return None

    async def set(self, preference: PreferredBrand) -> None:
        """선호 브랜드를 설정(저장/업데이트)한다."""
        query = """
            INSERT INTO preferred_brands (user_id, canonical_item_id, preferred_brand, preferred_variant, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, canonical_item_id) 
            DO UPDATE SET 
                preferred_brand = excluded.preferred_brand,
                preferred_variant = excluded.preferred_variant,
                updated_at = CURRENT_TIMESTAMP
        """
        try:
            async with aiosqlite.connect(settings.db_path) as db:
                await db.execute(query, (
                    preference.user_id,
                    preference.canonical_item_id,
                    preference.preferred_brand,
                    preference.preferred_variant
                ))
                await db.commit()
        except Exception as e:
            print(f"[PreferredBrandRepository] SET Error: {e}")
            raise e
