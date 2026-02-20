# 똑장ver2 통합 실행 계획 v1.10 (Online MVP Hardening Completed)

기준일: 2026-02-19  
기준 문서: `README.md`, `backend/README.md`, `reference/backend/reference_guide.md`, `reference/backend/reference_guide2.md`

## 1. 목표
- `ver2` API/프론트 계약은 유지하면서 `E:\AI\똑장\backend` 오프라인 엔진을 단계 이식한다.
- 충돌 시 우선순위:
1. API/화면 계약은 `ver2` 기준 유지
2. 오프라인 품질(매칭/후보/랭킹/fallback)은 루트 `backend` 기준 반영

## 2. 단계별 계획

## Phase 1 — 데이터/매칭 엔진 이식 (완료)
- 목적: mock 하드코딩 중심 로직을 DB 기반 오프라인 엔진으로 전환
- 작업:
1. 루트 `backend/mock` 데이터 자동 seed (`store_master`, `product_norm`, `offline_price_snapshot`)
2. DB 기반 품목 매칭 서비스 이식 (`ProductMatcherDB`)
3. DB 기반 플랜 후보 생성 어댑터 이식 (`OfflinePlanAdapter`)
4. `plans.generate`를
   - 1순위 DB 어댑터
   - 2순위 기존 mock fallback
   구조로 전환
5. 회귀 테스트 추가
- 결과:
1. 오프라인 품목 인식/가격 소스가 DB 스냅샷 기준으로 동작
2. API 계약(`PlanListResponse`)은 기존 그대로 유지

## Phase 2 — 오프라인 컨텍스트 확장 (완료)
- 목적: 사용자 맥락(위치/이동수단/시간)을 플랜 엔진 입력으로 확대
- 구현 전략(확정):
1. 프론트가 가능한 context를 전달
2. 누락 필드는 백엔드 기본값(강남 좌표/도보/30분) fallback
- 작업:
1. `POST /api/v1/plans/generate` 요청 본문에 `user_context`(optional) 추가
2. `OfflinePlanAdapter`에 context 입력 반영:
   - `lat/lng` 기준 후보 매장 반경 동적 산정
   - `travel_mode/max_travel_minutes` 기반 후보 필터링
   - place/routing provider 결과를 사용하고 실패 시 degraded 처리
3. 응답 `meta` 확장:
   - `degraded_providers`
   - `effective_context`
   - `weather_note`
4. 프론트 연동:
   - 온보딩 위치/이동수단을 로컬 저장(`planUserContext`)
   - 플랜 생성 시 `user_context`를 함께 전달
5. MockRouting 보정:
   - 이동수단별 소요시간 차등 계산으로 context 효과 보장
- 결과:
1. 같은 장바구니여도 이동수단/위치에 따라 오프라인 거리/시간 표기가 달라짐
2. context 미전달 클라이언트도 기존과 동일하게 동작(하위호환 유지)

## Phase 3 — 추천 품질 고도화 (완료)
- 목적: 대체상품/미매칭 후보/브랜드 선호 반영 강화
- 작업:
1. 미커버 품목 대체 추천 구조 이식
2. `preferences`와 매칭 엔진 결합
3. chat parser와 matcher를 연결해 발화-플랜 정합성 강화
- 결과:
1. `Plan.missing_items` + `alternative` 구조로 미커버 품목 대체 추천 노출
2. like/dislike 브랜드가 DB matcher 점수와 플랜 설명/배지에 반영
3. chat에서 DB matcher 해석 결과를 parser에 주입해 발화-플랜 품목명이 더 일관되게 정규화

## Phase 4 — 프론트 UX 정합성 마무리 (완료)
- 목적: 오프라인 엔진 고도화 결과를 UI에서 명확히 전달
- 작업:
1. 온라인/오프라인 비교 근거(거리/ETA/배송비/커버리지) 시각화
2. 예약/반복 장보기 실제 기능 범위 정리 및 UI 연결
3. 마이페이지 히스토리와 플랜 근거 연결
- 결과:
1. Top3에서 플랜 비교 근거(헤드라인/분석메타/대체안)가 노출됨
2. 주문 내역에 플랜 근거가 함께 저장되어 추적 가능
3. 예약(반복 장보기) 생성/활성화/삭제가 실제 상태로 동작
- 완료 기준:
1. 데모 시나리오에서 “왜 이 플랜인지” 사용자 관점 설명 가능

## Phase 6 — Online MVP Hardening (완료)
- 목적: `최종 종합 기획서.md`, `똑장-해커톤-제출용.md` 기준으로 온라인 파트를 MVP 수준에서 안정화한다.
- 우선순위:
1. 온라인/오프라인 결과 차이를 사용자에게 명확히 보이게 한다.
2. 온라인 Top3 + 신뢰 필드(출처/갱신시점/주의문구) + 실행 링크를 끊김 없이 제공한다.
3. 장애 시 degraded/fallback으로 데모 중단을 방지한다.

### Phase 6-A — 온라인 응답 계약 고정
- 작업:
1. Plan 모델/DTO에 온라인 신뢰 필드 추가 (optional 우선): `price_source`, `price_observed_at`, `price_notice`, `data_source`, `mall_product_links`, `direct_cart_supported`
2. 프론트 타입(`frontend/src/api.ts`)과 1:1 정합성 확보
- 완료 기준:
1. 기존 화면/테스트 회귀 없이 타입 확장 완료

### Phase 6-B — 온라인 후보 생성 엔진 실연결
- 작업:
1. `mode=online` 경로를 온라인 전용 어댑터(네이버 쇼핑 provider 기반)로 분리
2. 품목별 검색 -> 몰별 최저 매칭 -> 장바구니 총액/커버리지 계산
3. 배송 ETA/배송비 반영 `estimated_total` 산출
4. 키 미설정/외부 실패 시 degraded + fallback 경로 유지
- 완료 기준:
1. 온라인 Top3가 오프라인과 다른 근거 데이터로 생성
2. 실패 시 빈 결과 대신 안내 가능한 degraded 결과 제공

### Phase 6-C — 온라인 실행 연결/보안 고정
- 작업:
1. 온라인 플랜에 외부몰 이동 링크(`mall_product_links` 또는 `cart_url`) 연결
2. 허용 도메인 화이트리스트 검증으로 오픈 리다이렉트 차단
3. 승인 기반 실행 UX 유지(자동결제 금지)
- 완료 기준:
1. 온라인 상세에서 실제 이동 가능한 CTA 동작
2. 비허용 URL 차단 케이스 검증 통과

### Phase 6-D — 신뢰 UI/근거 시각화 마무리
- 작업:
1. Top3/상세에 출처/갱신시점/주의문구 고정 노출
2. 온라인/오프라인 근거 표시 분리 (배송/ETA vs 거리/이동시간)
3. degraded 문구/상태 표시 통일
- 완료 기준:
1. 사용자 관점에서 "왜 이 추천인지" 한 화면에서 설명 가능

### Phase 6-E — 검증 게이트
- 작업:
1. 백엔드 테스트에 온라인 회귀 세트 추가
2. 핵심 시나리오 검증:
   - 온라인 Top3 생성(5품목)
   - 신뢰 필드 노출
   - degraded/fallback 노출
   - 온라인 실행 링크 유효성/화이트리스트 차단
   - 온라인/오프라인 결과 차이
3. 프론트 빌드 + E2E 수동 리허설 실행
- 완료 기준:
1. `pytest -q` PASS
2. `npm run build` PASS
3. 입력 -> 비교 -> 승인 데모 루프 3회 연속 성공

## Phase 6 범위 고정 (MVP)
- In Scope:
1. 온라인 Top3 실데이터화
2. 온라인 실행 링크 제공(몰 이동)
3. 신뢰 필드/근거 필드 노출
4. degraded/fallback 안정화
- Out of Scope:
1. 완전자동결제
2. 외부몰 장바구니 직접 담기(파트너 API 연동 전)
3. 예약 스케줄러 본체 고도화

## Phase 6 결정 결과 (확정)
1. 온라인 API는 `GET /api/v1/plans/generate?mode=online` 단일 경로를 유지한다.
2. 온라인 후보 몰은 `이마트/홈플러스/컬리` 기본 3개에 `쿠팡` 노출을 확장한다.
3. 온라인 CTA 기본은 외부몰 이동으로 유지하고 `direct_cart_supported=false`를 기본값으로 둔다.

## Phase 6-F — 2차 리뷰 Follow-up (완료)
- 목적: 2차 리뷰에서 남은 UX/계산식/리팩토링 이슈(HIGH~LOW)를 빠르게 해소한다.
- 작업:
1. HIGH-1: `CartViewScreen` 하단 CTA를 `PAYMENT` 직행에서 `MODE_SELECTION` 유도로 변경, 버튼 문구를 `플랜 비교하기`로 교체
2. HIGH-2: `transit` 이동시간 공식을 도보보다 빠르게 보정 (`~4분/km`)
3. MEDIUM-1: `fetchPlans()`에서 `TOP3_RESULT` 화면에서는 `LOADING` 강제 전환을 생략
4. MEDIUM-2: `CompletionScreen` 소비 분석 문구를 주문 데이터 기반 동적 텍스트로 변경
5. MEDIUM-3 + LOW-1: `_haversine_km` 중복 제거(`geo` 유틸 추출) + 함수 내부 `import math` 제거
- 완료 기준:
1. 리뷰 지적 5개 항목 모두 코드 반영
2. `pytest -q`, `npm run build` 회귀 통과
3. `HISTORY.md`에 배치 기록 반영
- 검증 결과:
1. `cd backend && pytest -q` -> `57 passed in 14.48s`
2. `cd frontend && npm run build` -> `vite v6.3.5 build success`

## Phase 7-A — 보안 의존성 업그레이드(1차, 완료)
- 목적: v2.6 `pip-audit` 피드백에서 나온 고위험 경로를 의존성 레벨에서 우선 해소한다.
- 작업:
1. `backend/pyproject.toml` 런타임 의존성 상향:
   - `fastapi` -> `^0.128.0`
   - `starlette` 명시 추가: `>=0.49.1,<0.51.0`
   - `langgraph` -> `^1.0.0`
   - `langgraph-checkpoint` 명시 추가: `>=3.0.0,<4.0.0`
   - `langchain-openai` -> `^1.1.0`
   - `langchain-core` -> `>=1.2.11,<2.0.0`
2. 임시 Python 3.11 venv에서 설치 검증 후 테스트/보안 재점검 수행
- 완료 기준:
1. 업그레이드 버전 조합에서 `pytest -q` PASS
2. `pip-audit`에서 런타임 취약점(Starlette/LangChain/LangGraph Checkpoint) 미검출
- 검증 결과:
1. 임시 venv 기준 `pytest -q` -> `57 passed in 11.55s`
2. `pip-audit` -> 런타임 취약점 0건, 잔여는 점검 환경 `setuptools` 도구체인 항목만 검출

## Phase 7-B — 사용자 피드백 배치(예약/채팅/히스토리 UX, 완료)
- 목적: 2026-02-19 사용자 피드백 10건 중 기능 이슈를 우선 해결하고, 데모 사용성(예약/영수증/네비게이션)을 개선한다.
- 작업:
1. 채팅 레시피 번들 파싱 보강: `"김치찌개 재료 담아줘"` 발화 시 `김치/두부/돼지고기` 일괄 추가
2. 온라인 몰 노출 확장: 네이버 쇼핑 기반 후보에 `쿠팡` 포함
3. 예약 기능 확장: 주문 이력 기반 + 직접 품목 입력 기반 예약 생성 모두 지원 (`planned_items`)
4. 주문/영수증 UX 보강: 히스토리 카드 클릭 시 영수증 상세 모달 조회 가능화
5. 하단 네비게이션 고정: 스크롤과 무관하게 viewport 하단 고정
6. 홈 상단 중복 `My` 버튼 제거 및 알림 버튼으로 대체
7. 테스트 데이터 초기화: 프론트 localStorage 키를 `v2`로 상향해 기존 테스트 데이터 분리
8. 홈 배너 디자인은 코드 변경 대신 개선 제안 항목으로 분리(후속)
- 완료 기준:
1. 예약 API/프론트 타입/화면에서 `planned_items` end-to-end 동작
2. 히스토리에서 주문 상세/영수증 재조회 가능
3. `pytest -q`, `npx tsc --noEmit`, `npm run build` 회귀 통과
- 검증 결과:
1. `cd backend && pytest -q` -> `58 passed in 28.40s`
2. `cd frontend && npx tsc --noEmit` -> PASS
3. `cd frontend && npm run build` -> `vite v6.4.1 build success`

## 3. 체크리스트
- [x] Phase 1 완료
- [x] Phase 2 완료
- [x] Phase 3 완료
- [x] Phase 4 완료
- [x] Phase 6 핵심 반영 배치(v2.0) 완료
- [x] Phase 6-F 2차 리뷰 Follow-up 배치 완료
- [x] Phase 7-A 보안 의존성 업그레이드(1차) 완료
- [x] Phase 7-B 사용자 피드백 배치 완료

## 4. 검증 결과 (Phase 5 Validation, 2026-02-19)
- `cd frontend && npm run build` -> `vite v6.3.5 build success`
- `cd backend && pytest -q` -> `53 passed in 15.43s`
- API 스모크(TestClient):
  - `GET /api/v1` -> 200
  - `GET /api/v1/basket` -> 200
  - `POST /api/v1/basket/items` -> 200
  - `POST /api/v1/plans/generate` -> 200 (`top3=3`)
  - `POST /api/v1/chat/message` -> 200
