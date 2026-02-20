import svgPaths from "./svg-7552qr6n5o";
import { useApp } from "../app/store/AppContext";
import imgBackgroundShadow from "figma:asset/b940a41ff5a97f8d4babb998db9d7e0565e14975.png";
import imgBackgroundShadow1 from "figma:asset/8e8ad45e5b56db72ff9012ffc1053df12001e932.png";
import imgBackgroundShadow2 from "figma:asset/62c107aadf418ad78e7520cbb5f72ae673d8aa9d.png";
function Container() {
  return (
    <div className="relative shrink-0 size-[25px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="Container">
          <path d={svgPaths.p49e8c80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function FloatingActionButtonFab() {
  const { setIsChatOpen } = useApp();
  return (
    <div 
      className="absolute bg-[#137fec] bottom-[96px] content-stretch flex items-center justify-center right-[24px] rounded-[9999px] size-[56px] z-[4] cursor-pointer hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl active:scale-95" 
      data-name="Floating Action Button (FAB)"
      onClick={() => setIsChatOpen(true)}
    >
      <div className="absolute bg-[rgba(255,255,255,0)] bottom-0 right-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(19,127,236,0.4),0px_4px_6px_-4px_rgba(19,127,236,0.4)] size-[56px]" data-name="Floating Action Button (FAB):shadow" />
      <Container />
      <div className="absolute bg-[#ef4444] right-0 rounded-[9999px] size-[16px] top-0" data-name="Optional Notification Dot">
        <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
        <g id="Container">
          <path d={svgPaths.p12a32500} fill="var(--fill-0, #617589)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#617589] text-[10px] tracking-[0.5px] uppercase w-[10.5px]">
        <p className="leading-[15px] whitespace-pre-wrap">홈</p>
      </div>
    </div>
  );
}

function Link() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-center min-h-px min-w-px relative self-stretch cursor-pointer hover:bg-slate-50 rounded-lg p-1" data-name="Link" onClick={() => setCurrentScreen('HOME')}>
      <Container2 />
      <Container3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p8a35e00} fill="var(--fill-0, #617589)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#617589] text-[10px] tracking-[0.5px] uppercase w-[21px]">
        <p className="leading-[15px] whitespace-pre-wrap">검색</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Link">
      <Container4 />
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="Container">
          <path d={svgPaths.p27114680} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[10px] tracking-[0.5px] uppercase w-[21px]">
        <p className="leading-[15px] whitespace-pre-wrap">추천</p>
      </div>
    </div>
  );
}

function Link2() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-center min-h-px min-w-px relative self-stretch cursor-pointer hover:bg-slate-50 rounded-lg p-1" data-name="Link" onClick={() => setCurrentScreen('TOP3_RESULT')}>
      <Container6 />
      <Container7 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[18.35px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18.35">
        <g id="Container">
          <path d={svgPaths.p279a9400} fill="var(--fill-0, #617589)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#617589] text-[10px] tracking-[0.5px] uppercase w-[10.5px]">
        <p className="leading-[15px] whitespace-pre-wrap">찜</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Link">
      <Container8 />
      <Container9 />
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p85bff00} fill="var(--fill-0, #617589)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#617589] text-[10px] tracking-[0.5px] uppercase w-[21px]">
        <p className="leading-[15px] whitespace-pre-wrap">마이</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Link">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-start justify-center pb-[24px] pt-[8px] px-[16px] relative w-full">
          <Link />
          <Link1 />
          <Link2 />
          <Link3 />
          <Link4 />
        </div>
      </div>
    </div>
  );
}

function BottomNavigationBar() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex flex-col items-start left-0 max-w-[672px] pt-px right-0 z-[3]" data-name="Bottom Navigation Bar">
      <div aria-hidden="true" className="absolute border-[#f0f2f4] border-solid border-t inset-0 pointer-events-none" />
      <Container1 />
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #111418)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[40px]" data-name="Container">
      <Container14 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Heading 2">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center pr-[40px] relative w-full">
          <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[23px] justify-center leading-[0] not-italic relative shrink-0 text-[#111418] text-[18px] text-center tracking-[-0.45px] w-[74.02px]">
            <p className="leading-[22.5px] whitespace-pre-wrap">추천 상품</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="max-w-[672px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between max-w-[inherit] p-[16px] relative w-full">
          <Container13 />
          <Heading1 />
        </div>
      </div>
    </div>
  );
}

function HeaderSection() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-start pb-px relative shrink-0 w-full z-[2]" data-name="Header Section">
      <div aria-hidden="true" className="absolute border-[#dbe0e6] border-b border-solid inset-0 pointer-events-none" />
      <Container12 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="relative shrink-0 size-[41px]" data-name="Overlay">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 41 41">
        <g id="Overlay">
          <rect fill="var(--fill-0, #137FEC)" fillOpacity="0.1" height="41" rx="20.5" width="41" />
          <path d={svgPaths.p2b8dd00} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[30px] justify-center leading-[0] not-italic relative shrink-0 text-[#111418] text-[24px] w-[283.48px]">
        <p className="leading-[30px] whitespace-pre-wrap">구매해 주셔서 감사합니다!</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Overlay />
      <Heading />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[#617589] text-[16px] w-full whitespace-pre-wrap">
        <p className="mb-0">주문이 성공적으로 완료되었습니다. 고객님을 위</p>
        <p>한 특별한 제안을 확인해보세요.</p>
      </div>
    </div>
  );
}

function SuccessConfirmation() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 pb-[16px] pt-[32px] px-[16px] right-0 top-0" data-name="Success Confirmation">
      <Container15 />
      <Container16 />
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 size-[18.333px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
        <g id="Container">
          <path d={svgPaths.p3ca8ed80} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111418] text-[16px] w-[83.8px]">
        <p className="leading-[24px] whitespace-pre-wrap">맞춤형 추천</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Container20 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[42px] justify-center leading-[21px] not-italic relative shrink-0 text-[#617589] text-[14px] w-[303.63px] whitespace-pre-wrap">
        <p className="mb-0">고객님의 최근 쇼핑 내역과 선호도를 분석하여 선</p>
        <p>별한 아이템입니다.</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative">
        <Container18 />
        <Container21 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[10px] relative shrink-0 w-[6.167px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.16667 10">
        <g id="Container">
          <path d={svgPaths.p2ba68100} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[21px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[14px] text-center tracking-[0.35px] w-[46.72px]">
          <p className="leading-[21px] whitespace-pre-wrap">더 보기</p>
        </div>
        <Container22 />
      </div>
    </div>
  );
}

function TrustBlockPersonalizationInfo() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start justify-between left-[16px] p-[21px] right-[16px] rounded-[12px] top-[172px]" data-name="Trust Block / Personalization Info">
      <div aria-hidden="true" className="absolute border border-[#dbe0e6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container17 />
      <Button />
    </div>
  );
}

function SectionTitleHeading() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[16px] pt-[24px] right-[16px] top-[341px]" data-name="Section Title → Heading 3">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#111418] text-[20px] w-[214.22px]">
        <p className="leading-[28px] whitespace-pre-wrap">회원님을 위한 추천 상품</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[15.292px] relative shrink-0 w-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15.2917">
        <g id="Container">
          <path d={svgPaths.p28063980} fill="var(--fill-0, #617589)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute backdrop-blur-[4px] bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-center justify-center p-[8px] right-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <Container23 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="aspect-[4/5] overflow-clip relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Background+Shadow">
      <Button1 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium justify-center leading-[17.5px] not-italic relative shrink-0 text-[#111418] text-[14px] w-full whitespace-pre-wrap">
        <p className="mb-0">[유기농] 신선한 A2 우유</p>
        <p>1L</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">4,500원</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[14.25px] relative shrink-0 w-[16.482px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.4818 14.25">
        <g id="Container">
          <path d={svgPaths.p20c0d680} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#137fec] content-stretch flex gap-[8px] items-center justify-center py-[10px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <Container27 />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[87.33px]">
        <p className="leading-[20px] whitespace-pre-wrap">장바구니 담기</p>
      </div>
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Button:margin">
      <Button2 />
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[4px] relative w-full">
        <Container25 />
        <Container26 />
        <ButtonMargin />
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[16px] right-[203px] top-[16px]" data-name="Item 1">
      <BackgroundShadow />
      <Container24 />
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[15.292px] relative shrink-0 w-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15.2917">
        <g id="Container">
          <path d={svgPaths.p28063980} fill="var(--fill-0, #617589)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute backdrop-blur-[4px] bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-center justify-center p-[8px] right-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <Container28 />
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="aspect-[4/5] overflow-clip relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Background+Shadow">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
        <img alt="" className="absolute h-full left-[-30.03%] max-w-none top-0 w-[160.05%]" src={imgBackgroundShadow} />
      </div>
      <Button3 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[17.5px] not-italic relative shrink-0 text-[#111418] text-[14px] w-full whitespace-pre-wrap">
        <p className="mb-0">[농장직송] 무항생제 신선</p>
        <p>란 15구</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">6,800원</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[14.25px] relative shrink-0 w-[16.482px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.4818 14.25">
        <g id="Container">
          <path d={svgPaths.p20c0d680} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#137fec] content-stretch flex gap-[8px] items-center justify-center py-[10px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <Container32 />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[87.33px]">
        <p className="leading-[20px] whitespace-pre-wrap">장바구니 담기</p>
      </div>
    </div>
  );
}

function ButtonMargin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Button:margin">
      <Button4 />
    </div>
  );
}

function Container29() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[4px] relative w-full">
        <Container30 />
        <Container31 />
        <ButtonMargin1 />
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[203px] right-[16px] top-[16px]" data-name="Item 2">
      <BackgroundShadow1 />
      <Container29 />
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[15.292px] relative shrink-0 w-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15.2917">
        <g id="Container">
          <path d={svgPaths.p28063980} fill="var(--fill-0, #617589)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute backdrop-blur-[4px] bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-center justify-center p-[8px] right-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <Container33 />
    </div>
  );
}

function BackgroundShadow2() {
  return (
    <div className="aspect-[4/5] overflow-clip relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Background+Shadow">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
        <img alt="" className="absolute h-[120%] left-0 max-w-none top-[-10%] w-full" src={imgBackgroundShadow1} />
      </div>
      <Button5 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[17.5px] not-italic relative shrink-0 text-[#111418] text-[14px] w-full whitespace-pre-wrap">
        <p className="mb-0">[한돈] 수육용 삼겹살</p>
        <p>600g</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">15,800원</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[14.25px] relative shrink-0 w-[16.482px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.4818 14.25">
        <g id="Container">
          <path d={svgPaths.p20c0d680} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#137fec] content-stretch flex gap-[8px] items-center justify-center py-[10px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <Container37 />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[87.33px]">
        <p className="leading-[20px] whitespace-pre-wrap">장바구니 담기</p>
      </div>
    </div>
  );
}

function ButtonMargin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Button:margin">
      <Button6 />
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[4px] relative w-full">
        <Container35 />
        <Container36 />
        <ButtonMargin2 />
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[16px] right-[203px] top-[380.75px]" data-name="Item 3">
      <BackgroundShadow2 />
      <Container34 />
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[15.292px] relative shrink-0 w-[16.667px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15.2917">
        <g id="Container">
          <path d={svgPaths.p28063980} fill="var(--fill-0, #617589)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute backdrop-blur-[4px] bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-center justify-center p-[8px] right-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <Container38 />
    </div>
  );
}

function BackgroundShadow3() {
  return (
    <div className="aspect-[4/5] overflow-clip relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Background+Shadow">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
        <img alt="" className="absolute h-full left-[-33.44%] max-w-none top-0 w-[166.89%]" src={imgBackgroundShadow2} />
      </div>
      <Button7 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[17.5px] not-italic relative shrink-0 text-[#111418] text-[14px] w-full whitespace-pre-wrap">
        <p className="mb-0">[고당도] 멕시코산 생 아보</p>
        <p>카도 3입</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">9,900원</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[14.25px] relative shrink-0 w-[16.482px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.4818 14.25">
        <g id="Container">
          <path d={svgPaths.p20c0d680} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-[#137fec] content-stretch flex gap-[8px] items-center justify-center py-[10px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <Container42 />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[87.33px]">
        <p className="leading-[20px] whitespace-pre-wrap">장바구니 담기</p>
      </div>
    </div>
  );
}

function ButtonMargin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Button:margin">
      <Button8 />
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[4px] relative w-full">
        <Container40 />
        <Container41 />
        <ButtonMargin3 />
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[203px] right-[16px] top-[380.75px]" data-name="Item 4">
      <BackgroundShadow3 />
      <Container39 />
    </div>
  );
}

function ProductGrid() {
  return (
    <div className="absolute h-[745.5px] left-0 right-0 top-[401px]" data-name="Product Grid">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function Button9() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[26px] py-[10px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#137fec] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[16px] text-center w-[123.38px]">
        <p className="leading-[24px] whitespace-pre-wrap">추천 상품 더 보기</p>
      </div>
    </div>
  );
}

function EmptyStateFallbackLoadMore() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-0 p-[32px] right-0 top-[1146.5px]" data-name="Empty State Fallback / Load More">
      <Button9 />
    </div>
  );
}

function Main() {
  return (
    <div className="h-[1382.5px] max-w-[672px] relative shrink-0 w-full z-[1]" data-name="Main">
      <SuccessConfirmation />
      <TrustBlockPersonalizationInfo />
      <SectionTitleHeading />
      <ProductGrid />
      <EmptyStateFallbackLoadMore />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#f6f7f8] content-stretch flex flex-col isolate items-start pb-[3.5px] relative size-full" data-name="식재료 맞춤 추천">
      <FloatingActionButtonFab />
      <BottomNavigationBar />
      <HeaderSection />
      <Main />
    </div>
  );
}