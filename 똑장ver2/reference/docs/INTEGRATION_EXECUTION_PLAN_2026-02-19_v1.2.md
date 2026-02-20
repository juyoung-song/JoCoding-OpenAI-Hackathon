# 똑장ver2 통합 상세 실행 계획서 v1.2 (Feedback Batch)

본 문서는 사용자 피드백 20건을 기준으로 한 2차 통합 배치 계획이다.  
요약판은 루트 `PLAN.md`를 따른다.

## 1. 목표
- UX 데모 품질 저하 이슈(네비게이션/표시/미구현 placeholder) 제거
- 온보딩-채팅-장바구니-마이페이지 데이터 일관성 확보
- 주요 화면 브랜딩 요소 통일

## 2. 기준 원칙
1. 백엔드 API 계약을 SoR로 유지한다.
2. `.env` 값은 유지하며 문서/코드에 노출하지 않는다.
3. 레퍼런스 구현 패턴(`reference_guide*.md`)을 우선 반영한다.

## 3. 피드백 이슈 트래킹
| No | 요약 | 우선순위 | 대상 |
|---|---|---|---|
| 1 | `/api/v1` Not Found | P1 | backend |
| 2 | 내 정보 관리 진입 불가 | P0 | frontend |
| 3 | 결제 수단 관리 진입 불가 | P0 | frontend |
| 4 | 선호 브랜드 개수 하드코딩 | P0 | frontend |
| 5 | 비선호 브랜드 개수 하드코딩 | P0 | frontend |
| 6 | 앱 버전 하드코딩 | P1 | frontend |
| 7 | 약관/개인정보 화면 부재 | P1 | frontend |
| 8 | 온보딩 뒤로가기 UX 모호 | P1 | frontend |
| 9 | 로그아웃 흐름 부자연 | P1 | frontend |
| 10 | 온보딩 입력 텍스트 가독성 | P0 | frontend |
| 11 | 온보딩 전송 아이콘 가독성 | P0 | frontend |
| 12 | 온보딩 선호 브랜드 저장 안됨 | P0 | frontend+backend API 사용 |
| 13 | 온보딩 비선호 브랜드 질문 없음 | P1 | frontend |
| 14 | 로고 교체 필요 | P1 | frontend |
| 15 | 최근 장바구니 카드 라우팅 오동작 | P1 | frontend |
| 16 | 홈 마이크 버튼 무반응 | P0 | frontend |
| 17 | 채팅 아이콘 스타일 불일치 | P2 | frontend |
| 18 | 채팅 내역 저장 안됨 | P0 | frontend |
| 19 | 채팅 후 장바구니 동기화 안됨 | P0 | frontend |
| 20 | reference guide 반영 | P0 | 전체 |

## 4. 파일별 실행 계획

## Phase A
- `backend/src/main.py`
1. `/api/v1` 루트 응답 추가

## Phase B
- `frontend/src/pages/MyPageScreen.tsx`
- `frontend/src/pages/SettingsScreen.tsx`
- `frontend/src/app/store/AppContext.tsx`
- `frontend/src/app/App.tsx`
- 신규 파일:
  - `frontend/src/pages/AccountInfoScreen.tsx`
  - `frontend/src/pages/PaymentMethodsScreen.tsx`
  - `frontend/src/pages/TermsScreen.tsx`
  - `frontend/src/pages/PrivacyPolicyScreen.tsx`
  - `frontend/src/pages/LoginScreen.tsx`
1. 마이페이지 미연결 메뉴 연결
2. 브랜드 개수 API 동기화
3. 버전 동적화
4. 약관/개인정보 화면 연결
5. 로그아웃 후 로그인 게이트 진입
6. 최근 장바구니 카드 경로 수정

## Phase C
- `frontend/src/pages/OnboardingScreen.tsx`
- `frontend/src/features/chat/AiChatModal.tsx`
- `frontend/src/pages/HomeScreen.tsx`
- `frontend/src/pages/VoiceInputScreen.tsx`
- `frontend/src/app/store/AppContext.tsx`
- `frontend/src/styles/theme.css`
1. 브랜드 색상 토큰 정의
2. 온보딩 단계 보강(선호+비선호)
3. Preferences API 저장 연동
4. 홈 마이크 동작/음성 화면 최소 구현
5. 채팅 히스토리 로컬 저장
6. 채팅 후 basket refresh

## Phase D
- `frontend/src/assets/ddokjang-logo.png` (신규)
- `frontend/src/pages/HomeScreen.tsx`
- `frontend/src/pages/OnboardingScreen.tsx`
- `frontend/src/features/chat/AiChatModal.tsx`
1. 로고 에셋 반영
2. 홈/채팅 AI 아바타 교체

## Phase E
- `HISTORY.md`
- `PLAN.md`
1. 변경 이력 기록
2. 검증 결과 반영

## 5. 검증 기준
1. `pytest -q` 통과
2. `npm run build` 통과
3. 수동 검증:
   - 온보딩 선호/비선호 입력 후 마이페이지 수량 일치
   - 채팅으로 품목 추가 후 장바구니 즉시 반영
   - 내 정보/결제 수단/약관/개인정보 화면 진입

## 6. 완료 체크리스트
- [x] A: API 루트 응답
- [x] B: 마이페이지/설정 정합성
- [x] C: 온보딩/채팅/장바구니 동기화
- [x] D: 로고/아이콘 통일
- [x] E: 검증 및 이력 동기화

## 7. 검증 결과 (2026-02-19)
- `backend`: `pytest -q` → `43 passed`
- `frontend`: `npm run build` → `vite v6.3.5 build success`
