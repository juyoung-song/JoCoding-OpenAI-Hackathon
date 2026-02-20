# 똑장 (똑똑한 장보기) 백엔드

## 빠른 시작 (Poetry)

```bash
cd backend
poetry install
poetry run uvicorn src.main:app --reload --port 8000
```

Windows에서 Poetry를 쓰지 않는 경우(대안):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install fastapi "uvicorn[standard]" pydantic-settings aiosqlite openai langgraph langchain-openai langchain-core python-multipart python-dotenv httpx pytest pytest-asyncio ruff
uvicorn src.main:app --reload --port 8000
```

## API 문서

서버 실행 후: http://localhost:8000/docs

## 환경변수

루트의 `.env` 파일 참고. API 키 없으면 Mock Provider 자동 사용.

주요 추가 키:
- `OPENAI_MODEL`: `gpt-5-mini` 단일 모델 사용
- `PUBLIC_CATALOG_SYNC_ON_STARTUP`: 기동 시 KAMIS 카탈로그 자동 동기화 여부
- `PUBLIC_CATALOG_TIMEOUT_SECONDS`: KAMIS 호출 timeout(초)

## PostgreSQL + Alembic (베타 준비)

```bash
cd backend
poetry install
set POSTGRES_DSN=postgresql+psycopg://ddokjang:ddokjang@localhost:5432/ddokjang
poetry run alembic upgrade head
```

SQLite 개발 모드를 유지해도 되며, 운영 전환 시 Alembic으로 PostgreSQL 스키마를 먼저 적용합니다.

## 주요 엔드포인트

| Method | Path | 설명 |
|---|---|---|
| POST | `/api/v1/auth/login` | 로그인 + JWT 발급 |
| POST | `/api/v1/auth/refresh` | Access/Refresh 재발급 |
| POST | `/api/v1/auth/logout` | 세션 종료 |
| GET | `/api/v1/auth/me` | 현재 사용자 조회 |
| GET | `/api/v1/basket` | 장바구니 조회 |
| POST | `/api/v1/basket/items` | 품목 추가 |
| PATCH | `/api/v1/basket/items/{item_name}` | 수량 변경 |
| DELETE | `/api/v1/basket/items/{item_name}` | 품목 삭제 |
| POST | `/api/v1/offline/plans/generate` | 오프라인 Top3 생성 |
| POST | `/api/v1/online/plans/generate` | 온라인 Top3 생성 |
| POST | `/api/v1/offline/plans/select` | 오프라인 실행 선택 |
| POST | `/api/v1/online/plans/select` | 온라인 실행 선택 |
| POST | `/api/v1/payments/intents` | 샌드박스 결제 intent 생성 |
| POST | `/api/v1/payments/intents/{intent_id}/confirm` | 샌드박스 결제 확정 |
| POST | `/api/v1/public-data/catalog/sync` | KAMIS 공공데이터 카탈로그 동기화 |
| GET | `/api/v1/public-data/catalog/items` | 동기화된 공공데이터 카탈로그 조회 |
| GET | `/api/v1/ops/metrics/online-plans` | 온라인 KPI 조회 |
| GET | `/api/v1/ops/gates/online-plan-latency` | 온라인 KPI 게이트 판정 |
| POST | `/api/v1/chat/message` | AI 챗봇 |
| GET | `/api/v1/chat/greeting` | 첫 인사말 |
| POST | `/api/v1/stt/transcribe` | 음성 인식 |
| GET | `/health` | 헬스체크 |

`/api/v1/online/plans/generate` 요청 예시:

```json
{
  "items": [
    { "item_name": "우유", "quantity": 1 },
    { "item_name": "두부", "quantity": 1 }
  ],
  "user_context": {
    "lat": 37.4985,
    "lng": 127.0292,
    "travel_mode": "walk",
    "max_travel_minutes": 30
  }
}
```

`user_context`를 보내지 않으면 백엔드 기본값(강남 좌표/도보/30분)을 사용합니다.  
모든 API(로그인 제외)는 `Authorization: Bearer <access_token>`이 필요합니다.

응답에는 `missing_items`(미커버 품목)과 `alternative`(대체품) 정보가 포함될 수 있습니다.

## 프로젝트 구조

```
backend/
├── src/
│   ├── main.py              # FastAPI 앱 (lifespan)
│   ├── core/config.py       # 환경변수 설정
│   ├── domain/models/       # 도메인 모델
│   ├── application/         # 비즈니스 로직 (RankingEngine 등)
│   │   └── prompts/         # AI 프롬프트 템플릿 + 로더
│   ├── infrastructure/      # DB, 캐시, Provider
│   └── api/v1/routers/      # API 라우터
└── pyproject.toml
```

## 기술 스택

- **FastAPI** + **LangGraph** + **GPT-5-mini**
- **SQLite** (Dev) / **PostgreSQL** (Prod)
- **네이버쇼핑 API** Hybrid Search
- **Whisper** STT (Sprint 2)
