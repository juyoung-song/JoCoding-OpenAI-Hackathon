# 똑장ver2 통합 상세 실행 계획서 v1.7 (프롬프트 분리 리팩터링)

작성일: 2026-02-20  
연계 문서: `똑장_클로즈_베타_서비스화_계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.6.md`

## 1. 목적
- 코드 내 하드코딩된 AI 프롬프트를 분리해 프롬프트 고도화 작업의 변경 비용을 낮춘다.
- 프롬프트 템플릿과 런타임 변수 바인딩을 명확히 분리해 유지보수성을 높인다.

## 2. 적용 범위

### In Scope
1. `graph.py` analyzer system prompt의 파일 분리
2. 프롬프트 로더/렌더러 유틸 추가
3. 누락 변수 검증 및 경로 보안 처리
4. 단위/회귀 테스트 반영

### Out of Scope
1. 추천/일반응답 메시지의 전면 템플릿화
2. 프롬프트 버전 관리 UI
3. 외부 프롬프트 저장소 연동

## 3. 구현 내용

### A. 프롬프트 전용 폴더 신설
- `backend/src/application/prompts/`
  - `analyzer.system.txt`: analyzer system prompt 원문 저장
  - `loader.py`: 템플릿 로드/렌더링 로직
  - `__init__.py`: 공개 인터페이스

### B. 코드-프롬프트 의존성 분리
- `backend/src/application/graph.py`
  - 하드코딩 상수 `ANALYZER_PROMPT` 제거
  - `render_prompt("analyzer.system.txt", preferences=..., basket_status=...)` 방식으로 변경

### C. 변수 처리 방식
- 템플릿 변수:
  - `{preferences}`
  - `{basket_status}`
- 렌더링 시 누락 변수는 `PromptTemplateError`로 즉시 실패
- JSON 블록은 `{{` `}}` 이스케이프로 템플릿 안전성 유지

### D. 보안/안정성
- 로더에서 템플릿 파일 경로 traversal 방지
- 파일 없음/잘못된 렌더링은 명시적 예외 처리
- 템플릿 로드는 `lru_cache`로 캐시

## 4. 테스트
- 신규: `backend/tests/test_prompt_loader.py`
  - 템플릿 로드 성공
  - 변수 렌더링 성공
  - 누락 변수 예외 확인
- 회귀:
  - `backend/tests/test_graph_parsing.py`
  - 전체 백엔드 테스트

## 5. 검증 결과
- `cd backend && pytest -q tests/test_prompt_loader.py tests/test_graph_parsing.py` -> `7 passed`
- `cd backend && pytest -q` -> `54 passed`
- 재기동 후 `GET http://localhost:8000/health` -> `200`

## 6. 후속 작업 제안
1. `recommender_node`, `clarifier_node`, `general_node` 응답문도 템플릿 파일로 단계 분리
2. 프롬프트 템플릿에 버전 태그(`v1`, `v2`) 네이밍 규칙 도입
3. 프롬프트 변경 회귀 테스트(스냅샷 테스트) 추가
