# 똑장ver2 통합 상세 실행 계획서 v1.3 (Hotfix: Chat Reliability + Reservation Alarm)

작성일: 2026-02-20  
연계 문서: `똑장_클로즈_베타_서비스화_계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.2.md`

## 1. 문서 목적
- 사용자 앱 테스트에서 발견된 즉시 이슈 2건을 핫픽스로 반영한 결과를 공유한다.
- 재현/수정/검증/후속 확장 포인트를 팀 공용 기록으로 남긴다.

## 2. 이슈 요약
1. 챗봇 발화 시 `현재 AI 에이전트에 연결할 수 없어요` 문구가 빈번히 노출됨  
2. 예약 실행은 되지만 예약 시간 도래 알림 UX가 부족함

## 3. 원인 분석

### A. 챗봇 연결 오류 문구
- `OPENAI_API_KEY=__SET_IN_SECRET_MANAGER__` 같은 placeholder가 실제 키처럼 인식되어 LLM 호출 시도
- 또는 실제 키가 있어도 모델 권한 이슈(403) 발생 시 chat router에서 고정 fallback 문구를 바로 반환

### B. 예약 알림 부족
- 백엔드는 `last_run_at` 갱신까지 수행하지만 프론트에서 이를 주기적으로 확인/알림하지 않음

## 4. 구현 내용

### A. Backend
- `backend/src/application/graph.py`
  - placeholder 키 차단: `__SET_IN_SECRET_MANAGER__`면 LLM 미사용
- `backend/src/api/v1/routers/chat.py`
  - LangGraph 실패 시 규칙 기반 fallback(`modify/recommend/clarify/general`) 실행
  - fallback에서도 장바구니 변경/응답 생성 유지
- `backend/tests/test_api.py`
  - 챗봇 fallback 회귀 테스트 추가

### B. Frontend
- `frontend/src/app/store/AppContext.tsx`
  - 예약 목록 30초 폴링 추가
  - `last_run_at`가 갱신되면 인앱 toast 알림
  - 중복 알림 방지 marker를 localStorage(`ddokjang.reservation.alerts.v1`)로 관리
  - 예약 엔트리에 상태/실행 메타 필드(`status`, `nextRunAt`, `lastRunAt`, `lastResultStatus`, `retryCount`) 확장

## 5. 검증 결과
- `cd backend && pytest -q` -> `48 passed`
- `cd frontend && npx tsc --noEmit` -> PASS
- `cd frontend && npm run build` -> PASS

## 6. 운영 메모
- 본 알림은 인앱 알림(앱 활성 상태) 기준이다.
- 앱 비활성/백그라운드/종료 상태 알림은 Web Push 또는 모바일 push 채널 연동 배치에서 확장한다.

