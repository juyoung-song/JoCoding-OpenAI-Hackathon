# Sprint 2 실행 계획서 - 똑장 오프라인 파트

## Context
Sprint 1에서 Mock Provider 기반 코어 로직(플랜 생성 파이프라인, 랭킹 엔진, 품목 매칭)이 완성됨.
Sprint 2 목표: 실제 외부 API 연동, 캐시 계층, 테스트 코드 작성, 갭 분석.

## 현재 상태 (Sprint 1 완료)
- ✅ 도메인 타입/프로토콜 정의
- ✅ SQLite DB 스키마 + Mock 데이터 시딩
- ✅ ProductMatcher, RankingEngine, PlanService 구현
- ✅ FastAPI 라우트 (generate/select)
- ✅ MockRoutingProvider, MockWeatherProvider
- ❌ 실제 API Provider 미구현
- ❌ 캐시 계층 미구현
- ❌ 테스트 코드 없음

---

## 작업 목록 (총 6단계)

### Phase 1: 캐시 서비스 구현
**파일**: `backend/src/infrastructure/persistence/cache_service.py` (신규)

기획서 섹션 6.6 캐시 전략 구현:
- cache.db의 `cache_entries` 테이블 활용 (이미 스키마 존재: database.py:80-88)
- `CacheService` 클래스: get/set/delete/cleanup 메서드
- 캐시 키 패턴: `place:{lat_3dp}:{lng_3dp}:{category}:{radius}`, `route:car:{...}`, `weather:{...}`
- TTL: place 30분, route 10분, weather 30분 (config.py에 이미 정의됨)
- lazy eviction: 조회 시 만료 확인 후 삭제

```python
class CacheService:
    async def get(self, key: str) -> Optional[str]  # JSON string or None
    async def set(self, key: str, value: str, ttl_seconds: int) -> None
    async def delete_pattern(self, pattern: str) -> int  # 패턴 매칭 삭제
    async def cleanup_expired(self) -> int  # 만료 항목 일괄 정리
```

### Phase 2: 실제 API Provider 구현
**파일**: `backend/src/infrastructure/providers/` 디렉토리에 각 파일 신규 생성

#### 2-1. NaverLocalPlaceProvider
**파일**: `backend/src/infrastructure/providers/naver_place.py`
- 네이버 Local 검색 API: `https://openapi.naver.com/v1/search/local.json`
- 헤더: `X-Naver-Client-Id`, `X-Naver-Client-Secret`
- 쿼리: `?query=마트+{category}&display=20&sort=random`
- 좌표 기반 필터링은 클라이언트 측에서 처리 (API가 좌표 검색 미지원)
- 캐시 키: `place:{lat_3dp}:{lng_3dp}:{category}:{radius}`, TTL 30분
- 프로토콜: `IPlaceProvider.search_nearby()` 구현

#### 2-2. NaverRoutingProvider
**파일**: `backend/src/infrastructure/providers/naver_routing.py`
- 네이버 Directions 5 API: `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving`
- 헤더: `X-NCP-APIGW-API-KEY-ID`, `X-NCP-APIGW-API-KEY`
- 파라미터: `start={lng},{lat}&goal={lng},{lat}` (경도,위도 순서 주의!)
- car만 실제 API, walk/transit은 기존 추정 로직 유지 (기획서 5.2.1)
- 캐시 키: `route:car:{origin}:{dest}`, TTL 10분
- 프로토콜: `IRoutingProvider.estimate()` 구현

#### 2-3. KmaWeatherProvider
**파일**: `backend/src/infrastructure/providers/kma_weather.py`
- 기상청 단기예보 API: `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`
- 파라미터: `serviceKey`, `base_date`, `base_time`, `nx`, `ny` (격자 좌표 변환 필요)
- 위경도 → 기상청 격자 좌표 변환 함수 필요
- 강수확률(POP), 기온(TMP), 강수형태(PTY) 추출
- 캐시 키: `weather:{lat_2dp}:{lng_2dp}:{hour_block}`, TTL 30분
- 프로토콜: `IWeatherProvider.get_advisory()` 구현

#### 2-4. Provider 호출 로깅
각 Provider에 `offline_provider_call_log` 기록 로직 추가:
- provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class

### Phase 3: main.py Provider 교체
**파일**: `backend/src/main.py` 수정

- MockProvider → 실제 Provider로 교체
- Settings에서 API 키 읽기
- CacheService 인스턴스 생성 및 주입
- API 키 없으면 Mock fallback 유지 (개발 편의)

```python
# main.py lifespan 수정
cache_db = await get_cache_db()
cache = CacheService(cache_db)
settings = get_settings()

if settings.naver_client_id:
    routing = NaverRoutingProvider(settings, cache)
    weather = KmaWeatherProvider(settings, cache)
else:
    routing = MockRoutingProvider()
    weather = MockWeatherProvider()
```

### Phase 4: 테스트 코드 작성
**파일**: `backend/tests/` 디렉토리

#### 4-1. 단위 테스트
- `tests/test_ranking_engine.py`: 랭킹 정책 3종, 커버리지 필터, 중복 제거
- `tests/test_product_matcher.py`: 이름/브랜드/용량 매칭, assumptions 생성
- `tests/test_cache_service.py`: get/set/TTL만료/cleanup

#### 4-2. 통합 테스트
- `tests/test_plan_service.py`: Mock DB + Mock Provider로 전체 파이프라인
- `tests/test_api_routes.py`: FastAPI TestClient로 HTTP 엔드포인트

#### 4-3. 필수 시나리오 (기획서 12.2)
- TC-01: 정상 5품목 → 플랜 3개
- TC-04: 이동 제한 → 초과 매장 제외
- TC-05: 데이터 누락 → coverage 하락
- TC-06: Provider 장애 → degraded 응답
- TC-10: 금지 필드 미노출 검증

### Phase 5: pyproject.toml 의존성 추가
- `python-dotenv` (이미 사용 중이나 의존성 미선언)
- `pytest-httpx` (httpx 모킹용, 선택)

### Phase 6: 갭 분석
기획서 대비 구현 갭 확인 후 `docs/sprint2-gap-analysis.md` 작성

---

## 파일 변경 요약

| 작업 | 파일 | 유형 |
|------|------|------|
| 캐시 서비스 | `src/infrastructure/persistence/cache_service.py` | 신규 |
| 네이버 Place | `src/infrastructure/providers/naver_place.py` | 신규 |
| 네이버 Routing | `src/infrastructure/providers/naver_routing.py` | 신규 |
| 기상청 Weather | `src/infrastructure/providers/kma_weather.py` | 신규 |
| 메인 교체 | `src/main.py` | 수정 |
| 의존성 | `pyproject.toml` | 수정 |
| 테스트 | `tests/test_ranking_engine.py` | 신규 |
| 테스트 | `tests/test_product_matcher.py` | 신규 |
| 테스트 | `tests/test_cache_service.py` | 신규 |
| 테스트 | `tests/test_plan_service.py` | 신규 |
| 테스트 | `tests/test_api_routes.py` | 신규 |
| 갭 분석 | `docs/sprint2-gap-analysis.md` | 신규 |

## 검증 방법
1. `pytest tests/ -v` 전체 테스트 통과
2. `uvicorn src.main:app --reload` 후 curl로 generate 엔드포인트 테스트
3. 실제 API 키 설정 후 외부 API 응답 확인
4. 캐시 hit/miss 로그 확인
