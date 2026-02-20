# 똑장(똑똑한 장보기) UX Page Design v1.1

> **개발 시 반드시 이 문서를 참고해야 합니다.**
> 각 화면의 컴포넌트, 인터랙션, 상태, 엣지케이스를 정의합니다.  **v1.1 업데이트** : `reference/frontend/ttokjang_updated/` 코드 매핑 포함

 **문서 버전** : v1.1
 **작성일** : 2026-02-18

---

## 디자인 시스템 기준

### 색상 토큰

| 토큰명                | Hex         | 용도                                  |
| --------------------- | ----------- | ------------------------------------- |
| `--color-brand`     | `#59A22F` | GNB, 로딩바, 메인 아이콘, Primary CTA |
| `--color-dark`      | `#245E18` | 강조 텍스트, 버튼 Pressed 상태        |
| `--color-accent`    | `#74CB48` | 긍정 피드백, 서브 태그, 절약 금액     |
| `--color-highlight` | `#E4E764` | 알림 배지, NEW, Today 포인트          |
| `--color-text`      | `#2B2C25` | 본문 텍스트, Border, 기본 아이콘      |
| `--color-base`      | `#FCFDFA` | 전체 배경색                           |

### 타이포그래피

| 용도             | 크기 | 굵기           |
| ---------------- | ---- | -------------- |
| 총액 (메인 숫자) | 28px | Bold (700)     |
| 섹션 타이틀      | 20px | SemiBold (600) |
| 카드 제목        | 16px | SemiBold (600) |
| 본문             | 14px | Regular (400)  |
| 절약 금액 배지   | 13px | Medium (500)   |
| 출처/갱신일      | 11px | Regular (400)  |

---

## 화면 목록 (IA)

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60"></div><div class="flex flex-row gap-2 justify-end"><div class="cursor-pointer opacity-70 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-copy h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></div></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1">S-00  스플래시</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1">S-01  온보딩 (최초 1회)</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1">S-02  홈 / 입력 화면</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1">S-03  장바구니 확인 화면</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1">S-04  모드 선택 화면</span></div></div><div class="code-line" data-line-number="6" data-line-start="6" data-line-end="6"><div class="line-content"><span class="mtk1">S-05  로딩 화면 (신뢰 UX)</span></div></div><div class="code-line" data-line-number="7" data-line-start="7" data-line-end="7"><div class="line-content"><span class="mtk1">S-06  Top3 결과 화면</span></div></div><div class="code-line" data-line-number="8" data-line-start="8" data-line-end="8"><div class="line-content"><span class="mtk1">S-07  플랜 상세 화면 (예약 Bottom Sheet 포함)</span></div></div><div class="code-line" data-line-number="9" data-line-start="9" data-line-end="9"><div class="line-content"><span class="mtk1">S-08  예약 알림 화면</span></div></div><div class="code-line" data-line-number="10" data-line-start="10" data-line-end="10"><div class="line-content"><span class="mtk1">S-09  결제 확인 화면</span></div></div><div class="code-line" data-line-number="11" data-line-start="11" data-line-end="11"><div class="line-content"><span class="mtk1">S-10  결제 완료 화면</span></div></div><div class="code-line" data-line-number="12" data-line-start="12" data-line-end="12"><div class="line-content"><span class="mtk1">S-11  설정 화면 (마이페이지)</span></div></div><div class="code-line" data-line-number="13" data-line-start="13" data-line-end="13"><div class="line-content"><span class="mtk1">S-12  구매 이력 화면 (마이페이지 내)</span></div></div></div></div></div></div></pre>

---

## S-00. 스플래시 화면

*(생략: 별도 레퍼런스 없음)*

---

## S-01. 온보딩 화면 (최초 1회)

### 목적

서비스 사용에 필요한 기본 설정 수집 (지역, 이동수단 등)

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/imports/대화형환경설정.tsx` (OnboardingScreen)
* **Key Logic** :
* `step` 상태 관리 ('LOCATION' → 'TRANSPORT' → 'DONE')
* 채팅형 UI 인터랙션 (`AiMessageBubble`, `UserMessageBubble`)
* `SuggestionChip`을 통한 빠른 입력
* **Reference Code** :

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">tsx</div><div class="flex flex-row gap-2 justify-end"><div class="cursor-pointer opacity-70 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-copy h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></div></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk3">const</span><span class="mtk1"></span><span class="mtk13">handleSendMessage</span><span class="mtk1"> = () </span><span class="mtk3">=></span><span class="mtk1"> {</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1"></span><span class="mtk3">if</span><span class="mtk1"> (</span><span class="mtk4">step</span><span class="mtk1"></span><span class="mtk16">===</span><span class="mtk1"></span><span class="mtk6">'LOCATION'</span><span class="mtk1">) {</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1"></span><span class="mtk13">setTimeout</span><span class="mtk1">(() </span><span class="mtk3">=></span><span class="mtk1"> {</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1"></span><span class="mtk13">setMessages</span><span class="mtk1">(</span><span class="mtk4 mtki">prev</span><span class="mtk1"></span><span class="mtk3">=></span><span class="mtk1"> [...</span><span class="mtk4">prev</span><span class="mtk1">, { </span><span class="mtk4">sender</span><span class="mtk12">:</span><span class="mtk1"></span><span class="mtk6">'AI'</span><span class="mtk1">, </span><span class="mtk4">text</span><span class="mtk12">:</span><span class="mtk1"></span><span class="mtk6">'교통수단을 이용하시나요? 🛒'</span><span class="mtk1"> }]);</span></div></div><div class="code-line" data-line-number="5" data-line-start="5" data-line-end="5"><div class="line-content"><span class="mtk1"></span><span class="mtk13">setStep</span><span class="mtk1">(</span><span class="mtk6">'TRANSPORT'</span><span class="mtk1">);</span></div></div><div class="code-line" data-line-number="6" data-line-start="6" data-line-end="6"><div class="line-content"><span class="mtk1">    }, </span><span class="mtk5">600</span><span class="mtk1">);</span></div></div><div class="code-line" data-line-number="7" data-line-start="7" data-line-end="7"><div class="line-content"><span class="mtk1">  }</span></div></div><div class="code-line" data-line-number="8" data-line-start="8" data-line-end="8"><div class="line-content"><span class="mtk1">};</span></div></div></div></div></div></div></pre>

---

## S-02. 홈 / 입력 화면

### 목적

장바구니 입력의 시작점. 텍스트/음성 입력 및 예약 확인.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/app/components/HomeScreen.tsx`
* **Key Logic** :
* 검색 텍스트 `pendingChatMessage`로 전역 상태 공유
* `Floating CTA` ("가격 비교 시작하기" → `currentScreen = 'MODE_SELECTION'`)
* 최근 장바구니 카드 클릭 시 `VOICE_INPUT_CONFIRM`으로 이동
* **Reference Code** :

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">tsx</div><div class="flex flex-row gap-2 justify-end"><div class="cursor-pointer opacity-70 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-copy h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></div></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk3">const</span><span class="mtk1"></span><span class="mtk13">handleSendMessage</span><span class="mtk1"> = () </span><span class="mtk3">=></span><span class="mtk1"> {</span></div></div><div class="code-line" data-line-number="2" data-line-start="2" data-line-end="2"><div class="line-content"><span class="mtk1"></span><span class="mtk13">setPendingChatMessage</span><span class="mtk1">(</span><span class="mtk4">searchText</span><span class="mtk1">);</span></div></div><div class="code-line" data-line-number="3" data-line-start="3" data-line-end="3"><div class="line-content"><span class="mtk1"></span><span class="mtk13">setIsChatOpen</span><span class="mtk1">(</span><span class="mtk5">true</span><span class="mtk1">);</span></div></div><div class="code-line" data-line-number="4" data-line-start="4" data-line-end="4"><div class="line-content"><span class="mtk1">};</span></div></div></div></div></div></div></pre>

---

## S-03. 장바구니 확인 화면 (음성 입력 확인)

### 목적

AI가 이해한 품목(CartItems)을 확인하고 수정.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/imports/음성입력확인및수정.tsx` (VoiceInputScreen)
* **Mapping** : Base 문서의 S-03은 "AI 이해 결과 확인" 단계이므로, 레퍼런스의 `#5 음성 입력 확인 및 수정`에 해당함.
* **Key Logic** :
* `Button6/7`: 수량 증감 핸들러
* `Button4`: 전체 삭제 확인 모달
* `Button1`: 항목 직접 수정
* **Note** : 레퍼런스의 `CartViewScreen`(#14)은 별도의 "장바구니 보기" 화면으로 존재.

---

## S-04. 모드 선택 화면

### 목적

온라인(배송) vs 오프라인(방문) 모드 결정.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/imports/구매방식선택.tsx`
* **Components** : `ButtonOption1OnlineBlueTheme`, `ButtonOption2OfflineGreenTheme`
* **Key Logic** :
* 선택 시 `setSelectedMode('ONLINE' | 'OFFLINE')` 업데이트
* 선택 후 `currentScreen = 'TOP3_RESULT'`로 이동

---

## S-05. 로딩 화면

*(생략: 모드 선택이나 결과 화면 진입부 `AppContent` 내 트랜지션으로 처리)*

---

## S-06. Top3 결과 화면

### 목적

최적 장보기 플랜 3개를 비교 제시.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/app/components/Top3ResultScreen.tsx`
* **Key Logic** :
* 플랜 순위별 동적 스타일링 (`badgeColor`)
* 매칭률 시각화 (`matchingPercent` Progress Bar)
* 카드 클릭 시 `PAYMENT` 화면으로 이동 (임시 흐름)
* **Reference Code** :

<pre><div node="[object Object]" class="relative whitespace-pre-wrap word-break-all my-2 rounded-lg bg-list-hover-subtle border border-gray-500/20"><div class="min-h-7 relative box-border flex flex-row items-center justify-between rounded-t border-b border-gray-500/20 px-2 py-0.5"><div class="font-sans text-sm text-ide-text-color opacity-60">tsx</div><div class="flex flex-row gap-2 justify-end"><div class="cursor-pointer opacity-70 hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide lucide-copy h-3.5 w-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></div></div></div><div class="p-3"><div class="w-full h-full text-xs cursor-text"><div class="code-block"><div class="code-line" data-line-number="1" data-line-start="1" data-line-end="1"><div class="line-content"><span class="mtk1"><</span><span class="mtk4">div</span><span class="mtk1"></span><span class="mtk5 mtki">style</span><span class="mtk1">=</span><span class="mtk3">{</span><span class="mtk1">{ </span><span class="mtk4">width</span><span class="mtk12">:</span><span class="mtk1"></span><span class="mtk6">`</span><span class="mtk3">${</span><span class="mtk4">plan</span><span class="mtk1">.</span><span class="mtk4">matchingPercent</span><span class="mtk3">}</span><span class="mtk6">%`</span><span class="mtk1">, </span><span class="mtk4">backgroundColor</span><span class="mtk12">:</span><span class="mtk1"></span><span class="mtk4">plan</span><span class="mtk1">.</span><span class="mtk4">badgeColor</span><span class="mtk1"> }</span><span class="mtk3">}</span><span class="mtk1"></span><span class="mtk1">/></span></div></div></div></div></div></div></pre>

---

## S-07. 플랜 상세 화면

### 목적

선택한 플랜의 상세 품목 가격 및 예약 옵션 제공.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/imports/상세품목및가격확인.tsx` (PlanDetailScreen)
* **Components** :
* `PlanSummaryCard`: 플랜 요약
* `TrustIndicatorBanner`: 신뢰도 배너
* `BottomStickyActionBar`: 하단 고정 액션 바
* **Note** : 1300줄 이상의 대규모 UI 컴포넌트 (Figma Import 기반)

---

## S-09. 결제 확인 화면 (온라인)

### 목적

최종 구매 전 배송지 및 결제 정보 확인.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/imports/온라인주문결제확인.tsx` (PaymentScreen)
* **Components** :
* `TrustBlockAgentUi`: AI 에이전트 신뢰 배지
* `SectionDeliveryAddress`: 배송지 정보
* `SectionOrderItems`: 주문 상품 목록

---

## S-10. 결제 완료 화면

### 목적

주문/방문 완료 확인 및 절약 금액 리포트.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/imports/주문및결제완료.tsx` (CompletionScreen)
* **Components** :
* `SuccessAnimationIcon`: 완료 체크 애니메이션
* `OrderSummaryCard`: 결제 요약
* `PromotionSmartTipSection`: AI 소비 분석 팁 ("채소 구매 비중 증가" 등)

---

## S-11. 설정 화면 (마이페이지)

### 목적

사용자 프로필 및 선호도 설정 관리.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/app/components/MyPageScreen.tsx`
* **Related Files** :
* `PreferredBrandsScreen.tsx` (선호 브랜드 관리)
* `NonPreferredBrandsScreen.tsx` (비선호 브랜드 관리)
* **Components** : `MenuItem` (재사용 가능한 메뉴 리스트 아이템)

---

## [공통] AI 챗 레이어

### 목적

모든 화면에서 접근 가능한 대화형 에이전트 인터페이스.

### 🛠️ Implementation Reference

* **File** : `reference/frontend/ttokjang_updated/src/imports/똑장Ai채팅모달_NEW.tsx`
* **State** : `AppContext.tsx`의 `isChatOpen`, `pendingChatMessage`
* **Interaction** :
* 홈 화면 검색어(`pendingChatMessage`)를 `useEffect`로 수신하여 입력창에 자동 반영
* Quick Reply 버튼 지원

---

## [부록] 공용 UI 컴포넌트 (shadcn/ui)

`reference/frontend/ttokjang_updated/src/app/components/ui/*` 경로에 위치한 재사용 컴포넌트:

* **Buttons** : `button.tsx`
* **Inputs** : `input.tsx`, `textarea.tsx`, `checkbox.tsx`
* **Feedback** : `toast.tsx`, `dialog.tsx`, `sheet.tsx`
* **Layout** : `card.tsx`, `scroll-area.tsx`

---

## 사용자 흐름 요약 (Mermaid)

<pre><div node="[object Object]" class="mermaid-wrapper relative my-4"><div><svg id="mermaid-iyu5t0nw1" width="100%" xmlns="http://www.w3.org/2000/svg" class="flowchart" viewBox="-35 0 1183.453125 742" aria-roledescription="flowchart-v2"><g><marker id="mermaid-iyu5t0nw1_flowchart-v2-pointEnd" class="marker flowchart-v2" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" class="arrowMarkerPath"></path></marker><marker id="mermaid-iyu5t0nw1_flowchart-v2-pointStart" class="marker flowchart-v2" viewBox="0 0 10 10" refX="4.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 5 L 10 10 L 10 0 z" class="arrowMarkerPath"></path></marker><marker id="mermaid-iyu5t0nw1_flowchart-v2-circleEnd" class="marker flowchart-v2" viewBox="0 0 10 10" refX="11" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><circle cx="5" cy="5" r="5" class="arrowMarkerPath"></circle></marker><marker id="mermaid-iyu5t0nw1_flowchart-v2-circleStart" class="marker flowchart-v2" viewBox="0 0 10 10" refX="-1" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><circle cx="5" cy="5" r="5" class="arrowMarkerPath"></circle></marker><marker id="mermaid-iyu5t0nw1_flowchart-v2-crossEnd" class="marker cross flowchart-v2" viewBox="0 0 11 11" refX="12" refY="5.2" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><path d="M 1,1 l 9,9 M 10,1 l -9,9" class="arrowMarkerPath"></path></marker><marker id="mermaid-iyu5t0nw1_flowchart-v2-crossStart" class="marker cross flowchart-v2" viewBox="0 0 11 11" refX="-1" refY="5.2" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><path d="M 1,1 l 9,9 M 10,1 l -9,9" class="arrowMarkerPath"></path></marker><g class="root"><g class="clusters"></g><g class="edgePaths"><path d="M506.242,62L506.242,66.167C506.242,70.333,506.242,78.667,506.242,86.333C506.242,94,506.242,101,506.242,104.5L506.242,108" id="L_A_B_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_A_B_0" data-points="W3sieCI6NTA2LjI0MjE4NzUsInkiOjYyfSx7IngiOjUwNi4yNDIxODc1LCJ5Ijo4N30seyJ4Ijo1MDYuMjQyMTg3NSwieSI6MTEyfV0=" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M575.296,166L585.952,170.167C596.609,174.333,617.922,182.667,628.578,190.333C639.234,198,639.234,205,639.234,208.5L639.234,212" id="L_B_C_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_B_C_0" data-points="W3sieCI6NTc1LjI5NTgyMzMxNzMwNzcsInkiOjE2Nn0seyJ4Ijo2MzkuMjM0Mzc1LCJ5IjoxOTF9LHsieCI6NjM5LjIzNDM3NSwieSI6MjE2fV0=" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M432.484,146.193L355.904,153.661C279.323,161.128,126.161,176.064,49.581,194.199C-27,212.333,-27,233.667,-27,255C-27,276.333,-27,297.667,6.198,314.712C39.396,331.756,105.793,344.513,138.991,350.891L172.189,357.269" id="L_B_D_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_B_D_0" data-points="W3sieCI6NDMyLjQ4NDM3NSwieSI6MTQ2LjE5MjYxNTkyNTU3MzIyfSx7IngiOi0yNywieSI6MTkxfSx7IngiOi0yNywieSI6MjU1fSx7IngiOi0yNywieSI6MzE5fSx7IngiOjE3Ni4xMTcxODc1LCJ5IjozNTguMDIzODA0NDk4MjI5M31d" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M432.484,148.998L380.842,155.999C329.201,162.999,225.917,176.999,174.275,189.5C122.633,202,122.633,213,122.633,218.5L122.633,224" id="L_B_E_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_B_E_0" data-points="W3sieCI6NDMyLjQ4NDM3NSwieSI6MTQ4Ljk5ODIwNzgxMjMwOTA2fSx7IngiOjEyMi42MzI4MTI1LCJ5IjoxOTF9LHsieCI6MTIyLjYzMjgxMjUsInkiOjIyOH1d" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M437.189,166L426.532,170.167C415.876,174.333,394.563,182.667,383.906,192.333C373.25,202,373.25,213,373.25,218.5L373.25,224" id="L_B_F_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_B_F_0" data-points="W3sieCI6NDM3LjE4ODU1MTY4MjY5MjMsInkiOjE2Nn0seyJ4IjozNzMuMjUsInkiOjE5MX0seyJ4IjozNzMuMjUsInkiOjIyOH1d" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M639.234,294L639.234,298.167C639.234,302.333,639.234,310.667,606.036,321.212C572.838,331.756,506.442,344.513,473.244,350.891L440.045,357.269" id="L_C_D_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_C_D_0" data-points="W3sieCI6NjM5LjIzNDM3NSwieSI6Mjk0fSx7IngiOjYzOS4yMzQzNzUsInkiOjMxOX0seyJ4Ijo0MzYuMTE3MTg3NSwieSI6MzU4LjAyMzgwNDQ5ODIyOTN9XQ==" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M306.117,422L306.117,426.167C306.117,430.333,306.117,438.667,306.117,446.333C306.117,454,306.117,461,306.117,464.5L306.117,468" id="L_D_G_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_D_G_0" data-points="W3sieCI6MzA2LjExNzE4NzUsInkiOjQyMn0seyJ4IjozMDYuMTE3MTg3NSwieSI6NDQ3fSx7IngiOjMwNi4xMTcxODc1LCJ5Ijo0NzJ9XQ==" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M236.924,526L226.246,530.167C215.568,534.333,194.212,542.667,183.533,550.333C172.855,558,172.855,565,172.855,568.5L172.855,572" id="L_G_H_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_G_H_0" data-points="W3sieCI6MjM2LjkyMzYwMjc2NDQyMzEsInkiOjUyNn0seyJ4IjoxNzIuODU1NDY4NzUsInkiOjU1MX0seyJ4IjoxNzIuODU1NDY4NzUsInkiOjU3Nn1d" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M419.68,511.034L482.54,517.695C545.401,524.356,671.122,537.678,733.983,547.839C796.844,558,796.844,565,796.844,568.5L796.844,572" id="L_G_I_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_G_I_0" data-points="W3sieCI6NDE5LjY3OTY4NzUsInkiOjUxMS4wMzM2ODcyOTQwMzE1fSx7IngiOjc5Ni44NDM3NSwieSI6NTUxfSx7IngiOjc5Ni44NDM3NSwieSI6NTc2fV0=" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M172.855,630L172.855,634.167C172.855,638.333,172.855,646.667,172.855,654.333C172.855,662,172.855,669,172.855,672.5L172.855,676" id="L_H_J_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_H_J_0" data-points="W3sieCI6MTcyLjg1NTQ2ODc1LCJ5Ijo2MzB9LHsieCI6MTcyLjg1NTQ2ODc1LCJ5Ijo2NTV9LHsieCI6MTcyLjg1NTQ2ODc1LCJ5Ijo2ODB9XQ==" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M796.844,630L796.844,634.167C796.844,638.333,796.844,646.667,818.091,655.485C839.338,664.304,881.833,673.608,903.08,678.26L924.327,682.912" id="L_I_K_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_I_K_0" data-points="W3sieCI6Nzk2Ljg0Mzc1LCJ5Ijo2MzB9LHsieCI6Nzk2Ljg0Mzc1LCJ5Ijo2NTV9LHsieCI6OTI4LjIzNDM3NSwieSI6NjgzLjc2NzYzMTU3ODk0NzN9XQ==" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M1067.264,680L1072.345,675.833C1077.425,671.667,1087.585,663.333,1092.666,650.5C1097.746,637.667,1097.746,620.333,1097.746,603C1097.746,585.667,1097.746,568.333,1097.746,551C1097.746,533.667,1097.746,516.333,1097.746,499C1097.746,481.667,1097.746,464.333,1097.746,445C1097.746,425.667,1097.746,404.333,1097.746,383C1097.746,361.667,1097.746,340.333,1097.746,319C1097.746,297.667,1097.746,276.333,1097.746,255C1097.746,233.667,1097.746,212.333,1012.119,194.139C926.492,175.945,755.238,160.89,669.612,153.362L583.985,145.834" id="L_K_B_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_K_B_0" data-points="W3sieCI6MTA2Ny4yNjQxOTc3MTYzNDYyLCJ5Ijo2ODB9LHsieCI6MTA5Ny43NDYwOTM3NSwieSI6NjU1fSx7IngiOjEwOTcuNzQ2MDkzNzUsInkiOjYwM30seyJ4IjoxMDk3Ljc0NjA5Mzc1LCJ5Ijo1NTF9LHsieCI6MTA5Ny43NDYwOTM3NSwieSI6NDk5fSx7IngiOjEwOTcuNzQ2MDkzNzUsInkiOjQ0N30seyJ4IjoxMDk3Ljc0NjA5Mzc1LCJ5IjozODN9LHsieCI6MTA5Ny43NDYwOTM3NSwieSI6MzE5fSx7IngiOjEwOTcuNzQ2MDkzNzUsInkiOjI1NX0seyJ4IjoxMDk3Ljc0NjA5Mzc1LCJ5IjoxOTF9LHsieCI6NTgwLCJ5IjoxNDUuNDg0MTYwNDc1NDgyOTJ9XQ==" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M580,147.993L638.791,155.161C697.582,162.328,815.164,176.664,873.955,189.332C932.746,202,932.746,213,932.746,218.5L932.746,224" id="L_B_L_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_B_L_0" data-points="W3sieCI6NTgwLCJ5IjoxNDcuOTkyNjYzODI3NDQ4ODR9LHsieCI6OTMyLjc0NjA5Mzc1LCJ5IjoxOTF9LHsieCI6OTMyLjc0NjA5Mzc1LCJ5IjoyMjh9XQ==" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path><path d="M932.746,282L932.746,288.167C932.746,294.333,932.746,306.667,932.746,316.333C932.746,326,932.746,333,932.746,336.5L932.746,340" id="L_L_M_0" class="edge-thickness-normal edge-pattern-solid edge-thickness-normal edge-pattern-solid flowchart-link" data-edge="true" data-et="edge" data-id="L_L_M_0" data-points="W3sieCI6OTMyLjc0NjA5Mzc1LCJ5IjoyODJ9LHsieCI6OTMyLjc0NjA5Mzc1LCJ5IjozMTl9LHsieCI6OTMyLjc0NjA5Mzc1LCJ5IjozNDR9XQ==" marker-end="url(#mermaid-iyu5t0nw1_flowchart-v2-pointEnd)"></path></g><g class="edgeLabels"><g class="edgeLabel"><g class="label" data-id="L_A_B_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_B_C_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_B_D_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_B_E_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_B_F_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_C_D_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_D_G_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_G_H_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_G_I_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_H_J_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_I_K_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_K_B_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_B_L_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g><g class="edgeLabel"><g class="label" data-id="L_L_M_0" transform="translate(0, 0)"><foreignObject width="0" height="0"></foreignObject></g></g></g><g class="nodes"><g class="node default" id="flowchart-A-0" transform="translate(506.2421875, 35)"><rect class="basic label-container" x="-125.8828125" y="-27" width="251.765625" height="54"></rect><g class="label" transform="translate(-95.8828125, -12)"><rect></rect><foreignObject width="191.765625" height="24">ONBOARDING대화형환경설정</foreignObject></g></g><g class="node default" id="flowchart-B-1" transform="translate(506.2421875, 139)"><rect class="basic label-container" x="-73.7578125" y="-27" width="147.515625" height="54"></rect><g class="label" transform="translate(-43.7578125, -12)"><rect></rect><foreignObject width="87.515625" height="24">HOME홈 화면</foreignObject></g></g><g class="node default" id="flowchart-C-3" transform="translate(639.234375, 255)"><rect class="basic label-container" x="-130" y="-39" width="260" height="78"></rect><g class="label" transform="translate(-100, -24)"><rect></rect><foreignObject width="200" height="48">VOICE_INPUT_CONFIRM음성 입력 확인</foreignObject></g></g><g class="node default" id="flowchart-D-5" transform="translate(306.1171875, 383)"><rect class="basic label-container" x="-130" y="-39" width="260" height="78"></rect><g class="label" transform="translate(-100, -24)"><rect></rect><foreignObject width="200" height="48">MODE_SELECTION구매 방식 선택</foreignObject></g></g><g class="node default" id="flowchart-E-7" transform="translate(122.6328125, 255)"><rect class="basic label-container" x="-114.6328125" y="-27" width="229.265625" height="54"></rect><g class="label" transform="translate(-84.6328125, -12)"><rect></rect><foreignObject width="169.265625" height="24">CART_VIEW장바구니 보기</foreignObject></g></g><g class="node default" id="flowchart-F-9" transform="translate(373.25, 255)"><rect class="basic label-container" x="-85.984375" y="-27" width="171.96875" height="54"></rect><g class="label" transform="translate(-55.984375, -12)"><rect></rect><foreignObject width="111.96875" height="24">AI Chat채팅 모달</foreignObject></g></g><g class="node default" id="flowchart-G-13" transform="translate(306.1171875, 499)"><rect class="basic label-container" x="-113.5625" y="-27" width="227.125" height="54"></rect><g class="label" transform="translate(-83.5625, -12)"><rect></rect><foreignObject width="167.125" height="24">TOP3_RESULTTop 3 추천</foreignObject></g></g><g class="node default" id="flowchart-H-15" transform="translate(172.85546875, 603)"><rect class="basic label-container" x="-124.71875" y="-27" width="249.4375" height="54"></rect><g class="label" transform="translate(-94.71875, -12)"><rect></rect><foreignObject width="189.4375" height="24">PLAN_DETAIL상세 품목/가격</foreignObject></g></g><g class="node default" id="flowchart-I-17" transform="translate(796.84375, 603)"><rect class="basic label-container" x="-91.8046875" y="-27" width="183.609375" height="54"></rect><g class="label" transform="translate(-61.8046875, -12)"><rect></rect><foreignObject width="123.609375" height="24">PAYMENT결제 확인</foreignObject></g></g><g class="node default" id="flowchart-J-19" transform="translate(172.85546875, 707)"><rect class="basic label-container" x="-123.2109375" y="-27" width="246.421875" height="54"></rect><g class="label" transform="translate(-93.2109375, -12)"><rect></rect><foreignObject width="186.421875" height="24">ITEM_DETAIL상품 상세/대체</foreignObject></g></g><g class="node default" id="flowchart-K-21" transform="translate(1034.34375, 707)"><rect class="basic label-container" x="-106.109375" y="-27" width="212.21875" height="54"></rect><g class="label" transform="translate(-76.109375, -12)"><rect></rect><foreignObject width="152.21875" height="24">COMPLETION주문 완료</foreignObject></g></g><g class="node default" id="flowchart-L-25" transform="translate(932.74609375, 255)"><rect class="basic label-container" x="-97.0234375" y="-27" width="194.046875" height="54"></rect><g class="label" transform="translate(-67.0234375, -12)"><rect></rect><foreignObject width="134.046875" height="24">MY_PAGE마이페이지</foreignObject></g></g><g class="node default" id="flowchart-M-27" transform="translate(932.74609375, 383)"><rect class="basic label-container" x="-130" y="-39" width="260" height="78"></rect><g class="label" transform="translate(-100, -24)"><rect></rect><foreignObject width="200" height="48">PREFERRED_BRANDS선호 브랜드</foreignObject></g></g></g></g></g></svg></div></div></pre>
