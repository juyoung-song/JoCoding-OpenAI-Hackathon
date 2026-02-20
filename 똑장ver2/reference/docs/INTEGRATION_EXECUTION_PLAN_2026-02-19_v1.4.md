# 똑장ver2 통합 상세 실행 계획서 v1.4 (Feedback Batch 3)

작성일: 2026-02-19  
연계 문서: `PLAN.md`, `HISTORY.md`, `최종 종합 기획서.md`, `똑장-해커톤-제출용.md`

## 1. 요약
- 목표: 피드백 9건(챗봇 문맥/모드 분기/음성 UX)을 반영해 데모 완성도를 높인다.
- 핵심 축:
1. 챗봇 품목 파싱 안정화(문맥, 단위, 다중 품목)
2. 온라인/오프라인 모드의 실제 결과 차별화
3. 홈/음성 UI 동선 정합성 보완
4. 계획/이력 문서 동기화

## 2. 사실 기반 이슈 정리
| 구분 | 관측 문제 | 원인 요약 | 영향 |
|---|---|---|---|
| 챗봇 문맥 | `"원산지는 ... 1kg 추가"`를 `원산지는` 품목으로 처리 | fallback 토큰을 품목으로 오인식 | 장바구니 오염 |
| 단위 파싱 | `"두부 한 모"` 인식 실패 | 한국어 수량어+단위 규칙 부족 | 입력 신뢰 저하 |
| 품목 어휘 | `참이슬`, `비타500` 인식/응답 약함 | alias/canonical/mock 매핑 부재 | 검색/응답 품질 저하 |
| 다중 입력 | 여러 품목 입력 시 첫 품목만 반영 | 단일 품목 파싱 구조 | 누락 발생 |
| 모드 분기 | 온라인/오프라인 체감 동일 | 모드 상태 전달 지연 + mode별 메타 약함 | 기능 가치 불명확 |
| UX | 가격 비교 뒤로가기가 음성입력으로 이동 | 잘못된 라우팅 목적지 | 흐름 혼란 |
| UX | 음성 결과 수동 수정 불가 | 편집 UI 미제공 | 재시도 비용 증가 |
| UX 문구 | 반복장보기 문구/링크 불일치 | 기능 명세 대비 라벨 부정합 | 사용자 혼란 |

## 3. 범위
### In Scope
1. `graph.py` 파서 고도화
2. mode 전달/표시 정합성 수정
3. 홈/음성 화면 UX 수정
4. 테스트 추가 및 문서 기록

### Out of Scope
1. 공공데이터 API 실연동(상품 카탈로그/가격)
2. 정식 로그인/서버 주문 영속 저장
3. 완전한 예약 장보기 기능 구현

## 4. 구현 상세

## Phase A — 챗봇 파싱 보강
### A-1. `backend/src/application/graph.py`
- 작업:
1. `_parse_modify_intent(text, messages)`로 확장
2. `_infer_recent_item_from_messages()` 추가해 문맥 추론
3. `_extract_quantity`, `_extract_size` 개선:
   - `1kg`, `360ml`, `한 모` 등 대응
4. `_split_item_segments`, `_extract_all_item_names`로 다중 품목 처리
5. `참이슬`, `비타500` follow-up 가이드 개선

### A-2. 품목 매핑 보강
- 파일:
  - `backend/src/application/services/canonicalization.py`
  - `backend/src/infrastructure/providers/mock_providers.py`
- 작업:
1. `참이슬`, `비타500` canonical id 추가
2. mock 가격 데이터/키워드 매핑 추가

## Phase B — 모드 분기 정합성
### B-1. `frontend/src/app/store/AppContext.tsx`
- 작업:
1. `fetchPlans(modeOverride?)` 시그니처로 변경
2. `selectedMode` 비동기 업데이트 지연으로 생기는 stale mode 제거

### B-2. `frontend/src/pages/ModeSelectionScreen.tsx`
- 작업:
1. `setSelectedMode(mode)` 후 `fetchPlans(mode)` 호출
2. 뒤로가기 목적지를 `HOME`으로 변경

### B-3. `backend/src/api/v1/routers/plans.py`
- 작업:
1. mode별 메타데이터 분기:
   - online: 배송 ETA/배송비 중심
   - offline: 거리/도보시간 중심
2. 설명 텍스트 mode별 분리

## Phase C — UX 보정
### C-1. `frontend/src/pages/VoiceInputScreen.tsx`
- 작업:
1. 인식 결과 영역에 `수동으로 수정` 토글 추가
2. textarea 직접 수정 후 전송 가능하게 구현

### C-2. `frontend/src/pages/HomeScreen.tsx`
- 작업:
1. `반복 장보기` -> `장보기 예약` 문구 변경
2. 예약 카드 CTA를 `예약/주문 내역 보기`로 정렬

### C-3. `frontend/src/utils/productVisual.ts`
- 작업:
1. `참이슬`, `비타500` 비주얼 매핑 추가

## Phase D — 테스트/기록
### D-1. 테스트
- 파일:
  - `backend/tests/test_graph_parsing.py` (신규)
  - `backend/tests/test_api.py`
- 작업:
1. 문맥 follow-up 파싱 테스트
2. `두부 한 모`, 다중 품목, 비타500 테스트
3. online/offline mode 차이 테스트

### D-2. 문서
- 파일:
  - `PLAN.md` (v1.4)
  - `HISTORY.md`
  - 본 문서
- 작업:
1. 변경사항/검증결과 동기화

## 5. 변경 요약 (핵심)
1. 챗봇 파서는 이제 `문맥 + 세그먼트 + alias` 기반으로 동작
2. 모드 선택 시 실제 API mode가 보장 전달됨
3. 음성 입력 화면에서 수동 편집 가능
4. 계획/히스토리 기록을 v1.4로 갱신

## 6. 완료 정의 (DoD)
1. 문맥 follow-up 오인식(원산지는 품목화) 재발 없음
2. 다중 품목 입력 누락 없음
3. online/offline 설명/메타 차이 확인 가능
4. `pytest -q`, `npm run build` 성공
5. `PLAN.md`, `HISTORY.md`, `INTEGRATION_EXECUTION_PLAN_*` 동기화 완료

## 7. 검증 결과 (2026-02-19)
- `cd backend && pytest -q` -> `49 passed`
- `cd frontend && npm run build` -> `vite v6.3.5 build success`
