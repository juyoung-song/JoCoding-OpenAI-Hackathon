# 똑장ver2 통합 상세 실행 계획서 v1.10 (로그인 보조버튼 제거 + 채팅 음성입력 확장 + 가격 데이터 점검)

작성일: 2026-02-20  
연계 문서: `PLAN.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.9.md`

## 1. 목적
- 사용자 피드백 3건을 빠르게 반영해 UX 혼선을 줄이고 가격 신뢰도를 개선한다.
1. 로그인 화면에서 불필요한 보조 액션 제거
2. 채팅 화면에서도 음성 입력 진입 가능하게 확장
3. 온라인/오프라인 가격 데이터 이상치 원인 파악 및 보정

## 2. 문제 정의
1. 로그인 화면에 `맞춤 설정 다시 하기` 버튼이 존재해 현재 클로즈드 베타 로그인 UX와 불일치
2. 음성 입력은 홈 화면 진입 경로만 있어 채팅 맥락에서 입력 전환이 불편
3. 온라인/오프라인 플랜 가격이 체감과 크게 어긋나는 케이스가 존재하며, 원인(수집/필터/표시) 분해 점검 필요

## 3. 적용 범위

### In Scope
1. 로그인 버튼 하단 `맞춤 설정 다시 하기` 버튼 제거 (`로그인 버튼은 유지`)
2. 채팅 화면에 음성 입력 진입 버튼/플로우 연결
3. 가격 데이터 점검 로직/가드레일/테스트 추가
4. 가격 출처/관측시점/주의문구 노출 일관성 검증

### Out of Scope
1. 인증 정책/로그인 API 스펙 변경
2. STT 엔진 교체(Whisper 실연동 등) 자체
3. 대규모 디자인 리뉴얼

## 4. 실행 트랙

## Track A — 로그인 화면 보조버튼 제거
- 대상 파일:
1. `frontend/src/pages/LoginScreen.tsx`
- 작업:
1. 하단 `맞춤 설정 다시 하기` 버튼 제거
2. 기존 로그인 제출 버튼/입력 검증/토스트 동작은 유지
- 완료 기준:
1. 로그인 화면에는 이메일 입력 + 로그인 액션만 노출
2. 기존 로그인 성공/실패 흐름 회귀 없음

## Track B — 채팅 화면 음성 입력 진입 확장
- 대상 파일:
1. `frontend/src/features/chat/AiChatModal.tsx`
2. `frontend/src/pages/VoiceInputScreen.tsx`
3. 필요 시 `frontend/src/app/store/AppContext.tsx`
- 작업:
1. 채팅 입력창 인근에 음성 입력 진입 버튼 추가
2. 채팅 화면에서 `VOICE_INPUT_CONFIRM`로 이동 가능하도록 이벤트 연결
3. 음성 입력 완료 후 `pendingChatMessage` 전달 및 채팅 복귀 동선 보정
- 완료 기준:
1. 홈 화면/채팅 화면 모두 음성 입력 진입 가능
2. 음성 입력 후 채팅창으로 복귀해 메시지 자동 전송 동작 유지

## Track C — 가격 데이터 점검 및 신뢰도 보정
- 대상 파일:
1. `backend/src/infrastructure/providers/naver_shopping.py`
2. `backend/src/application/services/online_plan_adapter.py`
3. `backend/src/application/services/offline_plan_adapter.py`
4. `backend/src/api/v1/routers/plans.py` (필요 시 진단 필드/notice 정리)
5. `backend/tests/test_api.py`, `backend/tests/test_offline_integration.py` (회귀/이상치 테스트)
- 점검 축:
1. 온라인 수집 품질:
   - mall 필터 통과 조건 점검
   - 비식품/이상가격 항목 유입 여부 점검
   - 품목별 최저가 극단값(outlier) 컷오프 기준 정의
2. 오프라인 스냅샷 품질:
   - `price_source`, `price_observed_at`, `price_notice` 일관성 확인
   - fallback(mock) 경로 사용 시 사용자 안내 문구 명확화
3. 표시 일관성:
   - `Top3ResultScreen`/`PlanDetailScreen`에서 가격 근거 문구 고정 노출 확인
- 완료 기준:
1. 이상가격 재현 케이스에 대해 원인 분류(수집/매칭/표시) 가능
2. 온라인/오프라인 모두 극단값 완화 로직 반영
3. 가격 근거 필드 누락 없이 UI에 일관 노출

## 5. 검증 계획

### 자동 검증
1. `cd backend && pytest -q`
2. `cd frontend && npx tsc --noEmit`
3. `cd frontend && npm run build`

### 수동 검증 (도커 기준)
1. 로그인 화면 진입 시 보조 버튼 미노출 확인
2. 채팅 화면에서 음성 입력 진입 → 인식 문장 전송 확인
3. 동일 장바구니로 온라인/오프라인 3회 이상 생성해 가격/출처 문구 일관성 확인
4. 이상치 의심 품목(예: 계란/우유/두부/삼겹살)으로 총액 분포 비교

## 6. 리스크와 대응
1. 외부 API 변동으로 온라인 가격 불안정:
   - 대응: outlier 컷오프 + degraded notice 유지
2. 음성 입력 브라우저 호환성 이슈:
   - 대응: 기존 unsupported 안내 문구 유지, 텍스트 입력 fallback 고정
3. 오프라인 데이터 갱신 주기 불명확:
   - 대응: `price_observed_at` 기반 stale 점검/표시 강화

## 7. 산출물
1. 코드 수정 커밋(프론트 UX + 백엔드 가격 가드레일)
2. 이상치 점검 결과 요약(재현 케이스/수정 전후 비교)
3. `PLAN.md`, `HISTORY.md` 후속 동기화 기록

## 8. 실행 순서
1. Track A (로그인 보조버튼 제거)
2. Track B (채팅 음성입력 확장)
3. Track C (가격 점검/보정 + 테스트)
4. 회귀 검증 및 문서 동기화

## 9. 진행 로그 (Progress Log)
1. Track A 완료:
   - `frontend/src/pages/LoginScreen.tsx`에서 로그인 버튼 하단 `맞춤 설정 다시 하기` 버튼 제거
2. Track B 완료:
   - `frontend/src/features/chat/AiChatModal.tsx`에 음성 입력 진입 버튼 추가
   - `frontend/src/app/voiceInputOrigin.ts` 신규 추가(진입 origin 관리)
   - `frontend/src/pages/VoiceInputScreen.tsx` 복귀 경로를 origin 기반으로 보정
   - `frontend/src/pages/HomeScreen.tsx` 음성 입력 진입 시 origin 저장 추가
3. Track C 완료:
   - `backend/src/infrastructure/providers/naver_shopping.py` 제목 기반 품목 일치/제외 키워드 필터 강화
   - `backend/src/application/services/online_plan_adapter.py` 가격 이상치(outlier) 컷오프 추가
   - `backend/src/application/services/offline_plan_adapter.py` 스냅샷 가격 guardrail 추가
   - `backend/src/infrastructure/providers/mock_providers.py` 미매칭 품목에 임의 기본가(5000원) 주입 제거
   - `backend/src/api/v1/routers/plans.py` mock fallback 출처를 `mock_offline`로 명시
4. 테스트 보강:
   - `backend/tests/test_online_pricing_guards.py` 신규(온라인 이상치 컷오프 회귀)
   - `backend/tests/test_offline_integration.py` 극단값 스냅샷 필터 회귀 추가

## 10. 검증 결과
1. `cd backend && pytest -q` -> `61 passed in 59.02s`
2. `cd frontend && npx tsc --noEmit` -> PASS
3. `cd frontend && npm run build` -> `vite v6.4.1 build success`
