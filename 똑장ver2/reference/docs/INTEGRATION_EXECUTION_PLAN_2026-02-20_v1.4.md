# 똑장ver2 통합 상세 실행 계획서 v1.4 (UX Feedback Batch: 6 Issues)

작성일: 2026-02-20  
연계 문서: `똑장_클로즈_베타_서비스화_계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.3.md`

## 1. 문서 목적
- 사용자 실사용 테스트에서 보고된 6개 UX/신뢰성 이슈를 해결한 배치 결과를 기록한다.
- 재현 경로와 수정 범위를 팀 공용 기준으로 남긴다.

## 2. 이슈 및 조치 요약

### 1) 챗봇에서 일부 품목 인식 실패 (`깻잎`, `상추`)
- 원인:
  - alias 범위 제한 + fallback 토큰 파싱이 규격(`1kg`)을 품목으로 오인
- 조치:
  - `backend/src/application/graph.py`
    - alias 확장
    - fallback 품목 추출 강화
    - 숫자/규격 토큰 제외 필터 추가

### 2) 결제 중 배송지 입력 후 복귀 동선 불편
- 원인:
  - AddressBook의 고정 복귀 경로가 `ACCOUNT_INFO`
- 조치:
  - `frontend/src/pages/PaymentScreen.tsx`
  - `frontend/src/pages/AccountInfoScreen.tsx`
  - `frontend/src/pages/AddressBookScreen.tsx`
  - 진입 출처(`PAYMENT`/`ACCOUNT_INFO`) 저장 후 해당 화면으로 복귀

### 3) 다른 테스트 계정에서 채팅 기록 혼선
- 원인:
  - 채팅 localStorage 키가 전역 단일 키
- 조치:
  - `frontend/src/features/chat/AiChatModal.tsx`
  - 사용자 이메일 기반 저장 키로 분리

### 4) 승인대기 예약의 후속 액션 부재
- 원인:
  - 알림은 뜨지만 실행 액션으로 연결되는 UI 없음
- 조치:
  - `frontend/src/app/store/AppContext.tsx`
    - `openReservationFromAlert()` 추가
    - 승인대기 예약을 장바구니 반영 + 비교 흐름 연결
  - `frontend/src/pages/RecommendationScreen.tsx`
  - `frontend/src/pages/HistoryScreen.tsx`
    - 승인대기 액션 버튼 추가

### 5) 다음 예약 노출이 생성순 중심
- 원인:
  - 예약 정렬 기준이 `created_at DESC`
- 조치:
  - `backend/src/infrastructure/persistence/user_repository.py`
    - `next_run_at` 우선 정렬로 변경
  - `frontend/src/app/store/AppContext.tsx`
    - 예약 정렬 일관화
  - `frontend/src/pages/HomeScreen.tsx`
    - 가장 가까운 예약 기준으로 “다음 예약” 표시

### 6) 홈 우측 상단 알림 버튼 기능 미완성
- 조치:
  - `frontend/src/pages/NotificationsScreen.tsx` 신규
  - `frontend/src/app/App.tsx` 라우트 추가
  - `frontend/src/pages/HomeScreen.tsx` 벨 버튼 연결 + unread 배지
  - `frontend/src/app/store/AppContext.tsx` 알림 상태 관리(read/unread)

## 3. 검증 결과
- `cd backend && pytest -q` -> `49 passed`
- `cd frontend && npx tsc --noEmit` -> PASS
- `cd frontend && npm run build` -> PASS
- 서버 재기동 후:
  - `http://localhost:8000/health` -> OK
  - `http://localhost:5173/` -> OK

## 4. 사용 시나리오 확인 포인트
1. 채팅에서 `깻잎 1개 담아줘`, `상추 추가해줘` 입력 시 장바구니 반영되는지
2. 결제화면 -> 배송지 관리 -> 저장 후 결제화면으로 복귀하는지
3. 계정 A/B 전환 시 채팅 기록이 분리되는지
4. 예약 알림센터에서 승인대기 예약 “장바구니 반영” 동작이 연결되는지
5. 홈의 “다음 예약”이 현재 시각 기준 가장 가까운 예약인지
6. 홈 우측 벨 아이콘 배지/알림센터 진입이 동작하는지

