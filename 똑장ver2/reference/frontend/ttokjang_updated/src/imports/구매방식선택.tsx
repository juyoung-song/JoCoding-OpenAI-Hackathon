import svgPaths from "./svg-dfjnsv4w9j";
import { useApp } from "../app/store/AppContext";
function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[30px] not-italic relative shrink-0 text-[#0f172a] text-[24px] w-full whitespace-pre-wrap">
        <p className="mb-0">어떻게 장을</p>
        <p>보시겠어요?</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">장바구니에 담은 상품의 구매 방식을 선택해주세요.</p>
      </div>
    </div>
  );
}

function InstructionalText() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Instructional Text">
      <Heading1 />
      <Container />
    </div>
  );
}

function InstructionalTextMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[32px] pt-[8px] relative shrink-0 w-full" data-name="Instructional Text:margin">
      <InstructionalText />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[111.184px] right-[2px] top-[2px] w-[129.67px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 129.67 111.184">
        <g id="Container" opacity="0.1">
          <path d={svgPaths.p1531e600} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute bg-[rgba(19,127,236,0.1)] content-stretch flex items-center left-0 px-[10px] py-[4px] rounded-[8px] top-0" data-name="Overlay">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_0px_0px_1px_rgba(19,127,236,0.2)]" data-name="Overlay+Shadow" />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] w-[82.08px]">
        <p className="leading-[16px] whitespace-pre-wrap">🚀 가장 편리해요</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[40px]" data-name="Heading 3">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] w-[104.75px]">
        <p className="leading-[28px] whitespace-pre-wrap">온라인 주문</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[72px]" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] w-[123.2px]">
        <p className="leading-[20px] whitespace-pre-wrap">집 앞으로 배송 받기</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[12.656px] relative shrink-0 w-[13.008px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.0078 12.6562">
        <g id="Container">
          <path d={svgPaths.p20ed4a00} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(19,127,236,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] w-[204.77px]">
        <p className="leading-[16px] whitespace-pre-wrap">오늘 밤 11시 전 주문 시 내일 새벽 도착</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-0 right-0 top-[116px]" data-name="Container">
      <Overlay1 />
      <Container6 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[156px] relative shrink-0 w-[290px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Overlay />
        <Heading2 />
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function ButtonOption1OnlineBlueTheme() {
  const { setCurrentScreen, setSelectedMode } = useApp();
  return (
    <div 
      className="bg-white relative rounded-[24px] shrink-0 w-full cursor-pointer hover:bg-blue-50 transition-colors active:scale-95" 
      data-name="Button - Option 1: Online (Blue Theme)"
      onClick={() => {
        setSelectedMode('ONLINE');
        setCurrentScreen('TOP3_RESULT');
      }}
    >
      <div aria-hidden="true" className="absolute border-2 border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[24px]" />
      <div className="content-stretch flex flex-col items-start p-[26px] relative w-full">
        <Container1 />
        <Container2 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[117.186px] right-[2px] top-[2px] w-[123.302px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 123.302 117.186">
        <g id="Container" opacity="0.1">
          <path d={svgPaths.p2a87f600} fill="var(--fill-0, #22C55E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="absolute bg-[rgba(34,197,94,0.1)] content-stretch flex items-center left-0 px-[10px] py-[4px] rounded-[8px] top-0" data-name="Overlay">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[8px] shadow-[0px_0px_0px_1px_rgba(34,197,94,0.2)]" data-name="Overlay+Shadow" />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#22c55e] text-[12px] w-[66.17px]">
        <p className="leading-[16px] whitespace-pre-wrap">🛒 배송비 0원</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[40px]" data-name="Heading 3">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[20px] w-[124.75px]">
        <p className="leading-[28px] whitespace-pre-wrap">오프라인 방문</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[72px]" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] w-[147.47px]">
        <p className="leading-[20px] whitespace-pre-wrap">매장에서 직접 구매하기</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[12.656px] relative shrink-0 w-[13.008px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.0078 12.6562">
        <g id="Container">
          <path d={svgPaths.p20ed4a00} fill="var(--fill-0, #22C55E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(34,197,94,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] w-[215.63px]">
        <p className="leading-[16px] whitespace-pre-wrap">매장 재고 확인 및 위치 안내 서비스 제공</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-0 right-0 top-[116px]" data-name="Container">
      <Overlay3 />
      <Container12 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[156px] relative shrink-0 w-[290px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Overlay2 />
        <Heading3 />
        <Container9 />
        <Container10 />
      </div>
    </div>
  );
}

function ButtonOption2OfflineGreenTheme() {
  const { setCurrentScreen, setSelectedMode } = useApp();
  return (
    <div 
      className="bg-white relative rounded-[24px] shrink-0 w-full cursor-pointer hover:bg-green-50 transition-colors active:scale-95" 
      data-name="Button - Option 2: Offline (Green Theme)"
      onClick={() => {
        setSelectedMode('OFFLINE');
        setCurrentScreen('TOP3_RESULT');
      }}
    >
      <div aria-hidden="true" className="absolute border-2 border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[24px]" />
      <div className="content-stretch flex flex-col items-start p-[26px] relative w-full">
        <Container7 />
        <Container8 />
      </div>
    </div>
  );
}

function DecisionCardsContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative w-full" data-name="Decision Cards Container">
      <ButtonOption1OnlineBlueTheme />
      <ButtonOption2OfflineGreenTheme />
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 size-[11.648px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6484 11.6484">
        <g id="Container">
          <path d={svgPaths.p3f012f80} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Container">
      <Container14 />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] text-center w-[283.41px]">
        <p className="leading-[16px] whitespace-pre-wrap">온/오프라인 구매 시 상품 가격이 상이할 수 있습니다.</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#f8fafc] content-stretch flex items-start p-[12px] relative rounded-[12px] shrink-0" data-name="Background">
      <Container13 />
    </div>
  );
}

function FooterDisclaimer() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Footer / Disclaimer">
      <Background />
    </div>
  );
}

function FooterDisclaimerMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] pt-[32px] relative shrink-0 w-full" data-name="Footer / Disclaimer:margin">
      <FooterDisclaimer />
    </div>
  );
}

function MainContent() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[80px_0_24px_0] items-start px-[24px] py-[16px]" data-name="Main Content">
      <InstructionalTextMargin />
      <DecisionCardsContainer />
      <FooterDisclaimerMargin />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[15.188px] relative shrink-0 w-[15.609px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.6094 15.1875">
        <g id="Container">
          <path d={svgPaths.p2fd7b00} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonGoBack() {
  const { setCurrentScreen } = useApp();
  return (
    <div 
      className="absolute content-stretch flex flex-col items-center justify-center left-[-8px] p-[8px] rounded-[9999px] top-0 cursor-pointer hover:bg-slate-100" 
      data-name="Button - Go back"
      onClick={() => setCurrentScreen('VOICE_INPUT_CONFIRM')}
    >
      <Container15 />
    </div>
  );
}

function ButtonGoBackMargin() {
  return (
    <div className="h-[40px] relative shrink-0 w-[32px]" data-name="Button - Go back:margin">
      <ButtonGoBack />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-[116.53px]">
        <p className="leading-[28px] whitespace-pre-wrap">구매 방식 선택</p>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute backdrop-blur-[2px] bg-[rgba(255,255,255,0.9)] content-stretch flex items-center justify-between left-0 pb-[16px] pl-[20px] pr-[140.74px] pt-[24px] right-0 top-0" data-name="Header">
      <ButtonGoBackMargin />
      <Heading />
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" data-name="구매 방식 선택" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(246, 247, 248) 0%, rgb(246, 247, 248) 100%)" }}>
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" data-name="Mobile Container:shadow" />
      <MainContent />
      <div className="absolute h-[24px] left-0 right-0 top-[860px]" data-name="Bottom Safe Area (simulated for iOS)" />
      <Header />
    </div>
  );
}