# 똑장 (TTokJang)

오프라인 장보기 계획을 자동으로 생성하는 프로젝트입니다.  
현재 저장소는 백엔드 중심으로 구현되어 있으며, 시연용 UI(`backend/mock/ui-demo`)를 포함합니다.

## 프로젝트 구성

```text
.
├─ backend/                                  # FastAPI 백엔드 + 시연 UI + 테스트
├─ docs/                                     # 분석/문서 산출물
├─ stitch_remix_of_smart_basket_input/       # 초기 화면 시안/참고 리소스
├─ PRD.md                                    # 제품 요구사항
├─ 똑장-오프라인파트-상세기획서.md
└─ 중간보고서.md
```

## 현재 구현 범위

- 오프라인 플랜 생성 API (`/v1/offline/plans/generate`)
- 플랜 선택 API (`/v1/offline/plans/select`)
- 주소→좌표 변환 유틸 (`/v1/offline/utils/geocode`)
- 품목 매칭 후보 유틸 (`/v1/offline/utils/match-candidates`)
- 네이버/기상청 연동 + fallback 동작
- SQLite 기반 데이터 저장/캐시
- 시연 UI (`/demo`)

## 빠른 시작

백엔드 실행 방법은 `backend/README.md`를 참고하세요.

## 문서

- 요구사항: `PRD.md`
- 진행 보고: `중간보고서.md`
- Sprint 인수인계: `backend/HANDOFF.md`

## 주의사항

- `backend/.env`, `backend/app.db` 등 로컬 실행 파일에는 민감정보/로컬 데이터가 있을 수 있습니다.
- GitHub 공개 저장소 업로드 전 `.env`와 DB 파일 커밋 여부를 반드시 확인하세요.
