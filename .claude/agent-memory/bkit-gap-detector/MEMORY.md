# Gap Detector Memory - 똑장 프로젝트

## 프로젝트 구조
- 기획서: `E:\AI\똑장\똑장-오프라인파트-상세기획서.md` (v1.3)
- 백엔드: `E:\AI\똑장\backend\src\` (Python/FastAPI/aiosqlite)
- Mock 데이터: `E:\AI\똑장\backend\mock\` (stores.json, products.json, prices.json)
- 분석 결과: `E:\AI\똑장\docs\03-analysis\backend.analysis.md`

## Sprint 1 분석 결과 (2026-02-16)
- 종합 일치율: 82%
- 주요 갭: 캐시 로직 미구현(40%), Provider 호출 로그 미구현(55%), assumptions 응답 미전달, item_tag 미계산
- 강점: 랭킹 정책 100%, 커버리지 규칙 100%, 컴플라이언스 100%, 도메인 타입 95%

## 아키텍처 패턴
- Clean Architecture 4계층: domain / application / infrastructure / api
- 의존 역전: protocols.py에 Provider 인터페이스 정의
- 주의: application 계층에서 aiosqlite 직접 의존 (plan_service.py, product_matcher.py)
