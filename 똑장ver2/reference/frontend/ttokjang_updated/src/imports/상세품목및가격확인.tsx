import svgPaths from "./svg-qhhm4yq1kp";
import { useApp } from "../app/store/AppContext";
import imgAb6AXuCHro8GuVmX7U9thSXyHpU84JrBybzLkKdtdOjq2QFAxNgNy9Vl6Vtxf1Fc1KSntIy2JbjMdcQpNwCEuzXw6LO6Rl8KPzWqGeUr4LXlWan4HmlhrWfWjlcDaCjCzZuGs79Y5LYjNg4QgTKnDuBxMt902E7BLkvOieIhttwWHc6HHwMnl603LVaGrjAzigeX2DztTrLlMsX0R4PIwCkMDa2Beu7MjH8QAtas9HyVlcP3FG2GdUJNbxVUxMpnwzFvAfcOfk from "figma:asset/aa2489fa863641a46377c8b153ece25eab05f7d3.png";
import imgAb6AXuBzjVtReicJ1PVTt1EohxWZaHsHBpvaL3PsAtJcJqMQmD2B6ZxRrrz0ZlrWrGdFisCvlIWoWMvYd8Dzl0TBjGoCbaScMw1AbnQGcndDCnqbIuYqzwW712TbB5ZNyLtnQjsXh494OPIq5SCCfap4W8AfQmvmXgL1EzL06CKeYf9IWfYfDFhQpBa4DSjXml5YnQcOwRSgU5947EgAhBeQhZ7Kdp1U6MvD5SxRh82BOrGd16U8Rebrg6YCw6Wl2V0ATnAmo from "figma:asset/0480c29099e4308629169698aa35790a40da6b00.png";
import imgAb6AXuCbec5KCmWhjWslIHxY4AkbCy4IyV1SQ5ItIjOeOpHvcWsBxRfpKzZMhTwHmLmrtHaWzfe3GVnQGmsnm5IwIx05WVk3NzsI2MkLpuhzpBnIs0U8F4LSyXxzbRavNLyZ0YwmSzXyEYzpPnUSo1F67Z8L3DxPeY1THwwx90PzW2P9WWvf4XvDv4Kkz68A99BZcSqFdExumpTddwJTfvGlXmH6GrixLsPKkEGi4B4DlTaUzxjaauluk6Dedr7Nc2JV1AtmIt0O8 from "figma:asset/fc2ad81b029c047c3d7b8664fae6f1ff4612eb44.png";
import imgAb6AXuBj9QYKa7HVeE0D8HHk6J7KebOyom3RnLzzjK8M9J2Bye2Mgl23YjBNwIrTo6SFp0MFog6EMqDsuU6B2PzhtNujCzzlUpDxq4SmvxLnrjvd7J2L97Yxp0DDjx8IJcqYQnhxiHPzlqHRwa4XZjpx2OKcd4Z8JkuIkXv6KahM3LtutfW6IrAnLrF9Aiv7LWn2Kl28ShI5AgPLsTKgoBPozrqYPojgDcV0PXqEack4954Lx0Z04T3Zor9GDimsLXmAt2VpCjJOw from "figma:asset/9b2adceda613024522469fd0fa46370bb1b91943.png";
import imgAb6AXuCHg1Mzgx3QQQpzAdotU7Zg5GW94YlTmFvpDad9413FmhHRsENi4MzUWgRZrIvemVvpGza5QyzVxCaS4Pr79XSuntAqxCaPgxFctPt3O1QVtzfXoGu4OoBlZojuWfArfE8MFnj4UUx8R0KLslfjZPlQu4FegNwNok5KaTcf8GzJgDc4ZzRltovwpj4D8Em0XT5X2JUJeHg466GFjVqvqqNtOxLPpWYhnwuelYlGlFVi0Mewc4Fh63DwIgEiElWYrWwzBYQ from "figma:asset/7b44078bac5bcb4bb60cbfd8728cbd577109616d.png";
function Container1() {
  return (
    <div className="relative shrink-0 size-[16.031px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.0312 16.0312">
        <g id="Container">
          <path d={svgPaths.pf7e7200} fill="var(--fill-0, #4B5563)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[-8px] p-[8px] rounded-[9999px] top-0 cursor-pointer hover:bg-gray-100" data-name="Button" onClick={() => setCurrentScreen('MODE_SELECTION')}>
      <Container1 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="h-[48px] relative shrink-0 w-[32px]" data-name="Button:margin">
      <Button />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[19.922px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 19.9219">
        <g id="Container">
          <path d={svgPaths.p226e5900} fill="var(--fill-0, #4B5563)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0" data-name="Button">
      <Container2 />
    </div>
  );
}

function ButtonMargin1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[32px]" data-name="Button:margin">
      <Button1 />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[142.97px] top-[16px] w-[104.06px]" data-name="Heading 1">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] text-center w-[104.06px]">
        <p className="leading-[24px] whitespace-pre-wrap">상세 품목 확인</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[16px] relative size-full">
          <ButtonMargin />
          <ButtonMargin1 />
          <Heading />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.9)] content-stretch flex flex-col items-start pb-px relative shrink-0 w-full z-[4]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b border-solid inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] w-[72.92px]">
        <p className="leading-[20px] whitespace-pre-wrap">총 4개 품목</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[18px] w-[82.89px]">
        <p className="leading-[28px] whitespace-pre-wrap">42,500원</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[4px] relative w-full">
          <Container4 />
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white w-[152.06px]">
        <p className="leading-[24px] whitespace-pre-wrap">이 플랜으로 결정하기</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 size-[9.352px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.35156 9.35156">
        <g id="Container">
          <path d={svgPaths.pb213f40} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="bg-[#137fec] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-blue-600 transition-colors" data-name="Button" onClick={() => setCurrentScreen('PAYMENT')}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center py-[16px] relative w-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(19,127,236,0.3),0px_4px_6px_-4px_rgba(19,127,236,0.3)]" data-name="Button:shadow" />
        <Container6 />
        <Container7 />
      </div>
    </div>
  );
}

function BottomStickyActionBar() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex flex-col gap-[12px] items-start left-0 pb-[32px] pt-[17px] px-[16px] right-0 z-[3]" data-name="Bottom Sticky Action Bar">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-solid border-t inset-0 pointer-events-none" />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]" data-name="Bottom Sticky Action Bar:shadow" />
      <Container3 />
      <Button2 />
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[9.824px]" data-name="Margin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.82374 10.5">
        <g id="Margin">
          <path d={svgPaths.p3c5f9f00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#137fec] content-stretch flex items-center left-0 px-[8px] py-[2px] rounded-[4px] top-0" data-name="Background">
      <Margin />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white w-[63.2px]">
        <p className="leading-[16px] whitespace-pre-wrap">최저가 추천</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[28px]" data-name="Heading 2">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[20px] w-[142.72px]">
        <p className="leading-[28px] whitespace-pre-wrap">똑장 알뜰 플랜</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[60px]" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] w-[171.05px]">
        <p className="leading-[20px] whitespace-pre-wrap">배달비 포함 • 30분 내 도착</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[80px] relative shrink-0 w-[171.05px]" data-name="Container">
      <Background />
      <Heading1 />
      <Container10 />
    </div>
  );
}

function Ab6AXuCHro8GuVmX7U9thSXyHpU84JrBybzLkKdtdOjq2QFAxNgNy9Vl6Vtxf1Fc1KSntIy2JbjMdcQpNwCEuzXw6LO6Rl8KPzWqGeUr4LXlWan4HmlhrWfWjlcDaCjCzZuGs79Y5LYjNg4QgTKnDuBxMt902E7BLkvOieIhttwWHc6HHwMnl603LVaGrjAzigeX2DztTrLlMsX0R4PIwCkMDa2Beu7MjH8QAtas9HyVlcP3FG2GdUJNbxVUxMpnwzFvAfcOfk() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[32px]" data-name="AB6AXuCHro8GuVmX7u9thSXyHpU84JrBybzLkKdtdOjq2qFAxNgNy9-vl6VTXF1Fc1KSntIy2JbjMdcQPNwCEuz_Xw6lO6RL8KPzWqGeUR4lXlWAN4hmlhrWfWjlcDaCJCzZUGs79y5lYJNg4qgTKnDU-BxMT902E7BLkvOIE-IhttwWHc6HHwMnl603lVaGRJAzigeX2DztTr-LlMsX0r4pIw_CkMDa2Beu_7MjH8qAtas9hyVlcP3fG2gdU_j_NbxVUxMPNWZFvAFCOfk">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[9999px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuCHro8GuVmX7U9thSXyHpU84JrBybzLkKdtdOjq2QFAxNgNy9Vl6Vtxf1Fc1KSntIy2JbjMdcQpNwCEuzXw6LO6Rl8KPzWqGeUr4LXlWan4HmlhrWfWjlcDaCjCzZuGs79Y5LYjNg4QgTKnDuBxMt902E7BLkvOieIhttwWHc6HHwMnl603LVaGrjAzigeX2DztTrLlMsX0R4PIwCkMDa2Beu7MjH8QAtas9HyVlcP3FG2GdUJNbxVUxMpnwzFvAfcOfk} />
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start p-[8px] relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Background+Shadow">
      <Ab6AXuCHro8GuVmX7U9thSXyHpU84JrBybzLkKdtdOjq2QFAxNgNy9Vl6Vtxf1Fc1KSntIy2JbjMdcQpNwCEuzXw6LO6Rl8KPzWqGeUr4LXlWan4HmlhrWfWjlcDaCjCzZuGs79Y5LYjNg4QgTKnDuBxMt902E7BLkvOieIhttwWHc6HHwMnl603LVaGrjAzigeX2DztTrLlMsX0R4PIwCkMDa2Beu7MjH8QAtas9HyVlcP3FG2GdUJNbxVUxMpnwzFvAfcOfk />
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-[308px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative w-full">
        <Container9 />
        <BackgroundShadow />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[66.41px]">
        <p className="leading-[16px] whitespace-pre-wrap">총 예상 금액</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[32px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[24px] w-[110.52px]">
        <p className="leading-[32px] whitespace-pre-wrap">42,500원</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Container12 />
        <Container13 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-right w-[36px]">
        <p className="leading-[16px] whitespace-pre-wrap">매칭률</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[14px] text-right w-[60.95px]">
        <p className="leading-[20px] whitespace-pre-wrap">9/10 품목</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#e5e7eb] h-[8px] overflow-clip relative rounded-[9999px] shrink-0 w-[64px]" data-name="Background">
      <div className="absolute bg-[#137fec] inset-[0_10.02%_0_0] rounded-[9999px]" data-name="Background" />
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col h-[8px] items-start pl-[4px] relative shrink-0 w-[68px]" data-name="Margin">
      <Background1 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <Margin1 />
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative">
        <Container15 />
        <Container16 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-[308px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[rgba(19,127,236,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-end justify-between pt-[17px] relative w-full">
        <Container11 />
        <Container14 />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Background+Border" style={{ backgroundImage: "linear-gradient(149.886deg, rgba(19, 127, 236, 0.05) 0%, rgba(19, 127, 236, 0.1) 100%)" }}>
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start p-[21px] relative w-full">
          <div className="absolute bg-[rgba(19,127,236,0.1)] blur-[32px] right-[-63px] rounded-[9999px] size-[128px] top-[-63px]" data-name="Overlay+Blur" />
          <Container8 />
          <HorizontalBorder />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(19,127,236,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 size-[11.648px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6484 11.6484">
        <g id="Container">
          <path d={svgPaths.p3c62aa00} fill="var(--fill-0, #22C55E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin2() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[8px] relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[102.75px]">
          <p className="leading-[16px] whitespace-pre-wrap">실시간 재고 확인됨</p>
        </div>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="h-[4px] relative shrink-0 w-[12px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[8px] relative size-full">
        <div className="bg-[#d1d5db] rounded-[9999px] shrink-0 size-[4px]" data-name="Background" />
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[8px] relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[85.88px]">
          <p className="leading-[16px] whitespace-pre-wrap">5분 전 업데이트</p>
        </div>
      </div>
    </div>
  );
}

function TrustIndicatorBanner() {
  return (
    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-px py-[9px] relative rounded-[8px] shrink-0 w-full" data-name="Trust Indicator Banner">
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container18 />
      <Margin2 />
      <Margin3 />
      <Margin4 />
    </div>
  );
}

function PlanSummaryCard() {
  return (
    <div className="relative shrink-0 w-full" data-name="Plan Summary Card">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[20px] relative w-full">
        <BackgroundBorder />
        <TrustIndicatorBanner />
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#f3f4f6] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[19.42px]">
        <p className="leading-[16px] whitespace-pre-wrap">3개</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Background2 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[56px]">
        <p className="leading-[20px] whitespace-pre-wrap">신선식품</p>
      </div>
      <Margin5 />
    </div>
  );
}

function Ab6AXuBzjVtReicJ1PVTt1EohxWZaHsHBpvaL3PsAtJcJqMQmD2B6ZxRrrz0ZlrWrGdFisCvlIWoWMvYd8Dzl0TBjGoCbaScMw1AbnQGcndDCnqbIuYqzwW712TbB5ZNyLtnQjsXh494OPIq5SCCfap4W8AfQmvmXgL1EzL06CKeYf9IWfYfDFhQpBa4DSjXml5YnQcOwRSgU5947EgAhBeQhZ7Kdp1U6MvD5SxRh82BOrGd16U8Rebrg6YCw6Wl2V0ATnAmo() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuBzjVTReicJ1pVTt1eohxW_ZAHsH_bpvaL3PsAtJcJqMQmD2B6zxRrrz0zlrWrGdFISCvlIWoWMvYD8Dzl0TBjGOCbaScMW1AbnQGcndDCnqbIuYqzwW712TbB5z_NYLtnQjs-Xh494oPIq5_sCCfap4W8AFQmvmXgL1ezL06cKeYF9IWfYfDFhQpBA4DSjXml5ynQcOw_rSgU5947EgAh-BEQhZ7kdp1u6mvD5SxRh82BOr_gd16u-8Rebrg6yCW6WL2V-0ATnAmo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuBzjVtReicJ1PVTt1EohxWZaHsHBpvaL3PsAtJcJqMQmD2B6ZxRrrz0ZlrWrGdFisCvlIWoWMvYd8Dzl0TBjGoCbaScMw1AbnQGcndDCnqbIuYqzwW712TbB5ZNyLtnQjsXh494OPIq5SCCfap4W8AfQmvmXgL1EzL06CKeYf9IWfYfDFhQpBa4DSjXml5YnQcOwRSgU5947EgAhBeQhZ7Kdp1U6MvD5SxRh82BOrGd16U8Rebrg6YCw6Wl2V0ATnAmo} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur() {
  return (
    <div className="absolute backdrop-blur-[1px] bg-[rgba(0,0,0,0.4)] bottom-0 content-stretch flex flex-col items-center left-0 py-[2px] right-0" data-name="Overlay+OverlayBlur">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white w-[24.52px]">
        <p className="leading-[15px] whitespace-pre-wrap">x 3개</p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#f9fafb] relative rounded-[8px] shrink-0 size-[80px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Ab6AXuBzjVtReicJ1PVTt1EohxWZaHsHBpvaL3PsAtJcJqMQmD2B6ZxRrrz0ZlrWrGdFisCvlIWoWMvYd8Dzl0TBjGoCbaScMw1AbnQGcndDCnqbIuYqzwW712TbB5ZNyLtnQjsXh494OPIq5SCCfap4W8AfQmvmXgL1EzL06CKeYf9IWfYfDFhQpBa4DSjXml5YnQcOwRSgU5947EgAhBeQhZ7Kdp1U6MvD5SxRh82BOrGd16U8Rebrg6YCw6Wl2V0ATnAmo />
        <OverlayOverlayBlur />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[112.31px]">
        <p className="leading-[20px] whitespace-pre-wrap">청송 꿀사과 1.5kg</p>
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-[#dcfce7] content-stretch flex items-center px-[7px] py-[3px] relative rounded-[4px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#bbf7d0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#15803d] text-[10px] w-[52.67px]">
        <p className="leading-[15px] whitespace-pre-wrap">정확히 일치</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <BackgroundBorder1 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">{`요청한 '부사' 품종입니다.`}</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Container22 />
      <Container23 />
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[11.016px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.0156 10.5">
        <g id="Container">
          <path d={svgPaths.p1a344780} fill="var(--fill-0, #9CA3AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin7() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[46.55px]">
        <p className="leading-[16px] whitespace-pre-wrap">API 인증</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container26 />
      <Margin7 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] w-[70.23px]">
        <p className="leading-[24px] whitespace-pre-wrap">12,000원</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <Container27 />
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Margin">
      <Container24 />
    </div>
  );
}

function Container20() {
  return (
    <div className="flex-[1_0_0] h-[80px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between py-[2px] relative size-full">
        <Container21 />
        <Margin6 />
      </div>
    </div>
  );
}

function Item1ExactMatch() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-slate-50 transition-colors" data-name="Item 1: Exact Match" onClick={() => setCurrentScreen('ITEM_DETAIL')}>
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="content-stretch flex gap-[12px] items-start p-[13px] relative w-full">
        <Background3 />
        <Container20 />
      </div>
    </div>
  );
}

function Ab6AXuCbec5KCmWhjWslIHxY4AkbCy4IyV1SQ5ItIjOeOpHvcWsBxRfpKzZMhTwHmLmrtHaWzfe3GVnQGmsnm5IwIx05WVk3NzsI2MkLpuhzpBnIs0U8F4LSyXxzbRavNLyZ0YwmSzXyEYzpPnUSo1F67Z8L3DxPeY1THwwx90PzW2P9WWvf4XvDv4Kkz68A99BZcSqFdExumpTddwJTfvGlXmH6GrixLsPKkEGi4B4DlTaUzxjaauluk6Dedr7Nc2JV1AtmIt0O() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuCBEC5KCmWhjWslIHxY4AKBCy4iyV1sQ5ItIJOeOpHvcWsBxRfpKzZMhTwHmLmrt_haWZFE3gVN_QGmsnm5IwIX05wVk3nzsI2mkLpuhzpBnIS0U8F4l-SyXxzbRav-NLyZ0ywmSZ_XyEYzpPnUSo1f67z8l3DXPeY1THwwx90PzW2p9wWvf4xvDv4KKZ68a99bZc_SQFdEXUMPTddwJTfvGLXmH6GrixLsPKkEGi4b4dlTaUzxjaauluk6Dedr7NC2jV1atmIT0O8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuCbec5KCmWhjWslIHxY4AkbCy4IyV1SQ5ItIjOeOpHvcWsBxRfpKzZMhTwHmLmrtHaWzfe3GVnQGmsnm5IwIx05WVk3NzsI2MkLpuhzpBnIs0U8F4LSyXxzbRavNLyZ0YwmSzXyEYzpPnUSo1F67Z8L3DxPeY1THwwx90PzW2P9WWvf4XvDv4Kkz68A99BZcSqFdExumpTddwJTfvGlXmH6GrixLsPKkEGi4B4DlTaUzxjaauluk6Dedr7Nc2JV1AtmIt0O8} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur1() {
  return (
    <div className="absolute backdrop-blur-[1px] bg-[rgba(0,0,0,0.4)] bottom-0 content-stretch flex flex-col items-center left-0 py-[2px] right-0" data-name="Overlay+OverlayBlur">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white w-[22.39px]">
        <p className="leading-[15px] whitespace-pre-wrap">x 1개</p>
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#f9fafb] relative rounded-[8px] shrink-0 size-[80px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Ab6AXuCbec5KCmWhjWslIHxY4AkbCy4IyV1SQ5ItIjOeOpHvcWsBxRfpKzZMhTwHmLmrtHaWzfe3GVnQGmsnm5IwIx05WVk3NzsI2MkLpuhzpBnIs0U8F4LSyXxzbRavNLyZ0YwmSzXyEYzpPnUSo1F67Z8L3DxPeY1THwwx90PzW2P9WWvf4XvDv4Kkz68A99BZcSqFdExumpTddwJTfvGlXmH6GrixLsPKkEGi4B4DlTaUzxjaauluk6Dedr7Nc2JV1AtmIt0O />
        <OverlayOverlayBlur1 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[118.89px]">
        <p className="leading-[20px] whitespace-pre-wrap">매일우유 저지방 1L</p>
      </div>
    </div>
  );
}

function Margin8() {
  return (
    <div className="h-[7.91px] relative shrink-0 w-[13.18px]" data-name="Margin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1797 7.91016">
        <g id="Margin">
          <path d={svgPaths.p202b5c80} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(19,127,236,0.1)] content-stretch flex items-center px-[7px] py-[3px] relative rounded-[4px] shrink-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(19,127,236,0.2)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Margin8 />
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[10px] w-[32.48px]">
        <p className="leading-[15px] whitespace-pre-wrap">AI 추천</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative w-full">
        <Heading4 />
        <OverlayBorder />
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">서울우유 품절로 대체되었습니다.</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Container30 />
      <Container31 />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[6px] relative shrink-0 w-[9.984px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.98438 6">
        <g id="Container">
          <path d={svgPaths.p24645700} fill="var(--fill-0, #9CA3AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin10() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[45.06px]">
        <p className="[text-decoration-skip-ink:none] decoration-solid leading-[16px] line-through whitespace-pre-wrap">3,200원</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container34 />
      <Margin10 />
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute content-stretch flex items-start justify-end left-0 top-[5.5px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] text-right w-[29.78px]">
        <p className="leading-[16px] whitespace-pre-wrap">6%↓</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[24px] relative shrink-0 w-[101.11px]" data-name="Container">
      <Container36 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] not-italic right-0 text-[#111827] text-[16px] text-right top-[12px] w-[62.83px]">
        <p className="leading-[24px] whitespace-pre-wrap">2,980원</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container33 />
      <Container35 />
    </div>
  );
}

function Margin9() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Margin">
      <Container32 />
    </div>
  );
}

function Container28() {
  return (
    <div className="flex-[1_0_0] h-[80px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between py-[2px] relative size-full">
        <Container29 />
        <Margin9 />
      </div>
    </div>
  );
}

function Item2RecommendedAlternative() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 2: Recommended Alternative">
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="content-stretch flex gap-[12px] items-start p-[13px] relative w-full">
        <Background4 />
        <Container28 />
      </div>
    </div>
  );
}

function Ab6AXuBj9QYKa7HVeE0D8HHk6J7KebOyom3RnLzzjK8M9J2Bye2Mgl23YjBNwIrTo6SFp0MFog6EMqDsuU6B2PzhtNujCzzlUpDxq4SmvxLnrjvd7J2L97Yxp0DDjx8IJcqYQnhxiHPzlqHRwa4XZjpx2OKcd4Z8JkuIkXv6KahM3LtutfW6IrAnLrF9Aiv7LWn2Kl28ShI5AgPLsTKgoBPozrqYPojgDcV0PXqEack4954Lx0Z04T3Zor9GDimsLXmAt2VpCjJOw() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuBj9qYKa7HVeE-0d8HHk-6j7KebOyom3RnLzzjK8m9j2bye2mgl23yjBNwIRTo6SFp0MFog6EMqDsuU6B2PzhtNujCzzlUpDxq4smvxLNRJVD7j2L97Yxp0dDjx8I_JcqYQnhxiHPzlqHRwa4xZJPX2OKcd4Z8JkuIkXV6kah-m3ltutfW6irANLrF9AIV7lWN2kl28_sh-i5agPLsTKgoBPozrqYPojgDcV0PXqEACK4954Lx0Z04T3ZOR9gDimsLXmAT2VPCjJOw">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuBj9QYKa7HVeE0D8HHk6J7KebOyom3RnLzzjK8M9J2Bye2Mgl23YjBNwIrTo6SFp0MFog6EMqDsuU6B2PzhtNujCzzlUpDxq4SmvxLnrjvd7J2L97Yxp0DDjx8IJcqYQnhxiHPzlqHRwa4XZjpx2OKcd4Z8JkuIkXv6KahM3LtutfW6IrAnLrF9Aiv7LWn2Kl28ShI5AgPLsTKgoBPozrqYPojgDcV0PXqEack4954Lx0Z04T3Zor9GDimsLXmAt2VpCjJOw} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur2() {
  return (
    <div className="absolute backdrop-blur-[1px] bg-[rgba(0,0,0,0.4)] bottom-0 content-stretch flex flex-col items-center left-0 py-[2px] right-0" data-name="Overlay+OverlayBlur">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white w-[24.41px]">
        <p className="leading-[15px] whitespace-pre-wrap">x 2개</p>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#f9fafb] relative rounded-[8px] shrink-0 size-[80px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Ab6AXuBj9QYKa7HVeE0D8HHk6J7KebOyom3RnLzzjK8M9J2Bye2Mgl23YjBNwIrTo6SFp0MFog6EMqDsuU6B2PzhtNujCzzlUpDxq4SmvxLnrjvd7J2L97Yxp0DDjx8IJcqYQnhxiHPzlqHRwa4XZjpx2OKcd4Z8JkuIkXv6KahM3LtutfW6IrAnLrF9Aiv7LWn2Kl28ShI5AgPLsTKgoBPozrqYPojgDcV0PXqEack4954Lx0Z04T3Zor9GDimsLXmAt2VpCjJOw />
        <OverlayOverlayBlur2 />
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[119.06px]">
        <p className="leading-[20px] whitespace-pre-wrap">풀무원 국산콩 두부</p>
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="bg-[#fef9c3] content-stretch flex items-center px-[7px] py-[3px] relative rounded-[4px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#fef08a] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#854d0e] text-[10px] w-[30px]">
        <p className="leading-[15px] whitespace-pre-wrap">가성비</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Heading5 />
      <BackgroundBorder2 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">100g 당 가격이 가장 낮아요.</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Container39 />
      <Container40 />
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[11.016px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.0156 10.5">
        <g id="Container">
          <path d={svgPaths.p1a344780} fill="var(--fill-0, #9CA3AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin12() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[36px]">
        <p className="leading-[16px] whitespace-pre-wrap">실시간</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container43 />
      <Margin12 />
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] w-[63px]">
        <p className="leading-[24px] whitespace-pre-wrap">3,200원</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container42 />
      <Container44 />
    </div>
  );
}

function Margin11() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Margin">
      <Container41 />
    </div>
  );
}

function Container37() {
  return (
    <div className="flex-[1_0_0] h-[80px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between py-[2px] relative size-full">
        <Container38 />
        <Margin11 />
      </div>
    </div>
  );
}

function Item3BestValue() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 3: Best Value">
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="content-stretch flex gap-[12px] items-start p-[13px] relative w-full">
        <Background5 />
        <Container37 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Item1ExactMatch />
      <Item2RecommendedAlternative />
      <Item3BestValue />
    </div>
  );
}

function CategoryFreshFood() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Category: Fresh Food">
      <Heading2 />
      <Container19 />
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#f3f4f6] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[12px] w-[16.89px]">
        <p className="leading-[16px] whitespace-pre-wrap">1개</p>
      </div>
    </div>
  );
}

function Margin13() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Background6 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[105.06px]">
        <p className="leading-[20px] whitespace-pre-wrap">가공식품 및 기타</p>
      </div>
      <Margin13 />
    </div>
  );
}

function Ab6AXuCHg1Mzgx3QQQpzAdotU7Zg5GW94YlTmFvpDad9413FmhHRsENi4MzUWgRZrIvemVvpGza5QyzVxCaS4Pr79XSuntAqxCaPgxFctPt3O1QVtzfXoGu4OoBlZojuWfArfE8MFnj4UUx8R0KLslfjZPlQu4FegNwNok5KaTcf8GzJgDc4ZzRltovwpj4D8Em0XT5X2JUJeHg466GFjVqvqqNtOxLPpWYhnwuelYlGlFVi0Mewc4Fh63DwIgEiElWYrWwzBYQ() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuCHg1MZGX3qQQpz_Adot_U7ZG5gW94ylTmFVPDad9413fmhHRsENi4MzUWgRZrIVEMVvpGZA5qyzVXCaS4PR79xSuntAQXCaPgxFctPt3O1Q-vtzfXoGu4ooBlZOJUWfArfE8MFnj4UUx8r0kLslfjZPlQU4fegNwNOK5kaTCF8GZJgDc4ZZ_RLTOVWPJ4D8em0xT5X2jUJeHG466g_FjVQVQQNt-OxLPp-wYHNWUELYlGlFVi0MEWC4FH63dwIGEiElWYrWwzB_yQ">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuCHg1Mzgx3QQQpzAdotU7Zg5GW94YlTmFvpDad9413FmhHRsENi4MzUWgRZrIvemVvpGza5QyzVxCaS4Pr79XSuntAqxCaPgxFctPt3O1QVtzfXoGu4OoBlZojuWfArfE8MFnj4UUx8R0KLslfjZPlQu4FegNwNok5KaTcf8GzJgDc4ZzRltovwpj4D8Em0XT5X2JUJeHg466GFjVqvqqNtOxLPpWYhnwuelYlGlFVi0Mewc4Fh63DwIgEiElWYrWwzBYQ} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur3() {
  return (
    <div className="absolute backdrop-blur-[1px] bg-[rgba(0,0,0,0.4)] bottom-0 content-stretch flex flex-col items-center left-0 py-[2px] right-0" data-name="Overlay+OverlayBlur">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-center text-white w-[22.39px]">
        <p className="leading-[15px] whitespace-pre-wrap">x 1개</p>
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#f9fafb] relative rounded-[8px] shrink-0 size-[80px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Ab6AXuCHg1Mzgx3QQQpzAdotU7Zg5GW94YlTmFvpDad9413FmhHRsENi4MzUWgRZrIvemVvpGza5QyzVxCaS4Pr79XSuntAqxCaPgxFctPt3O1QVtzfXoGu4OoBlZojuWfArfE8MFnj4UUx8R0KLslfjZPlQu4FegNwNok5KaTcf8GzJgDc4ZzRltovwpj4D8Em0XT5X2JUJeHg466GFjVqvqqNtOxLPpWYhnwuelYlGlFVi0Mewc4Fh63DwIgEiElWYrWwzBYQ />
        <OverlayOverlayBlur3 />
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Heading 4">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] w-[131.73px]">
        <p className="leading-[20px] whitespace-pre-wrap">포카칩 오리지널 66g</p>
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="bg-[#dcfce7] content-stretch flex items-center px-[7px] py-[3px] relative rounded-[4px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#bbf7d0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#15803d] text-[10px] w-[52.67px]">
        <p className="leading-[15px] whitespace-pre-wrap">정확히 일치</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Heading7 />
      <BackgroundBorder3 />
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[10.5px] relative shrink-0 w-[11.016px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.0156 10.5">
        <g id="Container">
          <path d={svgPaths.p1a344780} fill="var(--fill-0, #9CA3AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin15() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[46.55px]">
        <p className="leading-[16px] whitespace-pre-wrap">API 인증</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container49 />
      <Margin15 />
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[16px] w-[59.67px]">
        <p className="leading-[24px] whitespace-pre-wrap">1,500원</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Container48 />
      <Container50 />
    </div>
  );
}

function Margin14() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Margin">
      <Container47 />
    </div>
  );
}

function Container45() {
  return (
    <div className="flex-[1_0_0] h-[80px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-between py-[2px] relative size-full">
        <Container46 />
        <Margin14 />
      </div>
    </div>
  );
}

function Item4RegularItem() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 4: Regular Item">
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="content-stretch flex gap-[12px] items-start p-[13px] relative w-full">
        <Background7 />
        <Container45 />
      </div>
    </div>
  );
}

function CategoryProcessedFoodOthers() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start pt-[8px] relative shrink-0 w-full" data-name="Category: Processed Food & Others">
      <Heading6 />
      <Item4RegularItem />
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#f3f4f6] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[16.89px]">
        <p className="leading-[16px] whitespace-pre-wrap">1개</p>
      </div>
    </div>
  );
}

function Margin16() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Background8 />
    </div>
  );
}

function Heading8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative w-full">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[14px] w-[73.53px]">
          <p className="leading-[20px] whitespace-pre-wrap">미포함 품목</p>
        </div>
        <Margin16 />
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[17.5px] relative shrink-0 w-[16.68px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6797 17.5">
        <g id="Container">
          <path d={svgPaths.p1b234540} fill="var(--fill-0, #9CA3AF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#e5e7eb] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[48px]" data-name="Background">
      <Container52 />
    </div>
  );
}

function Heading9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] w-[100.97px]">
        <p className="leading-[20px] whitespace-pre-wrap">유기농 바질 10g</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] w-[169.59px]">
        <p className="leading-[16px] whitespace-pre-wrap">현재 모든 매장에서 품절입니다.</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Heading9 />
      <Container54 />
    </div>
  );
}

function Container51() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Background9 />
        <Container53 />
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative rounded-[4px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[12px] text-center w-[63.2px]">
          <p className="leading-[16px] whitespace-pre-wrap">대체품 찾기</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div className="bg-[#f9fafb] opacity-70 relative rounded-[12px] shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f3f4f6] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between p-[13px] relative w-full">
          <Container51 />
          <Button3 />
        </div>
      </div>
    </div>
  );
}

function MissingItemsSection() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start pt-[17px] relative shrink-0 w-full" data-name="Missing Items Section">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-dashed border-t inset-0 pointer-events-none" />
      <Heading8 />
      <BackgroundBorder4 />
    </div>
  );
}

function ItemListSection() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item List Section">
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] px-[20px] relative w-full">
        <CategoryFreshFood />
        <CategoryProcessedFoodOthers />
        <MissingItemsSection />
      </div>
    </div>
  );
}

function MainScrollableContent() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip pb-[97px] relative shrink-0 w-full z-[2]" data-name="Main Scrollable Content">
      <PlanSummaryCard />
      <ItemListSection />
    </div>
  );
}

export default function Component() {
  return (
    <div className="content-stretch flex flex-col isolate items-start relative size-full" data-name="상세 품목 및 가격 확인" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(246, 247, 248) 0%, rgb(246, 247, 248) 100%)" }}>
      <Header />
      <BottomStickyActionBar />
      <MainScrollableContent />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] z-[1]" data-name="Mobile Container:shadow" />
    </div>
  );
}