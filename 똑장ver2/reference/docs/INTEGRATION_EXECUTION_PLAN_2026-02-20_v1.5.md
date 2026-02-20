# 똑장ver2 통합 상세 실행 계획서 v1.5 (LLM 실연동 + 공공데이터 동기화)

작성일: 2026-02-20  
연계 문서: `똑장_클로즈_베타_서비스화_계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.4.md`

## 1. 문서 목적
- 사용자 피드백의 핵심 지적(하드코딩/실연동 미흡)을 반영해, LLM과 공공데이터 연동을 실제 동작 수준으로 보강한 변경을 기록한다.
- 팀원이 동일 기준으로 운영/검증할 수 있도록 API·환경변수·테스트 결과를 남긴다.

## 2. 배치 범위

### In Scope
1. OpenAI 모델 fallback 체인 도입 및 챗봇 analyzer 연동
2. KAMIS 공공데이터 카탈로그 sync/list API 추가
3. 앱 startup 자동 동기화 연결
4. 테스트/문서 동기화

### Out of Scope
1. STT/날씨/경로 provider 실 API 전면 구현
2. 실결제 provider 연동
3. 푸시 알림 인프라

## 3. 구현 상세

### A. LLM 실연동 강화
- `backend/src/core/llm.py` (신규)
  - `is_openai_configured()`로 placeholder 키 차단
  - `ainvoke_with_model_fallback()`로 모델 fallback(`OPENAI_FALLBACK_MODELS`) 순차 시도
  - `ainvoke_json_with_model_fallback()`로 JSON 응답 파싱 통합
- `backend/src/application/graph.py`
  - analyzer에서 기존 단일 모델 호출 제거
  - LLM `entities`를 정규화해 matcher entities와 병합
  - 실패 시 keyword fallback 유지
  - matcher 기반 `remove` 액션 파싱 보강

### B. 공공데이터(KAMIS) 카탈로그 연동
- `backend/src/application/services/public_catalog_sync.py` (신규)
  - 카테고리 병렬 fetch(기본 100~600)
  - 가격/규격 정규화
  - `product_norm`, `offline_price_snapshot` upsert
  - 키 미설정/매장 없음/부분 실패에 대해 `skipped|partial` 상태 반환
- `backend/src/api/v1/routers/public_data.py` (신규)
  - `POST /api/v1/public-data/catalog/sync`
  - `GET /api/v1/public-data/catalog/items`
- `backend/src/main.py`
  - `PUBLIC_CATALOG_SYNC_ON_STARTUP=true`일 때 기동 시 자동 sync 수행
  - `public_data` router 등록

### C. 설정/문서 반영
- `.env`, `backend/.env`
  - `OPENAI_FALLBACK_MODELS`
  - `PUBLIC_CATALOG_SYNC_ON_STARTUP`
  - `PUBLIC_CATALOG_TIMEOUT_SECONDS`
- `backend/README.md`
  - 신규 API/환경변수 설명 추가

## 4. API 사용 예시

### 4.1 공공카탈로그 동기화
`POST /api/v1/public-data/catalog/sync`

```json
{
  "category_codes": ["100", "200"]
}
```

### 4.2 공공카탈로그 조회
`GET /api/v1/public-data/catalog/items?limit=20&offset=0&q=상추`

## 5. 검증 결과
- `cd backend && pytest -q` -> `51 passed`
- `cd frontend && npx tsc --noEmit` -> PASS
- `cd frontend && npm run build` -> PASS

## 6. 운영 메모
1. KAMIS 키가 placeholder면 sync는 실패가 아니라 `skipped`로 응답한다.
2. startup sync가 지연되면 `PUBLIC_CATALOG_SYNC_ON_STARTUP=false`로 비활성화하고 수동 sync API를 사용한다.
3. LLM 키가 없거나 모델 접근 실패 시에도 챗봇은 규칙 기반 경로로 동작한다.
