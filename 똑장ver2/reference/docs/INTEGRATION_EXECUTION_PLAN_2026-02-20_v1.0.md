# 똑장ver2 통합 상세 실행 계획서 v1.0 (Closed Beta Serviceization Kickoff)

작성일: 2026-02-20  
연계 문서: `똑장_클로즈_베타_서비스화_계획.md`, `HISTORY.md`, `reference/docs/INTEGRATION_EXECUTION_PLAN_2026-02-19_v1.10.md`

## 1. 문서 목적
- 본 문서는 `똑장_클로즈_베타_서비스화_계획.md`의 실제 구현 실행 로그를 단계별로 기록한다.
- 다른 팀원이 현재 코드 상태/다음 작업/검증 결과를 바로 파악할 수 있도록 변경 단위를 고정 포맷으로 남긴다.

## 2. 이번 배치 목표 (v1.0)
1. 인증(JWT + 서버 세션 저장) 도입
2. 사용자 핵심 데이터 SoR를 서버 DB로 전환(장바구니/선호/예약/주문/프로필)
3. 플랜 API 계약 정렬 (`/offline|online/plans/generate|select` + 호환 어댑터 유지)
4. 예약 필드 확장 + 1분 poll 실행 엔진
5. 프론트 API/상태를 인증 기반으로 정렬하고 민감정보 localStorage 저장 제거

## 3. 진행 상태 (2026-02-20 현재)
- [x] 실행 기준 문서 확정: `똑장_클로즈_베타_서비스화_계획.md`
- [x] 기존 구현/테스트/계약 차이 분석 완료
- [ ] 백엔드 인증/DB/라우터 구현
- [ ] 프론트 인증/상태 연동 구현
- [ ] 회귀 테스트 및 빌드 검증
- [ ] `HISTORY.md` 반영

## 4. 작업 단위 계획
### A. Backend Foundation
- DB 스키마 확장: users/auth_sessions/user_baskets/user_preferences/reservations/user_profiles/user_orders/plan_requests
- JWT 보안 모듈 + auth dependency + auth router 생성
- basket/preferences/reservations/chat/plans 인증 의존성 전환

### B. API Contract Alignment
- `POST /api/v1/offline/plans/generate`
- `POST /api/v1/offline/plans/select`
- `POST /api/v1/online/plans/generate`
- `POST /api/v1/online/plans/select`
- `POST /api/v1/plans/generate` (2주 호환 어댑터)
- 상태코드 계약: 200/206/400/422/503

### C. Reservation Engine
- 예약 필드 확장: `schedule_type/next_run_at/timezone/channel/last_run_at/last_result_status/retry_count`
- 1분 poll 디스패처: due reservation -> 승인대기/재시도/만료 상태 전이

### D. Frontend Integration
- Bearer 토큰 기반 API 호출 통일
- profile/order/reservation localStorage SoR 제거
- 온라인 실행 CTA 연결(cart_url/mall_product_links)
- 데모 placeholder 문구 -> 베타 준비중 문구로 교체

### E. Verification
- `cd backend && pytest -q`
- `cd frontend && npx tsc --noEmit`
- `cd frontend && npm run build`

## 5. 결정사항
- 이번 배치는 결제 실연동이 아닌 `결제 샌드박스 전제 UX/계약 정렬`까지만 포함한다.
- STT/외부 provider의 실 API 품질 고도화는 본 배치에서 계약/안전장치 우선으로 처리한다.

## 6. 업데이트 규칙
- 구현 중간 결과는 동일 날짜 버전 파일(`INTEGRATION_EXECUTION_PLAN_2026-02-20_v1.x.md`)로 누적한다.
- 코드 변경 완료 시점마다 `HISTORY.md`에 동기화 기록을 남긴다.