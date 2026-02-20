# 똑장ver2 통합 상세 실행 계획서 v1.3 (Feedback Batch 2)

작성일: 2026-02-19  
연계 문서: `PLAN.md`, `HISTORY.md`, `최종 종합 기획서.md`, `똑장-해커톤-제출용.md`

## 1. 요약
- 목표: 피드백 16건 기준으로 데모 안정성/신뢰도를 높인다.
- 핵심 개선축:
1. 챗봇 품목 인식 정확도(특히 음성 입력의 단문 품목 발화)
2. 홈/장바구니/결제/주문내역 상태 일관성
3. 마이페이지 프로필/배송지 실사용 흐름
4. 오프라인 모드 차별성(거리/시간 기준 안내)

## 2. 사실 기반 문제 정의
| 구분 | 관측 문제 | 원인 요약 | 영향 |
|---|---|---|---|
| 챗봇 | `"삼겹살"` 발화 시 일반 clarify 응답 | intent 분류가 동작어 중심 | 음성 UX 저하 |
| 파서 | 품목/브랜드/규격 파싱 단순 | 하드코딩 품목 목록 위주 | 오인식/미인식 |
| 홈 카드 | 지난주/매주 카드 하드코딩 | 실 주문 데이터 미사용 | 클릭 동작 신뢰 저하 |
| 주문내역 | 결제 완료 후 이력 미반영 | 결제 이벤트 저장 경로 부재 | 핵심 루프 단절 |
| 프로필 | 배송지/전화번호 관리 부재 | 모델/화면 미확장 | 결제/내정보 연동 약함 |
| 장바구니 | `11개` 등 단위 표기 오류 | size와 unit 혼합 처리 | 사용자 혼란 |
| 모드 차별 | 온/오프라인 안내 유사 | mode 기반 랭킹/표시 약함 | 가치 전달 약화 |

## 3. 범위
### In Scope
1. 챗봇 modifier 파싱 고도화 + 회귀 테스트
2. 홈 최근 카드 동적화 + 라우팅 정리
3. 결제 완료 -> 주문내역 반영 루프 고정
4. 프로필(이름/전화) + 배송지 다건 관리
5. 문서 동기화(`PLAN.md`, `HISTORY.md`, v1.3 실행계획서)

### Out of Scope
1. 정식 인증/계정 시스템 구축
2. 외부 Provider 완전 실연동(Naver/KMA/DB 고도화)
3. 법무 확정 약관 원문 작성

## 4. 구현 상세

## Phase A — 챗봇 인식 보강
### A-1. `backend/src/application/graph.py`
- 작업:
1. 품목 단독 발화 시 `general/clarify`를 `modify`로 heuristic 보정
2. `ADD/REMOVE/RECOMMEND` 키워드 분리
3. 수량/규격/브랜드 추출 함수 추가:
   - `_extract_item_name`
   - `_extract_brand`
   - `_extract_size`
4. 모호 발화에 대한 품목별 후속 응답 추가:
   - `"삼겹살"` -> 브랜드/용량 예시 안내
5. 동일 품목 병합 조건 강화(품목+브랜드+규격)
- 완료 기준:
1. `"삼겹살"` 발화가 일반 clarify 문구로 떨어지지 않음
2. 브랜드/규격 포함 발화가 basket 상태에 반영 가능

### A-2. `backend/tests/test_api.py`
- 작업:
1. `test_send_item_only_message_returns_item_guidance` 추가
- 완료 기준:
1. 품목 단독 발화 회귀 방지

## Phase B — 홈/주문 데이터 일관화
### B-1. `frontend/src/pages/HomeScreen.tsx`
- 작업:
1. 하드코딩 카드 제거
2. `orderHistory` 기반 최근 카드 최대 2개 렌더링
3. 카드 라벨을 날짜 기반 동적 텍스트로 변경
4. 비어있을 때 fallback 카드 제공
5. 반복 장보기 안내 카드 분리
- 완료 기준:
1. 동일 텍스트/동일 동작 카드 중복 제거
2. `전체보기`/카드 클릭 동선이 유효

### B-2. 주문 반영 루프
- 대상:
  - `frontend/src/app/store/AppContext.tsx`
  - `frontend/src/pages/PaymentScreen.tsx`
  - `frontend/src/pages/HistoryScreen.tsx`
- 작업:
1. `completeCurrentOrder()`에서 주문 생성 + 저장 + basket clear
2. `HistoryScreen`을 mock 대신 상태 기반 렌더링
- 완료 기준:
1. 결제 직후 주문내역 즉시 표시

## Phase C — 마이페이지 확장
### C-1. 프로필/배송지
- 대상:
  - `frontend/src/pages/AccountInfoScreen.tsx`
  - `frontend/src/pages/AddressBookScreen.tsx`
  - `frontend/src/app/store/AppContext.tsx`
- 작업:
1. 이름/전화번호 편집 저장
2. 배송지 다건 추가/수정/삭제/기본 설정
3. localStorage 영속화
- 완료 기준:
1. 결제화면 기본 배송지 사용 가능

### C-2. 마이페이지 가시성
- 대상:
  - `frontend/src/pages/MyPageScreen.tsx`
- 작업:
1. 주문내역 카운트 동적화
2. 선호/비선호 카운트 API 연동 유지
3. 구독 배너(`똑장 프라임+`) 추가
- 완료 기준:
1. 하드코딩 카운트/배너 공백 제거

## Phase D — 검증 및 기록
### D-1. 검증 커맨드
1. `cd backend && pytest -q`
2. `cd frontend && npm run build`

### D-2. 기록
1. `HISTORY.md`에 배치 기록 추가
2. `PLAN.md` v1.3 체크리스트 갱신

## 5. API/타입 정렬 요약
1. `PlansAPI.generatePlans(items, mode)`로 mode(`online/offline`) 전달
2. `PlanResponse`에 `distance_km`, `travel_minutes` 사용
3. `Basket` 아이템은 `brand/size/mode` 보존

## 6. 완료 정의 (DoD)
1. `"삼겹살"` 발화 시 품목 인지 기반 응답 제공
2. 결제 완료 후 주문내역 반영 성공
3. 홈 최근 카드가 실데이터 기반으로 표기/동작
4. `pytest -q`, `npm run build` 성공
5. `PLAN.md` + `HISTORY.md` + 본 문서 동기화 완료

## 7. 리스크 및 대응
| 리스크 | 대응 |
|---|---|
| LLM 응답 편차로 intent 분류 흔들림 | heuristic override로 품목 단독 발화 강제 보정 |
| Mock 가격/이미지의 현실감 부족 | 이번 배치는 일관성 우선, 실 이미지/실가격은 후속 |
| 주문내역 로컬 저장 한계 | 해커톤 범위 내 localStorage 고정, 서버 저장은 후속 |

## 8. 검증 결과 (2026-02-19)
- `cd backend && pytest -q` → `44 passed`
- `cd frontend && npm run build` → `vite v6.3.5 build success`
