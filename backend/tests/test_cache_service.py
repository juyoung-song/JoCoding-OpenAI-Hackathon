from __future__ import annotations

import pytest

from src.infrastructure.persistence.cache_service import CacheService
from tests.test_support import create_cache_db


@pytest.mark.asyncio
async def test_set_and_get() -> None:
    db = await create_cache_db()
    try:
        cache = CacheService(db)
        await cache.set("k1", '{"a":1}', ttl_seconds=30)
        assert await cache.get("k1") == '{"a":1}'
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_expired_returns_none() -> None:
    db = await create_cache_db()
    try:
        cache = CacheService(db)
        await cache.set("k_expired", '{"a":1}', ttl_seconds=-1)
        assert await cache.get("k_expired") is None
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_cleanup_removes_expired() -> None:
    db = await create_cache_db()
    try:
        cache = CacheService(db)
        await cache.set("k_live", '{"ok":true}', ttl_seconds=3600)
        await cache.set("k_dead", '{"ok":false}', ttl_seconds=-1)
        removed = await cache.cleanup_expired()
        assert removed >= 1
        assert await cache.get("k_dead") is None
        assert await cache.get("k_live") == '{"ok":true}'
    finally:
        await db.close()


@pytest.mark.asyncio
async def test_delete_pattern() -> None:
    db = await create_cache_db()
    try:
        cache = CacheService(db)
        await cache.set("route:car:a", "1", ttl_seconds=30)
        await cache.set("route:car:b", "2", ttl_seconds=30)
        await cache.set("weather:x", "3", ttl_seconds=30)
        deleted = await cache.delete_pattern("route:car:")
        assert deleted >= 2
        assert await cache.get("route:car:a") is None
        assert await cache.get("weather:x") == "3"
    finally:
        await db.close()
