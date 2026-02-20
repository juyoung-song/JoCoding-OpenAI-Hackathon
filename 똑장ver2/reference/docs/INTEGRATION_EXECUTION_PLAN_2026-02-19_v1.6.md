# 똑장ver2 통합 상세 실행 계획서 v1.6 (Phase 2 Completed)

작성일: 2026-02-19  
연계 문서: `PLAN.md`, `HISTORY.md`, `README.md`, `backend/README.md`

## 1. 배경
- 사용자 결정: `plans/generate` context 확장은
1. 프론트 입력을 우선 사용
2. 미입력/누락 시 백엔드 기본값 fallback
- 제약: `ver2` API/프론트 기존 계약은 깨지지 않아야 함

## 2. 적용 원칙
1. **Backward Compatible**: 기존 `{items:[...]}` 요청은 그대로 동작
2. **Context Optional**: `user_context`는 선택 필드
3. **Graceful Degradation**: provider 실패는 결과 중단 대신 `meta.degraded_providers`에 기록

## 3. Phase 2 구현 상세 (완료)

## A. 백엔드 요청/응답 확장
- 파일: `backend/src/api/v1/routers/plans.py`
- 작업:
1. `GeneratePlansRequest` 도입 (`items`, `user_context?`)
2. `PlanUserContext` (`lat/lng/travel_mode/max_travel_minutes/source/address`)
3. `PlanListResponse.meta` 추가:
   - `degraded_providers`
   - `effective_context`
   - `weather_note`
4. context 해석 함수 추가:
   - client 값이 있으면 사용
   - 없으면 `DEFAULT_USER_LAT/LNG`, `walk`, `30` 적용

## B. 오프라인 엔진 context 반영
- 파일: `backend/src/application/services/offline_plan_adapter.py`
- 작업:
1. `build_candidates` 시그니처 확장:
   - `travel_mode`, `max_travel_minutes`, `place_provider`, `routing_provider`
2. 반경 계산:
   - 이동수단 + 허용시간 기반 검색 반경 산정
3. routing 적용:
   - provider 결과 우선
   - 실패 시 직선거리 fallback + degraded 기록
4. 이동시간 필터:
   - 오프라인 모드에서 `max_travel_minutes` 적용
   - 필터 결과 없으면 nearest 일부 제한 노출
5. 반환 구조:
   - `CandidateBuildResult(candidates, degraded_providers, candidate_store_count, filtered_store_count)`

## C. Mock provider 품질 보정
- 파일: `backend/src/infrastructure/providers/mock_providers.py`
- 작업:
1. `MockRoutingProvider`를 이동수단별 시간 계산으로 변경
2. walk/transit/car에 따라 결과가 달라지도록 보정

## D. 프론트 context 전달
- 파일: `frontend/src/api.ts`
- 작업:
1. `PlanUserContextRequest` 타입 추가
2. `PlansAPI.generatePlans(..., userContext?)` 시그니처 확장
3. body에 `user_context` 포함 전송

- 파일: `frontend/src/app/store/AppContext.tsx`
- 작업:
1. `planUserContext` 상태/로컬저장소 추가
2. `updatePlanUserContext` 메서드 추가
3. `fetchPlans`에서 `user_context` 함께 전달

- 파일: `frontend/src/pages/OnboardingScreen.tsx`
- 작업:
1. 위치 입력을 좌표 context로 저장
   - GPS(현재위치) 시도
   - 지역 preset 매핑 fallback
2. 이동수단 입력을 `walk/transit/car`로 저장
3. 모드별 기본 이동시간(`max_travel_minutes`) 반영

## E. 테스트 보강
- 파일: `backend/tests/test_api.py`
- 작업:
1. context 미전달 시 default fallback 검증
2. travel_mode(도보/자차) 반영 검증

- 파일: `backend/tests/test_offline_integration.py`
- 작업:
1. `build_candidates` 반환 타입 변경 반영

## 4. 검증 결과
1. `cd backend && pytest -q` -> `53 passed`
2. `cd frontend && npm run build` -> `vite v6.3.5 build success`

## 5. 잔여 작업 (Phase 3)
1. 미매칭 품목의 후보/대체 추천 강화
2. 선호/비선호 브랜드와 매칭 엔진 결합
3. 채팅 파싱과 플랜 엔진의 발화 정합성 강화
