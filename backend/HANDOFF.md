# HANDOFF - Sprint 2 실행 가이드

## Goal
Sprint 2: 실제 외부 API 연동 + 캐시 계층 + 테스트 코드 + 갭 분석

## Current State
Sprint 1 완료. Mock Provider 기반 코어 로직 동작 중.
- `uvicorn src.main:app` 으로 서버 실행 가능
- `POST /v1/offline/plans/generate` 엔드포인트 동작 확인됨
- Mock 데이터 20매장, 80품목, ~1071 가격 스냅샷 시딩됨 (app.db)
- `.env` 파일에 실제 API 키 설정됨 (네이버, 기상청, KAMIS)

## 핵심 파일 맵

### 수정 불필요 (읽기 참조용)
| 파일 | 역할 |
|------|------|
| `src/domain/types.py` | Pydantic 도메인 모델 전체 |
| `src/domain/protocols.py` | IPlaceProvider, IRoutingProvider, IWeatherProvider 프로토콜 |
| `src/application/ranking_engine.py` | 3종 랭킹 정책 (lowest/nearest/balanced) |
| `src/application/product_matcher.py` | 장바구니→product_norm 매칭 |
| `src/application/plan_service.py` | 플랜 생성 8단계 파이프라인 오케스트레이터 |
| `src/api/routes.py` | FastAPI 라우트 (generate, select) |
| `src/config.py` | Settings dataclass (API 키, 캐시 TTL 등) |
| `src/infrastructure/persistence/database.py` | DB 스키마, 연결 관리 |
| `src/infrastructure/providers/mock_providers.py` | Sprint 0 Mock (fallback용 유지) |

### 수정 필요
| 파일 | 변경 내용 |
|------|-----------|
| `src/main.py` | Provider를 실제 구현체로 교체 |
| `pyproject.toml` | python-dotenv 의존성 추가 |

### 신규 생성 필요
| 파일 | 내용 |
|------|------|
| `src/infrastructure/persistence/cache_service.py` | SQLite 캐시 서비스 (cache.db) |
| `src/infrastructure/providers/naver_place.py` | 네이버 Local 검색 API |
| `src/infrastructure/providers/naver_routing.py` | 네이버 Directions 5 API (차량) |
| `src/infrastructure/providers/kma_weather.py` | 기상청 단기예보 API |
| `tests/test_ranking_engine.py` | 랭킹 엔진 단위 테스트 |
| `tests/test_product_matcher.py` | 품목 매칭 단위 테스트 |
| `tests/test_cache_service.py` | 캐시 서비스 단위 테스트 |
| `tests/test_plan_service.py` | 플랜 서비스 통합 테스트 |
| `tests/test_api_routes.py` | API 엔드포인트 통합 테스트 |

---

## Phase 1: 캐시 서비스 (cache_service.py)

**스키마 (이미 존재)**: `database.py:80-88`
```sql
cache_entries(cache_key TEXT PK, value_json TEXT, expires_at DATETIME, created_at DATETIME)
```

**구현 요구사항**:
- `get(key)` → 만료 확인 후 반환, 만료 시 삭제 (lazy eviction)
- `set(key, value_json, ttl_seconds)` → upsert
- `delete_pattern(prefix)` → `cache_key LIKE ?` 삭제
- `cleanup_expired()` → 전체 만료 항목 삭제
- `get_cache_db()` (database.py:100) 사용

**캐시 키 패턴 (기획서 6.6)**:
- 매장 후보: `place:{lat소수3자리}:{lng소수3자리}:{category}:{radius}` TTL=1800s
- 차량 경로: `route:car:{olat}:{olng}:{dlat}:{dlng}` TTL=600s
- 날씨: `weather:{lat소수2자리}:{lng소수2자리}:{hour_block}` TTL=1800s

---

## Phase 2: 실제 Provider 구현

### 2-1. NaverLocalPlaceProvider (naver_place.py)

**API**: `GET https://openapi.naver.com/v1/search/local.json`
**인증 헤더**: `X-Naver-Client-Id`, `X-Naver-Client-Secret`
**파라미터**: `query=마트&display=5&start=1&sort=random`

**주의사항**:
- 이 API는 좌표 기반 검색이 아님. 키워드 검색임.
- 응답의 `mapx`, `mapy`는 카텍 좌표 → WGS84 변환 필요 (또는 응답의 roadAddress로 판단)
- 반환값을 OfflineStore로 변환 후 거리 필터링 필요
- 캐시 적용 후 반환

**프로토콜 시그니처** (protocols.py:12):
```python
async def search_nearby(self, lat, lng, categories, radius) -> list[OfflineStore]
```

**참고**: Sprint 1에서는 DB 직접 조회로 매장을 찾고 있음 (plan_service.py:248-260).
Place Provider는 DB에 없는 신규 매장 발견용으로, 기존 DB 조회와 병합하는 방식을 고려할 것.

### 2-2. NaverRoutingProvider (naver_routing.py)

**API**: `GET https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving`
**인증 헤더**: `X-NCP-APIGW-API-KEY-ID`, `X-NCP-APIGW-API-KEY`
**파라미터**: `start={lng},{lat}&goal={lng},{lat}` (경도가 먼저!)

**응답 파싱**:
```json
{
  "route": {
    "traoptimal": [{
      "summary": {
        "distance": 12345,  // 미터
        "duration": 600000  // 밀리초
      }
    }]
  }
}
```

**travel_mode별 처리**:
- `car`: 실제 API 호출
- `walk`: 기존 직선거리×1.3/4km/h 추정 (mock_providers.py:38-40 로직)
- `transit`: 기존 직선거리×1.8 추정 (mock_providers.py:41-42 로직)

**프로토콜 시그니처** (protocols.py:20):
```python
async def estimate(self, origin, destination, travel_mode) -> RouteEstimate
```

### 2-3. KmaWeatherProvider (kma_weather.py)

**API**: `GET http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`
**인증**: `serviceKey` 쿼리 파라미터 (URL 인코딩 주의)
**파라미터**: `base_date=YYYYMMDD&base_time=0500&nx=60&ny=127&numOfRows=100&dataType=JSON`

**위경도→격자 변환**: LCC 투영법 구현 필요 (기상청 제공 공식)
- 서울 강남역 기준: lat=37.498, lng=127.028 → nx=61, ny=126 (대략)

**응답에서 추출할 카테고리**:
- POP: 강수확률 (%)
- TMP: 기온 (℃)
- PTY: 강수형태 (0=없음, 1=비, 2=비/눈, 3=눈, 4=소나기)
- SKY: 하늘상태 (1=맑음, 3=구름많음, 4=흐림)

**WeatherAdvisory 변환 규칙**:
- PTY > 0 → note="비 예보" 또는 "눈 예보"
- POP >= 60 → note에 강수확률 추가
- PTY == 0, SKY == 1 → note="맑음"

**프로토콜 시그니처** (protocols.py:27):
```python
async def get_advisory(self, lat, lng, time_window) -> WeatherAdvisory
```

### 2-4. Provider 호출 로깅

각 Provider 메서드에서 `offline_provider_call_log` 테이블에 기록:
```python
await db.execute(
    "INSERT INTO offline_provider_call_log VALUES (?,?,?,?,?,?,?,?)",
    (uuid4(), provider_name, endpoint_key, status_code, latency_ms, cache_hit, error_class, now())
)
```

---

## Phase 3: main.py 수정

```python
# 변경 전 (현재)
routing = MockRoutingProvider()
weather = MockWeatherProvider()

# 변경 후
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.providers.naver_routing import NaverRoutingProvider
from src.infrastructure.providers.kma_weather import KmaWeatherProvider

cache_db = await get_cache_db()
cache = CacheService(cache_db)
settings = get_settings()

if settings.ncp_client_id:
    routing = NaverRoutingProvider(settings, cache, db)
else:
    routing = MockRoutingProvider()

if settings.kma_service_key:
    weather = KmaWeatherProvider(settings, cache, db)
else:
    weather = MockWeatherProvider()

# cleanup에 cache_db.close() 추가
```

---

## Phase 4: 테스트 코드

### conftest.py (tests/conftest.py)
```python
# 공통 fixture: in-memory SQLite DB, Mock 데이터 시딩
@pytest.fixture
async def test_db():
    db = await aiosqlite.connect(":memory:")
    db.row_factory = aiosqlite.Row
    await db.executescript(APP_SCHEMA)
    # 테스트 매장/품목/가격 시딩
    ...
    yield db
    await db.close()
```

### test_ranking_engine.py
- `test_lowest_selects_cheapest_store`
- `test_nearest_selects_closest_store`
- `test_balanced_uses_weighted_score`
- `test_coverage_below_06_excluded`
- `test_coverage_04_fallback_when_no_06`
- `test_deduplication_replaces_balanced`

### test_product_matcher.py
- `test_exact_name_match`
- `test_brand_filter`
- `test_size_filter`
- `test_no_brand_creates_assumption`
- `test_no_size_creates_assumption`
- `test_alias_fallback`
- `test_no_match_returns_none`

### test_plan_service.py
- `test_generate_plans_returns_three_plans`
- `test_generate_empty_basket_error`
- `test_no_nearby_stores_returns_503`
- `test_routing_failure_degrades_gracefully`
- `test_weather_failure_returns_info_unavailable`
- `test_select_plan_returns_navigation_url`
- `test_select_nonexistent_store_returns_404`

### test_api_routes.py
- `test_generate_endpoint_200`
- `test_generate_endpoint_206_degraded`
- `test_generate_endpoint_503_no_stores`
- `test_select_endpoint_200`
- `test_select_endpoint_404`
- `test_compliance_no_accuracy_fields` (TC-10)

### test_cache_service.py
- `test_set_and_get`
- `test_expired_returns_none`
- `test_cleanup_removes_expired`
- `test_delete_pattern`

---

## Phase 5: pyproject.toml 수정

```toml
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "pydantic>=2.0.0",
    "aiosqlite>=0.20.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",  # 추가
]
```

---

## Phase 6: 갭 분석

기획서 섹션별 구현 여부를 `docs/sprint2-gap-analysis.md`에 정리.
주요 확인 항목:
- 섹션 5.1: API 응답 필드 완전성
- 섹션 6.6: 캐시 TTL/키패턴 일치
- 섹션 7.2: 랭킹 정책 정확성
- 섹션 7.4: Graceful Degradation 동작
- 섹션 10.3: 비용 예산 제어
- 섹션 12.2: 필수 테스트 시나리오 통과
- 섹션 14.4: 컴플라이언스 체크리스트

---

## 진행 체크리스트

- [ ] Phase 1: cache_service.py 구현
- [ ] Phase 2-1: naver_place.py 구현
- [ ] Phase 2-2: naver_routing.py 구현
- [ ] Phase 2-3: kma_weather.py 구현
- [ ] Phase 3: main.py Provider 교체
- [ ] Phase 5: pyproject.toml 수정
- [ ] Phase 4-0: conftest.py 공통 fixture
- [ ] Phase 4-1: test_ranking_engine.py
- [ ] Phase 4-2: test_product_matcher.py
- [ ] Phase 4-3: test_cache_service.py
- [ ] Phase 4-4: test_plan_service.py
- [ ] Phase 4-5: test_api_routes.py
- [ ] Phase 6: 갭 분석 문서 작성
- [ ] 전체 pytest 통과 확인

## Constraints
- .env에 API 키가 없으면 Mock fallback 유지 (CI/개발 환경 호환)
- httpx 비동기 클라이언트 사용 (pyproject.toml에 이미 포함)
- 기획서 금지 필드(accuracy_*, confidence_*) 절대 노출 금지
- 네이버 Directions API는 경도,위도 순서 (lat,lng 아님!)
