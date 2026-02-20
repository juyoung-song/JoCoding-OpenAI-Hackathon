from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel, Field

from src.api.v1.dependencies import AuthUser, require_auth
from src.application.services.public_catalog_sync import PublicCatalogSyncService
from src.core.config import settings

router = APIRouter(prefix="/public-data", tags=["public-data"])


class PublicCatalogSyncRequest(BaseModel):
    category_codes: list[str] = Field(default_factory=list)


class PublicCatalogSyncResponse(BaseModel):
    status: str
    reason: str | None = None
    categories: list[str]
    fetched_items: int
    upserted_products: int
    upserted_snapshots: int
    stores: int
    errors: list[str] = Field(default_factory=list)
    observed_at: str | None = None


class PublicCatalogItem(BaseModel):
    product_norm_key: str
    normalized_name: str
    brand: str
    size_display: str | None = None
    category: str | None = None
    updated_at: str
    min_price_won: int | None = None
    latest_observed_at: str | None = None


class PublicCatalogListResponse(BaseModel):
    items: list[PublicCatalogItem]
    total: int
    limit: int
    offset: int
    query: str | None = None


def _build_catalog_service(request: Request) -> PublicCatalogSyncService:
    return PublicCatalogSyncService(
        db=request.app.state.db,
        cert_key=settings.kamis_cert_key,
        cert_id=settings.kamis_cert_id,
        timeout_seconds=settings.public_catalog_timeout_seconds,
    )


@router.post("/catalog/sync", response_model=PublicCatalogSyncResponse)
async def sync_public_catalog(
    payload: PublicCatalogSyncRequest,
    request: Request,
    _: AuthUser = Depends(require_auth),
):
    service = _build_catalog_service(request)
    result = await service.sync_catalog(
        category_codes=payload.category_codes or None,
    )
    return PublicCatalogSyncResponse.model_validate(result)


@router.get("/catalog/items", response_model=PublicCatalogListResponse)
async def list_public_catalog_items(
    request: Request,
    _: AuthUser = Depends(require_auth),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    q: str | None = Query(default=None),
):
    service = _build_catalog_service(request)
    result = await service.list_catalog_items(limit=limit, offset=offset, query=q)
    return PublicCatalogListResponse.model_validate(result)
