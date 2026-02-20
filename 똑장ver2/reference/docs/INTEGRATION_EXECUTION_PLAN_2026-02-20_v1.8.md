# 똑장ver2 통합 상세 실행 계획서 v1.8 (팀원 작업물 통합 배치)

작성일: 2026-02-20  
연계 문서: `똑장ver2 팀원 작업물 통합 계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.7.md`

## 1. 목적
- 팀원 작업물 보고서 기준으로 챗봇 라우팅/프론트 SoR 동기화를 현 코드베이스에 안전하게 병합한다.
- 기존 API 계약은 유지하면서(`ChatMessageResponse`, `PlanListResponse`) 기능 회귀 없이 통합한다.

## 2. 적용 범위

### In Scope
1. `backup/` 기반 사전 백업 체계 적용
2. 챗봇 intent 정규화 (`ADD_ITEM/REMOVE_ITEM/SHOW_CART/GENERAL` + 기존 소문자 intent 호환)
3. `SHOW_CART` 노드 추가 및 라우터 일관 응답 처리
4. 프론트 `fetchPlans`의 서버 SoR 동기화 보강
5. 테스트/빌드 및 문서 이력 동기화

### Out of Scope
1. 가격 이상치 필터링(중앙값/노이즈 차단)
2. 챗봇 응답 스키마 확장(`clarifyingQuestion`, `actionResult`)
3. DB 스키마 변경 및 마이그레이션

## 3. 사전 백업 및 추적
- 백업 루트: `backup/2026-02-20_team_merge/`
- 동일 상대경로 백업 대상:
  - `backend/src/application/prompts/analyzer.system.txt`
  - `backend/src/application/graph.py`
  - `backend/src/api/v1/routers/chat.py`
  - `frontend/src/app/store/AppContext.tsx`
  - `backend/tests/test_api.py`
  - `backend/tests/test_graph_parsing.py`
  - `.gitignore`
  - `HISTORY.md`
  - `똑장ver2 팀원 작업물 통합 계획.md`
- 커밋 제외 규칙: `.gitignore`에 `backup/` 추가

## 4. 구현 내용

### A. 백엔드 챗봇 라우팅 통합
- `backend/src/application/prompts/analyzer.system.txt`
  - 순수 JSON 응답 규칙 강화
  - uppercase intent(`ADD_ITEM`, `REMOVE_ITEM`, `SHOW_CART`, `GENERAL`) + 기존 lowercase intent 동시 허용
  - 엔터티 포맷 이중 호환(`item_name`/`itemText`, `action`/`removeAll`)
- `backend/src/application/graph.py`
  - `normalize_agent_intent()` 추가
  - `_default_entity_action_from_intent()` 추가
  - `_normalize_llm_entities()` 이중 포맷 파싱 확장
  - `_keyword_classify()`에 `SHOW_CART` 키워드 분기 추가
  - `show_cart_node()` 신규 추가
  - `route_intent`/StateGraph edge에 `show_cart` 분기 연결

### B. 챗봇 API 계약 유지 보강
- `backend/src/api/v1/routers/chat.py`
  - `role/content/diff/suggestions` 계약 유지
  - `_build_show_cart_content()` 추가
  - 메인 경로/폴백 경로 모두 `normalize_agent_intent()` 기반으로 intent 정규화
  - `SHOW_CART` 시 후처리에서 장바구니 요약 응답을 일관적으로 재구성

### C. 프론트 SoR 동기화 강화
- `frontend/src/app/store/AppContext.tsx`
  - `fetchPlans`의 로컬 카트 0개 즉시 반환 제거
  - 로컬 카트가 비었을 때 `BasketAPI.getBasket()`으로 서버 SoR 1회 동기화
  - 동기화 후에도 비어 있으면 `CART_VIEW` 복귀
  - 기존 Top3 상태 갱신 로직 유지

### D. 테스트 보강
- `backend/tests/test_graph_parsing.py`
  - uppercase intent 정규화 테스트 추가
  - `SHOW_CART` 키워드 분류 테스트 추가
  - `itemText/removeAll` 엔터티 파싱 테스트 추가
- `backend/tests/test_api.py`
  - 챗봇 삭제 diff 회귀 테스트 추가
  - `장바구니 보여줘` 요약 응답 + 비변경 diff(`[]`) 테스트 추가
- `backend/tests/test_prompt_loader.py`
  - analyzer 프롬프트 고정 문자열 검증을 신규 포맷으로 동기화

## 5. 진행 로그 (Progress Log)
- 백업 폴더 생성 및 대상 파일 사전 백업 완료
- `.gitignore`에 `backup/` 규칙 반영 완료
- 챗봇 intent 정규화 + `SHOW_CART` 노드/라우팅 반영 완료
- 챗봇 API 메인/폴백 정규화 경로 통합 완료
- 프론트 `fetchPlans` SoR 동기화 반영 완료
- 테스트 실패 2건(`test_prompt_loader`) 원인 분석 후 기대 문자열 업데이트 완료
- 백엔드/프론트 검증 재실행 완료

## 6. 검증 결과
- `cd backend && pytest -q` -> `59 passed`
- `cd frontend && npm run build` -> `vite build success`

## 7. 결정 사항
1. 가격 이상치 필터는 사용자 지시대로 이번 배치에서 제외한다.
2. 챗봇 응답 계약 확장은 미적용하고 현 계약을 유지한다.
3. Git 루트 미감지 환경에서는 문서(`INTEGRATION_EXECUTION_PLAN`, `HISTORY`)를 SoR로 운영한다.

## 8. 미실행 항목
- 수동 E2E(브라우저 상 실제 사용자 플로우)는 본 배치에서 자동화 범위 밖이라 별도 수동 확인이 필요하다.
