AI 기반 온/오프라인 쇼핑 통합 추천 서비스
프로젝트명: 똑장(똑똑한 장보기)
버전: v1.0
작성일: 2026-02-14
1. 제품 개요 (Product Overview)
1.1 문제 정의 (Problem Statement)
속초, 부산 등 낯선 지역을 방문한 사용자는 다음과 같은 문제를 겪는다:
주변 마트 정보 부족
가격 정보 불투명
이동 거리/시간 고려 어려움
온라인/오프라인 가격 비교 단절
앱 간 정보 분산으로 인한 비교 피로
현재 사용자 흐름
장바구니 구성 → 가격 비교 → 지도 검색 → 배송 고려 → 결정 → 구매
→ 여러 앱을 전환하며 수작업 수행
→ 정보 불균형 + 시간 낭비 + 오구매 위험
1.2 기획 목적 (Goal)
온/오프라인 쇼핑 데이터를 통합하고
AI 추천 기반으로 합리적 의사결정을 지원하는 실행형 에이전트 구축
1.3 핵심 가치 (Core Value Proposition)
“장바구니를 만들면 → 후보를 찾고 → 가격 + 이동시간 + 날씨를 반영해 → 가장 합리적인 선택을 제안하고 실행까지 돕는다.”
2. 사용자 타겟 (Target Users)
구분	설명
2030 여행자	낯선 지역에서 장보기
출장/단기 체류자	지역 물가 정보 부족
합리적 소비 지향 사용자	총액 기준 판단 선호
3. 제품 범위 (Scope)
3.1 MVP 범위
필수 기능
장바구니 생성 (브랜드/용량/수량 구조화)
온/오프라인 후보 통합 수집
총액 기준 랭킹
오프라인 이동 시간 반영
온라인 최저가 비교
결제 플로우(카카오페이 테스트 모드)
음성 입력(STT)
3.2 MVP 기술적 타협
쿠폰 로직 제외
배송비까지만 반영
오프라인 가격 일부 Mock 허용
웹 스크래핑 금지 (공식 API 사용 원칙)
4. 기능 요구사항 (Functional Requirements)
4.1 오프라인 추천 (GPS 기반)
목적
낯선 지역에서 신뢰도 높은 마트 추천
핵심 기능
GPS 기반 위치 수집
대형 마트 우선 추천
한국소비자원 ‘참가격’ API 활용
이동 시간 계산 (네이버/카카오 모빌리티)
날씨 위험 표시 (기상청 단기예보 API)
랭킹 기준
총액
커버리지
이동 시간
날씨는 보조 정보로만 표시
4.2 온라인 쇼핑 통합
데이터 연동
네이버 쇼핑 검색 API
lprice
mallName
productId
direct link
실행 단계
장바구니 정리
플랜 선택
결제 화면
카카오페이 테스트 모드 실행
결제 완료 화면
4.3 UI/UX 설계 요구사항
4.3.1 Chat 기반 인터페이스
초기 설정: Chat UI
장바구니 입력: Chat + Voice
브랜드/용량 확인 질문
중간 모드 선택 화면 필수
4.3.2 신뢰도 강화
각 플랜에 반드시 표시:
가격 출처
갱신일
커버리지 %
“가격 변동 가능성 있음” 안내
온라인 결제 전 단계:
상품 이미지 표시 필수
수량/브랜드 재확인 화면 제공
4.3.3 데이터 구조화
장바구니 DB 설계 필수 필드:
item_name
brand
size
quantity
category
브랜드 선호도 추적 가능하도록 설계
5. 시스템 아키텍처
5.1 기술 스택
구분	기술
Language	Python
AI Framework	LangGraph, OpenAI GPT-4
Database	SQLite
Vector/비정형	SQLite 기반
Cache	Redis (검토), SQLite 분리
STT	OpenAI Whisper
Online	Naver Shopping API
Payment	KakaoPay Test Mode
Place	Naver Local API
Routing	Naver Local 기반
Weather	기상청 단기예보 API
Dev Tools	Cursor, Claude, .cursorrules
5.2 백엔드 계층 구조
API (라우팅)
Application (유즈케이스)
Domain (모델/정책)
Infrastructure (외부 API/DB)
Graph (LangGraph 오케스트레이션)
5.3 데이터 전략
SQLite 기반 분산 개발 전략
각 담당자 독립 개발
동일 스키마 유지
최종 통합 시 DB 파일 병합
6. 비기능 요구사항 (Non-functional Requirements)
항목	요구사항
성능	플랜 생성 3초 이내
안정성	API 실패 시 graceful fallback
확장성	Provider 교체 가능 구조
보안	음성 데이터 저장 금지 (opt-in 제외)
신뢰	출처/갱신일 필수 표시
7. 팀 역할 (R&R)
담당	역할
창현	오프라인 전략, 참가격 API, 지도/모빌리티
주형	온라인 쇼핑 플로우, 네이버 API
임승	로그인/결제 연동, GPS 모듈, 폴더 구조 세팅, .cursorrules 관리
8. 일정 (Milestones)
날짜	목표
2/15 10:00	초기 프로토타입 공유
2/17 17:00	통합안 도출, QA 준비
9. 개발 방법론
9.1 AI 기반 이터레이션
GPT-4/Claude 활용
10~15회 이상 반복 개선
App Mixing 전략
9.2 Working Prototype 우선
핵심 플로우 우선 구현
API 불가 시 Dummy Data 허용
전체 시나리오 흐름 유지
10. 성공 지표 (KPIs)
의사결정 시간 70% 이상 단축
플랜 선택 완료율
결제 전환율
재사용률
11. 리스크 및 대응 전략
리스크	대응
API 쿼터 초과	캐시 전략
가격 변동	갱신일 표시
웹 스크래핑 리스크	공식 API만 사용
결제 오류	Mock 단계 분리
12. 향후 확장 계획
쿠폰 통합
혼합 최적화(온라인+오프라인 조합)
MCP 기반 확장
개인화 추천 고도화
Redis 캐싱 본격 도입
🔵 결론
똑장은 단순 가격 비교 앱이 아니다.
데이터 기반 의사결정 실행 에이전트다.
MVP는 합리적 의사결정 흐름의 완성에 집중한다.
확장은 결제·쿠폰·개인화 방향으로 단계적 진행한다