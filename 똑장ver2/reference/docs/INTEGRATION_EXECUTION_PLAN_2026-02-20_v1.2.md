# 똑장ver2 통합 상세 실행 계획서 v1.2 (Remaining 4 Core Tasks Completed)

작성일: 2026-02-20  
연계 문서: `똑장_클로즈_베타_서비스화_계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.1.md`

## 1. 문서 목적
- v1.1 이후 잔여 핵심 작업 4건(PostgreSQL/Alembic, 결제 샌드박스, 성능 하드닝, 운영 게이트/법무 문안) 구현 결과를 기록한다.
- 다른 팀원이 바로 이어서 운영/QA를 진행할 수 있도록 파일 단위 변경과 검증 결과를 남긴다.

## 2. 배치 범위
- 결제 샌드박스 API 및 프론트 결제 실행 흐름 완성
- 온라인 성능/안정성 하드닝(timeout/retry/circuit/cache + KPI 계측)
- PostgreSQL + Alembic 마이그레이션 자산 추가
- 약관/개인정보 정식 문안 및 운영 게이트 자동화 스크립트 반영

## 3. 구현 상세

### A. 결제 샌드박스
- Backend
  - `backend/src/api/v1/routers/payments.py`
    - `POST /payments/intents` (idempotency + guardrail)
    - `GET /payments/intents/{intent_id}`
    - `POST /payments/intents/{intent_id}/confirm`
  - `backend/src/infrastructure/persistence/database.py`
    - `payment_intents` 테이블 유지/활성
  - `backend/src/infrastructure/persistence/user_repository.py`
    - 결제 intent 조회/생성/상태갱신 메서드 연계
  - `backend/src/main.py`
    - payments router 실제 등록
- Frontend
  - `frontend/src/api.ts`
    - `PaymentsAPI` + 결제 타입 추가
  - `frontend/src/pages/PaymentScreen.tsx`
    - 승인 후 `intent -> confirm -> completeCurrentOrder` 연동
    - 기본배송지/선택플랜 사전 검증

### B. 성능/안정성 하드닝
- `backend/src/application/services/online_plan_adapter.py`
  - 품목 검색 병렬화(`asyncio.gather`)
  - 중복 검색 제거
- `backend/src/infrastructure/providers/naver_shopping.py`
  - timeout/retry(backoff)/circuit breaker/TTL cache 적용
  - placeholder key 보호 처리
- `backend/src/core/metrics.py` (신규)
  - online plan KPI 수집기(p50/p95/p99/max, degraded/failure ratio)
- `backend/src/api/v1/routers/ops.py` (신규)
  - KPI 조회: `GET /ops/metrics/online-plans`
  - 게이트 판정: `GET /ops/gates/online-plan-latency`
- `backend/src/api/v1/routers/plans.py`
  - 온라인 generate 요청의 latency/degraded/success 자동 계측

### C. PostgreSQL + Alembic
- 신규 파일
  - `backend/alembic.ini`
  - `backend/alembic/env.py`
  - `backend/alembic/script.py.mako`
  - `backend/alembic/versions/20260220_0001_init_core_schema.py`
  - `backend/src/infrastructure/persistence/schema.py`
- 의존성/설정
  - `backend/pyproject.toml`: `sqlalchemy`, `alembic`, `psycopg[binary]` 추가
  - `.env`, `backend/.env`: `POSTGRES_DSN` 추가
  - `backend/README.md`: alembic 실행 가이드 추가

### D. 법무 문안/운영 게이트
- `frontend/src/pages/TermsScreen.tsx`
- `frontend/src/pages/PrivacyPolicyScreen.tsx`
  - placeholder 제거, 베타 정식 문안 반영
- `scripts/run_beta_gate.ps1` (신규)
  - backend `pytest`, frontend `tsc`, frontend `build` 게이트 자동 실행

## 4. 테스트/검증
- `cd backend && pytest -q` -> `47 passed`
- `cd frontend && npx tsc --noEmit` -> PASS
- `cd frontend && npm run build` -> PASS
- `cd backend && python -m compileall src alembic` -> PASS

## 5. 운영 전 체크포인트
- PostgreSQL 실전환 전 `POSTGRES_DSN` 기준으로 `alembic upgrade head` 수행
- Ops KPI 표본 10건 이상 누적 후 `online-plan-latency` 게이트 판정값 확인
- 베타 앱 테스트 시 결제 흐름은 반드시 `PAYMENT` 화면에서 사전 승인 체크 후 진행

