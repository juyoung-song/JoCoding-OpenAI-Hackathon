# 똑장ver2 통합 상세 실행 계획서 v1.5 (Offline Engine Migration)

작성일: 2026-02-19  
연계 문서: `PLAN.md`, `HISTORY.md`, `README.md`, `backend/README.md`

## 1. 배경
- 사용자 요청: `E:\AI\똑장\backend`의 오프라인 기능을 `ver2`에 단계적으로 이식
- 제약: 프론트/백 API 계약은 `ver2` 기준 유지

## 2. 마이그레이션 원칙
1. **계약 안정성 우선**: `ver2` 엔드포인트/응답 스키마 유지
2. **품질 역이식**: 오프라인 매칭/데이터/랭킹 품질은 루트 `backend` 기준 반영
3. **점진적 적용**: 실패 시 fallback 가능한 구조 유지

## 3. Phase 1 구현 (완료)

## A. 데이터 계층 이식
- 파일: `backend/src/infrastructure/persistence/seed_offline_mock_data.py`
- 내용:
1. 루트 `backend/mock` 자동 탐색
2. `store_master`, `product_norm`, `offline_price_snapshot` 초기 seed
3. 이미 데이터 존재 시 seed skip

## B. 품목 매칭 계층 이식
- 파일: `backend/src/application/services/product_matcher_db.py`
- 내용:
1. 검색/유사도/alias 기반 `product_norm_key` 매칭
2. 브랜드/사이즈 보정 점수 반영

## C. 플랜 후보 생성 계층 이식
- 파일: `backend/src/application/services/offline_plan_adapter.py`
- 내용:
1. BasketItem -> matched product 변환
2. DB 스냅샷 기반 매장별 가격 집계
3. 거리/이동시간 추정(오프라인) + 배송 ETA/배송비(온라인) 분기
4. `Plan` 모델(ver2 응답 타입)로 변환

## D. API 어댑터 적용
- 파일: `backend/src/api/v1/routers/plans.py`
- 내용:
1. `/api/v1/plans/generate` 내부를 DB 어댑터 우선으로 변경
2. 실패/무결과 시 기존 `MockOfflineProvider` fallback
3. 기존 응답 계약(`PlanListResponse`) 유지

## E. 앱 부트스트랩 반영
- 파일: `backend/src/main.py`
- 내용:
1. lifespan에서 `seed_offline_mock_data(db)` 실행

## F. 검증 테스트 추가
- 파일:
  - `backend/tests/test_offline_integration.py` (신규)
  - 기존 테스트 전체 재실행
- 내용:
1. 매칭 엔진 동작 확인
2. DB 어댑터 후보 생성 확인

## 4. Phase 2 계획 (다음 단계)
1. 사용자 위치/이동수단 context를 API 입력으로 확장(하위호환)
2. place/routing/weather provider 결과를 후보 생성에 반영
3. degraded 메타를 응답에 노출

## 5. Phase 3 계획
1. 대체품/미매칭 후보 추천 로직 이식
2. preferences(선호/비선호 브랜드)와 매칭 엔진 결합
3. chat parsing과 matcher를 직접 연결

## 6. 검증 결과 (Phase 1)
- `cd backend && pytest -q` -> `51 passed`
- `cd frontend && npm run build` -> `vite v6.3.5 build success`

