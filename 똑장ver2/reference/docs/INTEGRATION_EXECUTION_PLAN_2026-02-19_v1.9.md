# 똑장ver2 통합 상세 실행 계획서 v1.9 (Phase 6 + 6-F Completed Snapshot)

작성일: 2026-02-19  
연계 문서: `PLAN.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.8.md`

## 1. 문서 목적
- 본 문서는 `PLAN.md`의 **Phase 6(온라인 하드닝) + Phase 6-F(2차 리뷰 Follow-up) 실행 결과 요약본**이다.
- 대상 시점은 v1.9 배치 완료 시점으로 고정한다.

## 2. 대상 범위
- Phase 6-A: Plan/DTO 신뢰 필드 확장
- Phase 6-B: 온라인 후보 생성 엔진 실연결
- Phase 6-C: 외부 링크/화이트리스트 보안 고정
- Phase 6-D: 신뢰 UI/근거 시각화 반영
- Phase 6-E: 회귀 검증
- Phase 6-F: 리뷰 잔여 이슈(HIGH~LOW) 마무리

## 3. 실행 결과 요약

### A. 백엔드
- `backend/src/domain/models/plan.py`
  - 신뢰/실행 필드 추가: `price_source`, `price_observed_at`, `price_notice`, `data_source`, `mall_product_links`, `direct_cart_supported`, `expected_delivery_hours`
- `backend/src/application/services/online_plan_adapter.py` (신규)
  - `NaverShoppingProvider` 기반 몰별 장바구니 플랜 생성
- `backend/src/api/v1/routers/plans.py`
  - `mode=online` 경로에서 온라인 어댑터 우선 사용
  - 실패 시 `offline -> mock` fallback 유지
  - 외부 URL 화이트리스트 검증 적용
- `backend/src/main.py`
  - `app.state.shopping` 초기화 연결
- `backend/src/infrastructure/providers/naver_shopping.py`
  - `print` 제거, logger로 통일
- `backend/src/api/v1/routers/reservations.py` (신규)
  - 예약 조회/생성/수정/삭제 API 추가

### B. 프론트엔드
- `frontend/src/api.ts`
  - Plan 타입에 온라인 신뢰/실행 필드 반영
- `frontend/src/pages/Top3ResultScreen.tsx`
  - 온/오프라인 토글 + 신뢰 필드 노출
- `frontend/src/pages/PlanDetailScreen.tsx`
  - 출처/관측시각/주의문구 표시
- `frontend/src/pages/PaymentScreen.tsx`
  - 사전 승인 체크 이후 결제 진행
- `frontend/src/features/chat/AiChatModal.tsx`
  - chat diff 결과를 사용자 메시지로 반영

### C. 2차 리뷰 Follow-up (Phase 6-F)
- HIGH-1:
  - `frontend/src/pages/CartViewScreen.tsx`
  - CTA를 `PAYMENT` 직행에서 `MODE_SELECTION`으로 변경, 문구 `플랜 비교하기`로 변경
- HIGH-2:
  - `backend/src/api/v1/routers/plans.py`
  - `backend/src/application/services/offline_plan_adapter.py`
  - `backend/src/infrastructure/providers/mock_providers.py`
  - `transit` 이동시간 공식을 `~4분/km`로 보정
- MEDIUM-1:
  - `frontend/src/app/store/AppContext.tsx`
  - `TOP3_RESULT` 상태에서 `LOADING` 강제 전환 생략
- MEDIUM-2:
  - `frontend/src/pages/CompletionScreen.tsx`
  - 소비 팁을 주문 데이터 기반 동적 문구로 변경
- MEDIUM-3 / LOW-1:
  - `backend/src/application/services/geo.py` (신규)
  - `haversine_km()` 공통 유틸 추출로 중복 제거 및 정리

## 4. 검증
- `cd backend && pytest -q` -> `57 passed`
- `cd frontend && npm run build` -> `vite v6.3.5 build success`

## 5. 문서 동기화
- `PLAN.md`:
  - `Phase 6-F` 계획/완료 상태 반영
- `HISTORY.md`:
  - `v2.1 2차 리뷰 Follow-up 완료` 항목 반영

