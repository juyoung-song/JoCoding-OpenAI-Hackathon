# 오프라인 플랜 API 라우터 (기획서 섹션 5.1)
from __future__ import annotations

import uuid
from urllib.parse import unquote

import httpx
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.api.dependencies import get_plan_service
from src.application.product_matcher import ProductMatcher
from src.application.plan_service import PlanService, ServiceUnavailableError
from src.config import get_settings
from src.domain.types import (
    BasketItem,
    ErrorResponse,
    GeneratePlanRequest,
    GeneratePlanResponse,
    SelectPlanRequest,
    SelectPlanResponse,
)

router = APIRouter(tags=["offline-plans"])


class MatchCandidateRequest(BaseModel):
    items: list[BasketItem] = Field(..., min_length=1, max_length=30)


class MatchCandidateResponseItem(BaseModel):
    item_name: str
    matched: bool
    candidates: list[dict]


def _error_response(status_code: int, code: str, message: str, request_id: str | None = None) -> JSONResponse:
    payload = ErrorResponse(code=code, message=message, request_id=request_id)
    return JSONResponse(status_code=status_code, content=payload.model_dump(mode="json"))


def _parse_naver_map_coordinates(mapx: object, mapy: object) -> tuple[float, float] | None:
    try:
        raw_x = float(mapx)
        raw_y = float(mapy)
    except (TypeError, ValueError):
        return None

    if -180.0 <= raw_x <= 180.0 and -90.0 <= raw_y <= 90.0:
        lng, lat = raw_x, raw_y
    elif 1_240_000_000 <= raw_x <= 1_320_000_000 and 330_000_000 <= raw_y <= 390_000_000:
        lng, lat = raw_x / 10_000_000.0, raw_y / 10_000_000.0
    else:
        return None

    if not (33.0 <= lat <= 39.5 and 124.0 <= lng <= 132.0):
        return None
    return lat, lng


def _geocode_query_candidates(query: str) -> list[str]:
    tokens = [token for token in query.replace(",", " ").split() if token]
    candidates: list[str] = [query]
    if len(tokens) >= 2:
        candidates.append(" ".join(tokens[:2]))
    if len(tokens) >= 3:
        candidates.append(" ".join(tokens[:3]))
    if tokens:
        candidates.extend([tokens[-1], f"{tokens[-1]}역", f"{tokens[-1]} 주민센터"])
    # dedupe while preserving order
    seen: set[str] = set()
    result: list[str] = []
    for candidate in candidates:
        candidate = candidate.strip()
        if not candidate or candidate in seen:
            continue
        seen.add(candidate)
        result.append(candidate)
    return result


@router.get("/utils/geocode")
async def geocode_address(query: str) -> JSONResponse:
    decoded_query = unquote(query).strip()
    if not decoded_query:
        return JSONResponse(status_code=400, content={"code": "INVALID_QUERY", "message": "query가 비어 있습니다."})

    settings = get_settings()
    if not settings.naver_client_id or not settings.naver_client_secret:
        return JSONResponse(
            status_code=503,
            content={"code": "GEOCODER_UNAVAILABLE", "message": "네이버 Search API 키가 설정되지 않았습니다."},
        )

    headers = {
        "X-Naver-Client-Id": settings.naver_client_id,
        "X-Naver-Client-Secret": settings.naver_client_secret,
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            for candidate in _geocode_query_candidates(decoded_query):
                params = {"query": candidate, "display": 5, "start": 1, "sort": "random"}
                response = await client.get(
                    "https://openapi.naver.com/v1/search/local.json", headers=headers, params=params
                )
                response.raise_for_status()
                items = response.json().get("items", [])
                for item in items:
                    parsed = _parse_naver_map_coordinates(item.get("mapx"), item.get("mapy"))
                    if not parsed:
                        continue
                    lat, lng = parsed
                    address = item.get("roadAddress") or item.get("address") or candidate
                    return JSONResponse(
                        status_code=200,
                        content={
                            "query": decoded_query,
                            "resolved_query": candidate,
                            "lat": lat,
                            "lng": lng,
                            "resolved_address": address,
                        },
                    )
        return JSONResponse(
            status_code=404,
            content={"code": "GEOCODE_NOT_FOUND", "message": "주소를 좌표로 변환하지 못했습니다."},
        )
    except httpx.HTTPError:
        return JSONResponse(
            status_code=503,
            content={"code": "GEOCODER_UNAVAILABLE", "message": "지오코딩 서비스 호출에 실패했습니다."},
        )


@router.post("/utils/match-candidates")
async def match_candidates(request: MatchCandidateRequest, raw_request: Request) -> JSONResponse:
    db = raw_request.app.state.db
    matcher = ProductMatcher(db)

    results: list[MatchCandidateResponseItem] = []
    for item in request.items:
        matched = await matcher.match(item)
        if matched:
            results.append(
                MatchCandidateResponseItem(
                    item_name=item.item_name,
                    matched=True,
                    candidates=[
                        {
                            "product_norm_key": matched.product_norm_key,
                            "normalized_name": matched.normalized_name,
                            "brand": matched.brand,
                            "size_display": matched.size_display,
                            "score": 1.0,
                        }
                    ],
                )
            )
            continue

        suggestions = await matcher.suggest(item, limit=3)
        results.append(
            MatchCandidateResponseItem(
                item_name=item.item_name,
                matched=False,
                candidates=[
                    {
                        "product_norm_key": c.product_norm_key,
                        "normalized_name": c.normalized_name,
                        "brand": c.brand,
                        "size_display": c.size_display,
                        "score": c.score,
                    }
                    for c in suggestions
                ],
            )
        )

    return JSONResponse(
        status_code=200,
        content={"items": [r.model_dump(mode="json") for r in results]},
    )


@router.post(
    "/plans/generate",
    response_model=GeneratePlanResponse,
    responses={
        206: {"description": "부분 결과 (일부 Provider fallback)"},
        400: {"model": ErrorResponse, "description": "입력 오류"},
        422: {"model": ErrorResponse, "description": "품목 해석 불가"},
        503: {"model": ErrorResponse, "description": "필수 의존 실패"},
    },
)
async def generate_plans(
    request: GeneratePlanRequest,
    response: Response,
    service: PlanService = Depends(get_plan_service),
) -> GeneratePlanResponse | JSONResponse:
    """오프라인 장보기 플랜 생성 API.

    장바구니 품목과 사용자 위치/이동수단을 기반으로
    최저가/가까움/균형 3종 플랜을 생성합니다.
    """
    try:
        result = await service.generate_plans(request)
    except ServiceUnavailableError as exc:
        return _error_response(
            status_code=503,
            code=exc.code,
            message=exc.message,
            request_id=str(uuid.uuid4()),
        )

    # 206 Partial Content: Provider fallback 발생 시 (기획서 5.1)
    if result.meta.degraded_providers:
        response.status_code = 206

    return result


@router.post(
    "/plans/select",
    response_model=SelectPlanResponse,
    responses={
        404: {"model": ErrorResponse, "description": "플랜 없음"},
    },
)
async def select_plan(
    request: SelectPlanRequest,
    service: PlanService = Depends(get_plan_service),
) -> SelectPlanResponse | JSONResponse:
    """오프라인 플랜 선택 기록 API.

    사용자가 선택한 플랜을 기록하고 네이버 지도 길찾기 딥링크를 반환합니다.
    """
    result = await service.select_plan(request)
    if not result:
        return _error_response(
            status_code=404,
            code="PLAN_NOT_FOUND",
            message="매장을 찾을 수 없습니다.",
            request_id=request.request_id,
        )
    return result
