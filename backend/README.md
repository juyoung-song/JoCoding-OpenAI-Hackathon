# TTokJang Offline Backend

FastAPI 기반 오프라인 장보기 플랜 생성 백엔드입니다.

## 1. 기능 요약

- 장바구니 품목 정규화/매칭
- 주변 매장 후보 탐색
- 이동시간/거리 계산 (네이버 Directions + fallback)
- 가격/커버리지 기반 3종 플랜 랭킹 (`lowest`, `nearest`, `balanced`)
- 기상청 단기예보 기반 날씨 안내
- 품목 미매칭 후보 추천 및 대체 추천
- 시연용 UI 제공 (`/demo`)

## 2. 폴더 구조

```text
backend/
├─ src/
│  ├─ api/                      # FastAPI 라우트
│  ├─ application/              # 도메인 서비스(매칭/플랜생성/랭킹)
│  ├─ domain/                   # 타입/프로토콜
│  ├─ infrastructure/
│  │  ├─ persistence/           # DB/캐시
│  │  └─ providers/             # 외부 API provider
│  └─ main.py                   # 앱 엔트리
├─ tests/                       # pytest 테스트
├─ scripts/                     # 데이터 동기화/시딩 스크립트
├─ mock/ui-demo/                # 시연용 프론트
├─ pyproject.toml
└─ .env
```

## 3. 실행 방법

### 3.1 요구사항

- Python 3.11+

### 3.2 설치

```bash
cd backend
python -m pip install -e ".[dev]"
```

### 3.3 환경변수 (`.env`)

아래 값 중 키가 없으면 일부 기능은 자동으로 fallback 동작합니다.

```env
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NCP_CLIENT_ID=
NCP_CLIENT_SECRET=
KMA_SERVICE_KEY=
KAMIS_API_KEY=
KAMIS_CERT_ID=
```

### 3.4 서버 실행

```bash
cd backend
uvicorn src.main:app --reload
```

- API 문서: `http://127.0.0.1:8000/docs`
- 시연 UI: `http://127.0.0.1:8000/demo`

## 4. 주요 API

- `POST /v1/offline/plans/generate`
  - 입력: 사용자 위치/이동수단 + 장바구니
  - 출력: 추천 플랜 목록 + 메타 정보
- `POST /v1/offline/plans/select`
  - 입력: 선택한 플랜 정보
  - 출력: 선택 결과 + 길찾기 URL
- `GET /v1/offline/utils/geocode?query=...`
  - 주소를 좌표로 변환
- `POST /v1/offline/utils/match-candidates`
  - 매칭이 애매한 품목의 후보 반환

## 5. 테스트

```bash
cd backend
pytest -q
```

## 6. 데이터 동기화 (선택)

KAMIS 참가격 데이터 반영:

```bash
cd backend
python scripts/sync_kamis_prices.py
```

## 7. 현재 동작 특성/제약

- 사용자 입력 사이즈와 매칭 후보 사이즈가 크게 다르면 자동 매칭 대신 후보 선택을 유도합니다.
- 외부 API 장애 또는 키 미설정 시 일부 결과는 degraded(부분 fallback) 상태로 반환될 수 있습니다.
- 가격 정보는 스냅샷 기반이며 현장 실판매가와 차이가 날 수 있습니다.
