import svgPaths from "./svg-qr2cpm5h99";
import { useApp } from "../app/store/AppContext";
import imgOrganicRedApples from "figma:asset/987b9dbf538986406e7191f6d372d5dcb6e1781f.png";
import imgFreshOrganicCarrots from "figma:asset/6209927ca6f782bbc0a9850e7a0c6eed69caa665.png";
import imgMilkCartonBottle from "figma:asset/932b50573f984e04d921a222de6244b5b5640f26.png";
function Container1() {
  return (
    <div className="h-[11.074px] relative shrink-0 w-[12.852px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8516 11.0742">
        <g id="Container">
          <path d={svgPaths.p1fb40200} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] w-[129.61px]">
        <p className="leading-[16px] whitespace-pre-wrap">똑장 에이전트 분석 완료</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative w-full">
        <Container1 />
        <Container2 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[10px] w-[140.11px]">
        <p className="leading-[15px] whitespace-pre-wrap">데이터 출처: 실시간 최저가 API</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[10px] w-[78.52px]">
        <p className="leading-[15px] whitespace-pre-wrap">업데이트: 방금 전</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Container4 />
        <Container5 />
      </div>
    </div>
  );
}

function TrustBlockAgentUi() {
  return (
    <div className="absolute bg-[rgba(19,127,236,0.05)] content-stretch flex flex-col gap-[4px] items-start left-0 pb-[13px] pt-[12px] px-[16px] right-0 top-[65px]" data-name="Trust Block (Agent UI)">
      <div aria-hidden="true" className="absolute border-[rgba(19,127,236,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <Container />
      <Container3 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[42px]">
        <p className="leading-[20px] whitespace-pre-wrap">배송지</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] text-center w-[24px]">
        <p className="leading-[16px] whitespace-pre-wrap">변경</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Button />
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[21.969px] relative shrink-0 w-[13.969px]" data-name="Margin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9688 21.9688">
        <g id="Margin">
          <path d={svgPaths.p15cb0e00} fill="var(--fill-0, #9CA3AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] w-[48px]">
        <p className="leading-[24px] whitespace-pre-wrap">김똑똑</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e5e7eb] content-stretch flex flex-col items-start px-[6px] py-[2px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#4b5563] text-[10px] w-[52.81px]">
        <p className="leading-[15px] whitespace-pre-wrap">기본 배송지</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Background />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[39px] justify-center leading-[19.25px] not-italic relative shrink-0 text-[#4b5563] text-[14px] w-[202.7px] whitespace-pre-wrap">
        <p className="mb-0">서울특별시 강남구 테헤란로 123</p>
        <p>똑장빌딩 15층 1501호</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[87.03px]">
        <p className="leading-[16px] whitespace-pre-wrap">010-1234-5678</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative">
        <Container8 />
        <Container10 />
        <Container11 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-[#f9fafb] relative rounded-[12px] shrink-0 w-full" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="content-stretch flex gap-[12px] items-start p-[17px] relative w-full">
        <Margin />
        <Container7 />
      </div>
    </div>
  );
}

function SectionDeliveryAddress() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Section - Delivery Address">
      <Container6 />
      <BackgroundBorderShadow />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex gap-[4px] items-start leading-[0] not-italic relative shrink-0 text-[14px]" data-name="Heading 2">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center relative shrink-0 text-[#111827] w-[62.64px]">
        <p className="leading-[20px] whitespace-pre-wrap">{`주문 상품 `}</p>
      </div>
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[20px] justify-center relative shrink-0 text-[#137fec] w-[9.05px]">
        <p className="leading-[20px] whitespace-pre-wrap">3</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Heading2 />
    </div>
  );
}

function OrganicRedApples() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[78px]" data-name="Organic Red Apples">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgOrganicRedApples} />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#f3f4f6] relative rounded-[8px] shrink-0 size-[80px]" data-name="Background+Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <OrganicRedApples />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">이마트몰</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">당도선별 제주 감귤 3kg (로얄과)</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Heading3 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[47.72px]">
        <p className="leading-[16px] whitespace-pre-wrap">수량: 1개</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] w-[70.09px]">
        <p className="leading-[24px] whitespace-pre-wrap">12,900원</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container18 />
      <Container19 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px py-[2px] relative self-stretch" data-name="Container">
      <Container15 />
      <Container17 />
    </div>
  );
}

function Item() {
  return (
    <div className="bg-white content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item 1">
      <BackgroundBorder />
      <Container14 />
    </div>
  );
}

function FreshOrganicCarrots() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[78px]" data-name="Fresh organic carrots">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFreshOrganicCarrots} />
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-[#f3f4f6] relative rounded-[8px] shrink-0 size-[80px]" data-name="Background+Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <FreshOrganicCarrots />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">홈플러스</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">무농약 흙당근 1봉 (500g)</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Container">
      <Container22 />
      <Heading4 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[50.16px]">
        <p className="leading-[16px] whitespace-pre-wrap">수량: 2개</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] w-[62.77px]">
        <p className="leading-[24px] whitespace-pre-wrap">3,500원</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container24 />
      <Container25 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px py-[2px] relative self-stretch" data-name="Container">
      <Container21 />
      <Container23 />
    </div>
  );
}

function Item1() {
  return (
    <div className="bg-white content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item 2">
      <BackgroundBorder1 />
      <Container20 />
    </div>
  );
}

function MilkCartonBottle() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[78px]" data-name="Milk carton bottle">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgMilkCartonBottle} />
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="bg-[#f3f4f6] relative rounded-[8px] shrink-0 size-[80px]" data-name="Background+Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <MilkCartonBottle />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">쿠팡프레시</p>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">서울우유 나 100% 1000ml</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Container">
      <Container28 />
      <Heading5 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[47.72px]">
        <p className="leading-[16px] whitespace-pre-wrap">수량: 1개</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] w-[62.83px]">
        <p className="leading-[24px] whitespace-pre-wrap">2,980원</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container30 />
      <Container31 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px min-w-px py-[2px] relative self-stretch" data-name="Container">
      <Container27 />
      <Container29 />
    </div>
  );
}

function Item2() {
  return (
    <div className="bg-white content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item 3">
      <BackgroundBorder2 />
      <Container26 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Item />
      <Item1 />
      <Item2 />
    </div>
  );
}

function SectionOrderItems() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Section - Order Items">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">결제 수단</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[20.031px] relative shrink-0 w-[19.969px]" data-name="Margin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9688 20.0312">
        <g id="Margin">
          <path d={svgPaths.p12d06ab4} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container33() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] w-[48px]">
          <p className="leading-[16px] whitespace-pre-wrap">신용카드</p>
        </div>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="bg-[rgba(19,127,236,0.05)] h-[96px] relative rounded-[12px] shrink-0 w-full" data-name="Label">
      <div aria-hidden="true" className="absolute border-2 border-[#137fec] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[14px] relative size-full">
          <Margin1 />
          <Container33 />
        </div>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[5.586px] relative shrink-0 w-[7.324px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.32422 5.58594">
        <g id="Container">
          <path d={svgPaths.p21d8e700} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#137fec] content-stretch flex items-center justify-center right-[8px] rounded-[9999px] size-[16px] top-[8px]" data-name="Background">
      <Container34 />
    </div>
  );
}

function Option1Selected() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0 w-[111.33px]" data-name="Option 1: Selected">
      <Label />
      <Background1 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[4px] relative">
        <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#03c75a] text-[20px] w-[15.25px]">
          <p className="leading-[28px] whitespace-pre-wrap">N</p>
        </div>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[60px]">
          <p className="leading-[16px] whitespace-pre-wrap">네이버페이</p>
        </div>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="bg-[#f9fafb] h-[96px] relative rounded-[12px] shrink-0 w-full" data-name="Label">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[14px] relative size-full">
          <Margin2 />
          <Container35 />
        </div>
      </div>
    </div>
  );
}

function Option() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0 w-[111.33px]" data-name="Option 2">
      <Label1 />
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 size-[11.648px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6484 11.6484">
        <g id="Container">
          <path d={svgPaths.p2674200} fill="var(--fill-0, black)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#fae100] content-stretch flex items-center justify-center relative rounded-[4px] shrink-0 size-[24px]" data-name="Background">
      <Container36 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="h-[28px] relative shrink-0 w-[24px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[4px] relative size-full">
        <Background2 />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[60px]">
          <p className="leading-[16px] whitespace-pre-wrap">카카오페이</p>
        </div>
      </div>
    </div>
  );
}

function Label2() {
  return (
    <div className="bg-[#f9fafb] h-[96px] relative rounded-[12px] shrink-0 w-full" data-name="Label">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[14px] relative size-full">
          <Margin3 />
          <Container37 />
        </div>
      </div>
    </div>
  );
}

function Option1() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0 w-[111.34px]" data-name="Option 3">
      <Label2 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex gap-[12px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Option1Selected />
      <Option />
      <Option1 />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#2563eb] content-stretch flex h-[20px] items-center justify-center relative rounded-[4px] shrink-0 w-[32px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[8px] text-center text-white tracking-[-0.4px] w-[17.72px]">
        <p className="leading-[12px] whitespace-pre-wrap">VISA</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#374151] text-[14px] w-[102.08px]">
        <p className="leading-[20px] whitespace-pre-wrap">현대카드 (1234)</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <Background3 />
        <Container39 />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[4.32px] relative shrink-0 w-[7px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 4.32031">
        <g id="Container">
          <path d={svgPaths.p255cd6c0} fill="var(--fill-0, #9CA3AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function CardSelectDropdownVisibleOnlyIfCardSelectedSimulated() {
  return (
    <div className="bg-[#f9fafb] relative rounded-[8px] shrink-0 w-full" data-name="Card Select Dropdown (Visible only if card selected - simulated)">
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[13px] relative w-full">
          <Container38 />
          <Container40 />
        </div>
      </div>
    </div>
  );
}

function SectionPaymentMethod() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Section - Payment Method">
      <Heading6 />
      <Container32 />
      <CardSelectDropdownVisibleOnlyIfCardSelectedSimulated />
    </div>
  );
}

function Container42() {
  return (
    <div className="relative shrink-0 size-[16.641px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6406 16.6406">
        <g id="Container">
          <path d={svgPaths.p33732e80} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[59.73px]">
        <p className="leading-[20px] whitespace-pre-wrap">똑장 쿠폰</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <Container42 />
        <Container43 />
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[14px] w-[115.27px]">
        <p className="leading-[20px] whitespace-pre-wrap">1,000원 할인 적용</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[7px] relative shrink-0 w-[4.32px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.32031 7">
        <g id="Container">
          <path d={svgPaths.p33f04e70} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center relative">
        <Container45 />
        <Container46 />
      </div>
    </div>
  );
}

function SectionCouponDiscount() {
  return (
    <div className="content-stretch flex items-center justify-between py-[13px] relative shrink-0 w-full" data-name="Section - Coupon / Discount">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b border-solid border-t inset-0 pointer-events-none" />
      <Container41 />
      <Container44 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] w-[77.88px]">
        <p className="leading-[20px] whitespace-pre-wrap">총 상품 금액</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[58.78px]">
        <p className="leading-[20px] whitespace-pre-wrap">19,380원</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container48 />
      <Container49 />
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] w-[42px]">
        <p className="leading-[20px] whitespace-pre-wrap">배송비</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[66.53px]">
        <p className="leading-[20px] whitespace-pre-wrap">+ 3,000원</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container51 />
      <Container52 />
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[14px] w-[59.94px]">
        <p className="leading-[20px] whitespace-pre-wrap">할인 금액</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[14px] w-[61.02px]">
        <p className="leading-[20px] whitespace-pre-wrap">- 1,000원</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container54 />
      <Container55 />
    </div>
  );
}

function Container56() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] w-[103.58px]">
          <p className="leading-[24px] whitespace-pre-wrap">최종 결제 금액</p>
        </div>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[20px] w-[86.86px]">
          <p className="leading-[28px] whitespace-pre-wrap">21,380원</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex items-center justify-between pt-[13px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-solid border-t inset-0 pointer-events-none" />
      <Container56 />
      <Container57 />
    </div>
  );
}

function SectionPriceBreakdown() {
  return (
    <div className="bg-[#f9fafb] relative rounded-[12px] shrink-0 w-full" data-name="Section - Price Breakdown">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[20px] relative w-full">
        <Container47 />
        <Container50 />
        <Container53 />
        <HorizontalBorder />
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="h-[14.824px] relative shrink-0 w-[13.125px]" data-name="Margin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.125 14.8242">
        <g id="Margin">
          <path d={svgPaths.p3875380} fill="var(--fill-0, #16A34A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[3.27px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#166534] text-[12px] w-[308.73px] whitespace-pre-wrap">
        <p className="mb-0">
          <span className="leading-[16px]">똑장 Tip:</span>
          <span className="font-['WenQuanYi_Zen_Hei:Medium',sans-serif] leading-[16px] not-italic">{` 대형마트 3사의 가격을 비교하여 가장 저렴한 조`}</span>
        </p>
        <p className="font-['WenQuanYi_Zen_Hei:Medium',sans-serif] leading-[16px]">합으로 구성했습니다. 약 2,400원을 절약했어요!</p>
      </div>
    </div>
  );
}

function AgentTip() {
  return (
    <div className="bg-[#f0fdf4] relative rounded-[8px] shrink-0 w-full" data-name="Agent Tip">
      <div className="content-stretch flex gap-[8px] items-start p-[12px] relative w-full">
        <Margin4 />
        <Container58 />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-0 pb-[72px] pt-[16px] px-[16px] right-0 top-[129px]" data-name="Main Content">
      <SectionDeliveryAddress />
      <SectionOrderItems />
      <div className="bg-[#f3f4f6] h-px shrink-0 w-full" data-name="Divider" />
      <SectionPaymentMethod />
      <SectionCouponDiscount />
      <SectionPriceBreakdown />
      <AgentTip />
    </div>
  );
}

function Container59() {
  return (
    <div className="h-[19.969px] relative shrink-0 w-[11.766px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.7656 19.9688">
        <g id="Container">
          <path d={svgPaths.p32c89f00} fill="var(--fill-0, #4B5563)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[-8px] p-[8px] top-0 cursor-pointer hover:bg-slate-100" data-name="Button" onClick={() => setCurrentScreen('TOP3_RESULT')}>
      <Container59 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="h-[40px] relative shrink-0 w-[32px]" data-name="Button:margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button1 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Heading 1">
      <div className="flex flex-col items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pr-[32px] relative w-full">
          <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[18px] text-center w-[116.53px]">
            <p className="leading-[28px] whitespace-pre-wrap">주문 결제 확인</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute backdrop-blur-[2px] bg-[rgba(255,255,255,0.9)] content-stretch flex items-center justify-between left-0 pb-[13px] pt-[12px] px-[16px] right-0 top-0" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b border-solid inset-0 pointer-events-none" />
      <ButtonMargin />
      <Heading />
    </div>
  );
}

function MobileContainer() {
  return (
    <div className="bg-white flex-[1_0_0] max-w-[448px] min-h-[1382px] min-w-px relative self-stretch" data-name="Mobile Container">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" data-name="Mobile Container:shadow" />
      <TrustBlockAgentUi />
      <MainContent />
      <Header />
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white w-[154.44px]">
        <p className="leading-[28px] whitespace-pre-wrap">21,380원 결제하기</p>
      </div>
    </div>
  );
}

function Button2() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="bg-[#137fec] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-blue-600 transition-colors" data-name="Button" onClick={() => setCurrentScreen('COMPLETION')}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center py-[16px] relative w-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.3),0px_4px_6px_-4px_rgba(59,130,246,0.3)]" data-name="Button:shadow" />
        <Container60 />
      </div>
    </div>
  );
}

function StickyFooter() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex flex-col items-start left-0 max-w-[448px] pb-[32px] pt-[17px] px-[16px] right-0" data-name="Sticky Footer">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-solid border-t inset-0 pointer-events-none" />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]" data-name="Sticky Footer:shadow" />
      <Button2 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#f6f7f8] content-stretch flex items-start justify-center relative size-full" data-name="온라인 주문 결제 확인">
      <MobileContainer />
      <StickyFooter />
    </div>
  );
}