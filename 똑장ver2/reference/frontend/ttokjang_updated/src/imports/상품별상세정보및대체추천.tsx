import svgPaths from "./svg-ji7kdqe8zq";
import { useApp } from "../app/store/AppContext";
import imgAb6AXuAo9YRzDnL6NWWwYf7N2AsRj3EsKdJe4VuEt6ZLtRis2OO05Uyynm1DxSv1EexDzCluh2Yh8Up7HBw1NrAzrUrGs6CefjeHjiIswwpJphYbFgsoAsR6Mfl7LBaKz7BnE4Ggtkz2ZKolW4XnnD24Vcpw0XZ9Mql3Z2UecmJvpbZVxUwBvFfmYfs1JKvBp2Qsds2QNa7XveEagw6LUrZ3CApMcMWlMhd44Ysb0UmAqSp9A6Qx4TbX2Je8XxmBbGqPzQ42LDlE from "figma:asset/65c8eec0b24c2b1c50163d435e82b98a89bac061.png";
import imgAb6AXuCvHb9JYd27KTd4Uy8EbXIvTmHadTuDb9P9LYzhToM2Iw4CrrJsb29TI6NVhjXfWcSjUQcMhz5BmMuJFxfePpgA7TS2Gv1XFBlZBm9URfYmFenZsb0R3CD0DpRSlEehp6ErVnQ4EoiRelVI0PstuMaa19J1IxEhRnBdkjy6XeBpEu22EvqCYvAyUcxjbErjAq0VxE4GuGidTuyv9MBgCwOpBInM7PgPFsEzn1C1Rp5QablGNmyBHHcTrUhvqXc from "figma:asset/20e11862e9e2a09dfea1859505dead9d10f6d6fe.png";
import imgAb6AXuBj40BNxQTraWdXox2QA96YAxOo46NzIFhIrOj23Hyp7Iw6XFpWnLpTPp7OPgJLst4E5PeMyxScN300UlL5JzGJgI3Sf6AFZv5HXdbQstPmcPSa14QwhEBbzRMzAaeo3WxOrmSpjz3SCfSq7YApMlOBi5OOFrsUleciMekVil3ZDYcgj5QpdHWriX2CmbqTwb6GaiTnjp5S6Do3JwNzrxE3XOev6Iz3Le82TjcrhwW080CXotOsAmhieRy9J1VeFwxDexwq6Pkc from "figma:asset/b0de7c5ae7e70a9b32e00a15064a6b5037744230.png";
import imgAb6AXuBliih4OpNoJuFcwa8W68MNfgaIMeIedv6LeDboMa8GrcZd5X2P9YvAzXoalOgF3Ah4Zsue0Svq1ZMBsgf52Mo2XXfr886GI2HhMpfnjtxhCkPn6NKkBpCxMqzWlq42FyidDpweEyumRnctrMrbPQh47QVezvNcqkWrmAygDsoXYdKnStyrOiDqzq0PM6M8UCjQb2WwjCPgHe7PbILs5YdAbtFdcTkn8J3LDeeUeiU3Uo9AfRsieapafm9NNyugRzUaBpIrp4 from "figma:asset/4562aef00ec296c69e2cea0c2ab501099d6b50e8.png";
import imgAb6AXuDsPCkqKubtSm2Cox0IxFuSwtmklDs1Rx5Jkmj2WcHkeQZyBlD2EmgZqR7JeiBonrJalxClUGzwewEzgWEiJzsT8Ci2FjqRbtqtXaXkXwBSaiwBacJkq1FmZyUnk6K3L9Bgtv0SeehyNgi5Xa5RzLjseOkSWhAKnceylaJ1Tq5E4QygaUgaIIs5VbOl9NfkpRmXN3WjSZuqt8HvoD7CUvSEalzyT699LJwIhXaZpj2Xc4WNwhtDndFAqnLyQ6TKf9LcvQ from "figma:asset/0cdeb92137c945d09dd5dac589b3cd841adf94d3.png";
function Container() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[16px] text-center text-white w-[106.84px]">
        <p className="leading-[24px] whitespace-pre-wrap">이대로 구매하기</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[8.859px] relative shrink-0 w-[9.105px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.10547 8.85938">
        <g id="Container">
          <path d={svgPaths.p1c15c148} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="bg-[#137fec] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-blue-600 transition-colors" data-name="Button" onClick={() => setCurrentScreen('PAYMENT')}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center py-[16px] relative w-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.3),0px_4px_6px_-4px_rgba(59,130,246,0.3)]" data-name="Button:shadow" />
        <Container />
        <Container1 />
      </div>
    </div>
  );
}

function BottomActionBar() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex flex-col items-start left-0 pb-[32px] pt-[17px] px-[16px] right-0 z-[4]" data-name="Bottom Action Bar">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-solid border-t inset-0 pointer-events-none" />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]" data-name="Bottom Action Bar:shadow" />
      <Button />
    </div>
  );
}

function Container2() {
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

function Button1() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[-8px] p-[8px] rounded-[9999px] top-0 cursor-pointer hover:bg-slate-100" data-name="Button" onClick={() => setCurrentScreen('TOP3_RESULT')}>
      <Container2 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="h-[48px] relative shrink-0 w-[32px]" data-name="Button:margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Button1 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="relative shrink-0" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[18px] w-[124.45px]">
          <p className="leading-[28px] whitespace-pre-wrap">장보기 상세 내역</p>
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[4.031px] relative shrink-0 w-[16.031px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.0312 4.03125">
        <g id="Container">
          <path d={svgPaths.pa0a2d00} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0" data-name="Button">
      <Container3 />
    </div>
  );
}

function ButtonMargin1() {
  return (
    <div className="relative shrink-0 w-[32px]" data-name="Button:margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Button2 />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(255,255,255,0.9)] relative shrink-0 w-full z-[3]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[13px] pl-[16px] pr-[16.02px] pt-[12px] relative w-full">
          <ButtonMargin />
          <Heading />
          <ButtonMargin1 />
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#dbeafe] text-[14px] w-[127.13px]">
        <p className="leading-[20px] whitespace-pre-wrap">이번 장보기 예상 금액</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[30px] text-white w-[135.25px]">
        <p className="leading-[36px] whitespace-pre-wrap">45,200원</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Container">
      <Container7 />
      <Heading1 />
    </div>
  );
}

function OverlayOverlayBlur() {
  return (
    <div className="backdrop-blur-[2px] bg-[rgba(255,255,255,0.2)] content-stretch flex flex-col items-start px-[12px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay+OverlayBlur">
      <div className="flex flex-col font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white w-[62.77px]">
        <p className="leading-[16px] whitespace-pre-wrap">총 12개 품목</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <OverlayOverlayBlur />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[15.823px] relative shrink-0 w-[16.641px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6406 15.8228">
        <g id="Container">
          <path d={svgPaths.p3f928820} fill="var(--fill-0, #86EFAC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#86efac] text-[14px] w-[262.48px]">
          <p className="whitespace-pre-wrap">
            <span className="leading-[20px]">1,500원 절약</span>
            <span className="font-['Noto_Sans_KR:Regular','Noto_Sans_KR:Bold',sans-serif] font-normal leading-[20px] text-white">{` `}</span>
            <span className="font-['Noto_Sans_KR:Regular','Noto_Sans_KR:Bold',sans-serif] font-normal leading-[20px] text-[#dbeafe]">· 대체 상품 선택으로 아꼈어요!</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] relative rounded-[8px] shrink-0 w-full" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center p-[13px] relative w-full">
          <Container8 />
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <OverlayBorder />
    </div>
  );
}

function SummaryCard() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip p-[20px] relative rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] shrink-0 w-[358px]" data-name="Summary Card" style={{ backgroundImage: "linear-gradient(155.653deg, rgb(19, 127, 236) 0%, rgb(37, 99, 235) 100%)" }}>
      <div className="absolute bg-[rgba(255,255,255,0.1)] blur-[12px] right-[-16px] rounded-[9999px] size-[96px] top-[-16px]" data-name="Decorative Circle" />
      <Container4 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#1e293b] text-[18px] w-[124.45px]">
        <p className="leading-[28px] whitespace-pre-wrap">담긴 상품 리스트</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] relative shrink-0 text-[#137fec] text-[12px] w-[44.17px]">
        <p className="leading-[16px] whitespace-pre-wrap">전체보기</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[6.508px] relative shrink-0 w-[3.849px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.84863 6.50781">
        <g id="Container">
          <path d={svgPaths.p1e788380} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container11 />
      <Container12 />
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[4px] pt-[8px] relative shrink-0 w-full" data-name="Section Header">
      <Heading2 />
      <Container10 />
    </div>
  );
}

function Ab6AXuAo9YRzDnL6NWWwYf7N2AsRj3EsKdJe4VuEt6ZLtRis2OO05Uyynm1DxSv1EexDzCluh2Yh8Up7HBw1NrAzrUrGs6CefjeHjiIswwpJphYbFgsoAsR6Mfl7LBaKz7BnE4Ggtkz2ZKolW4XnnD24Vcpw0XZ9Mql3Z2UecmJvpbZVxUwBvFfmYfs1JKvBp2Qsds2QNa7XveEagw6LUrZ3CApMcMWlMhd44Ysb0UmAqSp9A6Qx4TbX2Je8XxmBbGqPzQ42LDlE() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuAO9yRzDnL6nWWw-yf7n2asRj-3ESKdJE4vuET6ZLtRis2oO05uyynm1dxSV1eexDzCLUH2Yh8up7hBW1NRAzrURGs6CefjeHJIIswwpJPHYbFgsoAsR6MFL7LBaKZ7bnE4ggtkz2ZKolW4xnnD2_4vcpw0xZ9MQL3z_2uecmJvpbZ-VXUwBVFfmYfs1jKvBp2qsds2qNA7xveEAGW6lUr_Z3cApMc_mWlMHD44Ysb0UmAqSp9A6qx4TbX2Je8XxmBBGqPzQ42lDlE">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuAo9YRzDnL6NWWwYf7N2AsRj3EsKdJe4VuEt6ZLtRis2OO05Uyynm1DxSv1EexDzCluh2Yh8Up7HBw1NrAzrUrGs6CefjeHjiIswwpJphYbFgsoAsR6Mfl7LBaKz7BnE4Ggtkz2ZKolW4XnnD24Vcpw0XZ9Mql3Z2UecmJvpbZVxUwBvFfmYfs1JKvBp2Qsds2QNa7XveEagw6LUrZ3CApMcMWlMhd44Ysb0UmAqSp9A6Qx4TbX2Je8XxmBbGqPzQ42LDlE} />
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[8px] shrink-0 size-[80px]" data-name="Background">
      <Ab6AXuAo9YRzDnL6NWWwYf7N2AsRj3EsKdJe4VuEt6ZLtRis2OO05Uyynm1DxSv1EexDzCluh2Yh8Up7HBw1NrAzrUrGs6CefjeHjiIswwpJphYbFgsoAsR6Mfl7LBaKz7BnE4Ggtkz2ZKolW4XnnD24Vcpw0XZ9Mql3Z2UecmJvpbZVxUwBvFfmYfs1JKvBp2Qsds2QNa7XveEagw6LUrZ3CApMcMWlMhd44Ysb0UmAqSp9A6Qx4TbX2Je8XxmBbGqPzQ42LDlE />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] w-[33.13px]">
        <p className="leading-[16px] whitespace-pre-wrap">풀무원</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[16px] w-[171.16px]">
        <p className="leading-[20px] whitespace-pre-wrap">국산콩 유기농 두부 300g</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Container">
      <Container17 />
      <Heading3 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[12.59px] relative shrink-0 w-[17.573px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5728 12.5904">
        <g id="Container">
          <path d={svgPaths.p18428700} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container18 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Button3 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex gap-[8px] items-baseline leading-[0] not-italic relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[28px] justify-center relative shrink-0 text-[#137fec] text-[18px] w-[69.72px]">
        <p className="leading-[28px] whitespace-pre-wrap">3,000원</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[16px] justify-center relative shrink-0 text-[#94a3b8] text-[12px] w-[43.73px]">
        <p className="[text-decoration-skip-ink:none] decoration-solid leading-[16px] line-through whitespace-pre-wrap">3,500원</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container15 />
      <Paragraph />
    </div>
  );
}

function ProductInfo() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Product Info">
      <Background />
      <Container14 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] w-[81.75px]">
        <p className="leading-[16px] whitespace-pre-wrap">요청 상품 (품절)</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[12px] w-[113.97px]">
        <p className="[text-decoration-skip-ink:none] decoration-solid leading-[16px] line-through whitespace-pre-wrap">브랜드A 두부 3,500원</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 w-[296px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Container20 />
        <Container21 />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 size-[11.648px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6484 11.6484">
        <g id="Container">
          <path d={svgPaths.p37164620} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container24 />
      <div className="flex flex-col font-['Noto_Sans_KR:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] relative shrink-0 text-[#137fec] text-[14px] w-[122.22px]">
        <p className="leading-[20px] whitespace-pre-wrap">성분 유사 · 가격 저렴</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#dcfce7] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#16a34a] text-[12px] w-[59.63px]">
        <p className="leading-[16px] whitespace-pre-wrap">500원 절약</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0 w-[296px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Container23 />
        <Background1 />
      </div>
    </div>
  );
}

function ComparisonReason() {
  return (
    <div className="bg-[rgba(19,127,236,0.05)] relative rounded-[8px] shrink-0 w-full" data-name="Comparison Reason">
      <div aria-hidden="true" className="absolute border border-[rgba(19,127,236,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[13px] relative w-full">
        <Container19 />
        <div className="bg-[rgba(19,127,236,0.1)] h-px shrink-0 w-[296px]" data-name="Horizontal Divider" />
        <Container22 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 w-[354px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[16px] pt-[32px] px-[16px] relative w-full">
        <ProductInfo />
        <ComparisonReason />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[9.492px] relative shrink-0 w-[11.016px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.0156 9.49219">
        <g id="Container">
          <path d={svgPaths.p29f41080} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-[#137fec] left-[2px] rounded-br-[8px] top-[2px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center px-[12px] py-[4px] relative">
        <Container25 />
        <div className="flex flex-col font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[10px] text-white w-[51.81px]">
          <p className="leading-[15px] whitespace-pre-wrap">AI 대체 추천</p>
        </div>
      </div>
    </div>
  );
}

function Item1AlternativeRecommendationHeroComponent() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 1: Alternative Recommendation (Hero Component)">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[2px] relative rounded-[inherit] w-full">
        <Container13 />
        <Badge />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-[rgba(19,127,236,0.2)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Ab6AXuCvHb9JYd27KTd4Uy8EbXIvTmHadTuDb9P9LYzhToM2Iw4CrrJsb29TI6NVhjXfWcSjUQcMhz5BmMuJFxfePpgA7TS2Gv1XFBlZBm9URfYmFenZsb0R3CD0DpRSlEehp6ErVnQ4EoiRelVI0PstuMaa19J1IxEhRnBdkjy6XeBpEu22EvqCYvAyUcxjbErjAq0VxE4GuGidTuyv9MBgCwOpBInM7PgPFsEzn1C1Rp5QablGNmyBHHcTrUhvqXc() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuCVHb9-jYd27kTd4uy8EB_xIvTmHadTuDB9P9lYzhToM2Iw4crrJSB29tI6NVhjXfWCSjUQcMHZ5bm-muJFxfePPG-a7T_S_2GV1xFBlZBm9u_rfYmFenZsb0R3cD0DpRSlEehp6-erVnQ4EoiRelV_i0PSTUMaa19J1ixEHRnBDKJY6xeBpEU22-EvqCYv_-AyUCXJBErjAq0VxE4GUGid-TUYV9-mBgCwOpBInM-7pgPFsEzn1C1Rp5qablGNmyB-hHcTrUHVQXc">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuCvHb9JYd27KTd4Uy8EbXIvTmHadTuDb9P9LYzhToM2Iw4CrrJsb29TI6NVhjXfWcSjUQcMhz5BmMuJFxfePpgA7TS2Gv1XFBlZBm9URfYmFenZsb0R3CD0DpRSlEehp6ErVnQ4EoiRelVI0PstuMaa19J1IxEhRnBdkjy6XeBpEu22EvqCYvAyUcxjbErjAq0VxE4GuGidTuyv9MBgCwOpBInM7PgPFsEzn1C1Rp5QablGNmyBHHcTrUhvqXc} />
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#f8fafc] relative rounded-[8px] shrink-0 size-[64px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Ab6AXuCvHb9JYd27KTd4Uy8EbXIvTmHadTuDb9P9LYzhToM2Iw4CrrJsb29TI6NVhjXfWcSjUQcMhz5BmMuJFxfePpgA7TS2Gv1XFBlZBm9URfYmFenZsb0R3CD0DpRSlEehp6ErVnQ4EoiRelVI0PstuMaa19J1IxEhRnBdkjy6XeBpEu22EvqCYvAyUcxjbErjAq0VxE4GuGidTuyv9MBgCwOpBInM7PgPFsEzn1C1Rp5QablGNmyBHHcTrUhvqXc />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">서울우유</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">나 100% 우유 1L</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">2,800원</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative w-full">
        <Container27 />
        <Heading4 />
        <Container28 />
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex flex-col items-start px-[8px] py-[4px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] w-[30.27px]">
        <p className="leading-[16px] whitespace-pre-wrap">수량 1</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end relative">
        <Background3 />
      </div>
    </div>
  );
}

function Item2StandardItem() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 2: Standard Item">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[13px] relative w-full">
          <Background2 />
          <Container26 />
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Ab6AXuBj40BNxQTraWdXox2QA96YAxOo46NzIFhIrOj23Hyp7Iw6XFpWnLpTPp7OPgJLst4E5PeMyxScN300UlL5JzGJgI3Sf6AFZv5HXdbQstPmcPSa14QwhEBbzRMzAaeo3WxOrmSpjz3SCfSq7YApMlOBi5OOFrsUleciMekVil3ZDYcgj5QpdHWriX2CmbqTwb6GaiTnjp5S6Do3JwNzrxE3XOev6Iz3Le82TjcrhwW080CXotOsAmhieRy9J1VeFwxDexwq6Pkc() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuBj40bNxQTraWdXox2qA96YAxOO46nzIFhIrOJ23HYP7Iw6xFPWnLpTPp7OPgJLst4E5PeMyxScN300UlL5JzGJgI3SF6aFZv5HXdbQSTPmcPSa14QwhE_BbzRMzAAEO3WxORMSpjz3sCfSQ7yAPMlOBi5o_OFrsUleciMekVIL3zDYcgj_5QpdHWriX2CmbqTwb6GaiTnjp5S6Do3JWNzrxE3xOev6Iz3LE82tjcrhwW080cXotOsAmhieRY9j1VEFwxDexwq6Pkc">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuBj40BNxQTraWdXox2QA96YAxOo46NzIFhIrOj23Hyp7Iw6XFpWnLpTPp7OPgJLst4E5PeMyxScN300UlL5JzGJgI3Sf6AFZv5HXdbQstPmcPSa14QwhEBbzRMzAaeo3WxOrmSpjz3SCfSq7YApMlOBi5OOFrsUleciMekVil3ZDYcgj5QpdHWriX2CmbqTwb6GaiTnjp5S6Do3JwNzrxE3XOev6Iz3Le82TjcrhwW080CXotOsAmhieRy9J1VeFwxDexwq6Pkc} />
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#f8fafc] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[8px] shrink-0 size-[64px]" data-name="Background">
      <Ab6AXuBj40BNxQTraWdXox2QA96YAxOo46NzIFhIrOj23Hyp7Iw6XFpWnLpTPp7OPgJLst4E5PeMyxScN300UlL5JzGJgI3Sf6AFZv5HXdbQstPmcPSa14QwhEBbzRMzAaeo3WxOrmSpjz3SCfSq7YApMlOBi5OOFrsUleciMekVil3ZDYcgj5QpdHWriX2CmbqTwb6GaiTnjp5S6Do3JwNzrxE3XOev6Iz3Le82TjcrhwW080CXotOsAmhieRy9J1VeFwxDexwq6Pkc />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">신선팜</p>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">유기농 양상추 1통</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[61.72px]">
        <p className="leading-[24px] whitespace-pre-wrap">3,200원</p>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#fef2f2] content-stretch flex flex-col items-start px-[6px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#ef4444] text-[12px] w-[41.59px]">
        <p className="leading-[16px] whitespace-pre-wrap">+200원</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex gap-[8px] items-center pt-[2px] relative shrink-0 w-full" data-name="Container">
      <Container34 />
      <Background5 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container32 />
      <Heading5 />
      <Container33 />
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0 size-[19.969px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9688 19.9688">
        <g id="Container">
          <path d={svgPaths.p6bb2980} fill="var(--fill-0, #CBD5E1)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container35 />
    </div>
  );
}

function ButtonAlignCenter() {
  return (
    <div className="content-stretch flex items-center relative self-stretch shrink-0" data-name="Button:align-center">
      <Button4 />
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0 w-[356px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start pb-[12px] pt-[24px] px-[12px] relative w-full">
        <Background4 />
        <Container31 />
        <ButtonAlignCenter />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="absolute bg-[#f1f5f9] left-px rounded-br-[8px] top-px" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-r border-solid inset-0 pointer-events-none rounded-br-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[3px] pl-[8px] pr-[9px] pt-[2px] relative">
        <div className="flex flex-col font-['Noto_Sans_KR:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] w-[59.94px]">
          <p className="leading-[15px] whitespace-pre-wrap">재고 없음 대체</p>
        </div>
      </div>
    </div>
  );
}

function Item3AlternativeRecommendationPriceHigher() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 3: Alternative Recommendation (Price Higher)">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] w-full">
        <Container30 />
        <BackgroundBorder />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(19,127,236,0.2)] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Ab6AXuBliih4OpNoJuFcwa8W68MNfgaIMeIedv6LeDboMa8GrcZd5X2P9YvAzXoalOgF3Ah4Zsue0Svq1ZMBsgf52Mo2XXfr886GI2HhMpfnjtxhCkPn6NKkBpCxMqzWlq42FyidDpweEyumRnctrMrbPQh47QVezvNcqkWrmAygDsoXYdKnStyrOiDqzq0PM6M8UCjQb2WwjCPgHe7PbILs5YdAbtFdcTkn8J3LDeeUeiU3Uo9AfRsieapafm9NNyugRzUaBpIrp() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuBliih4opNoJuFcwa8w68MNfgaIMeIEDV6LeDboMA8grcZd5x2p9YvAzXOALOgF3AH4zsue0Svq1zMBsgf52Mo2x_Xfr886gI2HhMpfnjtxhCkPn6nKkBpCxMqzWlq42fyidDpweEyumRnctrMrbPQh47qVEZV-ncqkWrmAygDsoXYdKnStyrOIDqzq0pM6M8uCjQB2wwjCPgHe7PbILs5YdABTFdcTKN8j-3LDee-UEI-U3UO9AfRsieapafm9nNYUGRzUaBpIrp4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuBliih4OpNoJuFcwa8W68MNfgaIMeIedv6LeDboMa8GrcZd5X2P9YvAzXoalOgF3Ah4Zsue0Svq1ZMBsgf52Mo2XXfr886GI2HhMpfnjtxhCkPn6NKkBpCxMqzWlq42FyidDpweEyumRnctrMrbPQh47QVezvNcqkWrmAygDsoXYdKnStyrOiDqzq0PM6M8UCjQb2WwjCPgHe7PbILs5YdAbtFdcTkn8J3LDeeUeiU3Uo9AfRsieapafm9NNyugRzUaBpIrp4} />
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#f8fafc] relative rounded-[8px] shrink-0 size-[64px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Ab6AXuBliih4OpNoJuFcwa8W68MNfgaIMeIedv6LeDboMa8GrcZd5X2P9YvAzXoalOgF3Ah4Zsue0Svq1ZMBsgf52Mo2XXfr886GI2HhMpfnjtxhCkPn6NKkBpCxMqzWlq42FyidDpweEyumRnctrMrbPQh47QVezvNcqkWrmAygDsoXYdKnStyrOiDqzq0PM6M8UCjQb2WwjCPgHe7PbILs5YdAbtFdcTkn8J3LDeeUeiU3Uo9AfRsieapafm9NNyugRzUaBpIrp />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">자연방사</p>
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">동물복지 유정란 15구</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">8,900원</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative w-full">
        <Container37 />
        <Heading6 />
        <Container38 />
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex flex-col items-start px-[8px] py-[4px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] w-[30.27px]">
        <p className="leading-[16px] whitespace-pre-wrap">수량 1</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end relative">
        <Background7 />
      </div>
    </div>
  );
}

function Item4StandardItem() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 4: Standard Item">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[13px] relative w-full">
          <Background6 />
          <Container36 />
          <Container39 />
        </div>
      </div>
    </div>
  );
}

function Ab6AXuDsPCkqKubtSm2Cox0IxFuSwtmklDs1Rx5Jkmj2WcHkeQZyBlD2EmgZqR7JeiBonrJalxClUGzwewEzgWEiJzsT8Ci2FjqRbtqtXaXkXwBSaiwBacJkq1FmZyUnk6K3L9Bgtv0SeehyNgi5Xa5RzLjseOkSWhAKnceylaJ1Tq5E4QygaUgaIIs5VbOl9NfkpRmXN3WjSZuqt8HvoD7CUvSEalzyT699LJwIhXaZpj2Xc4WNwhtDndFAqnLyQ6TKf9LcvQ() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="AB6AXuDsPCkqKubtSM2_Cox_0IxFuSWTMKLDs1RX5JKMJ2WCHkeQZyBlD2EmgZqR7jeiBONRJalxClUGzwewEzgWEiJzsT8CI2FjqRBTQTXaXKXwBSaiwBAC_Jkq1fmZYUnk6k3l9Bgtv0SEEHY_ngi5xa5RzLJSEOkS_WH_aKnceylaJ_1Tq5e4QygaUgaIIs5vbOL9NfkpRm_xN3WjSZuqt8hvoD7cUvSEalzyT699LJwIhXAZpj2xc4wNwht-DndFAqnLyQ6tKf9LcvQ">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAb6AXuDsPCkqKubtSm2Cox0IxFuSwtmklDs1Rx5Jkmj2WcHkeQZyBlD2EmgZqR7JeiBonrJalxClUGzwewEzgWEiJzsT8Ci2FjqRbtqtXaXkXwBSaiwBacJkq1FmZyUnk6K3L9Bgtv0SeehyNgi5Xa5RzLjseOkSWhAKnceylaJ1Tq5E4QygaUgaIIs5VbOl9NfkpRmXN3WjSZuqt8HvoD7CUvSEalzyT699LJwIhXaZpj2Xc4WNwhtDndFAqnLyQ6TKf9LcvQ} />
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#f8fafc] relative rounded-[8px] shrink-0 size-[64px]" data-name="Background">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Ab6AXuDsPCkqKubtSm2Cox0IxFuSwtmklDs1Rx5Jkmj2WcHkeQZyBlD2EmgZqR7JeiBonrJalxClUGzwewEzgWEiJzsT8Ci2FjqRbtqtXaXkXwBSaiwBacJkq1FmZyUnk6K3L9Bgtv0SeehyNgi5Xa5RzLjseOkSWhAKnceylaJ1Tq5E4QygaUgaIIs5VbOl9NfkpRmXN3WjSZuqt8HvoD7CUvSEalzyT699LJwIhXaZpj2Xc4WNwhtDndFAqnLyQ6TKf9LcvQ />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">청송</p>
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] w-full">
        <p className="leading-[20px] whitespace-pre-wrap">꿀사과 1.5kg (봉)</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">12,500원</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative w-full">
        <Container41 />
        <Heading7 />
        <Container42 />
      </div>
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex flex-col items-start px-[8px] py-[4px] relative rounded-[4px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] w-[30.27px]">
        <p className="leading-[16px] whitespace-pre-wrap">수량 1</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end relative">
        <Background9 />
      </div>
    </div>
  );
}

function Item5StandardItem() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 5: Standard Item">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[13px] relative w-full">
          <Background8 />
          <Container40 />
          <Container43 />
        </div>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[13.648px] relative shrink-0 w-[11.648px]" data-name="Margin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6484 13.6484">
        <g id="Margin">
          <path d={svgPaths.p3eb99680} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[2.16px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Noto_Sans_KR:Regular',sans-serif] font-normal h-[32px] justify-center leading-[16px] relative shrink-0 text-[#64748b] text-[12px] w-[309.84px] whitespace-pre-wrap">
        <p className="mb-0">매장 상황에 따라 실제 가격이나 재고는 달라질 수 있습니다. 대</p>
        <p>체 상품은 유사한 성분과 가격대를 우선으로 추천되었습니다.</p>
      </div>
    </div>
  );
}

function WarningNote() {
  return (
    <div className="bg-[#f8fafc] relative rounded-[8px] shrink-0 w-full" data-name="Warning Note">
      <div className="content-stretch flex gap-[8px] items-start p-[12px] relative w-full">
        <Margin />
        <Container44 />
      </div>
    </div>
  );
}

function ListSection() {
  return (
    <div className="relative shrink-0 w-full" data-name="List Section">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] relative w-full">
        <SectionHeader />
        <Item1AlternativeRecommendationHeroComponent />
        <Item2StandardItem />
        <Item3AlternativeRecommendationPriceHigher />
        <Item4StandardItem />
        <Item5StandardItem />
        <WarningNote />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[1099px] items-center overflow-clip pb-[98px] pt-[16px] relative shrink-0 w-full z-[2]" data-name="Main Content">
      <SummaryCard />
      <ListSection />
    </div>
  );
}

export default function Component() {
  return (
    <div className="content-stretch flex flex-col isolate items-start relative size-full" data-name="상품별 상세 정보 및 대체 추천" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(246, 247, 248) 0%, rgb(246, 247, 248) 100%)" }}>
      <BottomActionBar />
      <Header />
      <MainContent />
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] z-[1]" data-name="Mobile Container:shadow" />
    </div>
  );
}