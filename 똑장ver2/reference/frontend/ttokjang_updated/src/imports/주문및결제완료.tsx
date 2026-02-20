import svgPaths from "./svg-f1hjvhtzgx";
import { useApp } from "../app/store/AppContext";
function Container() {
  return (
    <div className="relative shrink-0 size-[17.461px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.4609 17.4609">
        <g id="Container">
          <path d={svgPaths.p2f800b00} fill="var(--fill-0, #9CA3AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 cursor-pointer hover:bg-gray-100 rounded-full p-1" data-name="Button" onClick={() => setCurrentScreen('HOME')}>
      <Container />
    </div>
  );
}

function HeaderCloseAction() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header / Close Action">
      <div className="flex flex-row justify-end size-full">
        <div className="content-stretch flex items-start justify-end p-[24px] relative w-full">
          <Button />
        </div>
      </div>
    </div>
  );
}

function Heading1MainMessage() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 1 - Main Message">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[24px] text-center w-[253.8px]">
        <p className="leading-[32px] whitespace-pre-wrap">결제가 완료되었습니다!</p>
      </div>
    </div>
  );
}

function Heading1MainMessageMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[52.09px] pb-[8px] top-[144px]" data-name="Heading 1 - Main Message:margin">
      <Heading1MainMessage />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 pb-[0.625px] top-[-1.13px]" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[46px] justify-center leading-[22.75px] not-italic relative shrink-0 text-[#6b7280] text-[14px] text-center w-[207.92px] whitespace-pre-wrap">
        <p className="mb-0">똑똑한 장보기가 시작되었습니다.</p>
        <p>주문하신 내역을 확인해주세요.</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute h-[85.5px] left-[75.03px] top-[184px] w-[207.92px]" data-name="Margin">
      <Container1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[16px] text-center w-[88.53px]">
          <p className="leading-[24px] whitespace-pre-wrap">총 결제 금액</p>
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[20px] text-center w-[91.61px]">
          <p className="leading-[28px] whitespace-pre-wrap">52,000원</p>
        </div>
      </div>
    </div>
  );
}

function TotalAmount() {
  return (
    <div className="relative shrink-0 w-[244px]" data-name="Total Amount">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[17px] relative w-full">
        <Container2 />
        <Container3 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[9.352px] relative shrink-0 w-[12.852px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8516 9.35156">
        <g id="Container">
          <path d={svgPaths.p151a3a00} fill="var(--fill-0, #13EC13)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[32px]" data-name="Background+Shadow">
      <Container5 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col h-[36px] items-start pt-[4px] relative shrink-0 w-[32px]" data-name="Margin">
      <BackgroundShadow />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[51.2px]">
        <p className="leading-[16px] whitespace-pre-wrap">배송 예정</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[14px] w-[132.41px]">
        <p className="leading-[20px] whitespace-pre-wrap">오늘 18:00 도착 예정</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#13ec13] text-[12px] w-[75.2px]">
        <p className="leading-[16px] whitespace-pre-wrap">새벽배송 대상</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Container">
      <Container7 />
      <Container8 />
      <Container9 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Margin1 />
      <Container6 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[11.648px] relative shrink-0 w-[8.148px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.14844 11.6484">
        <g id="Container">
          <path d={svgPaths.p2c702200} fill="var(--fill-0, #13EC13)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-[32px]" data-name="Background+Shadow">
      <Container11 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col h-[36px] items-start pt-[4px] relative shrink-0 w-[32px]" data-name="Margin">
      <BackgroundShadow1 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[36px]">
        <p className="leading-[16px] whitespace-pre-wrap">배송지</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[14px] w-[174.14px]">
        <p className="leading-[20px] whitespace-pre-wrap">서울시 강남구 테헤란로 123</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[108.09px]">
        <p className="leading-[16px] whitespace-pre-wrap">똑장 오피스텔 101호</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Container">
      <Container13 />
      <Container14 />
      <Container15 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Margin2 />
      <Container12 />
    </div>
  );
}

function LogisticsInfo() {
  return (
    <div className="relative shrink-0 w-[244px]" data-name="Logistics Info">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Container4 />
        <Container10 />
      </div>
    </div>
  );
}

function OrderSummaryCard() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex flex-col gap-[16px] items-start left-[32px] p-[25px] right-[32px] rounded-[12px] top-[269.5px]" data-name="Order Summary Card">
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <TotalAmount />
      <LogisticsInfo />
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[18.32px] relative shrink-0 w-[18.75px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.75 18.3203">
        <g id="Container">
          <path d={svgPaths.p203bbb00} fill="var(--fill-0, #13EC13)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[12px] w-[80.86px]">
        <p className="leading-[16px] whitespace-pre-wrap">AI 소비 분석 팁</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[32px] justify-center leading-[16px] not-italic relative shrink-0 text-[#4b5563] text-[12px] w-[220.67px] whitespace-pre-wrap">
        <p className="mb-0">지난달보다 채소 구매 비중이 15% 늘었어</p>
        <p>요!</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative">
        <Container18 />
        <Container19 />
      </div>
    </div>
  );
}

function PromotionSmartTipSection() {
  return (
    <div className="bg-[rgba(19,236,19,0.05)] relative rounded-[8px] shrink-0 w-full" data-name="Promotion / Smart Tip Section">
      <div aria-hidden="true" className="absolute border border-[rgba(19,236,19,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[17px] relative w-full">
          <Container16 />
          <Container17 />
        </div>
      </div>
    </div>
  );
}

function PromotionSmartTipSectionMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pt-[24px] right-[32px] top-[510.5px]" data-name="Promotion / Smart Tip Section:margin">
      <PromotionSmartTipSection />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[10px] text-center w-[152.41px]">
        <p className="leading-[15px] whitespace-pre-wrap">주문번호: 20231024-ORD-88291</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[102.8px] pt-[24px] top-[776.5px]" data-name="Margin">
      <Container20 />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[20.109px] relative shrink-0 w-[26.367px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26.3672 20.1094">
        <g id="Container">
          <path d={svgPaths.p280a7b00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#13ec13] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[64px]" data-name="Background">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(255,255,255,0)] left-1/2 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(19,236,19,0.4),0px_4px_6px_-4px_rgba(19,236,19,0.4)] size-[64px] top-1/2" data-name="Overlay+Shadow" />
      <Container21 />
    </div>
  );
}

function SuccessAnimationIcon() {
  return (
    <div className="bg-[rgba(19,236,19,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[96px]" data-name="Success Animation/Icon">
      <Background />
    </div>
  );
}

function SuccessAnimationIconMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[131px] pb-[32px] top-[16px]" data-name="Success Animation/Icon:margin">
      <SuccessAnimationIcon />
    </div>
  );
}

function Button1() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="bg-[#13ec13] content-stretch flex items-center justify-center py-[16px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-green-500 transition-colors" data-name="Button" onClick={() => setCurrentScreen('HOME')}>
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(19,236,19,0.2),0px_4px_6px_-4px_rgba(19,236,19,0.2)]" data-name="Button:shadow" />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black text-center w-[115.8px]">
        <p className="leading-[24px] whitespace-pre-wrap">홈으로 돌아가기</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex items-center justify-center px-px py-[17px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#4b5563] text-[16px] text-center w-[84.03px]">
        <p className="leading-[24px] whitespace-pre-wrap">영수증 보기</p>
      </div>
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Action Buttons">
      <Button1 />
      <Button2 />
    </div>
  );
}

function ActionButtonsMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] pt-[32px] right-[32px] top-[618.5px]" data-name="Action Buttons:margin">
      <ActionButtons />
    </div>
  );
}

function ContentArea() {
  return (
    <div className="h-[847.5px] relative shrink-0 w-full" data-name="Content Area">
      <Heading1MainMessageMargin />
      <Margin />
      <OrderSummaryCard />
      <PromotionSmartTipSectionMargin />
      <div className="-translate-x-1/2 absolute left-1/2 size-0 top-[618.5px]" data-name="Spacer to push buttons to bottom if needed, though flex-1 handles it" />
      <Margin3 />
      <SuccessAnimationIconMargin />
      <ActionButtonsMargin />
    </div>
  );
}

function MobileContainer() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col items-start max-w-[448px] min-h-[800px] min-w-px overflow-clip relative rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" data-name="Mobile Container">
      <HeaderCloseAction />
      <ContentArea />
      <div className="absolute bg-gradient-to-r from-[rgba(19,236,19,0)] h-[8px] left-0 opacity-50 right-0 to-[rgba(19,236,19,0)] top-0 via-1/2 via-[rgba(19,236,19,0.5)]" data-name="Subtle decorative top gradient" />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#f6f8f6] content-stretch flex items-center justify-center px-[16px] py-[17.75px] relative size-full" data-name="주문 및 결제 완료">
      <MobileContainer />
    </div>
  );
}