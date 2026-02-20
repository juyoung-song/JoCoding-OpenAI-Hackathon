# 똑장ver2 통합 상세 실행 계획서 v1.10 (Phase 7-B Feedback Batch Completed)

작성일: 2026-02-19  
연계 문서: `PLAN.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.9.md`

## 1. 문서 목적
- 본 문서는 `PLAN.md`의 **Phase 7-B 사용자 피드백 배치 실행 결과 요약본**이다.
- 대상 시점은 v2.9 반영 완료 시점으로 고정한다.

## 2. 대상 범위
- 채팅 레시피 번들 파싱 보강 (`김치찌개 재료 담아줘`)
- 온라인 몰 노출 확장 (`쿠팡` 포함)
- 예약 기능 확장 (최근 주문 기반 + 직접 품목 입력 기반)
- 주문/영수증 재조회 UX 복구
- 하단 네비게이션 고정
- 홈 상단 `My` 버튼 제거 및 알림 버튼 전환
- 프론트 테스트 데이터 정리(localStorage `v2` 전환)
- 홈 배너 리디자인은 회의 후 결정으로 보류

## 3. 실행 결과 요약

### A. 백엔드
- `backend/src/application/graph.py`
  - 레시피 번들 인식 규칙 추가: `김치찌개 + 재료 + 담기 키워드` 조합 시 `김치/두부/돼지고기` 일괄 추가
- `backend/src/api/v1/routers/reservations.py`
  - 예약 DTO에 `planned_items` 추가
  - `planned_items` 정규화(공백 제거/중복 제거) 로직 추가
- `backend/src/infrastructure/providers/naver_shopping.py`
  - `TARGET_MALL_KEYS`에 `coupang` 추가
- `backend/src/application/services/online_plan_adapter.py`
  - `REQUIRED_MALL_KEYWORDS`에 `쿠팡` 추가
  - `coupang` 배송 정책/아이콘 반영
- `backend/tests/test_api.py`
  - 레시피 번들 회귀 테스트 추가
  - 예약 `planned_items` 생성/수정 회귀 테스트 추가

### B. 프론트엔드
- `frontend/src/api.ts`
  - 예약 API 타입에 `planned_items` 반영
- `frontend/src/app/store/AppContext.tsx`
  - `createReservationFromItems()` 추가
  - 최근 주문 예약 생성 시 `planned_items`도 함께 저장
  - localStorage key를 `v1 -> v2` 상향, legacy key 정리 로직 추가
- `frontend/src/features/reservation/ReservationComposerCard.tsx` (신규)
  - 예약명/요일/시간/품목 직접 입력 폼 추가
- `frontend/src/pages/RecommendationScreen.tsx`
  - 직접 품목 예약 폼 연동
  - 예약 카드에 `plannedItems` 노출
- `frontend/src/pages/HistoryScreen.tsx`
  - 직접 품목 예약 폼 연동
  - 주문 카드 클릭 시 영수증 상세 모달 조회 가능화
- `frontend/src/app/App.tsx`
  - 하단 네비게이션 `fixed bottom-0` 고정
- `frontend/src/pages/HomeScreen.tsx`
  - 상단 `My` 버튼 제거, 알림 버튼으로 교체
- `frontend/src/features/chat/AiChatModal.tsx`
  - 채팅 히스토리 storage key를 `v2`로 상향

### C. 문서 동기화
- `PLAN.md`
  - `Phase 7-B — 사용자 피드백 배치(완료)` 추가
- `HISTORY.md`
  - `v2.9 사용자 피드백 배치` 이력 추가

## 4. 검증
- `cd backend && pytest -q` -> `58 passed in 28.40s`
- `cd frontend && npx tsc --noEmit` -> PASS
- `cd frontend && npm run build` -> `vite v6.4.1 build success`

## 5. 네이버 스토어 취급 기준
- 현재 설계에서 `Naver Shopping`은 **몰 자체가 아니라 가격/상품 검색 데이터 소스(provider)** 로 취급한다.
- 이유:
  1. 네이버는 다수 판매처를 중개하는 메타 채널이어서 단일 몰 장바구니/결제 URL 정책이 약하다.
  2. 현재 실행 UX는 몰별 `cart_url` + 화이트리스트 기반 CTA를 전제로 한다.
- 필요 시 후속 배치에서 `naver_store`를 별도 mall key로 추가 가능하나, 이 경우 기본 CTA는 `direct_cart_supported=false` + 상품 링크 목록 이동으로 처리하는 것이 안전하다.

## 6. 보류 항목
- 홈 배너(카피/비주얼) 리디자인은 팀 회의 후 확정한다.
