# 똑장ver2 통합 상세 실행 계획서 v1.6 (.env 복구 및 운영 로그 보강)

작성일: 2026-02-20  
연계 문서: `똑장_클로즈_베타_서비스화_계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.5.md`

## 1. 목적
- 사용자가 보유한 `.env_backup`를 기준으로 실키를 복구하고 실행 상태를 정상화한다.
- 실키 복구 이후 외부 API 호출 로그의 민감정보 노출 위험을 즉시 차단한다.

## 2. 실행 항목

### A. .env 복구
1. `.env_backup` 존재 확인
2. `.env`, `backend/.env` 현재 파일 스냅샷 생성 (`*.before_restore_YYYYMMDD_HHMMSS`)
3. 템플릿 파일 구조는 유지하고, 키/값은 `.env_backup` 값으로 병합 복원
4. `KAMIS_CERT_KEY`는 백업의 `KAMIS_API_KEY` 값으로 동기화

### B. 런타임 재기동
1. 기존 8000/5173 포트 프로세스 종료
2. 백엔드 재기동: `python -m uvicorn src.main:app --host 0.0.0.0 --port 8000`
3. 프론트 재기동: `npm run dev -- --host 0.0.0.0 --port 5173`
4. 헬스체크 확인

### C. 로그 보안 보강
1. `backend/src/core/logging_mask.py`
   - 쿼리/JSON의 민감 키(`p_cert_key`, `p_cert_id`, `api_key`, `client_secret`, `access_token`) 마스킹 추가
2. `backend/src/main.py`
   - `httpx`, `httpcore` 로그 레벨을 `WARNING`으로 조정
3. 기존 로그 파일 초기화 후 백엔드 재기동

## 3. 검증 결과
- `.env_backup` 발견: `똑장ver2/.env_backup`
- 복구 후 키 상태:
  - `.env`: OpenAI/Naver/KAMIS/Langfuse 키 `set` 확인
  - `backend/.env`: OpenAI/Naver/KAMIS/Langfuse 키 `set` 확인
- 실행 상태:
  - `GET http://localhost:8000/health` -> `200`
  - `GET http://localhost:5173` -> `200`
- 보안 상태:
  - 백엔드 시작 로그에서 외부 API 쿼리 민감값 노출 없음

## 4. 운영 메모
1. `JWT_SECRET`은 백업 기준 값이 없으면 placeholder 상태가 유지될 수 있으므로 필요 시 별도 설정한다.
2. 추후 배포에서는 `.env_backup` 대신 시크릿 매니저를 단일 SoR로 사용한다.
