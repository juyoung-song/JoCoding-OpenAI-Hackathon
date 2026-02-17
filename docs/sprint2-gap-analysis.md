# Sprint 2 Gap Analysis

## 기준 문서
- `backend/HANDOFF.md`
- `backend/melodic-mapping-raccoon.md`
- `PRD.md`

## 섹션별 점검 결과

### 5.1 API 응답 필드 완전성
- 구현 상태: 충족
- 근거:
  - `backend/src/api/routes.py`에서 `generate/select` 응답 모델 고정
  - `backend/tests/test_api_routes.py`에서 200/206/503/404 응답 시나리오 검증
- 비고:
  - 금지 필드(`accuracy_*`, `confidence_*`) 미노출 검사 포함

### 6.6 캐시 TTL/키 패턴 일치
- 구현 상태: 충족
- 근거:
  - `backend/src/infrastructure/persistence/cache_service.py` 구현 완료
  - Routing 키: `route:car:{olat}:{olng}:{dlat}:{dlng}`, TTL 600s 적용
  - Weather 키: `weather:{lat2}:{lng2}:{hour_block}`, TTL 1800s 적용
  - Place 키: `place:{lat3}:{lng3}:{category}:{radius}`, TTL 1800s 적용
- 근거 추가:
  - `backend/src/application/plan_service.py`에서 DB 후보 + Place Provider 결과 병합 적용

### 7.2 랭킹 정책 정확성
- 구현 상태: 충족
- 근거:
  - `backend/src/application/ranking_engine.py` 정책 반영
  - `backend/tests/test_ranking_engine.py`로 lowest/nearest/balanced, coverage, dedup 검증

### 7.4 Graceful Degradation 동작
- 구현 상태: 충족
- 근거:
  - `PlanService`에서 routing/weather 실패 fallback 처리
  - `backend/tests/test_plan_service.py`, `backend/tests/test_api_routes.py`에서 degraded 시나리오 검증

### 10.3 비용 예산 제어
- 구현 상태: 충족
- 근거:
  - `backend/src/infrastructure/providers/provider_budget.py`에서 월간 호출량 집계 + warning/critical 임계치 판단
  - critical 초과 시 `BudgetExceededError`로 외부 API 차단
  - 각 실제 Provider(`naver_place`, `naver_routing`, `kma_weather`)에서 캐시 miss 시 예산 체크 연동
  - `backend/tests/test_provider_budget.py`에서 warning/critical 시나리오 검증

### 12.2 필수 테스트 시나리오
- 구현 상태: 부분 충족
- 근거:
  - 단위/통합 테스트 파일 5종 작성
  - 핵심 경로(정상, provider 장애, 응답 컴플라이언스) 검증 포함
- 갭:
  - TC-04/TC-05와 완전히 1:1 매핑된 명시적 케이스 이름은 추가 여지 있음

### 14.4 컴플라이언스 체크리스트
- 구현 상태: 충족
- 근거:
  - API 응답에서 금지 필드 미포함 테스트 (`test_compliance_no_accuracy_fields`)

## 종합
- Sprint 2 핵심(실제 Place/Routing/Weather 연동, 캐시 계층, 예산 제어, 테스트 기반)은 반영됨.
- 운영 점검 메모:
  - 2026-02-16 E2E 기준 `Naver Directions`는 401 Unauthorized로 routing degrade 발생
  - Place/KMA 호출은 200 응답 확인
- 남은 개선 항목:
  - TC-04/TC-05 명시 테스트 케이스를 기획서 명칭과 1:1로 확장
