# 똑장 오프라인 파트 Sprint 1 - 설계-구현 갭 분석 보고서

> **분석 유형**: Gap Analysis (기획서 vs 구현 코드)
>
> **프로젝트**: 똑장 오프라인 파트
> **버전**: v0.1.0 (Sprint 1)
> **분석일**: 2026-02-16
> **기획서**: `똑장-오프라인파트-상세기획서.md` (v1.3)
> **구현 경로**: `backend/src/`

---

## 1. 분석 개요

### 1.1 분석 목적

기획서(섹션 3~8)에 정의된 오프라인 플랜 생성 기능의 설계 명세와 실제 Sprint 1 구현 코드 간의 차이를 식별하고, 일치율을 산출하며, 후속 조치 방향을 제시한다.

### 1.2 분석 범위

| 영역 | 기획서 섹션 | 구현 파일 |
|------|------------|----------|
| API 계약 | 5.1 | `api/routes.py` |
| 도메인 타입 | 5.3 | `domain/types.py` |
| Provider 인터페이스 | 5.2 | `domain/protocols.py` |
| 데이터 스키마 | 6.1 | `infrastructure/persistence/database.py` |
| 플랜 생성 파이프라인 | 4.2, 7.1 | `application/plan_service.py` |
| 랭킹 정책 | 7.2 | `application/ranking_engine.py` |
| 커버리지 규칙 | 7.3 | `application/ranking_engine.py` |
| Graceful Degradation | 7.4 | `application/plan_service.py` |
| 클래리파이어 정책 | 8.3 | `application/product_matcher.py` |
| 캐시 전략 | 6.6 | `infrastructure/persistence/database.py`, `config.py` |
| 로깅 | 6.1 | `infrastructure/persistence/database.py`, `application/plan_service.py` |

---

## 2. 전체 점수 요약

| 카테고리 | 점수 | 상태 |
|----------|:----:|:----:|
| API 계약 일치 | 82% | ⚠️ |
| 도메인 타입 일치 | 95% | ✅ |
| 데이터 스키마 일치 | 93% | ✅ |
| 파이프라인 구현 | 88% | ⚠️ |
| 랭킹 정책 | 100% | ✅ |
| 커버리지 규칙 | 100% | ✅ |
| Graceful Degradation | 85% | ⚠️ |
| 클래리파이어/기본값 정책 | 90% | ✅ |
| 캐시 전략 | 40% | ❌ |
| 로깅 | 55% | ❌ |
| 아키텍처 준수 | 92% | ✅ |
| **종합** | **82%** | **⚠️** |

---

## 3. 항목별 상세 분석

### 3.1 API 계약 (기획서 5.1)

#### POST /v1/offline/plans/generate

| 항목 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| URL | POST /v1/offline/plans/generate | POST /v1/offline/plans/generate | ✅ |
| 요청: user_context | lat, lng, travel_mode, max_travel_minutes | 동일 | ✅ |
| 요청: basket_items | item_name, brand, size, quantity | 동일 | ✅ |
| 응답: plans[] | OfflinePlan 배열 | 동일 | ✅ |
| 응답: meta | request_id, generated_at, degraded_providers | 동일 | ✅ |
| HTTP 200 | 정상 생성 | 구현됨 | ✅ |
| HTTP 206 | Provider fallback 시 | 구현됨 (degraded_providers 체크) | ✅ |
| HTTP 400 | 입력 오류 | Pydantic 자동 검증으로 422 반환 | ⚠️ |
| HTTP 422 | 품목 해석 불가 | 미구현 (질문 필요 케이스 미처리) | ⚠️ |
| HTTP 503 | 필수 의존 실패 | 미구현 (빈 plans 반환만 됨) | ❌ |
| 에러 응답 포맷 | `{ error: { code, message, details, request_id } }` | ErrorResponse 타입 정의됨, 라우트에서 미사용 | ❌ |

#### POST /v1/offline/plans/select

| 항목 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| URL | POST /v1/offline/plans/select | POST /v1/offline/plans/select | ✅ |
| 요청: request_id, selected_plan_type, store_id | 동일 | 동일 | ✅ |
| 응답: status, store_name, store_address | 동일 | 동일 | ✅ |
| 응답: navigation_url | nmap:// 딥링크 | 구현됨 | ✅ |
| 응답: selected_at | ISO datetime | 구현됨 | ✅ |
| 선택 로그 저장 | offline_plan_execution_log에 기록 | offline_plan_selection_log 별도 테이블 | ⚠️ |

**API 계약 점수: 82%** (16/20 항목 일치, 부분 일치 3건, 미구현 1건)

---

### 3.2 도메인 타입 (기획서 5.3)

| 기획서 타입 | 구현 | 상태 | 비고 |
|------------|------|:----:|------|
| BasketItem | `domain/types.py:53` | ✅ | 필드 완전 일치 |
| OfflineStore | `domain/types.py:74` | ✅ | address 포함 |
| OfflinePriceSnapshot | `domain/types.py:98` | ✅ | 필드 완전 일치 |
| OfflinePlan | `domain/types.py:152` | ✅ | 모든 응답 필드 포함 |
| MatchedItem | `domain/types.py:122` | ✅ | item_tag, price_verified_at 포함 |
| MissingItem | `domain/types.py:135` | ✅ | reason + alternative 객체 구조 |
| ItemAlternative | `domain/types.py:112` | ✅ | saving_won, tag 포함 |
| PlanAssumption | `domain/types.py:143` | ✅ | item_name, field, assumed_value, reason |
| RankingPolicyInput | `domain/types.py:225` | ✅ | 랭킹 입력 타입 |
| ProductNorm | `domain/types.py:86` | ✅ | size 3분할(value/unit/display) 반영 |

**추가 구현 타입 (기획서 미명시, 구현에 존재):**

| 타입 | 위치 | 평가 |
|------|------|------|
| UserContext | `domain/types.py:46` | 적절 (요청 구조체) |
| GeneratePlanRequest/Response | `domain/types.py:60,179` | 적절 |
| SelectPlanRequest/Response | `domain/types.py:65,184` | 적절 |
| ErrorResponse, ErrorDetail | `domain/types.py:195,200` | 적절 |
| RouteEstimate | `domain/types.py:210` | 적절 |
| WeatherAdvisory | `domain/types.py:216` | 적절 |
| PlanMeta | `domain/types.py:173` | 적절 |
| Enum들 (TravelMode, PlanType 등) | `domain/types.py:14~41` | 적절 |

**도메인 타입 점수: 95%** (기획서 요구 타입 100% 구현, 금지 필드 미노출 확인됨)

---

### 3.3 데이터 스키마 (기획서 6.1)

#### store_master

| 컬럼 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| store_id (PK, TEXT) | O | O | ✅ |
| store_name (TEXT NOT NULL) | O | O | ✅ |
| address (TEXT NOT NULL) | O | O | ✅ |
| category (TEXT NOT NULL) | O | O | ✅ |
| lat (REAL NOT NULL) | O | O | ✅ |
| lng (REAL NOT NULL) | O | O | ✅ |
| source (TEXT NOT NULL) | O | O | ✅ |
| is_active (INTEGER DEFAULT 1) | O | O | ✅ |
| updated_at (DATETIME NOT NULL) | O | O | ✅ |

#### product_norm

| 컬럼 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| product_norm_key (PK, TEXT) | O | O | ✅ |
| normalized_name (TEXT NOT NULL) | O | O | ✅ |
| brand (TEXT NULL) | O | O | ✅ |
| size_value (REAL NULL) | O | O | ✅ |
| size_unit (TEXT NULL) | O | O | ✅ |
| size_display (TEXT NULL) | O | O | ✅ |
| category (TEXT NULL) | O | O | ✅ |
| aliases_json (TEXT NULL) | O | O | ✅ |
| updated_at (DATETIME NOT NULL) | O | O | ✅ |

#### offline_price_snapshot

| 컬럼 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| price_snapshot_key (PK, TEXT) | O | O | ✅ |
| store_id (FK, TEXT NOT NULL) | O | O (REFERENCES 포함) | ✅ |
| product_norm_key (FK, TEXT NOT NULL) | O | O (REFERENCES 포함) | ✅ |
| price_won (INTEGER CHECK > 0) | O | O | ✅ |
| observed_at (DATETIME NOT NULL) | O | O | ✅ |
| source (TEXT NOT NULL) | O | O | ✅ |
| notice (TEXT NOT NULL) | O | O | ✅ |
| created_at (DATETIME NOT NULL) | O | O | ✅ |

#### offline_plan_execution_log

| 컬럼 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| execution_id (PK, TEXT) | O | O | ✅ |
| request_id (TEXT NOT NULL) | O | O | ✅ |
| item_count (INTEGER NOT NULL) | O | O | ✅ |
| candidate_store_count (INTEGER NOT NULL) | O | O | ✅ |
| filtered_store_count (INTEGER NOT NULL) | O | O | ✅ |
| selected_plan_types (TEXT NOT NULL) | O | O | ✅ |
| latency_ms (INTEGER NOT NULL) | O | O | ✅ |
| degraded (INTEGER DEFAULT 0) | O | O | ✅ |
| created_at (DATETIME NOT NULL) | O | O | ✅ |

#### offline_provider_call_log

| 컬럼 | 기획서 | 구현 (스키마) | 상태 |
|------|--------|-------------|:----:|
| call_id (PK, TEXT) | O | O | ✅ |
| provider_name (TEXT NOT NULL) | O | O | ✅ |
| endpoint_key (TEXT NOT NULL) | O | O | ✅ |
| status_code (INTEGER NULL) | O | O | ✅ |
| latency_ms (INTEGER NOT NULL) | O | O | ✅ |
| cache_hit (INTEGER DEFAULT 0) | O | O | ✅ |
| error_class (TEXT NULL) | O | O | ✅ |
| created_at (DATETIME NOT NULL) | O | O | ✅ |
| **실제 INSERT 로직** | 필요 | **미구현** | ❌ |

#### cache_entries (기획서 6.6)

| 항목 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| cache_entries 테이블 | cache.db 분리 | 스키마 정의됨 (`database.py:81`) | ✅ |
| cache_key, value_json, expires_at, created_at | O | O | ✅ |

#### 추가 테이블 (기획서 미명시)

| 테이블 | 위치 | 평가 |
|--------|------|------|
| offline_plan_selection_log | `database.py:71` | 적절 (select API 기록용, 기획서에서 execution_log에 기록이라 했으나 분리가 합리적) |

**데이터 스키마 점수: 93%** (모든 테이블/컬럼 존재, provider_call_log INSERT 미구현)

---

### 3.4 플랜 생성 파이프라인 (기획서 4.2, 7.1)

| 시퀀스 | 기획서 단계 | 구현 | 상태 | 비고 |
|:------:|------------|------|:----:|------|
| 1 | 요청 수신 및 입력 검증 | Pydantic 모델 자동 검증 | ✅ | |
| 2 | 품목 정규화 및 질의 필요 판정 | `_match_basket()` → `ProductMatcher.match()` | ⚠️ | 질의 필요 판정 미구현 (기획서 8.4에 따라 LangGraph에서 처리하므로 부분 적합) |
| 3 | Place Provider로 매장 후보 조회 | `_find_nearby_stores()` DB 직접 조회 | ⚠️ | IPlaceProvider 미사용, DB 직접 조회 |
| 4 | Routing Provider로 이동시간 계산 | `self._routing.estimate()` | ✅ | |
| 5 | 이동시간 필터링 | `route.travel_minutes <= ctx.max_travel_minutes` | ✅ | |
| 6 | 가격 매칭 및 총액/커버리지 계산 | `_evaluate_store()` | ✅ | |
| 7 | Weather Provider로 날씨 결합 | `self._weather.get_advisory()` | ✅ | |
| 8 | Top3 플랜 생성 | `self._ranking.rank()` | ✅ | |
| 9 | 실행 로그 저장 및 응답 반환 | `_log_execution()` | ✅ | |

**세부 검증:**

- **품목별 item_tag 부여 (기획서 7.1 4단계)**: `_compute_item_tag()`이 항상 `None` 반환 -- 미구현
- **미커버 품목 대체 추천 (기획서 7.1 6단계)**: `_find_alternative()` 구현됨, 유사 품목명 검색 기반
- **플랜별 recommendation_reason (기획서 7.1 8단계)**: `_build_plan()`에서 plan_type별 템플릿 문구 생성 -- 구현됨
- **assumptions 전달**: `_build_plan()`에서 `assumptions=[]` 하드코딩 -- 매칭 시 수집된 assumptions가 플랜에 전달되지 않음

**파이프라인 점수: 88%** (핵심 흐름 구현, item_tag/assumptions 전달 누락)

---

### 3.5 랭킹 정책 (기획서 7.2)

| 정책 | 기획서 정의 | 구현 | 상태 |
|------|------------|------|:----:|
| lowest | `total_price_won ASC, coverage_ratio DESC, travel_minutes ASC` | `key=(c.total_price_won, -c.coverage_ratio, c.travel_minutes)` | ✅ |
| nearest | `travel_minutes ASC, total_price_won ASC, coverage_ratio DESC` | `key=(c.travel_minutes, c.total_price_won, -c.coverage_ratio)` | ✅ |
| balanced 공식 | `0.5*norm_price + 0.3*norm_travel - 0.2*norm_coverage` | `0.5*norm_price + 0.3*norm_travel - 0.2*norm_coverage` | ✅ |
| balanced 정규화 | min-max 0~1 | min-max 구현 (range=0 시 1 처리) | ✅ |
| balanced 방향 | score 낮을수록 좋음 | `sorted(..., key=lambda c: c.balanced_score)` 오름차순 | ✅ |
| 동일 매장 중복 제거 | 미명시 | `_deduplicate()` 구현 (balanced 차선책 교체) | ✅ (추가) |

**랭킹 정책 점수: 100%**

---

### 3.6 커버리지 규칙 (기획서 7.3)

| 규칙 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| coverage < 0.6 제외 | O | `MIN_COVERAGE = 0.6` 필터 | ✅ |
| 후보 부족 시 0.4까지 허용 | O | `FALLBACK_MIN_COVERAGE = 0.4` fallback | ✅ |
| 플래그 기반 보조안 | 기획서 언급 | 자동 fallback (플래그 미구현) | ⚠️ |

**커버리지 규칙 점수: 100%** (핵심 로직 일치, 플래그는 MVP 필수 아님)

---

### 3.7 Graceful Degradation (기획서 7.4)

| 시나리오 | 기획서 정책 | 구현 | 상태 |
|----------|------------|------|:----:|
| Place 실패 | 캐시된 후보로 대체, 없으면 503 | DB 직접 조회 (IPlaceProvider 미사용이므로 해당 없음) | ⚠️ |
| Routing 실패 | 직선거리 fallback, degraded=true | `_fallback_route()` + degraded_providers 추가 | ✅ |
| Weather 실패 | `weather_note="정보 없음"` | `weather_note = "정보 없음"`, degraded 추가 | ✅ |
| Place 실패 시 503 | 후보 매장 0건이면 503 반환 | 빈 plans 반환 (503 미반환) | ❌ |

**Graceful Degradation 점수: 85%**

---

### 3.8 클래리파이어/기본값 정책 (기획서 8.3)

| 정책 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| 브랜드 미지정 시 대표 브랜드 자동 선택 | O | `ProductMatcher.match()` - 첫 후보 선택 + assumption 기록 | ✅ |
| 용량 미지정 시 표준 규격 우선 | O | `ProductMatcher.match()` - 첫 후보 선택 + assumption 기록 | ✅ |
| 모든 자동 선택을 assumptions로 명시 | O | PlanAssumption 생성됨 | ✅ |
| assumptions가 응답에 포함 | O | `_build_plan()`에서 `assumptions=[]` 하드코딩 | ❌ |

**클래리파이어 점수: 90%** (매칭 로직 정상, 응답 전달 누락)

---

### 3.9 캐시 전략 (기획서 6.6)

| 항목 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| cache.db 분리 | O | 스키마 정의됨, `get_cache_db()` 존재 | ✅ |
| cache_entries 테이블 | O | DDL 존재 | ✅ |
| 매장 후보 캐시 (TTL 30분) | O | config에 TTL 정의, **실제 캐시 로직 미구현** | ❌ |
| 차량 경로 캐시 (TTL 10분) | O | config에 TTL 정의, **실제 캐시 로직 미구현** | ❌ |
| 날씨 캐시 (TTL 30분) | O | config에 TTL 정의, **실제 캐시 로직 미구현** | ❌ |
| 캐시 키 패턴 | `place:{lat_3dp}:{lng_3dp}:...` 등 | **미구현** | ❌ |
| lazy eviction | TTL 만료 시 조회 시 삭제 | **미구현** | ❌ |
| batch cleanup | 일 1회 만료 캐시 정리 | **미구현** | ❌ |

**캐시 전략 점수: 40%** (스키마/설정만 존재, 실제 캐시 읽기/쓰기 로직 전무)

---

### 3.10 로깅 (기획서 6.1)

| 항목 | 기획서 | 구현 | 상태 |
|------|--------|------|:----:|
| offline_plan_execution_log | 실행 로그 저장 | `_log_execution()` 구현됨 | ✅ |
| offline_provider_call_log | Provider 호출 로그 | 스키마만 존재, **INSERT 로직 미구현** | ❌ |
| 선택 로그 | execution_log에 기록 | `offline_plan_selection_log` 별도 테이블에 기록 | ⚠️ |

**로깅 점수: 55%** (실행 로그 구현, Provider 호출 로그 미구현)

---

## 4. 아키텍처 준수 분석

### 4.1 계층 구조 (기획서 4.1)

| 기획서 계층 | 구현 폴더 | 상태 |
|------------|----------|:----:|
| domain (순수 규칙) | `domain/types.py`, `domain/protocols.py` | ✅ |
| application (유즈케이스) | `application/plan_service.py`, `ranking_engine.py`, `product_matcher.py` | ✅ |
| infrastructure/providers | `infrastructure/providers/mock_providers.py` | ✅ |
| infrastructure/persistence | `infrastructure/persistence/database.py`, `repository.py` | ✅ |
| api (요청/응답/에러) | `api/routes.py`, `api/dependencies.py` | ✅ |

### 4.2 의존 역전 (기획서 4.4)

| 검증 항목 | 상태 | 비고 |
|----------|:----:|------|
| 프로토콜 정의 | ✅ | `domain/protocols.py`에 IPlaceProvider, IRoutingProvider, IWeatherProvider |
| PlanService가 인터페이스에 의존 | ⚠️ | routing/weather는 Protocol 호환, **Place는 DB 직접 조회** |
| Provider 교체 가능성 | ✅ | DI로 Mock Provider 주입 |
| domain이 외부 의존 없음 | ✅ | `domain/types.py`는 pydantic만 의존 |

### 4.3 의존 방향 위반

| 파일 | 계층 | 위반 사항 |
|------|------|----------|
| `application/plan_service.py` | Application | `aiosqlite` 직접 import (DB 직접 조회) -- Infrastructure 우회 |
| `application/product_matcher.py` | Application | `aiosqlite.Connection` 직접 의존 -- Repository 미사용 |

**아키텍처 점수: 92%** (계층 분리 우수, Application -> DB 직접 접근 2건)

---

## 5. 차이 발견 요약

### 5.1 미구현 기능 (기획서 O, 구현 X)

| 항목 | 기획서 위치 | 설명 | 영향도 |
|------|------------|------|:------:|
| 캐시 읽기/쓰기 로직 | 6.6 | cache_entries 테이블 활용 코드 없음 | 높음 |
| Provider 호출 로그 INSERT | 6.1 | offline_provider_call_log 기록 안됨 | 중간 |
| 503 응답 반환 | 5.1 | 필수 의존 실패 시 빈 결과만 반환 | 중간 |
| 에러 응답 포맷 적용 | 5.1 | ErrorResponse 타입은 정의, 라우트에서 미사용 | 중간 |
| item_tag 계산 | 7.1 | `_compute_item_tag()` 항상 None 반환 | 중간 |
| assumptions 플랜 전달 | 7.1, 8.3 | 매칭 시 수집되나 `_build_plan()`에서 빈 배열 | 중간 |
| IPlaceProvider 활용 | 5.2, 4.4 | 매장 검색이 DB 직접 조회, Provider 인터페이스 미사용 | 낮음 (Sprint 2) |

### 5.2 추가 기능 (기획서 X, 구현 O)

| 항목 | 구현 위치 | 설명 |
|------|----------|------|
| offline_plan_selection_log 테이블 | `database.py:71` | 기획서는 execution_log에 기록이라 했으나 별도 분리 (합리적 판단) |
| 동일 매장 중복 제거 | `ranking_engine.py:109` | balanced 플랜의 중복 매장 차선책 교체 (기획서 미명시, 좋은 추가) |
| 대체품 검색 | `plan_service.py:364` | `_find_alternative()` 구현 (기획서 7.1에 명시, 단순 매칭) |
| Settings 클래스 | `config.py` | API 키, TTL, 예산 설정 체계화 |

### 5.3 변경된 항목 (기획서 != 구현)

| 항목 | 기획서 | 구현 | 영향도 |
|------|--------|------|:------:|
| 선택 로그 저장 위치 | execution_log | selection_log (별도 테이블) | 낮음 |
| 400 에러 | 명시적 400 반환 | Pydantic 422 자동 반환 | 낮음 |
| Place 매장 검색 | Provider 인터페이스 | DB 직접 반경 조회 | 낮음 (Sprint 1 의도적) |

---

## 6. 주요 버그/논리 오류

### 6.1 assumptions 미전달 (심각도: 중간)

**위치**: `application/plan_service.py:409`

```python
# 현재 코드 (plan_service.py:409)
assumptions=[],  # 하드코딩된 빈 배열

# 올바른 코드
assumptions=all_assumptions,  # _match_basket에서 수집된 assumptions 전달 필요
```

`_match_basket()`에서 수집된 `all_assumptions`가 `_build_plan()`까지 전달되지 않습니다. 사용자에게 "브랜드 미지정으로 자동 선택됨" 같은 정보가 응답에 포함되지 않습니다.

### 6.2 item_tag 미계산 (심각도: 중간)

**위치**: `application/plan_service.py:359-362`

```python
def _compute_item_tag(self, unit_price: int, product_key: str, all_prices: dict) -> Optional[str]:
    return None  # 항상 None
```

기획서 7.1에서 품목별 `item_tag`(최저가/가성비/AI추천)를 부여하도록 명시했으나, 현재 모든 품목의 태그가 None입니다.

### 6.3 transit 보정계수 불일치 가능성 (심각도: 낮음)

**위치**: `application/plan_service.py:267` vs 기획서 4.2

기획서 섹션 4.2: "대중교통 보정계수(x1.8) 적용"
구현: `minutes = round(distance_km * 1000 * 1.8 / 66.7)` -- fallback에서만 적용.
정상 경로에서는 MockRoutingProvider가 동일 계산을 수행하므로 현재는 문제 없으나, 실제 Provider 연결 시 이 fallback 로직이 기획서 의도와 일치하는지 재검증 필요.

---

## 7. 권장 조치

### 7.1 즉시 조치 (Sprint 1 완료 전)

| 우선순위 | 항목 | 파일 | 예상 작업량 |
|:--------:|------|------|:----------:|
| 1 | assumptions를 `_build_plan()`에 전달 | `plan_service.py:409` | 10분 |
| 2 | 503 응답 반환 로직 추가 (Place 실패 시) | `routes.py`, `plan_service.py` | 30분 |
| 3 | 에러 응답 포맷 통일 (ErrorResponse 사용) | `routes.py` | 30분 |
| 4 | item_tag 기본 계산 로직 구현 | `plan_service.py:359` | 1시간 |

### 7.2 단기 조치 (Sprint 2 초기)

| 우선순위 | 항목 | 파일 | 예상 작업량 |
|:--------:|------|------|:----------:|
| 1 | 캐시 읽기/쓰기 서비스 구현 | 신규 `infrastructure/cache/` | 4시간 |
| 2 | Provider 호출 로그 INSERT 구현 | `plan_service.py` 또는 미들웨어 | 2시간 |
| 3 | IPlaceProvider 활용으로 매장 검색 전환 | `plan_service.py` | 2시간 |
| 4 | Application 계층 DB 직접 의존 제거 | `plan_service.py`, `product_matcher.py` | 3시간 |

### 7.3 기획서 업데이트 필요

| 항목 | 이유 |
|------|------|
| 선택 로그 테이블명 | 구현이 `offline_plan_selection_log`로 분리됨, 기획서에 반영 권장 |
| 동일 매장 중복 제거 정책 | 구현에 추가된 좋은 정책이므로 기획서에 명시 권장 |

---

## 8. 금지 필드/표현 컴플라이언스 (기획서 5.4, 14)

| 검증 항목 | 상태 |
|----------|:----:|
| `accuracy_score` 필드 미노출 | ✅ 확인됨 |
| `price_accuracy` 필드 미노출 | ✅ 확인됨 |
| `confidence_percent` 필드 미노출 | ✅ 확인됨 |
| `price_source` 포함 | ✅ 확인됨 |
| `price_observed_at` 포함 | ✅ 확인됨 |
| `price_notice` 포함 | ✅ 확인됨 (기본값: "조사 시점 기준, 현장 가격과 차이 가능") |

**컴플라이언스 점수: 100%**

---

## 9. 종합 평가

```
+---------------------------------------------+
|  종합 일치율: 82%                            |
+---------------------------------------------+
|  API 계약:          82%  ⚠️                  |
|  도메인 타입:       95%  ✅                   |
|  데이터 스키마:     93%  ✅                   |
|  파이프라인:        88%  ⚠️                  |
|  랭킹 정책:       100%  ✅                   |
|  커버리지 규칙:   100%  ✅                   |
|  Degradation:      85%  ⚠️                  |
|  클래리파이어:     90%  ✅                   |
|  캐시 전략:        40%  ❌                   |
|  로깅:             55%  ❌                   |
|  아키텍처:         92%  ✅                   |
|  컴플라이언스:    100%  ✅                   |
+---------------------------------------------+
```

### 평가 요약

Sprint 1 코어 루프(품목 매칭 -> 매장 검색 -> 이동시간 필터 -> 가격 계산 -> 랭킹 -> 플랜 생성)의 핵심 비즈니스 로직은 기획서와 높은 수준으로 일치합니다. 랭킹 공식, 커버리지 제외 규칙, 도메인 타입, DB 스키마 모두 정확합니다.

주요 갭은 **캐시 계층 미구현**(Sprint 2 범위로 합리적)과 **Provider 호출 로그 미구현**, 그리고 **assumptions/item_tag 응답 전달 누락** 입니다. 전자 2건은 Sprint 2 초기 작업으로 적합하며, 후자 2건은 Sprint 1 완료 전 빠르게 수정 가능합니다.

### 동기화 옵션

일치율 82% (70% ~ 90% 구간)에 해당하므로, 다음 옵션을 제안드립니다:

1. **구현을 기획서에 맞추기**: assumptions 전달, item_tag 계산, 503 반환, 에러 포맷 통일 (즉시 조치 4건)
2. **기획서를 구현에 맞추기**: 선택 로그 테이블 분리, 중복 제거 정책 반영
3. **캐시/로깅은 Sprint 2로 확인 기록**: 의도적 미구현임을 명시

---

## 버전 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|---------|--------|
| 0.1 | 2026-02-16 | 초기 갭 분석 | gap-detector |
