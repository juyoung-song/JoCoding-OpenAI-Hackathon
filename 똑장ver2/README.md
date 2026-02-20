# 똑장 ver2 (Closed Beta)

똑장은 장바구니 품목을 기반으로 **온라인/오프라인 장보기 Top3 플랜**을 비교 추천하고,  
챗봇/예약/결제(샌드박스)까지 연결하는 통합 베타 서비스입니다.

## 1) 현재 범위

- 이메일 기반 베타 로그인 + JWT 세션
- 장바구니 CRUD
- 온라인/오프라인 플랜 생성 및 선택
- AI 챗봇 기반 장바구니 수정/추천
- 장보기 예약(반복/일회성) 관리
- 결제 Intent 생성/확정(샌드박스)
- 공공데이터(KAMIS) 카탈로그 동기화
- 운영 지표/게이트 확인 API

## 2) 기술 스택

- Frontend: React 18, TypeScript, Vite 6, Tailwind CSS v4
- Backend: Python 3.11, FastAPI, LangGraph, OpenAI SDK, aiosqlite
- Infra: Docker Compose, Nginx
- DB/Cache: SQLite (`main.db`, `cache.db`)

## 3) 디렉터리 구조

```text
똑장ver2/
├─ frontend/                 # React 앱
├─ backend/                  # FastAPI 앱
├─ api/Dockerfile            # API 컨테이너 빌드
├─ web/Dockerfile            # Web(Nginx + frontend dist) 컨테이너 빌드
├─ web/nginx.conf            # /api 프록시 설정
├─ scripts/run_beta_gate.ps1 # 베타 게이트(테스트/빌드) 스크립트
├─ docker-compose.yml
├─ .env.example
├─ .env                      # 런타임 환경변수 SoR (단일 소스)
└─ HISTORY.md
```

## 4) 사전 준비

- Docker Desktop + Docker Compose (권장 실행 방식)
- 또는 로컬 개발 시:
  - Node.js 20+
  - Python 3.11+
  - Poetry 1.8+

## 5) 환경변수

### 핵심 원칙

- 런타임 환경변수는 **루트 `.env`가 단일 SoR**입니다.
- `backend/.env`는 참고/백업 성격이며 런타임 SoR로 사용하지 않습니다.

### 시작 방법

```powershell
cd .\똑장ver2
Copy-Item .env.example .env
```

### 주요 변수

- 기본 런타임
  - `API_HOST_PORT` (기본 8000)
  - `WEB_PORT` (기본 3000)
  - `API_PREFIX` (`/api/v1` 권장, 프론트 기본값과 일치 필요)
- LLM
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL` (기본 `gpt-5-mini`)
- 외부 연동(선택)
  - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` (쇼핑/로컬)
  - `NCP_CLIENT_ID`, `NCP_CLIENT_SECRET` (경로/이동시간)
  - `KMA_SERVICE_KEY` 또는 `WEATHER_API_KEY` (날씨)
  - `KAMIS_CERT_KEY`/`KAMIS_API_KEY`, `KAMIS_CERT_ID` (공공데이터)

참고: 일부 키가 없어도 서버는 fallback(mock/degraded) 경로로 동작합니다.

## 6) 실행 방법

### A. Docker Compose (권장)

```powershell
cd .\똑장ver2
docker compose up --build
```

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### B. 로컬 개발 실행

1. 백엔드 실행

```powershell
cd .\똑장ver2\backend
poetry install
poetry run uvicorn src.main:app --reload --port 8000
```

2. 프론트 실행

```powershell
cd .\똑장ver2\frontend
npm ci
npm run dev
```

- Frontend dev: `http://localhost:5173`
- Frontend는 `/api`를 `http://localhost:8000`으로 프록시합니다.

## 7) 로그인/사용 흐름

- 앱 접속 후 이메일로 로그인합니다. (베타 버전: 비밀번호 없음)
- 로그인 후 장바구니를 채우고, 온라인/오프라인 플랜 비교를 실행합니다.
- 대부분 API는 `Authorization: Bearer <access_token>`이 필요합니다.
  - 예외: `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/health`

## 8) 테스트/검증

### 백엔드 테스트

```powershell
cd .\똑장ver2\backend
poetry run pytest -q
```

### 프론트 검증

```powershell
cd .\똑장ver2\frontend
npx tsc --noEmit
npm run build
```

### 통합 베타 게이트 (Windows)

```powershell
cd .\똑장ver2
powershell -ExecutionPolicy Bypass -File .\scripts\run_beta_gate.ps1
```

옵션:
- `-SkipBackend`
- `-SkipFrontend`

## 9) 주요 API 그룹

- 인증: `/api/v1/auth/*`
- 장바구니: `/api/v1/basket*`
- 플랜:
  - `POST /api/v1/offline/plans/generate`
  - `POST /api/v1/online/plans/generate`
  - `POST /api/v1/plans/generate` (호환 경로)
  - `POST /api/v1/offline/plans/select`
  - `POST /api/v1/online/plans/select`
- 챗봇: `/api/v1/chat/*`
- 선호도: `/api/v1/preferences/*`
- 예약: `/api/v1/reservations*`
- 결제(샌드박스): `/api/v1/payments/*`
- 사용자 데이터: `/api/v1/users/me/*`
- 공공데이터: `/api/v1/public-data/*`
- 운영지표: `/api/v1/ops/*`

## 10) 참고

- 변경 이력: `HISTORY.md`
- 통합 계획: `PLAN.md`
- 백엔드 상세: `backend/README.md`
