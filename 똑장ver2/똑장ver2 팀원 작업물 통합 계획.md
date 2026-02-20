# 똑장ver2 팀원 작업물 통합 계획 (가격 이상치 필터 제외)

## 요약
- 3개 보고서 대조 결과:
  - 이미 반영됨: `/basket/items` 경로 테스트 정합성, FE `PlanResponse/BasketResponse` 매핑, Top3/Detail 화면 필드명 정합성, HomeScreen import 오류 수정.
  - 부분 반영됨: `AppContext.fetchPlans`는 `top3/headline/last_updated` 반영 중이나 `cartItems.length===0` early return으로 서버 SoR 동기화가 끊길 수 있음.
  - 미반영/재설계 필요: 챗봇 단일 JSON 의도 라우팅 강화(ADD/REMOVE/SHOW_CART 계열), 명확화 질문 처리 규칙.
- 사용자 결정 반영:
  - `가격 이상치 필터링`은 이번 통합에서 제외.
  - 챗봇 응답 API 계약은 현행 유지(`content/diff/suggestions`).

## 구현 범위 (파일 단위, 결정 완료)
1. 백엔드 챗봇 의도 라우팅 고도화
- 대상 파일:
  - `backend/src/application/prompts/analyzer.system.txt`
  - `backend/src/application/graph.py`
- 변경 내용:
  - 프롬프트를 “순수 JSON 단일 응답” 지침으로 강화하되, 내부 intent를 `ADD_ITEM/REMOVE_ITEM/SHOW_CART/GENERAL` 또는 기존 `modify/recommend/clarify/general` 둘 다 수용하도록 명시.
  - `graph.py`에 intent 정규화 계층 추가:
    - `ADD_ITEM|REMOVE_ITEM -> modify`
    - `SHOW_CART -> show_cart`(신규 내부 intent)
    - `GENERAL -> general`
    - 기존 소문자 intent도 그대로 호환.
  - `show_cart` 전용 노드 추가(장바구니 요약 반환), `route_intent`/StateGraph edge에 연결.
  - 엔티티 정규화 로직을 이중 포맷 호환으로 확장:
    - 기존: `{item_name, quantity, brand, size, action}`
    - 신규 문서형: `{itemText, quantity, removeAll}`도 파싱.
  - 모호 발화 처리 강화:
    - “우유/계란” 기본값 보정은 기존 `_extract_size`/alias 흐름과 충돌 없게 유지.
    - 항목 불충분 시 follow-up 질문 문자열을 `final_response`로 반환.

2. 백엔드 챗봇 API 계약 유지 + 내부 동작 정합성 보강
- 대상 파일:
  - `backend/src/api/v1/routers/chat.py`
- 변경 내용:
  - `ChatMessageResponse` 스키마는 변경하지 않음 (`role/content/diff/suggestions` 유지).
  - `show_cart` 의도 실행 시 `diff=[]` + 장바구니 요약 content가 일관되게 반환되도록 라우터 후처리 보정.
  - fallback 경로에서도 동일한 의도 정규화 함수를 사용해 주경로/예외경로 동작 편차 제거.

3. 프론트엔드 서버 SoR 동기화 보강 (플랜 생성 경로)
- 대상 파일:
  - `frontend/src/app/store/AppContext.tsx`
- 변경 내용:
  - `fetchPlans`의 `cartItems.length === 0` 즉시 반환 제거.
  - 로컬 카트가 비어 있을 때 서버 basket을 1회 조회해(SoR 우선) 그 스냅샷으로 플랜 생성 시도.
  - 서버 조회 후에도 비어 있으면 그때만 `CART_VIEW`로 복귀.
  - `top3/headline/last_updated/meta` 상태 갱신 로직은 현행 유지.

4. 프론트엔드 채팅 연동은 계약 유지 원칙으로 최소 조정
- 대상 파일:
  - `frontend/src/features/chat/AiChatModal.tsx`
- 변경 내용:
  - 현재 `finally`의 `refreshBasket()`는 실시간 반영 관점에서 이미 요구사항을 충족하므로 기본 유지.
  - (선택 적용) 불필요 호출 감소가 필요하면 `response.diff?.length > 0` 조건 호출로만 조정하되, 기본안은 안정성 우선으로 유지.

## Public API / 인터페이스 변경 사항
- 외부 API breaking change 없음.
- 유지:
  - `ChatMessageResponse`: `{ role, content, diff?, suggestions }`
  - `PlanListResponse`: `{ top3, headline, last_updated, alternatives, meta? }`
- 내부 전용 변경:
  - `graph.py` 내부 intent 체계에 `show_cart` 라우팅 추가.
  - analyzer prompt 출력 스키마를 이중 호환(신규/기존)으로 강화.

## 테스트 케이스 및 검증 시나리오
1. 백엔드 자동 테스트
- `backend/tests/test_api.py` 확장:
  - `“장바구니 보여줘”` 요청 시 200, 요약 content 반환, `diff`는 비파괴 동작.
  - `“우유 1개 담아줘”` 요청 시 add diff 생성.
  - `“우유 빼줘”` 요청 시 remove diff 생성.
- `backend/tests`에 graph 단위 테스트 추가:
  - 신규/기존 intent 토큰 정규화 매핑 검증.
  - 신규/기존 entities 포맷 파싱 검증.
- 실행: `pytest` 전수.

2. 프론트엔드 검증
- `npm run build` 성공 확인.
- 수동 시나리오:
  - 로그인 직후 로컬 카트가 빈 상태에서 플랜 생성 진입 시 서버 카트 기반으로 생성되는지 확인.
  - 챗봇 추가/삭제 직후 카트 배지/서랍 즉시 반영 확인.
  - “장바구니 보여줘” 응답이 자연어 요약으로 노출되는지 확인.

3. 회귀 검증
- 기존 Top3/상세/결제 흐름(장바구니 → 플랜 생성 → 상세/결제) 재점검.
- 가격 이상치 필터 미적용으로 인한 기존 결과 변동 없음 확인.

## 변동사항 (2026-02-20)
- analyzer 프롬프트 강화에 따라 `backend/tests/test_prompt_loader.py`의 고정 문자열 검증 항목을 신규 포맷 기준으로 동기화.
- 챗봇 라우팅 통합 테스트 범위를 보강하기 위해 `backend/tests/test_api.py`에 `SHOW_CART`/삭제 diff 회귀 케이스 추가.

## 가정 및 기본값
- 사용자 지시대로 `가격 이상치 필터링(중앙값/노이즈 차단)`은 이번 통합에서 제외.
- 챗봇 응답 API 필드 확장(`clarifyingQuestion/actionResult`)은 제외하고 현행 계약 유지.
- DB 스키마/마이그레이션 변경 없음.
- 새 의존성 추가 없음.
- 통합 우선순위: `백엔드 의도 라우팅` → `AppContext SoR 동기화` → `테스트/빌드 검증`.
