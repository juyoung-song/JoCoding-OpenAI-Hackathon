# 데이터 접근 레포지토리 (기획서 섹션 6 기반)
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

import aiosqlite

from src.domain.types import OfflinePriceSnapshot, OfflineStore, ProductNorm


class StoreRepository:
    """매장 마스터 CRUD."""

    def __init__(self, db: aiosqlite.Connection) -> None:
        self._db = db

    async def find_nearby(self, lat: float, lng: float, radius_km: float, categories: Optional[list[str]] = None) -> list[OfflineStore]:
        """반경 내 활성 매장 조회 (Haversine 근사)."""
        # 위도 1도 ≈ 111km, 경도 1도 ≈ 88km (한국 기준)
        lat_range = radius_km / 111.0
        lng_range = radius_km / 88.0

        query = """
            SELECT * FROM store_master
            WHERE is_active = 1
              AND lat BETWEEN ? AND ?
              AND lng BETWEEN ? AND ?
        """
        params: list = [lat - lat_range, lat + lat_range, lng - lng_range, lng + lng_range]

        if categories:
            placeholders = ",".join("?" for _ in categories)
            query += f" AND category IN ({placeholders})"
            params.extend(categories)

        rows = await self._db.execute(query, params)
        results = await rows.fetchall()
        return [OfflineStore(**dict(row)) for row in results]

    async def upsert(self, store: OfflineStore) -> None:
        await self._db.execute(
            """INSERT INTO store_master (store_id, store_name, address, category, lat, lng, source, is_active, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(store_id) DO UPDATE SET
                 store_name=excluded.store_name, address=excluded.address,
                 category=excluded.category, lat=excluded.lat, lng=excluded.lng,
                 source=excluded.source, is_active=excluded.is_active, updated_at=excluded.updated_at""",
            (store.store_id, store.store_name, store.address, store.category,
             store.lat, store.lng, store.source, int(store.is_active), store.updated_at.isoformat()),
        )


class ProductRepository:
    """품목 정규화 테이블 CRUD."""

    def __init__(self, db: aiosqlite.Connection) -> None:
        self._db = db

    async def find_by_name(self, name: str, brand: Optional[str] = None) -> list[ProductNorm]:
        """품목명으로 검색 (부분 매칭)."""
        query = "SELECT * FROM product_norm WHERE normalized_name LIKE ?"
        params: list = [f"%{name}%"]
        if brand:
            query += " AND brand = ?"
            params.append(brand)
        rows = await self._db.execute(query, params)
        results = await rows.fetchall()
        return [ProductNorm(**dict(row)) for row in results]

    async def upsert(self, product: ProductNorm) -> None:
        await self._db.execute(
            """INSERT INTO product_norm (product_norm_key, normalized_name, brand, size_value, size_unit, size_display, category, aliases_json, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(product_norm_key) DO UPDATE SET
                 normalized_name=excluded.normalized_name, brand=excluded.brand,
                 size_value=excluded.size_value, size_unit=excluded.size_unit,
                 size_display=excluded.size_display, category=excluded.category,
                 aliases_json=excluded.aliases_json, updated_at=excluded.updated_at""",
            (product.product_norm_key, product.normalized_name, product.brand,
             product.size_value, product.size_unit, product.size_display,
             product.category, product.aliases_json, product.updated_at.isoformat()),
        )


class PriceSnapshotRepository:
    """가격 스냅샷 CRUD."""

    def __init__(self, db: aiosqlite.Connection) -> None:
        self._db = db

    async def find_by_store(self, store_id: str) -> list[OfflinePriceSnapshot]:
        """매장별 최신 가격 스냅샷 조회."""
        rows = await self._db.execute(
            "SELECT * FROM offline_price_snapshot WHERE store_id = ? ORDER BY observed_at DESC",
            (store_id,),
        )
        results = await rows.fetchall()
        return [OfflinePriceSnapshot(**dict(row)) for row in results]

    async def find_by_store_and_products(
        self, store_id: str, product_norm_keys: list[str]
    ) -> list[OfflinePriceSnapshot]:
        """매장+품목 목록 기반 가격 조회 (최신 스냅샷만)."""
        if not product_norm_keys:
            return []
        placeholders = ",".join("?" for _ in product_norm_keys)
        rows = await self._db.execute(
            f"""SELECT * FROM offline_price_snapshot
                WHERE store_id = ? AND product_norm_key IN ({placeholders})
                ORDER BY observed_at DESC""",
            [store_id, *product_norm_keys],
        )
        results = await rows.fetchall()
        # 품목별 최신 1건만
        seen: set[str] = set()
        unique: list[OfflinePriceSnapshot] = []
        for row in results:
            snap = OfflinePriceSnapshot(**dict(row))
            if snap.product_norm_key not in seen:
                seen.add(snap.product_norm_key)
                unique.append(snap)
        return unique

    async def upsert(self, snapshot: OfflinePriceSnapshot) -> None:
        await self._db.execute(
            """INSERT INTO offline_price_snapshot (price_snapshot_key, store_id, product_norm_key, price_won, observed_at, source, notice, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(price_snapshot_key) DO UPDATE SET
                 price_won=excluded.price_won, observed_at=excluded.observed_at,
                 source=excluded.source, notice=excluded.notice""",
            (snapshot.price_snapshot_key, snapshot.store_id, snapshot.product_norm_key,
             snapshot.price_won, snapshot.observed_at.isoformat(), snapshot.source,
             snapshot.notice, snapshot.created_at.isoformat()),
        )
