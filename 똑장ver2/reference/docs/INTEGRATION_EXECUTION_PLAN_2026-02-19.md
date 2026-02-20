# 똑장ver2 통합 상세 실행 계획서 v1.1 (Decision-Complete)

## 1. 요약
- 목표: `똑장ver2`를 해커톤 데모 가능한 통합 상태로 고정한다.
- 1차 완료 기준: `장바구니 → Top3 생성 → 상세 확인 → 결제 진입` 흐름이 실 API 데이터로 끊김 없이 동작.
- 2차 완료 기준: 백엔드 통합 테스트(`pytest`) 전수 통과.
- 기준 원칙: 백엔드 API 계약을 SoR로 두고 프론트를 정렬한다.
- 키 정책: `.env` 값은 현재 상태 유지, 로컬 전용으로만 사용한다.

## 2. 범위
### In Scope
1. 프론트-백 API 계약 정렬
2. 데모 루프 화면 흐름 안정화
3. 백엔드 테스트 정합성 복구
4. 문서/이력 동기화

### Out of Scope
1. `NaverLocal/NaverDirections/KMA` 실연동 TODO 완료
2. 예약 스케줄러/DB 전환(PostgreSQL)
3. UI 전면 리디자인
4. API 키 재발급/교체

## 3. Phase별 실행 항목

## Phase A — 실행 환경 정상화
### A-1. 프론트 빌드 환경 복구
1. `frontend` 의존성 재설치
2. Windows 기준 `npm run build` 성공 확인

### A-2. 계획 문서 생성
1. 본 문서 파일 저장
2. 체크리스트/검증 커맨드 포함

## Phase B — API 계약 정렬 (Frontend)
### B-1. `frontend/src/api.ts`
1. `BasketAPI.getBasket()` 반환 타입을 `BasketResponse`(`items`)로 정렬
2. `PlansAPI.generatePlans()` 반환 타입을 `PlanListResponse`로 정렬
3. `PlanResponse`를 백엔드 스키마(`plan_type`, `estimated_total`, `mart_name`, `coverage`)에 맞춤
4. `ChatAPI` 타입을 실제 응답(`role/content/diff/suggestions`)에 맞춤

### B-2. `frontend/src/app/store/AppContext.tsx`
1. `fetchBasket()` 매핑 기준을 `basketData.items`로 정렬
2. `selectedPlan` placeholder 제거 후 실제 state/setter 연결
3. `plans`를 `PlanResponse[]`로 타입 고정
4. `fetchPlans()` 성공 시 `setPlans(response.top3)` 적용
5. `fetchPlans` 함수 참조 안정화(`useCallback`)

## Phase C — 데모 루프 화면 안정화
### C-1. `frontend/src/pages/ModeSelectionScreen.tsx`
1. 모드 선택 후 `fetchPlans()` 직접 호출
2. 장바구니 비어있으면 `CART_VIEW`로 이동

### C-2. `frontend/src/pages/Top3ResultScreen.tsx`
1. `plan_type` 소문자 enum 기준 분기
2. 총액 필드 `estimated_total` 사용
3. API 데이터 우선 렌더링, 빈 데이터는 Empty State
4. 선택 시 `setSelectedPlan(originalPlan)`만 사용
5. 하단 고정 바는 데이터 존재 시만 렌더링

### C-3. `frontend/src/pages/PlanDetailScreen.tsx`
1. `selectedPlan`을 백엔드 `PlanResponse` 타입 기준으로 처리
2. `total_price` 제거, `estimated_total` 사용
3. `missing_items` 부재 시 `cartItems` 대비 누락 품목 파생 계산
4. 결제 진입 버튼 동작 유지

### C-4. `frontend/src/pages/HomeScreen.tsx`
1. 누락 import(`useApp`, `useState`) 정리
2. 미정의 `ImageWithFallback` 제거 후 기본 `img`로 대체

## Phase D — 백엔드 테스트 정합성 복구
### D-1. `backend/tests/test_api.py`
1. 품목 추가 경로: `POST /api/v1/basket/items`
2. 품목 삭제 경로: `DELETE /api/v1/basket/items/{item_name}`
3. duplicate/clear 테스트도 실제 라우터 계약으로 정렬

### D-2. 통합 스모크 시나리오
1. `test_integration.sh` 경로가 라우터 계약과 일치하는지 확인

## Phase E — 문서/기록 동기화
### E-1. `HISTORY.md`
1. 각 Phase 완료 즉시 기록 추가
2. 고정 형식:
   - Status
   - Changes
   - Decisions
   - Verification
   - Next Steps

### E-2. `backend/README.md`
1. 실제 설치/실행 절차 반영
2. 존재하지 않는 `requirements.txt` 경로 안내 제거
3. basket endpoint 경로 정합성 반영

## 4. 검증 시나리오
1. Backend: `pytest -q` 전수 통과
2. Frontend: `npm run build` 성공
3. End-to-end 수동 흐름:
   - 홈 진입
   - 모드 선택
   - 로딩
   - Top3 확인
   - 상세 진입
   - 결제 진입
4. API 샘플:
   - `GET /api/v1/basket`
   - `POST /api/v1/basket/items`
   - `POST /api/v1/plans/generate`
   - `POST /api/v1/chat/message`

## 5. 완료 정의 (DoD)
1. 데모 루프 1회 수행 시 런타임 에러 0건
2. 프론트 타입 계약과 백엔드 응답 구조 불일치 0건
3. 백엔드 테스트 실패 0건
4. 계획 문서 + HISTORY 최신화 완료
5. `.env` 키는 코드/문서/HISTORY에 직접 노출하지 않음

## 6. 체크리스트
- [x] 계획 문서 저장
- [x] `api.ts` 계약 정렬 완료
- [x] `AppContext.tsx` 상태/계약 정렬 완료
- [x] `ModeSelection/Top3/PlanDetail/Home` 화면 정렬 완료
- [x] `backend/tests/test_api.py` 정렬 완료
- [x] `backend/README.md` 정렬 완료
- [x] 프론트 빌드 성공
- [x] 백엔드 테스트 전수 통과
- [x] HISTORY 단계별 기록 완료

## 7. 검증 결과 (2026-02-19)
- `backend`: `pytest -q` → `42 passed`
- `frontend`: `npm run build` → `vite v6.3.5 build success`
