# HISTORY.md — 똑장 프로젝트 진행 이력

## [2026-02-20] v3.12 사용자 피드백 3건 코드 반영 — 로그인 보조버튼 제거/채팅 음성입력/가격 가드레일

- **Status**: Completed
- **Changes**:
  - Frontend
    - `frontend/src/pages/LoginScreen.tsx`
      - 로그인 버튼 하단 `맞춤 설정 다시 하기` 버튼 제거 (`로그인` 버튼은 유지)
    - `frontend/src/features/chat/AiChatModal.tsx`
      - 채팅 입력창에 음성 입력 진입 버튼 추가
      - 채팅 화면에서 `VOICE_INPUT_CONFIRM`로 이동 가능하도록 연결
    - `frontend/src/pages/HomeScreen.tsx`
      - 음성 입력 진입 시 origin 저장 로직 추가
    - `frontend/src/pages/VoiceInputScreen.tsx`
      - origin(`home`/`chat`) 기반 복귀 경로 보정
    - `frontend/src/app/voiceInputOrigin.ts` (신규)
      - 음성 입력 진입 origin 상태 유틸 추가
  - Backend (가격 데이터 점검/보정)
    - `backend/src/infrastructure/providers/naver_shopping.py`
      - 제목 기반 품목 일치 필터 추가
      - 교환권/사은품 등 비정상 후보 제외 키워드 필터 추가
    - `backend/src/application/services/online_plan_adapter.py`
      - 품목별 unit price 기준 이상치(outlier) 컷오프 추가
    - `backend/src/application/services/offline_plan_adapter.py`
      - 오프라인 스냅샷 가격 guardrail(중앙값 기반 하/상한) 추가
      - guardrail 이탈 시 `가격 이상치 제외` 처리
    - `backend/src/infrastructure/providers/mock_providers.py`
      - 미매칭 품목의 임의 기본가(5000원) 주입 제거
    - `backend/src/api/v1/routers/plans.py`
      - mock fallback 출처를 `mock_offline`로 명시
  - Tests
    - `backend/tests/test_online_pricing_guards.py` (신규)
      - 온라인 이상치 저가 후보 필터 회귀 추가
    - `backend/tests/test_offline_integration.py`
      - 극단값 스냅샷 가격 필터 회귀 추가
  - Docs
    - `PLAN.md` -> `Phase 7-C` 완료 처리 + 검증 결과 반영
    - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.10.md`
      - 진행 로그/검증 결과 반영
- **Decisions**:
  - 로그인 UX는 핵심 액션(입력 + 로그인)만 남기고 보조 CTA를 제거한다.
  - 가격 이상치는 수집 단계 필터 + 어댑터 단계 outlier 컷오프를 동시에 적용한다.
  - mock fallback 경로는 출처를 명시해 사용자 오해를 줄인다.
- **Verification**:
  - `cd backend && pytest -q` -> `61 passed in 59.02s`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> `vite v6.4.1 build success`

---

## [2026-02-20] v3.11 사용자 피드백 3건 대응 계획 배치 — 실행 계획 문서화

- **Status**: Completed (Planning Docs)
- **Changes**:
  - `PLAN.md`
    - 문서 버전을 `v1.11`로 상향
    - `Phase 7-C` 신규 추가:
      - 로그인 화면의 하단 `맞춤 설정 다시 하기` 버튼 제거 계획
      - 채팅 화면 음성 입력 진입 확장 계획
      - 온라인/오프라인 가격 데이터 이상치 점검 및 보정 계획
    - 요구사항 명시: `로그인` 버튼은 유지, 보조 버튼만 제거
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.10.md` (신규)
    - 이슈 3건에 대한 상세 실행 트랙(Track A/B/C), 파일 단위 대상, 검증 계획, 리스크 대응 작성
- **Decisions**:
  - 이번 배치는 코드 변경 전 “실행 계획 확정 + 이력 고정”을 우선한다.
  - 가격 이슈는 수집/매칭/표시 3개 축으로 분해 점검한다.
- **Verification**:
  - `PLAN.md`, `reference/docs/*v1.10.md`, `HISTORY.md` 상호 참조 및 버전 체계 정합성 확인
- **Next Steps**:
  - Phase 7-C 코드 구현(프론트 UX 수정 + 백엔드 가격 가드레일 + 회귀 테스트)

---

## [2026-02-20] v3.10 OpenAI 모델 정책 정렬 — `gpt-5-mini` 단일 고정

- **Status**: Completed
- **Changes**:
  - `backend/src/core/config.py`
    - `OPENAI_MODEL` 기본값을 `gpt-5-mini`로 변경
    - `OPENAI_FALLBACK_MODELS` 설정/파싱 경로 제거
  - `backend/src/core/llm.py`
    - 모델 선택 로직을 단일 모델(`OPENAI_MODEL`)만 사용하도록 단순화
  - `backend/src/application/prompts/analyzer.system.txt`
    - JSON 단일 응답 템플릿 재정비
    - uppercase/lowercase intent, 엔터티 이중 포맷 호환 규칙 명시
  - `backend/README.md`
    - 환경변수 가이드에서 fallback 체인 제거
    - 기본 LLM 기술스택 표기를 `GPT-5-mini`로 변경
  - `똑장ver2 팀원 작업물 통합 계획.md`
    - `## 변동사항`에 단일 모델 정책 전환 결정 반영
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.9.md` (신규)
- **Decisions**:
  - 현재 OpenAI 프로젝트 권한 기준으로 백엔드는 `gpt-5-mini` 단일 모델만 호출한다.
  - 다중 모델 fallback은 권한 불일치 시 오탐/오류를 확대하므로 이번 배치에서 비활성화한다.
- **Verification**:
  - `cd backend && pytest -q` -> `59 passed`

---

## [2026-02-20] v3.9 환경설정 SoR 고정 — 루트 `.env` 단일 소스화

- **Status**: Completed
- **Changes**:
  - `backend/src/core/config.py`
    - `.env` 로딩 순서를 `루트(.env) -> /tmp/ddokjang/.env`로 고정
    - `backend/.env` 자동 로딩 경로 제거 (루트 `.env` 단일 SoR 적용)
  - `backend/src/main.py`
    - 별도 `load_dotenv(backend/.env)` 호출 제거
  - `backend/.env`
    - 런타임 SoR 아님(루트 `.env` 사용) 안내 주석 추가
- **Decisions**:
  - 로컬 실행 기준 환경변수 SoR은 `똑장ver2/.env` 하나로 통일한다.
  - `backend/.env`는 참고/백업 성격으로만 유지한다.

---

## [2026-02-20] v3.8 로그인-온보딩 게이트 보강 + LLM 권한 진단 + 채팅 UI 정리

- **Status**: Completed
- **Changes**:
  - `frontend/src/app/onboardingState.ts` (신규)
    - 사용자 이메일 기준 온보딩 완료 상태 저장/조회 유틸 추가
    - 마지막 로그인 이메일 추적 키 추가
  - `frontend/src/pages/LoginScreen.tsx`
    - 로그인 성공 후 온보딩 필요 여부를 검사해 `ONBOARDING`/`HOME` 분기
    - 비로그인 상태의 `맞춤 설정 다시 하기`가 온보딩으로 직접 진입하지 않도록 차단
  - `frontend/src/pages/OnboardingScreen.tsx`
    - 온보딩 완료/건너뛰기 시 온보딩 완료 상태를 사용자 기준으로 저장
  - `frontend/src/app/store/AppContext.tsx`
    - 인증 세션 보유 시 초기 화면을 `ONBOARDING`이 아닌 `HOME`으로 조정
  - `frontend/src/features/chat/AiChatModal.tsx`
    - 모든 응답 하단에 반복 표기되던 `AI 분석 완료` 문구 제거
  - `backend/src/application/graph.py`
    - analyzer 단계에 `llm_degraded`, `llm_error` 상태 추가
    - OpenAI 미설정/호출 실패 시 fallback과 함께 진단 정보 유지
  - `backend/src/api/v1/routers/chat.py`
    - LLM 권한/설정 이슈 감지 시 사용자 안내 문구를 응답 하단에 추가
- **Decisions**:
  - 로그인 전에는 온보딩(맞춤설정) 진입을 허용하지 않는다.
  - LLM 실패를 무음 fallback으로 숨기지 않고, 모델 권한 문제를 사용자에게 명시한다.
- **Verification**:
  - `cd backend && pytest -q` -> `59 passed`
  - `cd frontend && npm run build` -> `vite build success`
  - OpenAI 런타임 점검:
    - 키 로드 상태: configured=`True`
    - 실제 호출 결과: 모든 후보 모델에서 `PermissionDeniedError` (프로젝트 모델 권한 없음)

---

## [2026-02-20] v3.7 팀원 작업물 통합 배치 — 챗봇 라우팅/SoR 동기화 강화

- **Status**: Completed
- **Progress Log**:
  - `backup/2026-02-20_team_merge/` 생성 및 수정 대상 파일 사전 백업 완료
  - `.gitignore`에 `backup/` 규칙 반영 완료
  - `graph.py`에 intent 정규화 + `show_cart` 노드/라우팅 반영 완료
  - `chat.py` 메인/폴백 경로 intent 정규화 통합 및 `SHOW_CART` 응답 일관화 완료
  - `AppContext.tsx` `fetchPlans` 서버 SoR 재조회 로직 반영 완료
  - 테스트 실패(`test_prompt_loader`) 기대값 동기화 후 전수 테스트 재통과
- **Changes**:
  - `.gitignore`
    - `backup/` 커밋 제외 규칙 추가
  - `backend/src/application/prompts/analyzer.system.txt`
    - 순수 JSON 단일 응답 지침 강화
    - uppercase/lowercase intent 이중 호환 정의
    - 엔터티 필드(`item_name` + `itemText`, `action` + `removeAll`) 병행 규격 명시
  - `backend/src/application/graph.py`
    - `normalize_agent_intent()`, `_default_entity_action_from_intent()` 추가
    - `_normalize_llm_entities()` 이중 포맷 파싱 확장
    - `_keyword_classify()`에 `show_cart` 분기 추가
    - `show_cart_node()` 추가 및 그래프 edge 연결
  - `backend/src/api/v1/routers/chat.py`
    - `_build_show_cart_content()` 추가
    - 메인/폴백 모두 intent 정규화 경로 통합
    - `show_cart` 시 요약 content 후처리 일관성 보장
  - `frontend/src/app/store/AppContext.tsx`
    - `fetchPlans`에서 로컬 카트 0개 시 서버 basket 재조회 후 판단하도록 변경
  - `backend/tests/test_graph_parsing.py`
    - uppercase intent/`show_cart`/신규 엔터티 포맷 테스트 추가
  - `backend/tests/test_api.py`
    - 챗봇 삭제 diff 테스트 추가
    - `장바구니 보여줘` 요약 응답 + 비변경 diff 테스트 추가
  - `backend/tests/test_prompt_loader.py`
    - analyzer 프롬프트 기대 문자열을 신규 포맷 기준으로 동기화
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.8.md` (신규)
  - `똑장ver2 팀원 작업물 통합 계획.md`
    - `변동사항 (2026-02-20)` 섹션 추가
- **Decisions**:
  - 가격 이상치 필터링은 이번 배치에서 제외한다.
  - 챗봇 API 응답 계약(`role/content/diff/suggestions`)은 유지한다.
  - Git 루트 미감지 환경이므로 문서(`INTEGRATION_EXECUTION_PLAN`, `HISTORY`)를 작업 SoR로 유지한다.
- **Verification**:
  - `cd backend && pytest -q` -> `59 passed`
  - `cd frontend && npm run build` -> `vite build success`

---

## [2026-02-20] v3.6 프롬프트 분리 리팩터링 — 코드/프롬프트 의존성 해소

- **Status**: Completed
- **Changes**:
  - `backend/src/application/prompts/` (신규 폴더)
  - `backend/src/application/prompts/analyzer.system.txt` (신규)
    - `graph.py` 내부 analyzer system prompt를 파일 템플릿으로 이동
    - `{preferences}`, `{basket_status}` 변수 바인딩 포맷 유지
  - `backend/src/application/prompts/loader.py` (신규)
    - 템플릿 로드/렌더링 유틸 추가
    - 누락 변수 검증 및 path traversal 방어 로직 추가
  - `backend/src/application/prompts/__init__.py` (신규)
  - `backend/src/application/graph.py`
    - 하드코딩 `ANALYZER_PROMPT` 제거
    - `render_prompt("analyzer.system.txt", ...)`로 교체
  - `backend/tests/test_prompt_loader.py` (신규)
    - 프롬프트 템플릿 로드/렌더/누락변수 단위 테스트 추가
  - `똑장_클로즈_베타_서비스화_계획.md`
    - `2026-02-20 v1.7` 실행 현황 업데이트 반영
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.7.md` (신규)
- **Decisions**:
  - AI 프롬프트는 코드 상수로 유지하지 않고 파일 기반 템플릿으로 관리한다.
  - 프롬프트 변수 바인딩은 코드에서 명시적으로 주입하며, 누락 변수는 예외로 조기 탐지한다.
- **Verification**:
  - `cd backend && pytest -q` -> `54 passed`
  - `GET http://localhost:8000/health` -> `200`

---

## [2026-02-20] v3.5 .env 복구 + 런타임 재기동 + 로그 마스킹 보강

- **Status**: Completed
- **Changes**:
  - `.env_backup` 확인 후 `.env`, `backend/.env`에 실키 병합 복원
  - `.env.before_restore_20260220_*`, `backend/.env.before_restore_20260220_*` 스냅샷 백업 생성
  - `backend/src/core/logging_mask.py`
    - `p_cert_key`, `p_cert_id`, `api_key`, `client_secret`, `access_token` 마스킹 규칙 추가
  - `backend/src/main.py`
    - `httpx`, `httpcore` 로그 레벨을 `WARNING`으로 하향
  - `backend_server.log`, `backend_server.err.log` 초기화 후 백엔드 재기동
  - 프론트 dev 서버 재기동
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.6.md` (신규)
- **Decisions**:
  - 실키 복원은 백업 파일 전체 덮어쓰기 대신 “현재 템플릿에 백업값 병합” 방식으로 수행해 최신 설정 항목을 유지한다.
  - 외부 API 요청 URL 로깅은 민감정보 노출 위험이 있어 기본적으로 억제한다.
- **Verification**:
  - `GET /health` -> `200`
  - `GET http://localhost:5173` -> `200`
  - 백엔드 시작 로그에서 KAMIS 동기화 성공 확인(민감 쿼리 미노출)

---

## [2026-02-20] v3.4 실연동 강화 배치 — LLM 모델 fallback + KAMIS 공공카탈로그 동기화

- **Status**: Completed
- **Changes**:
  - `backend/src/core/llm.py` (신규)
    - OpenAI 호출 공통 유틸 추가
    - `OPENAI_FALLBACK_MODELS` 기반 모델 순차 fallback 지원
    - JSON 응답 파싱/코드펜스 제거 처리
  - `backend/src/application/graph.py`
    - analyzer 노드를 LLM fallback 유틸 기반으로 전환
    - LLM `entities`를 정규화해 matcher 엔터티와 병합
    - LLM 실패 시 키워드 분류 fallback 유지
    - matcher 엔터티 기반 `remove` 액션 파싱 보강
  - `backend/src/application/services/public_catalog_sync.py` (신규)
    - KAMIS 카테고리 데이터 fetch/정규화/upsert 서비스 추가
    - `product_norm`, `offline_price_snapshot` 동기화 구현
  - `backend/src/api/v1/routers/public_data.py` (신규)
    - `POST /api/v1/public-data/catalog/sync`
    - `GET /api/v1/public-data/catalog/items`
  - `backend/src/main.py`
    - 앱 기동 시 공공카탈로그 동기화(`PUBLIC_CATALOG_SYNC_ON_STARTUP`) 연결
    - `public_data` 라우터 등록
  - `backend/tests/test_api.py`
    - 공공카탈로그 sync/list API 회귀 테스트 추가
  - `.env`, `backend/.env`
    - `OPENAI_FALLBACK_MODELS`
    - `PUBLIC_CATALOG_SYNC_ON_STARTUP`
    - `PUBLIC_CATALOG_TIMEOUT_SECONDS` 추가
  - `backend/README.md`
    - 공공데이터 API/환경변수 가이드 추가
  - `똑장_클로즈_베타_서비스화_계획.md`
    - `2026-02-20 v1.5` 실행 현황 반영
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.5.md` (신규)
- **Decisions**:
  - 품목 처리 로직은 하드코딩 heuristic 단독 의존 대신 `LLM + 규칙 fallback` 이중 안전 구조로 유지한다.
  - 공공데이터 동기화 실패는 서비스 기동 실패로 전파하지 않고 `skip/partial` 상태로 기록해 운영 안정성을 우선한다.
- **Verification**:
  - `cd backend && pytest -q` -> `51 passed`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> PASS (`vite build success`)

---

## [2026-02-20] v3.3 UX/신뢰성 개선 배치 — 챗봇 품목 인식/배송지 복귀/예약 알림 연결/알림센터

- **Status**: Completed
- **Changes**:
  - `backend/src/application/graph.py`
    - 품목 alias 확장(`깻잎`, `상추` 등)
    - `allow_fallback` 품목 추출 강화(미등록 품목도 처리)
    - 숫자/규격 토큰(`1kg`)이 품목명으로 오인되지 않도록 필터링
  - `backend/src/infrastructure/persistence/user_repository.py`
    - 예약 목록 정렬을 생성순 중심에서 “가장 가까운 `next_run_at` 우선”으로 변경
  - `backend/tests/test_api.py`
    - 비-alias 품목(`깻잎`) 채팅 추가 회귀 테스트 추가
  - `frontend/src/features/chat/AiChatModal.tsx`
    - 채팅 로컬 저장 키를 사용자 이메일 기반으로 분리
    - 다른 테스트 계정 로그인 시 이전 채팅 기록이 섞이지 않도록 수정
  - `frontend/src/pages/PaymentScreen.tsx`
  - `frontend/src/pages/AccountInfoScreen.tsx`
  - `frontend/src/pages/AddressBookScreen.tsx`
    - 배송지 관리 진입/복귀 목적지(`PAYMENT` vs `ACCOUNT_INFO`) 분기 저장
    - 결제 화면에서 배송지 입력 후 다시 결제 맥락으로 복귀하도록 수정
  - `frontend/src/app/store/AppContext.tsx`
    - 예약 실행 알림 엔트리 상태(`reservationAlerts`) 추가
    - 읽지 않은 알림 수 계산/읽음 처리
    - `openReservationFromAlert()` 추가: 승인대기 예약을 장바구니 반영 후 비교 흐름으로 연결
    - 예약 목록 정렬(가까운 예약 우선) 일관화
  - `frontend/src/pages/HomeScreen.tsx`
    - 우측 상단 벨 버튼을 실제 알림센터 진입으로 연결
    - 읽지 않은 알림 배지 표시
    - “다음 예약” 표기를 가장 가까운 예약 기준으로 계산
  - `frontend/src/pages/RecommendationScreen.tsx`
  - `frontend/src/pages/HistoryScreen.tsx`
    - `awaiting_approval` 상태 노출 및 “장바구니 반영” 액션 버튼 연결
  - `frontend/src/pages/NotificationsScreen.tsx` (신규)
    - 알림센터 화면 추가(승인대기 예약/알림 목록/읽음 처리/장바구니 반영)
  - `frontend/src/app/App.tsx`
    - `NOTIFICATIONS` 라우트 연결
  - `똑장_클로즈_베타_서비스화_계획.md`
    - `2026-02-20 v1.4` 실행 현황 업데이트 추가
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.4.md` (신규)
- **Decisions**:
  - 알림 UX는 “토스트 단일 안내”에서 “알림센터 + 승인대기 액션”으로 승격한다.
  - 예약 승인대기 상태는 알림 클릭 시 장바구니 반영으로 즉시 해결 가능한 동작으로 연결한다.
- **Verification**:
  - `cd backend && pytest -q` -> `49 passed`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> PASS (`vite build success`)
  - 서버 재기동 후 `http://localhost:8000/health`, `http://localhost:5173/` 응답 확인

---

## [2026-02-20] v3.2 핫픽스 — 챗봇 연결 오류 완화 + 예약시간 인앱 알림 추가

- **Status**: Completed
- **Changes**:
  - `backend/src/application/graph.py`
    - `OPENAI_API_KEY` placeholder(`__SET_IN_SECRET_MANAGER__`)를 유효 키로 오인하지 않도록 방어 로직 추가
  - `backend/src/api/v1/routers/chat.py`
    - LangGraph/LLM 호출 실패 시 단순 에러 문구 대신 규칙 기반 fallback(`modify/recommend/clarify/general`) 실행으로 전환
    - fallback에서도 장바구니 반영/응답 생성이 되도록 처리
  - `backend/tests/test_api.py`
    - 챗봇 fallback 회귀 테스트 추가 (`현재 AI 에이전트에 연결할 수 없어요` 문구 재발 방지)
  - `frontend/src/app/store/AppContext.tsx`
    - 예약 목록 주기 폴링(30초) 추가
    - 예약 `last_run_at` 기반 인앱 알림(Toast) 추가
    - 알림 중복 방지용 localStorage marker(`ddokjang.reservation.alerts.v1`) 추가
    - 예약 엔트리 타입에 상태/실행 메타 필드 확장
  - `똑장_클로즈_베타_서비스화_계획.md`
    - `2026-02-20 v1.3` 실행 현황 업데이트 추가
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.3.md` (신규)
- **Decisions**:
  - 외부 LLM 권한/모델 접근 실패 시에도 챗봇 핵심 UX(장바구니 조작)는 유지하도록 규칙 기반 fallback을 기본 안전장치로 채택한다.
  - 예약 알림은 우선 인앱 방식(앱 활성 상태)으로 제공하고, 푸시 알림은 후속 배치로 분리한다.
- **Verification**:
  - `cd backend && pytest -q` -> `48 passed`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> PASS (`vite build success`)

---

## [2026-02-20] v3.1 클로즈드 베타 서비스화 2차 구현 — 결제샌드박스/성능하드닝/Alembic/Ops Gate

- **Status**: Completed
- **Changes**:
  - `backend/src/main.py`
    - `payments`, `ops` 라우터 등록
    - placeholder secret 자동 무효 처리로 외부 provider 오작동 방지
  - `backend/src/core/config.py`
    - Naver Shopping timeout/retry/circuit/cache 및 online KPI 윈도우 설정 추가
    - `POSTGRES_DSN` 설정 추가
  - `backend/src/core/metrics.py` (신규)
    - 온라인 플랜 KPI 수집기(p50/p95/p99/max, degraded/failure 비율) 구현
  - `backend/src/api/v1/routers/ops.py` (신규)
    - `GET /ops/metrics/online-plans`
    - `GET /ops/gates/online-plan-latency`
  - `backend/src/api/v1/routers/plans.py`
    - 온라인 플랜 생성 구간 latency/degraded/success 계측 추가
  - `backend/src/application/services/online_plan_adapter.py`
    - 검색 병렬화(`asyncio.gather`) + 중복 검색 제거
  - `backend/src/infrastructure/providers/naver_shopping.py`
    - timeout/retry(backoff)/circuit breaker/TTL cache 적용
  - `backend/src/api/v1/routers/payments.py`
    - 메인 앱 라우팅 연결 완료(실운영 경로 활성화)
  - `backend/src/infrastructure/persistence/schema.py` (신규)
    - PostgreSQL/Alembic용 SQLAlchemy 메타데이터 정의
  - `backend/alembic.ini` (신규)
  - `backend/alembic/env.py` (신규)
  - `backend/alembic/script.py.mako` (신규)
  - `backend/alembic/versions/20260220_0001_init_core_schema.py` (신규)
    - 클로즈드 베타 핵심 스키마 초기 마이그레이션 추가
  - `backend/pyproject.toml`
    - `sqlalchemy`, `alembic`, `psycopg[binary]` 의존성 추가
  - `backend/README.md`
    - Alembic 실행 가이드 및 최신 API 계약 반영
  - `backend/tests/test_api.py`
    - 결제(intent/confirm/idempotency/guardrail) 테스트 추가
    - ops KPI/게이트 API 테스트 추가
  - `frontend/src/api.ts`
    - `PaymentsAPI` 및 결제 타입 추가
    - 에러 메시지 파싱(detail.message) 확장
  - `frontend/src/pages/PaymentScreen.tsx`
    - `intent -> confirm -> completeCurrentOrder` 실연동
    - 기본 배송지/선택플랜 사전 검증 + idempotency 적용
  - `frontend/src/pages/TermsScreen.tsx`
  - `frontend/src/pages/PrivacyPolicyScreen.tsx`
    - 클로즈드 베타 정식 문안으로 교체
  - `scripts/run_beta_gate.ps1` (신규)
    - `pytest`, `tsc`, `build` 자동 게이트 스크립트 추가
  - `.env`, `backend/.env`
    - `POSTGRES_DSN`, Naver hardening, KPI 설정 키 추가
  - `똑장_클로즈_베타_서비스화_계획.md`
    - `2026-02-20 v1.2` 실행 현황 반영
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.2.md` (신규)
- **Decisions**:
  - 런타임 DB는 기존 SQLite SoR를 유지하면서, 운영 전환 대비 PostgreSQL/Alembic 마이그레이션 자산을 병행 도입한다.
  - 결제는 베타 정책에 맞춰 승인 기반 샌드박스만 허용하고, 실결제는 후속 단계로 분리한다.
- **Verification**:
  - `cd backend && pytest -q` -> `47 passed`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> PASS (`vite build success`)
  - `cd backend && python -m compileall src alembic` -> PASS

---

## [2026-02-20] v3.0 클로즈드 베타 서비스화 1차 구현 — JWT 인증/서버 SoR/API 계약 정렬

- **Status**: Completed
- **Changes**:
  - `backend/src/core/security.py` (신규)
    - JWT(HMAC) 토큰 생성/검증, refresh hash 유틸 구현
  - `backend/src/core/logging_mask.py` (신규)
    - API 키/토큰/전화번호 마스킹 로그 필터 추가
  - `backend/src/infrastructure/persistence/database.py`
    - `users/auth_sessions/user_baskets/user_preferences/user_profiles/user_orders/user_reservations/plan_requests` 테이블 추가
  - `backend/src/infrastructure/persistence/user_repository.py` (신규)
    - 사용자별 SoR repository + 예약 디스패치 로직 구현
  - `backend/src/api/v1/dependencies.py` (신규)
    - `require_auth` Bearer JWT 의존성 추가
  - `backend/src/api/v1/routers/auth.py` (신규)
    - `POST /auth/login|refresh|logout`, `GET /auth/me` 추가
  - `backend/src/api/v1/routers/user_data.py` (신규)
    - `GET|PUT /users/me/profile`, `GET|POST /users/me/orders` 추가
  - `backend/src/api/v1/routers/basket.py`
  - `backend/src/api/v1/routers/preferences.py`
  - `backend/src/api/v1/routers/reservations.py`
  - `backend/src/api/v1/routers/chat.py`
    - `user_id` 쿼리 제거, JWT 사용자 컨텍스트 기반 처리로 전환
  - `backend/src/api/v1/routers/plans.py`
    - `POST /offline/plans/generate|select`, `POST /online/plans/generate|select` 구현
    - `POST /plans/generate` 호환 어댑터 유지
    - degraded 시 `206`, invalid redirect 시 `400 INVALID_REDIRECT_URL` 반영
  - `backend/src/main.py`
    - auth/user_data router 등록, 예약 스케줄러(1분 poll) 실행 루프 추가
  - `backend/tests/test_api.py`
    - JWT 인증/권한/온라인·오프라인 generate/select/예약 확장 계약 기준으로 재작성
  - `frontend/src/api.ts`
    - 토큰 저장(sessionStorage) + Bearer 공통 요청 + refresh 재시도 + auth/user/profile/order/select API 추가
  - `frontend/src/app/store/AppContext.tsx`
    - profile/order/reservation localStorage SoR 제거, 서버 SoR 연동
    - 세션 부재 시 `LOGIN` 화면 강제
  - `frontend/src/pages/LoginScreen.tsx`
  - `frontend/src/pages/MyPageScreen.tsx`
  - `frontend/src/pages/PlanDetailScreen.tsx`
  - `frontend/src/pages/PaymentMethodsScreen.tsx`
  - `frontend/src/pages/TermsScreen.tsx`
  - `frontend/src/pages/PrivacyPolicyScreen.tsx`
  - `frontend/src/pages/PaymentScreen.tsx`
    - 베타 준비중/샌드박스 문구 정렬, 온라인 실행 CTA 추가
  - `.env`, `backend/.env`
    - 평문 비밀키 제거, 샘플 템플릿/시크릿 매니저 주입 방식으로 정리
  - `똑장_클로즈_베타_서비스화_계획.md`
    - `2026-02-20 v1.1` 실행 현황 섹션 추가
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.0.md` (신규)
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.1.md` (신규)
- **Decisions**:
  - PostgreSQL/Alembic 선행 대신, 현재 배치에서는 SQLite SoR 전환을 우선 적용해 사용자 데이터 영속성과 계정 격리를 먼저 확보한다.
  - 결제는 실제 provider 연동 대신 샌드박스 UX/계약 정렬까지만 포함하고, 실연동은 후속 배치로 분리한다.
- **Verification**:
  - `cd backend && pytest -q` -> `44 passed`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> PASS (`vite build success`)

---

## [2026-02-19] v2.9-a 문서 동기화 — INTEGRATION_EXECUTION_PLAN v1.10 작성/기본 문서 복원

- **Status**: Completed
- **Changes**:
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.10.md` 신규 작성
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19.md`를 독립 버전 문서(`v1.1`)로 복원
  - 문서에 네이버 스토어 취급 기준(Provider vs Mall) 결정 근거 반영
- **Verification**:
  - 기본 문서 `v1.1` / 신규 문서 `v1.10` 병행 유지 확인

---

## [2026-02-19] v2.9 사용자 피드백 배치 — 채팅 재료번들/예약 직접작성/영수증 재조회/하단바 고정

- **Status**: Completed
- **Changes**:
  - `backend/src/application/graph.py`
    - `"김치찌개 재료 담아줘"` 발화를 레시피 번들로 인식해 `김치/두부/돼지고기`를 일괄 장바구니 반영
  - `backend/src/api/v1/routers/reservations.py`
    - 예약 모델/요청/수정 DTO에 `planned_items` 필드 추가
    - 품목 리스트 정규화(공백/중복 제거) 로직 추가
  - `backend/src/infrastructure/providers/naver_shopping.py`
  - `backend/src/application/services/online_plan_adapter.py`
    - 온라인 후보 몰에 `쿠팡` 포함, 검색 키워드/배송 정책/아이콘 확장
  - `backend/tests/test_api.py`
    - 레시피 번들 채팅 회귀 테스트 추가
    - 예약 `planned_items` 생성/수정 회귀 테스트 추가
  - `frontend/src/api.ts`
  - `frontend/src/app/store/AppContext.tsx`
    - 예약 API 타입에 `planned_items` 반영
    - `createReservationFromItems()` 추가(직접 품목 예약 생성)
    - localStorage 키를 `v1` -> `v2`로 상향(기존 테스트 데이터 분리)
  - `frontend/src/features/reservation/ReservationComposerCard.tsx` (신규)
    - 예약명/요일/시간/품목 직접 입력 폼 컴포넌트 추가
  - `frontend/src/pages/RecommendationScreen.tsx`
  - `frontend/src/pages/HistoryScreen.tsx`
    - 직접 품목 예약 폼 연결
    - 예약 카드에 `plannedItems` 노출
  - `frontend/src/pages/HistoryScreen.tsx`
    - 주문 카드 클릭/chevron 클릭 시 영수증 상세 모달 조회 가능화
  - `frontend/src/app/App.tsx`
    - 하단 네비게이션을 viewport 하단 `fixed`로 변경
  - `frontend/src/pages/HomeScreen.tsx`
    - 상단 `My` 버튼 제거, 알림 버튼으로 교체
  - `frontend/src/features/chat/AiChatModal.tsx`
    - 채팅 히스토리 storage key `v2` 적용
- **Decisions**:
  - 네이버는 온라인 데이터 소스(provider)로 유지하고, 사용자 노출 몰 후보는 `쿠팡`까지 확장한다.
  - 홈 배너 비주얼 개편은 코드 즉시 반영 대신 별도 디자인 제안 배치로 분리한다.
- **Verification**:
  - `cd backend && pytest -q` -> `58 passed in 28.40s`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> `vite v6.4.1 build success`

---

## [2026-02-20] v2.8 보안 업그레이드 배치(1번) — 백엔드 의존성 major 상향

- **Status**: Completed
- **Changes**:
  - `backend/pyproject.toml`
    - `fastapi`를 `^0.115.0` -> `^0.128.0`으로 상향
    - `starlette`를 명시 의존성으로 추가 (`>=0.49.1,<0.51.0`)
    - `langgraph`를 `^0.2.0` -> `^1.0.0`으로 상향
    - `langgraph-checkpoint` 명시 의존성 추가 (`>=3.0.0,<4.0.0`)
    - `langchain-openai`를 `^0.2.0` -> `^1.1.0`으로 상향
    - `langchain-core`를 `^0.3.0` -> `>=1.2.11,<2.0.0`으로 상향
  - `PLAN.md`
    - `Phase 7-A — 보안 의존성 업그레이드(1차)` 섹션 추가 및 완료 체크 반영
- **Decisions**:
  - `pip-audit`에서 지적된 런타임 취약점(Starlette, LangChain Core, LangGraph Checkpoint)은 버전 하한을 `pyproject`에 명시해 재발을 방지한다.
  - 해커톤 안정성을 위해 1차 배치는 “의존성 상향 + 회귀 통과”까지 완료하고, 추가 보안 하드닝은 후속 배치로 분리한다.
- **Verification**:
  - 임시 Python 3.11 venv에서 업그레이드 조합 설치 확인
  - `pytest -q` -> `57 passed in 11.55s`
  - `pip-audit` -> 런타임 취약점 0건, 점검 환경 `setuptools` 도구체인 항목만 잔여

---

## [2026-02-20] v2.7 테스트 기반 개선 — pytest 경고 제거 및 회귀 검증

- **Status**: Completed
- **Changes**:
  - `backend/pyproject.toml`
    - `pytest-asyncio` 경고 제거를 위해 `asyncio_default_fixture_loop_scope = "function"` 명시
- **Decisions**:
  - 테스트 독립성/예측 가능성을 위해 async fixture loop scope를 function 단위로 고정
- **Verification**:
  - `cd backend && pytest -q` -> `57 passed`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> `vite v6.4.1 build success`

---

## [2026-02-20] v2.6 백엔드 보안 점검 — pip-audit 실행 및 노출면 분석

- **Status**: Completed
- **Changes**:
  - 백엔드 의존성 보안 점검 실행(`pip-audit`)
    - Poetry 기반 프로젝트라 Windows에서 실행 가능한 임시 Python 3.11 venv를 생성해 점검
    - 점검 후 임시 산출물(`.audit-venv`, `.audit-requirements.txt`) 정리
  - 코드 노출면 분석:
    - `FileResponse`/`StaticFiles` 미사용 확인 (`src/main.py`, `src/**`)
    - LangGraph checkpoint 미사용 확인 (`workflow.compile()`에 checkpointer 미지정)
    - `ChatOpenAI.get_num_tokens_from_messages()`/`image_url` 토큰 계산 경로 미사용 확인
- **Findings**:
  - `langchain-core` (CVE-2026-26013): fix가 `1.2.11`(major 업그레이드 필요)
  - `langgraph-checkpoint` (CVE-2025-64439): fix가 `3.0.0`(major 업그레이드 필요)
  - `starlette` (CVE-2025-54121, CVE-2025-62727): fix가 `0.47.2`/`0.49.1`이며 현재 FastAPI 제약 범위와 충돌 가능
  - `setuptools` 취약점은 점검용 환경 도구체인 영역
- **Decisions**:
  - 해커톤 안정성 우선으로, 즉시 major 업그레이드(FASTAPI/LangChain/LangGraph)는 이번 배치에서 보류
  - 다음 배치에서 `FastAPI/Starlette`, `langchain-*`, `langgraph-*` 호환성 테스트를 포함한 보안 업그레이드 배치를 별도로 수행
- **Verification**:
  - `pip-audit`가 UTF-8 디코딩 오류 없이 동작하도록 `PYTHONUTF8=1` 적용 후 점검 성공
  - 백엔드 테스트는 점검용 임시 venv에서 환경 변수 영향으로 `56 passed, 1 failed`(기존 OpenAI 모델 설정 이슈) 확인

---

## [2026-02-20] v2.5 보안 점검 후속 — npm audit 0건 정리(vite 패치 업데이트)

- **Status**: Completed
- **Changes**:
  - `frontend/package.json`
    - `vite`를 `6.3.5` -> `6.4.1`로 패치 업데이트
  - `frontend/package-lock.json`
    - lockfile 재생성으로 의존성 트리 동기화
- **Decisions**:
  - 취약점은 `devDependency(vite)` 1건(Moderate)이었고, semver major 변경 없는 패치 업그레이드로 해결한다.
- **Verification**:
  - `cd frontend && npm audit --json` -> `total vulnerabilities: 0`
  - `cd frontend && npx tsc --noEmit` -> PASS
  - `cd frontend && npm run build` -> `vite v6.4.1 build success`

---

## [2026-02-20] v2.4 정석안 타입체크 복구 — 누락 의존성 설치 + strict 에러 정리

- **Status**: Completed
- **Changes**:
  - `frontend/package.json`, `frontend/package-lock.json`
    - Radix UI/Recharts/DayPicker/Resizable Panels 등 `shared/ui` 의존성 전량 추가
  - `frontend/src/vite-env.d.ts` 신규
    - `vite/client` 및 `*.png` 모듈 타입 선언 추가
  - `frontend/src/shared/ui/calendar.tsx`
    - `react-day-picker` 최신 `Chevron` 컴포넌트 타입(`ChevronProps`)에 맞게 수정
  - `frontend/src/shared/ui/chart.tsx`
    - Recharts v3 타입 시그니처에 맞춰 tooltip/legend payload 타입 명시
    - strict 모드 implicit any/props 에러 제거
  - `frontend/src/shared/ui/resizable.tsx`
    - `react-resizable-panels@4` export 변경(`Group/Panel/Separator`) 반영
  - `frontend/src/shared/ui/GlobalBottomSheet.tsx`
  - `frontend/src/shared/ui/ToastProvider.tsx`
    - 미사용 `React` default import 제거
- **Decisions**:
  - 해커톤 안정성을 위해 `tsc --noEmit`을 빌드와 별도로 통과시키는 정석안으로 유지한다.
  - 미사용 컴포넌트 제외(`exclude`) 우회 대신, 의존성/타입을 실제로 복구해 기술부채를 남기지 않는다.
- **Verification**:
  - `cd frontend && npx tsc --noEmit` -> PASS (0 errors)
  - `cd frontend && npm run build` -> `vite v6.3.5 build success`

---

## [2026-02-20] v2.3 예약 기능 프론트-백엔드 API 연동 + Phase 6 완료 표기 정리

- **Status**: Completed
- **Changes**:
  - `frontend/src/api.ts`
    - `/api/v1/reservations` 전용 타입/클라이언트(`ReservationsAPI`) 추가
    - 조회/생성/수정/삭제(GET/POST/PATCH/DELETE) 호출 경로 고정
  - `frontend/src/app/store/AppContext.tsx`
    - `shoppingReservations`를 서버 응답 기준으로 동기화하도록 변경
    - 앱 초기 로드시 예약 목록 서버 조회 추가
    - `createReservationFromLatestOrder`, `toggleReservation`, `removeReservation`를 API 연동으로 전환
    - snake_case API 필드(`source_order_id`, `source_mart_name`)를 프론트 camelCase 필드로 매핑
  - `PLAN.md`
    - `Phase 6 — Online MVP Hardening` 상태를 `계획`에서 `완료`로 변경
    - `피드백 받고 싶은 결정` 섹션을 `결정 결과(확정)` 섹션으로 정리
- **Decisions**:
  - 예약 데이터의 SoR(Source of Truth)는 백엔드 `reservations` API로 고정하고, 로컬 상태는 UI 캐시로만 사용한다.
- **Verification**:
  - `cd frontend && npm run build` -> `vite v6.3.5 build success`

---

## [2026-02-20] v2.2 실행계획 문서 정규화 — v1.8/v1.9 구성 중복 제거

- **Status**: Completed
- **Changes**:
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.8.md`
    - 문서 시점을 Phase 4 스냅샷으로 고정
    - 후속 배치 내용(Phase 6 업데이트) 제거
    - `다음 배치 권장` 섹션 제거
    - PLAN 요약본 목적에 맞게 구조 단순화
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.9.md`
    - 문서 시점을 Phase 6 + 6-F 스냅샷으로 고정
    - v1.8 복제 잔재(Phase 4 본문/중복 섹션) 제거
    - 실행 범위/결과/검증/문서 동기화 4블록으로 정리
- **Decisions**:
  - 버전별 실행계획 문서는 해당 배치의 PLAN 요약만 포함하고, 다른 시점의 내용을 혼합하지 않는다.
  - 권장사항/차기배치 제안은 실행계획 스냅샷 문서에서 제외하고 `PLAN.md`에서만 관리한다.
- **Verification**:
  - `v1.8`: Phase 4 단일 스냅샷 구조 확인
  - `v1.9`: Phase 6/6-F 단일 스냅샷 구조 확인

---

## [2026-02-19] v2.1 2차 리뷰 Follow-up 완료 — HIGH/ MEDIUM/ LOW 잔여 이슈 해소

- **Status**: Completed
- **Changes**:
  - HIGH-1 (비교 단계 우회 수정):
    - `frontend/src/pages/CartViewScreen.tsx`
      - 하단 CTA 경로를 `PAYMENT` 직행에서 `MODE_SELECTION`으로 변경
      - 버튼 텍스트를 `주문하기` -> `플랜 비교하기`로 변경
  - HIGH-2 (이동시간 공식 보정):
    - `backend/src/api/v1/routers/plans.py`
    - `backend/src/application/services/offline_plan_adapter.py`
    - `backend/src/infrastructure/providers/mock_providers.py`
      - `transit` 이동시간을 `~4분/km` 근사로 변경(도보보다 빠르게 보정)
  - MEDIUM-1 (모드 토글 UX 개선):
    - `frontend/src/app/store/AppContext.tsx`
      - `fetchPlans()`에서 `TOP3_RESULT` 화면일 때 `LOADING` 화면 강제 전환 생략
  - MEDIUM-2 (Completion 팁 동적화):
    - `frontend/src/pages/CompletionScreen.tsx`
      - 하드코딩 문구 제거, 최신 주문(`itemCount`, `totalPrice`) 기반 동적 팁으로 교체
  - MEDIUM-3 + LOW-1 (중복 제거/정리):
    - `backend/src/application/services/geo.py` 신규
      - 공통 `haversine_km()` 유틸 추가
    - `backend/src/api/v1/routers/plans.py`
    - `backend/src/application/services/offline_plan_adapter.py`
      - 중복 `_haversine_km` 제거 후 공통 유틸 사용
      - 함수 내부 `import math` 제거
  - 문서:
    - `PLAN.md`
      - `Phase 6-F` 계획 추가 및 완료 상태/검증 결과 반영
- **Decisions**:
  - 데모 핵심 흐름(입력 -> 비교 -> 승인)을 우선 복원하기 위해 장바구니 CTA를 비교 단계로 고정한다.
  - 이동시간 정책은 사용자 체감 일관성을 위해 `walk(12분/km)`, `transit(4분/km)` 근사값을 채택한다.
  - 중복 지리 계산 로직은 공통 유틸로 통합해 유지보수 비용을 낮춘다.
- **Verification**:
  - `cd backend && pytest -q` -> `57 passed in 14.48s`
  - `cd frontend && npm run build` -> `vite v6.3.5 build success`
- **Next Steps**:
  - 수동 E2E 리허설에서 `CartView -> ModeSelection -> Top3 toggle -> PlanDetail -> Payment(사전승인)` 루프 확인

---

## [2026-02-19] v2.0 Phase 6 핵심 반영 — 온라인 엔진 연결/신뢰필드/승인 UX/예약 API

- **Status**: Completed
- **Changes**:
  - 백엔드:
    - `backend/src/domain/models/plan.py`
      - 온라인 신뢰/실행 필드 확장 (`price_source`, `price_observed_at`, `price_notice`, `data_source`, `mall_product_links`, `direct_cart_supported`, `expected_delivery_hours`)
    - `backend/src/application/services/online_plan_adapter.py` 신규
      - 네이버 쇼핑 검색 결과를 몰별 플랜으로 집계하는 온라인 어댑터 구현
    - `backend/src/api/v1/routers/plans.py`
      - `mode=online` 시 온라인 어댑터 우선, 실패 시 offline/mock fallback
      - URL 화이트리스트 검증 및 링크 정제
      - 신뢰 필드 기본값 보정, 도보 이동시간 계수 보정
    - `backend/src/main.py`
      - `NaverShoppingProvider` 앱 상태 초기화
    - `backend/src/api/v1/routers/reservations.py` 신규
      - 예약 조회/생성/수정/삭제 API 추가
    - `backend/src/api/v1/routers/basket.py`, `backend/src/api/v1/routers/chat.py`, `backend/src/application/graph.py`
      - user_id 기반 장바구니 분리 및 chat diff 생성
    - `backend/src/infrastructure/providers/naver_shopping.py`
      - `print` -> `logger` 교체
  - 프론트엔드:
    - `frontend/src/api.ts`
      - Plan 타입 확장
    - `frontend/src/pages/Top3ResultScreen.tsx`
      - 온라인/오프라인 토글 및 신뢰 필드 표시
    - `frontend/src/pages/PlanDetailScreen.tsx`
      - 신뢰 UI 및 배송비 계산 로직 보정
    - `frontend/src/pages/PaymentScreen.tsx`
      - 결제 전 사전 승인(체크) 단계 추가
    - `frontend/src/app/store/AppContext.tsx`
      - 플랜 생성 실패 에러 토스트 추가
    - `frontend/src/features/chat/AiChatModal.tsx`
      - chat diff 반영 메시지 추가
    - `frontend/src/pages/CompletionScreen.tsx`, `frontend/src/pages/CartViewScreen.tsx`
      - 배송/도착 하드코딩 제거
    - `frontend/src/pages/VoiceInputScreen.tsx`
      - 브라우저 미지원 안내 강화
    - `frontend/src/pages/ItemDetailScreen.tsx`
      - Stub 제거
    - `frontend/src/utils/productVisual.ts`
      - 두부 이모지 교체
  - 테스트:
    - `backend/tests/test_api.py`
      - 온라인 신뢰필드/URL 화이트리스트/예약 API 테스트 추가
- **Decisions**:
  - 온라인 실행 CTA는 외부몰 이동 링크 중심으로 유지 (`direct_cart_supported=false` 기본)
  - 온라인/오프라인 비교는 Top3 화면 내 모드 토글 방식으로 통합
  - 해커톤 안정성을 위해 온라인 실패 시 degraded + offline/mock fallback 유지
- **Verification**:
  - `cd backend && pytest -q` → `57 passed in 13.30s`
  - `cd frontend && npm run build` → `vite v6.3.5 build success`
- **Next Steps**:
  - 결제 플로우의 "최종 확인 모달" 세부 UX 다듬기
  - 예약 API와 프론트 예약 상태(localStorage)를 서버 동기화로 통합

---

## [2026-02-19] v1.9 Phase 5 검증 완료 — 전수 테스트 + API 스모크 통과

- **Status**: Completed
- **Changes**:
  - 실행 검증:
    - `cd backend && pytest -q` 실행
    - `cd frontend && npm run build` 실행
    - FastAPI `TestClient` 기반 API 스모크 실행
  - 문서 반영:
    - `PLAN.md` 검증 결과를 Phase 5 Validation 기준으로 갱신
- **Decisions**:
  - API 스모크는 로컬 DB 락 간섭을 피하기 위해 임시 `DB_PATH/CACHE_DB_PATH`를 분리해 수행한다.
  - 검증은 "빌드 + 백엔드 전수 + 핵심 API 루프" 3단계로 고정한다.
- **Verification**:
  - `cd backend && pytest -q` → `53 passed in 15.43s`
  - `cd frontend && npm run build` → `vite v6.3.5 build success`
  - API 스모크:
    - `GET /api/v1` 200
    - `GET /api/v1/basket` 200
    - `POST /api/v1/basket/items` 200
    - `POST /api/v1/plans/generate` 200 (`top3=3`)
    - `POST /api/v1/chat/message` 200
- **Next Steps**:
  - 브라우저 수동 E2E(홈→Top3→상세→결제→주문/예약) 리허설 결과를 별도 항목으로 추가

---

## [2026-02-19] v1.8 Phase 4 완료 — 플랜 근거 시각화/예약 기능/주문이력 연동

- **Status**: Completed
- **Changes**:
  - `frontend/src/app/store/AppContext.tsx`
    - 플랜 분석 메타(`planHeadline`, `planLastUpdated`, `planMeta`, `planAlternatives`) 상태 추가
    - 주문 이력(`orderHistory`)에 플랜 근거 메타 저장 필드 확장
    - 예약 상태(`shoppingReservations`) 및 생성/토글/삭제 액션 추가
  - `frontend/src/pages/Top3ResultScreen.tsx`
    - 가격 근거(상품합+부가비용), 미포함 품목, 분석 메타, 대체안 UI 노출
  - `frontend/src/pages/HistoryScreen.tsx`
    - 주문/예약 탭 분리
    - 주문카드에 플랜 근거와 비교 컨텍스트 표시
    - 예약 생성/활성화/삭제 UI 연결
  - `frontend/src/pages/RecommendationScreen.tsx`
    - 예약 관리 전용 화면으로 정리(생성/토글/삭제)
  - `frontend/src/pages/MyPageScreen.tsx`
    - `장보기 예약 관리` 진입 메뉴 추가
  - `frontend/src/pages/HomeScreen.tsx`
    - 홈 예약 카드와 예약 관리 화면 동선 연결
  - `frontend/src/pages/CompletionScreen.tsx`
    - 결제 완료 화면에 주문 플랜 근거 요약 추가
  - 문서:
    - `PLAN.md` v1.8 갱신
    - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.8.md` 신규 작성
- **Decisions**:
  - 추천 엔진 설명 가능성을 위해 “플랜 결정 근거”를 Top3/주문 이력 모두에 남긴다.
  - 반복 장보기는 우선 주문 이력 기반 예약 관리로 범위를 고정한다.
- **Verification**:
  - `cd frontend && npm run build` → production build success
  - `cd backend && pytest -q` → 사용자 요청에 따라 이번 배치 미실행
- **Next Steps**:
  - Phase 5 검증 배치: `pytest -q` 전수 + E2E 수동 리허설(홈→Top3→상세→결제→주문/예약 확인)

---

## [2026-02-19] v1.7 Phase 3 완료 — 대체추천/선호도 결합/챗봇-매처 정합성 강화

- **Status**: Completed
- **Changes**:
  - `backend/src/domain/models/plan.py`
    - `missing_items`, `PlanAlternative` 확장 모델 추가
  - `backend/src/application/services/offline_plan_adapter.py`
    - 미커버 품목에 대한 `MissingPlanItem` 생성
    - 매장 내 대체품 조회(`_find_alternative_for_missing`) 추가
    - 선호/비선호 브랜드 가중치 입력 반영
    - 플랜 배지에 선호도 반영 결과 표시
  - `backend/src/application/services/product_matcher_db.py`
    - `preferred_brands`/`disliked_brands` 기반 매칭 점수 보정
    - `MatchResult`에 `category` 필드 확장
  - `backend/src/api/v1/routers/plans.py`
    - `user_id` 기준 like/dislike 선호도를 읽어 플랜 생성에 주입
    - 설명문에 선호도/미커버 대체추천 요약 추가
    - `alternatives` 응답 실제 채움
  - `backend/src/api/v1/routers/chat.py`
    - DB matcher 기반 엔티티 해석(`matcher_entities`) 추가
    - LangGraph state에 matcher 결과를 주입해 파싱 보강
  - `backend/src/application/graph.py`
    - `matcher_entities` state 반영
    - 파서 실패 시 matcher 결과를 fallback parsing으로 사용
  - `frontend/src/api.ts`
    - `MissingPlanItemResponse`, `PlanAlternativeResponse` 타입 추가
  - `frontend/src/pages/PlanDetailScreen.tsx`
    - `plan.missing_items`가 있으면 해당 데이터를 우선 렌더링
    - 대체상품 가격/규격 표시 추가
- **Decisions**:
  - 하드코딩 alias 파서 단독 의존을 줄이고, DB matcher를 보조 신호로 결합한다.
  - 선호/비선호는 먼저 “점수 가중치 + 설명 반영”으로 적용하고, 강제 필터링은 Phase 4 이후 검토한다.
- **Verification**:
  - 사용자 요청에 따라 테스트는 Phase 4 완료 후 일괄 수행 예정 (이번 배치 미실행)
- **Next Steps**:
  - Phase 4: UI 근거 시각화(거리/ETA/배송비/커버리지), 예약/반복 동선 정리, 마이페이지 이력 연결

---

## [2026-02-19] v1.6 Phase 2 완료 — plans context 하이브리드(프론트 전달 + 백엔드 fallback)

- **Status**: Completed
- **Changes**:
  - `backend/src/api/v1/routers/plans.py`
    - `GeneratePlansRequest(user_context optional)` 추가
    - `PlanListResponse.meta`(`degraded_providers`, `effective_context`, `weather_note`) 추가
    - context 미전달 시 기본값(강남/도보/30분) 자동 적용
  - `backend/src/application/services/offline_plan_adapter.py`
    - context 기반 반경/이동시간 계산, max minutes 필터링
    - place/routing provider 연동 및 degraded 수집
  - `backend/src/infrastructure/providers/mock_providers.py`
    - `MockRoutingProvider` 이동수단별 시간 계산 반영
  - `backend/tests/test_api.py`
    - 기본 context fallback 검증
    - user_context travel_mode 반영(도보/자차) 검증
  - `backend/tests/test_offline_integration.py`
    - 어댑터 반환 타입 변경(CandidateBuildResult) 반영
  - `frontend/src/api.ts`
    - `PlanUserContextRequest`, `PlanGenerationMeta` 타입 추가
    - `PlansAPI.generatePlans(..., userContext)` 시그니처 확장
  - `frontend/src/app/store/AppContext.tsx`
    - `planUserContext` 상태/저장(localStorage) 추가
    - `fetchPlans()` 호출 시 `user_context` 전달
  - `frontend/src/pages/OnboardingScreen.tsx`
    - 위치/이동수단 입력을 context로 저장
    - 현재위치(GPS 시도) + 지역 preset 좌표 매핑 추가
- **Decisions**:
  - 추천 방안 확정: 프론트가 context를 넘기되, 백엔드가 항상 안전한 기본값으로 fallback한다.
  - API 계약은 하위호환을 유지하고 신규 필드는 optional로만 확장한다.
- **Verification**:
  - `cd backend && pytest -q` → `53 passed`
  - `cd frontend && npm run build` → production build success
- **Next Steps**:
  - Phase 3: 미매칭 품목의 대체/후보 추천 강화 + preferences 결합

---

## [2026-02-19] v1.5 Phase 1 완료 — 루트 backend 오프라인 엔진 1차 이식

- **Status**: Completed
- **Changes**:
  - `backend/src/infrastructure/persistence/seed_offline_mock_data.py` 신규
    - 루트 `backend/mock` 데이터 자동 seed 로직 추가
  - `backend/src/application/services/product_matcher_db.py` 신규
    - DB 기반 품목 매칭 엔진 이식
  - `backend/src/application/services/offline_plan_adapter.py` 신규
    - DB 스냅샷 기반 오프라인 플랜 후보 생성기 추가
  - `backend/src/api/v1/routers/plans.py` 재구성
    - DB 어댑터 우선, mock fallback 이중 경로 적용
  - `backend/src/main.py`
    - 앱 기동 시 seed 실행 연결
  - 테스트:
    - `backend/tests/test_offline_integration.py` 신규
- **Decisions**:
  - `ver2` API 계약은 유지하고 내부 생성엔진만 단계 이식한다.
  - 루트 backend 기능은 전면 교체가 아니라 fallback 가능한 어댑터 구조로 반영한다.
- **Verification**:
  - `cd backend && pytest -q` → `51 passed`
  - `cd frontend && npm run build` → production build success
- **Next Steps**:
  - Phase 2: 위치/이동수단 context 입력 확장 + place/routing/weather provider 반영

---

## [2026-02-19] v1.4 Feedback Batch 3 완료 — 문맥 파싱/모드 분기/음성 UX 보완

- **Status**: Completed
- **Changes**:
  - `backend/src/application/graph.py`
    - 문맥 기반 파싱(`_infer_recent_item_from_messages`) 추가
    - 다중 품목 입력 분해(`_split_item_segments`, `_extract_all_item_names`) 추가
    - 단위 파싱 확장(`1kg`, `두부 한 모`, `360ml 2병`)
    - `참이슬`, `비타500` follow-up 응답 보강
  - `backend/src/application/services/canonicalization.py`
    - `참이슬`, `비타500` canonical id 추가
  - `backend/src/infrastructure/providers/mock_providers.py`
    - `참이슬`, `비타500` mock 가격/키워드 매핑 추가
  - `backend/tests/test_graph_parsing.py` 신규
    - 문맥/다중품목/단위/비타500 파싱 단위 테스트 추가
  - `backend/tests/test_api.py`
    - online/offline mode 응답 차이 검증 테스트 추가
  - `frontend/src/app/store/AppContext.tsx`
    - `fetchPlans(modeOverride?)` 시그니처로 mode 전달 안정화
  - `frontend/src/pages/ModeSelectionScreen.tsx`
    - 모드 선택 시 `fetchPlans(mode)` 호출
    - 뒤로가기 경로 `HOME`으로 수정
  - `frontend/src/pages/VoiceInputScreen.tsx`
    - 인식 결과 수동 수정 토글/입력 기능 추가
  - `frontend/src/pages/HomeScreen.tsx`
    - `반복 장보기` 문구를 `장보기 예약`으로 변경하고 CTA 정렬
  - 문서:
    - `PLAN.md` v1.4 갱신
    - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.4.md` 신규 작성
- **Decisions**:
  - 품목 인식은 LLM 단독 의존이 아니라 heuristic(문맥/단위/alias) 병행 전략으로 고정
  - online/offline 차이는 라우팅/랭킹뿐 아니라 설명/메타 정보에서도 명확히 분리
  - 예약 장보기는 실제 기능 범위 전까지 문구/동선을 예약 내역 중심으로 정렬
- **Verification**:
  - `cd backend && pytest -q` → `49 passed`
  - `cd frontend && npm run build` → production build success
- **Next Steps**:
  - 수동 E2E: `삼겹살 -> 문맥 follow-up -> 다중 품목 추가 -> mode 비교 -> 결제/주문내역` 리허설

---

## [2026-02-19] v1.3 Feedback Batch 2 완료 — 챗봇 인식/주문 흐름/프로필 확장

- **Status**: Completed
- **Changes**:
  - `backend/src/application/graph.py`
    - 품목 단독 발화 intent 보정(`general/clarify` -> `modify`)
    - 품목/브랜드/규격/수량 파싱 함수 추가
    - `"삼겹살"` 등 모호 입력에 후속 안내 메시지 강화
  - `backend/tests/test_api.py`
    - 품목 단독 발화 회귀 테스트 추가 (`test_send_item_only_message_returns_item_guidance`)
  - `frontend/src/pages/HomeScreen.tsx`
    - 최근 장바구니 카드 하드코딩 제거
    - `orderHistory` 기반 동적 카드 렌더링/동선 분리
  - `PLAN.md`
    - v1.3 실행계획 및 검증 결과 반영
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.3.md`
    - 상세 실행 계획서 신규 작성
- **Decisions**:
  - 음성 입력 단문 품목 발화는 LLM 분류보다 heuristic 보정을 우선한다.
  - 홈 최근 카드/주문내역은 mock 텍스트 대신 상태 데이터 기반으로 고정한다.
- **Verification**:
  - `cd backend && pytest -q` → `44 passed`
  - `cd frontend && npm run build` → production build success
- **Next Steps**:
  - 수동 E2E 리허설: 음성 입력 `"삼겹살"` -> 장바구니 반영/후속 발화 -> 결제 -> 주문내역 확인

---

## [2026-02-19] v1.2 Phase A 완료 — API 루트 진입성 개선

- **Status**: Completed
- **Changes**:
  - `backend/src/main.py`에 `GET /api/v1`, `GET /api/v1/` 안내 응답 추가
  - `backend/tests/test_api.py`에 API 루트 응답 테스트 추가
- **Decisions**:
  - 사용자 혼선을 줄이기 위해 prefix 루트에서 최소 메타 정보(JSON)를 제공한다
- **Verification**:
  - `pytest -q` 통과(신규 API root 테스트 포함)
- **Next Steps**:
  - v1.2 Phase B 마이페이지/설정 네비게이션 정합성 수정

---

## [2026-02-19] v1.2 Phase B 완료 — 마이페이지/설정 네비게이션 정합성

- **Status**: Completed
- **Changes**:
  - `frontend/src/pages/MyPageScreen.tsx`에 내 정보/결제수단 라우팅 연결
  - 선호/비선호 수량을 하드코딩 제거 후 API 기반 동적 표기
  - `frontend/src/pages/SettingsScreen.tsx` 버전 표기를 `package.json` 기반으로 변경
  - 약관/개인정보 라우팅 추가
  - 신규 화면 추가:
    - `frontend/src/pages/AccountInfoScreen.tsx`
    - `frontend/src/pages/PaymentMethodsScreen.tsx`
    - `frontend/src/pages/TermsScreen.tsx`
    - `frontend/src/pages/PrivacyPolicyScreen.tsx`
    - `frontend/src/pages/LoginScreen.tsx`
  - `frontend/src/app/App.tsx`, `frontend/src/app/store/AppContext.tsx` 스크린 타입/라우팅 확장
- **Decisions**:
  - 정식 인증 서버는 후속으로 두고, 이번 배치는 데모 로그인 게이트 방식으로 정리한다
- **Verification**:
  - 프론트 빌드 통과
- **Next Steps**:
  - v1.2 Phase C 온보딩/채팅/장바구니 상태 동기화

---

## [2026-02-19] v1.2 Phase C 완료 — 온보딩/채팅/장바구니 동기화

- **Status**: Completed
- **Changes**:
  - `frontend/src/pages/OnboardingScreen.tsx` 재구성:
    - 뒤로가기 제거
    - 선호/비선호 브랜드 질문 단계 추가
    - Preferences API 연동 저장
    - 칩 입력 처리 로직 안정화
  - `frontend/src/features/chat/AiChatModal.tsx` 개선:
    - localStorage 기반 대화 히스토리 저장/복원
    - 전송 후 basket refresh 동기화
  - `frontend/src/pages/HomeScreen.tsx`:
    - 마이크 버튼 빈 입력 시 음성입력 화면 이동
    - 최근 장바구니 카드 이동 경로 `CART_VIEW`로 수정
  - `frontend/src/pages/VoiceInputScreen.tsx` placeholder 제거 후 최소 동작 구현
  - `frontend/src/app/store/AppContext.tsx`에 `refreshBasket` 노출
  - `frontend/src/styles/theme.css`에 `brand-*` 토큰 정의
- **Decisions**:
  - 채팅 기반 basket 변경은 optimistic parsing보다 서버 상태 pull(refresh)로 일관성 확보
- **Verification**:
  - 프론트 빌드 통과
- **Next Steps**:
  - v1.2 Phase D 브랜딩/아이콘 통일

---

## [2026-02-19] v1.2 Phase D 완료 — 로고/아이콘 통일

- **Status**: Completed
- **Changes**:
  - `e:/AI/똑장/똑장로고.png`를 `frontend/src/assets/ddokjang-logo.png`로 반영
  - 홈 좌상단 아이콘/온보딩 AI 아바타/채팅 AI 아이콘을 로고로 통일
- **Decisions**:
  - 주요 터치포인트(Home/Onboarding/Chat)에서 동일 브랜딩 자산 사용
- **Verification**:
  - 프론트 빌드 산출물에 로고 에셋 포함 확인
- **Next Steps**:
  - v1.2 Phase E 문서/검증 동기화

---

## [2026-02-19] v1.2 Phase E 완료 — 계획/검증 동기화

- **Status**: Completed
- **Changes**:
  - `PLAN.md`를 피드백 기반 v1.2로 갱신 및 체크리스트 완료 처리
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.2.md` 생성 및 검증 결과 반영
  - `HISTORY.md`에 v1.2 단계별 기록 추가
- **Decisions**:
  - 운영 인수인계를 위해 피드백 번호 기준 트래킹 방식 유지
- **Verification**:
  - `cd backend && pytest -q` → `43 passed`
  - `cd frontend && npm run build` → production build success
- **Next Steps**:
  - 수동 E2E(온보딩 → 채팅 추가 → 장바구니 반영 → 마이페이지 카운트) 리허설

---

## [2026-02-19] Phase A 완료 — 실행 환경 정상화

- **Status**: Completed
- **Changes**:
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19.md` 생성
  - `frontend/package.json` 빌드 스크립트를 Windows/Node 24 환경에서 안정 동작하도록 보정
- **Decisions**:
  - `.env` 키는 교체하지 않고 현재 로컬 값을 유지한다
  - 빌드 게이트는 `npm run build` 성공으로 고정한다
- **Verification**:
  - `cd frontend && npm run build` → production build success
- **Next Steps**:
  - Phase B API 계약 정렬 진행

---

## [2026-02-19] Phase B 완료 — Frontend API 계약 정렬

- **Status**: Completed
- **Changes**:
  - `frontend/src/api.ts` 타입 계약을 백엔드 응답(`BasketResponse`, `PlanListResponse`, `PlanResponse`, `ChatMessageResponse`) 기준으로 정렬
  - `frontend/src/app/store/AppContext.tsx`에서 `basketData.items` 매핑, `selectedPlan` 실 state 연결, `fetchPlans()`를 `top3` 기준으로 수정
- **Decisions**:
  - 백엔드 API 계약을 단일 SoR로 유지하고 프론트 타입을 맞춘다
- **Verification**:
  - 프론트 빌드 시 타입/번들 에러 0건
- **Next Steps**:
  - Phase C 데모 루프 화면 안정화 진행

---

## [2026-02-19] Phase C 완료 — 데모 루프 화면 안정화

- **Status**: Completed
- **Changes**:
  - `frontend/src/pages/ModeSelectionScreen.tsx`: 모드 선택 후 `fetchPlans()` 직접 호출
  - `frontend/src/pages/Top3ResultScreen.tsx`: 실데이터 렌더링 고정, `estimated_total`/소문자 `plan_type` 기준 반영
  - `frontend/src/pages/PlanDetailScreen.tsx`: `selectedPlan` 백엔드 모델 정렬, 누락 품목 파생 계산
  - `frontend/src/pages/HomeScreen.tsx`: 누락 import 및 이미지 컴포넌트 참조 정리
  - `frontend/src/pages/CompletionScreen.tsx`: `estimated_total`, `mart_name` 기준 정렬
- **Decisions**:
  - mock fallback 경로는 데모 신뢰성을 위해 기본 비활성화한다
- **Verification**:
  - 화면 코드 컴파일 성공 (`npm run build`)
- **Next Steps**:
  - Phase D 테스트 정합성 복구 진행

---

## [2026-02-19] Phase D 완료 — 백엔드 테스트 정합성 복구

- **Status**: Completed
- **Changes**:
  - `backend/tests/test_api.py`의 basket 경로를 `/basket/items` 계약으로 정렬
  - `test_integration.sh` 라우터 경로 정합성 확인
- **Decisions**:
  - 백엔드 라우터 계약은 변경하지 않고 테스트를 맞춘다
- **Verification**:
  - `cd backend && pytest -q` → `42 passed`
- **Next Steps**:
  - Phase E 문서/기록 동기화 진행

---

## [2026-02-19] Phase E 완료 — 문서/기록 동기화

- **Status**: Completed
- **Changes**:
  - `backend/README.md` 실행 절차/엔드포인트/의존성 안내 정합성 업데이트
  - `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19.md` 체크리스트 완료 표시 및 검증 결과 반영
  - `HISTORY.md`에 Phase별 이력 기록
- **Decisions**:
  - 운영 인수인계 기준으로 결정사항/검증결과를 문서에 명시적으로 남긴다
- **Verification**:
  - 계획 문서 체크리스트 완료(`x`) 상태 확인
  - `pytest -q`, `npm run build` 재확인 완료
- **Next Steps**:
  - 데모 리허설 시 수동 E2E(`장바구니 → Top3 → 상세 → 결제`) 1회 수행

---

## [2026-02-18] Sprint 1 MVP — 백엔드 구현 완료

- **Status**: Completed
- **Changes**:
  - Phase 0: `config.py` python-dotenv 전환, DB 경로 `/tmp/ddokjang/`, 의존성 추가
  - Phase 1: `ranking_engine.py` TRD 기반 3종 정렬(Cheapest/Nearest/Balanced) + 커버리지 필터 구현
  - Phase 2: `plans.py` 동적 플랜 생성 + TRD 응답 포맷(top3/headline/last_updated)
  - Phase 3: `graph.py` LangGraph modifier 실제 구현, LLM lazy 로딩, 키워드 fallback
  - Phase 4: pytest 30/30 ALL PASS (모델, 표준화, 랭킹, API 통합)
- **Decisions**:
  - pydantic-settings PermissionError → python-dotenv + os.getenv 방식 확정
  - Plan 객체 model_copy()로 mutation 방지 패턴 도입
- **Next Steps**:
  - STT 실제 구현 (Whisper)
  - NaverLocalProvider / KmaWeatherProvider 실제 연동
  - Frontend 연동

---

## [2026-02-18] Architecture v1.0 — 시스템 구조 설계

- **Status**: Completed
- **Change**: `Architecture.md` (v1.0) 작성
- **Detail**:
  - 시스템 개요: React PWA + FastAPI + LangGraph 모놀리식 구조
  - 데이터 흐름: User → API → Agent → Provider → DB
  - 인프라: Docker, SQLite(Dev), Redis(Prod) 계획
  - 보안: API Budget Manager, PII 마스킹 정책 수립

---

## [2026-02-18] UX Page Design v1.1 — 레퍼런스 코드 매핑 통합

- **Status**: Completed
- **Change**: `UX_PAGE_DESIGN.md` (v1.1) 작성
- **Detail**:
  - 기존 디자인 명세(v1.0)에 `reference/frontend/ttokjang_updated` 코드 매핑 추가
  - 각 화면 섹션 하단에 `🛠️ Implementation Reference` 추가 (파일 경로 + 핵심 로직)
  - 개발자가 디자인과 구현체 코드를 한눈에 파악할 수 있도록 문서 통합

---

## [2026-02-18] PRD v1.1 — UX 흐름(User Flow) 수정

- **Status**: Completed
- **Change**: `PRD.md` 섹션 7 'UX 흐름' 전면 수정 (v1.0 → v1.1)
- **Detail**:
  - '확인 및 수정(Verification)' 단계 명시적 추가
  - 온보딩 → 입력 → **검증** → 모드선택 → 결과 → 상세 → 실행 흐름 정립
  - 예약 및 반복 장보기 흐름에도 검증 단계 포함
- **Rationale**: 레퍼런스 프론트엔드(`ttokjang_updated`) 구현과 문서의 정합성 확보

---

## [2026-02-18] UX Page Design — 프론트엔드 레퍼런스 코드 분석 & 기능별 매핑

- **Status**: Completed
- **Changes**:
  - `reference/frontend/ttokjang_updated/` 전체 코드 분석 완료
  - `reference/frontend/ux_page_Design.md` 신규 작성
  - 17개 섹션으로 기능별 레퍼런스 코드 위치 매핑
  - 핵심 코드 조각(AppContext, 화면 전환, 온보딩, 장바구니 CRUD, 채팅 등) 직접 포함
  - 사용자 흐름 Mermaid 다이어그램 포함
- **Decisions**:
  - 문서를 `reference/frontend/` 디렉토리에 배치 (레퍼런스 프론트엔드 관련)
  - 화면별 기능 + 코드 위치 + 핵심 코드 스니펫 3종 세트로 구성
- **Next Steps**:
  - 실제 구현 시 ux_page_Design.md를 참조하여 컴포넌트 구현
  - 백엔드 API 연동 시 mock 데이터를 실제 데이터로 교체

---

## [2026-02-18] TRD v2.0 — 레퍼런스 기반 전면 재작성

- **Status**: Completed
- **Changes**:
  - `reference/backend/reference_guide.md`, `reference_guide2.md` 분석 완료
  - TRD v2.0 전면 재작성 (기존 v1.0 대체)
  - 실제 코드 패턴 반영:
    - `Settings` (pydantic-settings / frozen dataclass)
    - `CacheService` (SQLite TTL 캐시, 캐시 키 정밀도 규칙)
    - `Provider ABC` 인터페이스 (OnlinePrice / OfflinePrice / STT / Place / Weather)
    - `NaverShoppingProvider` Hybrid Search Strategy (Phase1 + Phase2)
    - `MockOfflineProvider` (MVP 오프라인 Mock)
    - `NaverLocalProvider` (좌표 미지원 주의사항 포함)
    - `NaverRoutingProvider` + 직선거리 Fallback
    - `KmaWeatherProvider` (`_to_grid()` 절대 수정 금지)
    - `RankingEngine` (min-max 정규화 + 가중합, 중복 제거)
    - `ChatService` (GPT-4o-mini, diff 파싱, 선호 브랜드 자동 적용)
    - `LangGraph` 상태(`ChatState`) + 그래프 빌더 + parse/clarify 노드
    - DB 스키마 (store_master, product_norm, offline_price_snapshot, 로그 테이블)
    - API 라우터 (basket, chat, plans, preferences, stt, utils/geocode)
    - `lifespan` 패턴 (API 키 유무 자동 Provider 선택)
- **Decisions**:
  - SQLite CacheService를 Dev 환경 기본 캐시로 채택 (Redis 불필요)
  - 네이버 Local API 좌표 미지원 → Haversine 후처리 필수
  - `_to_grid()` LCC DFS 공식 절대 수정 금지 명시
  - 구매 가드레일 `require_approval=True` 코드 레벨 강제
- **Next Steps**:
  - Architecture.md 작성
  - Sprint 1 백엔드 구현 시작

---

## [2026-02-18] PRD v1.0 + UX Page Design v1.0 + TRD v1.0 초안 작성

- **Status**: Completed
- **Changes**: PRD, UX Page Design, TRD 초안 작성
- **Decisions**: 예약 설정 Bottom Sheet를 Plan Detail 화면에 통합
- **Next Steps**: 레퍼런스 기반 TRD 보강 → Architecture.md
