# 똑장ver2 통합 상세 실행 계획서 v1.9 (OpenAI 모델 정책 정렬)

작성일: 2026-02-20  
연계 문서: `똑장ver2 팀원 작업물 통합 계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.8.md`

## 1. 목적
- OpenAI 프로젝트 권한 정책에 맞춰 백엔드 LLM 호출 모델을 `gpt-5-mini` 단일로 고정한다.
- analyzer 프롬프트를 현재 graph 라우팅 규약과 일치하도록 정비한다.

## 2. 적용 범위

### In Scope
1. `OPENAI_MODEL` 기본값 `gpt-5-mini` 반영
2. `OPENAI_FALLBACK_MODELS` 다중 fallback 경로 비활성화
3. analyzer 프롬프트 JSON 스키마 정비
4. 문서/이력 SoR 동기화

### Out of Scope
1. 챗봇 API 외부 응답 계약 변경
2. DB 스키마 및 마이그레이션 변경
3. 프론트 화면/동선 변경

## 3. 구현 항목
- `backend/src/core/config.py`
  - `openai_model` 기본값: `gpt-5-mini`
  - fallback env parsing 제거
- `backend/src/core/llm.py`
  - 모델 iteration을 단일 모델(`OPENAI_MODEL`) 기준으로 고정
- `backend/src/application/prompts/analyzer.system.txt`
  - JSON-only 출력 지시 강화
  - intent/엔터티 이중 호환 규칙 유지
- `backend/README.md`
  - fallback 환경변수 설명 제거
  - 기술스택 모델명 갱신
- `똑장ver2 팀원 작업물 통합 계획.md`, `HISTORY.md`
  - 정책 변경 및 의사결정 반영

## 4. 진행 로그 (Progress Log)
- `config.py` 모델 기본값 변경 및 fallback 파싱 제거 완료
- `llm.py` 단일 모델 호출 경로 반영 완료
- analyzer 프롬프트 템플릿 갱신 완료
- README/계획서/HISTORY 동기화 완료

## 5. 검증
- `cd backend && pytest -q` -> `59 passed`

## 6. 결정 사항
1. 모델 권한 이슈가 해소될 때까지 백엔드는 `gpt-5-mini` 단일 호출 정책을 유지한다.
2. fallback 체인은 재도입 요청이 있을 때만 별도 배치로 복원한다.
