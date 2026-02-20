# 똑장 (똑똑한 장보기) 🛒✨

> **“더 싸고 더 빠르게.”**  
> 장바구니를 만들면 **가격 비교 → 플랜 추천 → 구매 흐름**까지 한 번에 이어주는 장보기 에이전트 UI 프로토타입입니다.

- 디자인 원본(Figma): https://www.figma.com/design/xUMUVd5s2BZg77EEE1RcAK/%EB%98%91%EC%9E%A5
- 현재 레포는 **Vite + React + TypeScript + Tailwind** 기반의 프론트엔드 번들이며, 화면 단위 컴포넌트가 `src/imports/`와 `src/app/components/`에 구성되어 있습니다.

---

## 미리보기(화면 흐름)

앱 내부에서는 `AppContext`로 현재 화면 상태를 관리하며, 아래와 같은 사용자 흐름을 구성합니다.

1. **대화형 환경설정** → `src/imports/대화형환경설정`
2. **음성 입력 확인/수정** → `src/imports/음성입력확인및수정`
3. **구매 방식 선택** → `src/imports/구매방식선택`
4. **상세 품목/가격 확인** → `src/imports/상세품목및가격확인`
5. **온라인 주문/결제 확인** → `src/imports/온라인주문결제확인`
6. **주문/결제 완료** → `src/imports/주문및결제완료`

추가로, 앱 하단 탭/결과 화면은 다음 컴포넌트로 구성되어 있습니다.

- Home: `src/app/components/HomeScreen.tsx`
- Top3 결과: `src/app/components/Top3ResultScreen.tsx`
- 마이페이지: `src/app/components/MyPageScreen.tsx`
- 선호/비선호 브랜드: `PreferredBrandsScreen.tsx` / `NonPreferredBrandsScreen.tsx`
- 장바구니 보기: `CartViewScreen.tsx`
- 채팅 모달: `src/imports/똑장Ai채팅모달_NEW`

---

## 기술 스택

- **Vite** (dev server / build)
- **React 18 + TypeScript**
- **Tailwind CSS** (+ `tailwind-merge`, `clsx`)
- **Radix UI** 기반 shadcn 스타일 컴포넌트 (`src/app/components/ui/*`)
- **motion**(Framer Motion 호환) / **lucide-react** 아이콘
- (옵션) **Supabase Edge Functions** 코드 포함: `supabase/functions/server/*`

---

## 빠른 시작

### 1) 설치

```bash
npm i
```

### 2) 개발 서버 실행

```bash
npm run dev
```

### 3) 빌드 / 프리뷰

```bash
npm run build
npm run preview
```

> Node 버전은 LTS(예: 18/20) 사용을 권장합니다.

---

## 프로젝트 구조

```text
.
├─ src/
│  ├─ main.tsx                # 엔트리
│  ├─ app/
│  │  ├─ App.tsx              # 화면 전환/레이아웃(하단 네비, 채팅 모달 등)
│  │  ├─ store/AppContext.tsx # 전역 UI 상태 (currentScreen 등)
│  │  └─ components/
│  │     ├─ HomeScreen.tsx
│  │     ├─ Top3ResultScreen.tsx
│  │     ├─ MyPageScreen.tsx
│  │     └─ ui/*              # 공용 UI 컴포넌트 모음
│  ├─ imports/                # Figma에서 가져온 화면 단위 컴포넌트들
│  ├─ assets/                 # 이미지 리소스
│  └─ styles/                 # 전역 스타일
├─ supabase/functions/server/ # (옵션) 서버/kv_store 예시 코드
├─ guidelines/                # 가이드 문서
└─ ATTRIBUTIONS.md            # 사용 리소스/라이선스
```

---

## 개발 메모

### 화면 전환 로직
- `AppContext`에서 `currentScreen` 값을 바꾸며 화면을 교체합니다.
- 채팅 모달은 `isChatOpen`으로 열고 닫습니다.

### UI 컴포넌트
- `src/app/components/ui/`는 Radix UI 기반 공용 컴포넌트 모음입니다.
- 필요 시 해당 폴더에서 컴포넌트를 가져다 쓰는 방식으로 화면을 조립합니다.

---

## 라이선스 / 크레딧

- 디자인 및 에셋 관련 고지: `ATTRIBUTIONS.md` 참고
