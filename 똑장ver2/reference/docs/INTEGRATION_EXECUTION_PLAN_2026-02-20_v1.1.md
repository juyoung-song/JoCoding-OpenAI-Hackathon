# 똑장ver2 통합 상세 실행 계획서 v1.1 (Auth+SoR+API Contract Batch Completed)

작성일: 2026-02-20  
연계 문서: `똑장_클로즈_베타_서비스화_계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.0.md`

## 1. 문서 목적
- 본 문서는 클로즈드 베타 서비스화 계획의 첫 구현 배치(v1.1) 결과를 기록한다.
- 다른 팀원이 파일 단위 변경점/검증 결과/잔여 과제를 즉시 확인할 수 있도록 작성한다.

## 2. 배치 범위
- JWT 인증 + 서버 세션 저장
- 사용자 데이터 SoR(DB) 전환
- 플랜 API 계약 정렬(online/offline generate+select)
- 예약 필드 확장 + 1분 poll 실행 엔진
- 프론트 인증 연동 + 민감정보 localStorage 제거 + 온라인 실행 CTA 연결

## 3. 실행 결과 요약

### A. Backend
- 신규 파일
  - `backend/src/core/security.py`
    - JWT(HMAC SHA256) 생성/검증, 토큰 해시 유틸
  - `backend/src/core/logging_mask.py`
    - 토큰/키/전화번호 마스킹 필터
  - `backend/src/infrastructure/persistence/user_repository.py`
    - users/sessions/basket/preferences/profile/orders/reservations/plan_requests SoR repository
  - `backend/src/api/v1/dependencies.py`
    - `require_auth` 의존성(Bearer JWT 검증)
  - `backend/src/api/v1/routers/auth.py`
    - `POST /auth/login|refresh|logout`, `GET /auth/me`
  - `backend/src/api/v1/routers/user_data.py`
    - `GET|PUT /users/me/profile`, `GET|POST /users/me/orders`
- 수정 파일
  - `backend/src/infrastructure/persistence/database.py`
    - 사용자/세션/예약/주문/플랜요청 테이블 확장
  - `backend/src/main.py`
    - auth/user_data router 등록
    - 예약 스케줄러 백그라운드 루프(1분 poll)
    - 로그 마스킹 필터 설치
  - `backend/src/api/v1/routers/basket.py`
    - `user_id` 쿼리 제거, JWT 사용자 컨텍스트 기반 처리
    - DB SoR 동기화
  - `backend/src/api/v1/routers/preferences.py`
    - JWT 사용자 컨텍스트 기반 처리 + DB SoR 동기화
  - `backend/src/api/v1/routers/reservations.py`
    - 확장 필드(`schedule_type/next_run_at/timezone/channel/last_run_at/last_result_status/retry_count/status`) 반영
  - `backend/src/api/v1/routers/chat.py`
    - JWT 사용자 컨텍스트 기반 처리
    - 사용자별 히스토리 분리 + 장바구니 DB 동기화
  - `backend/src/api/v1/routers/plans.py`
    - `POST /offline/plans/generate|select`
    - `POST /online/plans/generate|select`
    - `POST /plans/generate` 호환 유지
    - `206` degraded 상태코드 반영
    - `INVALID_REDIRECT_URL` 400 강제
- 테스트
  - `backend/tests/test_api.py`를 JWT/계약 기준으로 재작성

### B. Frontend
- 수정 파일
  - `frontend/src/api.ts`
    - Bearer 토큰 공통 request + refresh 재시도
    - `AuthAPI`, `UserDataAPI`, `PlansAPI.select*` 추가
    - reservations/plans/meta 타입 계약 확장
  - `frontend/src/app/store/AppContext.tsx`
    - 서버 SoR 연동(profile/orders/reservations/basket)
    - 민감정보 localStorage 저장 제거(known price 캐시만 유지)
    - 세션 부재 시 `LOGIN` 화면 전환
  - `frontend/src/pages/LoginScreen.tsx`
    - 실제 `AuthAPI.login()` 연동
    - 베타 준비중 안내 문구 반영
  - `frontend/src/pages/MyPageScreen.tsx`
    - `AuthAPI.logout()` 연동
  - `frontend/src/pages/PlanDetailScreen.tsx`
    - 온라인 실행 CTA 추가(online select API + fallback 링크)
  - `frontend/src/pages/PaymentMethodsScreen.tsx`
  - `frontend/src/pages/TermsScreen.tsx`
  - `frontend/src/pages/PrivacyPolicyScreen.tsx`
  - `frontend/src/pages/PaymentScreen.tsx`
    - 데모 문구 -> 베타 준비중/샌드박스 문구로 정렬

### C. 보안/운영
- `.env`, `backend/.env`를 샘플 템플릿 형태로 교체(평문 키 제거)
- JWT/화이트리스트/스케줄러 환경변수 키 문서화

## 4. 검증 결과
- `cd backend && pytest -q` -> `44 passed`
- `cd frontend && npx tsc --noEmit` -> PASS
- `cd frontend && npm run build` -> PASS (`vite build success`)

## 5. 변경된 가정/주의사항
- 본 배치에서는 PostgreSQL/Alembic 대신 SQLite 기반 영속화 전환을 선적용했다.
- 결제는 샌드박스 UX 문구/흐름 정렬까지만 반영했으며, 실제 결제 provider 연동은 후속 배치다.

## 6. 다음 배치 권장 순서
1. PostgreSQL + Alembic 마이그레이션
2. 결제 샌드박스 서버 연동(intent/confirm/idempotency)
3. 성능 하드닝(online p99 <= 5s)
4. 베타 운영 대시보드/알람/런북