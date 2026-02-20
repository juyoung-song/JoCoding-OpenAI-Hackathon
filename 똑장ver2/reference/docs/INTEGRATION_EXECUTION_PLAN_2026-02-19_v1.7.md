# 똑장ver2 통합 상세 실행 계획서 v1.7 (Phase 3 Completed)

작성일: 2026-02-19  
연계 문서: `PLAN.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.6.md`

## 1. 목표
- Phase 3 범위인 추천 품질 고도화(대체추천/선호도 결합/챗봇-매처 정합성)를 완료한다.
- 테스트는 사용자 요청에 따라 Phase 4 완료 후 일괄 수행한다.

## 2. Phase 3 구현 요약

## A. 미커버 품목 대체 추천 구조 이식
- 파일: `backend/src/domain/models/plan.py`
  - `MissingPlanItem`, `PlanAlternative` 추가
  - `Plan.missing_items` 필드 추가
- 파일: `backend/src/application/services/offline_plan_adapter.py`
  - 미매칭 품목에 `missing_items` 기록
  - `_find_alternative_for_missing()`로 같은 매장 내 대체품 조회
  - 플랜 설명/노출 근거에 미커버 요약 활용 가능하도록 데이터 제공

## B. preferences와 매칭 엔진 결합
- 파일: `backend/src/application/services/product_matcher_db.py`
  - `match(item, preferred_brands, disliked_brands)` 확장
  - 브랜드 선호 점수 가중치 반영
- 파일: `backend/src/api/v1/routers/plans.py`
  - `user_id` 기준 like/dislike 읽어서 matcher/plan 생성에 전달
  - 설명문에 선호 반영 요약 포함

## C. chat parser + matcher 결합
- 파일: `backend/src/api/v1/routers/chat.py`
  - 사용자 발화에서 segment별 matcher 해석(`matcher_entities`) 수행
  - LangGraph state에 matcher 결과 전달
- 파일: `backend/src/application/graph.py`
  - parser가 하드코딩 alias에서 실패할 때 matcher 결과를 fallback으로 사용

## D. 프론트 연동 보강
- 파일: `frontend/src/api.ts`
  - `MissingPlanItemResponse`, `PlanAlternativeResponse` 타입 추가
- 파일: `frontend/src/pages/PlanDetailScreen.tsx`
  - `plan.missing_items` 우선 렌더
  - 대체상품(브랜드/규격/가격) 표시

## 3. Phase 4 착수 포인트
1. Top3/상세에서 거리/ETA/배송비/커버리지 비교 근거 시각화 강화
2. 예약/반복 장보기 UX 정리 및 실제 동선 연결
3. 마이페이지 주문이력에 플랜 근거(선택 사유/미커버/대체추천) 연결

## 4. 검증 정책
- 이번 배치: 테스트 미실행 (요청사항 반영)
- 다음 배치(Phase 4 완료 후): `pytest -q`, `npm run build`, E2E 수동 시나리오 일괄 실행
