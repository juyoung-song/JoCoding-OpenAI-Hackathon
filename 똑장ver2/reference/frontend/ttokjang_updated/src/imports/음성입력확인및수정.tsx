import svgPaths from "./svg-rz12wtz7om";
import { useApp } from "../app/store/AppContext";
import { useState } from "react";
function Container1() {
  return (
    <div className="h-[11.648px] relative shrink-0 w-[10.5px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 11.6484">
        <g id="Container">
          <path d={svgPaths.p170355d8} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#137fec] text-[14px] w-[139.94px]">
        <p className="leading-[20px] whitespace-pre-wrap">방금 말씀하신 내용이에요</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute bg-[rgba(19,127,236,0.05)] h-[21px] left-[129.28px] rounded-[4px] top-[4px] w-[94.58px]" data-name="Overlay">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Medium',sans-serif] h-[30px] justify-center leading-[0] left-[4px] not-italic text-[#137fec] text-[18px] top-[10.5px] w-[86.58px]">
        <p className="[text-decoration-skip-ink:none] decoration-dotted leading-[29.25px] underline whitespace-pre-wrap">삼겹살 한 근</p>
      </div>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="absolute bg-[rgba(19,127,236,0.05)] h-[21px] left-[95.84px] rounded-[4px] top-[33.25px] w-[79.02px]" data-name="Overlay">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Medium',sans-serif] h-[30px] justify-center leading-[0] left-[4px] not-italic text-[#137fec] text-[18px] top-[10.5px] w-[71.02px]">
        <p className="[text-decoration-skip-ink:none] decoration-dotted leading-[29.25px] underline whitespace-pre-wrap">계란 한 판</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[87.75px] relative shrink-0 w-[292px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] h-[30px] justify-center leading-[0] left-0 not-italic text-[#1e293b] text-[18px] top-[14.5px] w-[129.28px]">
          <p className="leading-[29.25px] whitespace-pre-wrap">{`"오늘 저녁에 먹을 `}</p>
        </div>
        <Overlay />
        <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] h-[30px] justify-center leading-[0] left-[223.86px] not-italic text-[#1e293b] text-[18px] top-[14.5px] w-[66.77px]">
          <p className="whitespace-pre-wrap">
            <span className="leading-[29.25px]">{`이랑 `}</span>
            <span className="font-['Pretendard:Medium',sans-serif] leading-[29.25px] not-italic text-[#0f172a]">우유</span>
          </p>
        </div>
        <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Medium',sans-serif] h-[30px] justify-center leading-[0] left-0 not-italic text-[#0f172a] text-[18px] top-[43.75px] w-[95.84px]">
          <p className="whitespace-pre-wrap">
            <span className="leading-[29.25px]">두 개</span>
            <span className="font-['Pretendard:Regular',sans-serif] leading-[29.25px] not-italic text-[#1e293b]">{`, 그리고 `}</span>
          </p>
        </div>
        <Overlay1 />
        <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] h-[30px] justify-center leading-[0] left-[174.86px] not-italic text-[#1e293b] text-[18px] top-[43.75px] w-[102.38px]">
          <p className="leading-[29.25px] whitespace-pre-wrap">{` 장바구니에 담`}</p>
        </div>
        <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] h-[30px] justify-center leading-[0] left-0 not-italic text-[#1e293b] text-[18px] top-[73px] w-[41.06px]">
          <p className="leading-[29.25px] whitespace-pre-wrap">{`아줘."`}</p>
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p2ca6c100} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-white bottom-[13px] right-[13px] rounded-[9999px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[7px] relative">
        <Container4 />
      </div>
    </div>
  );
}

function SpeechBubble() {
  return (
    <div className="bg-[#f8fafc] relative rounded-bl-[16px] rounded-br-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="Speech Bubble">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-bl-[16px] rounded-br-[16px] rounded-tr-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="content-stretch flex flex-col items-start p-[25px] relative w-full">
        <Container3 />
        <Button />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[11.641px] relative shrink-0 w-[16.641px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6406 11.6406">
        <g id="Container">
          <path d={svgPaths.p3d07ed20} fill="var(--fill-0, #137FEC)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] text-center">
          <p className="leading-[16px] whitespace-nowrap">직접 수정</p>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = () => {
    setIsEditing(true);
    alert('직접 수정 기능이 활성화되었습니다. 텍스트를 직접 편집할 수 있습니다.');
  };
  
  return (
    <div 
      className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px] cursor-pointer hover:bg-blue-50 transition-colors" 
      data-name="Button"
      onClick={handleEdit}
    >
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[6px] items-center justify-center px-[9px] py-[13px] relative w-full">
          <Container5 />
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[15.82px] relative shrink-0 w-[11.514px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.5138 15.8203">
        <g id="Container">
          <path d={svgPaths.p23224b80} fill="var(--fill-0, #F43F5E)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] text-center w-[54.8px]">
          <p className="leading-[16px] whitespace-pre-wrap">다시 말하기</p>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  const { setCurrentScreen, setIsChatOpen } = useApp();
  
  const handleRespeak = () => {
    alert('다시 말하기 기능이 활성화되었습니다. 음성 입력을 다시 시작합니다.');
    setCurrentScreen('HOME');
    setTimeout(() => setIsChatOpen(true), 300);
  };
  
  return (
    <div 
      className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px] cursor-pointer hover:bg-red-50 transition-colors" 
      data-name="Button"
      onClick={handleRespeak}
    >
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[6px] items-center justify-center px-[9px] py-[13px] relative w-full">
          <Container7 />
          <Container8 />
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 size-[16.641px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6406 16.6406">
        <g id="Container">
          <path d={svgPaths.p1914f040} fill="var(--fill-0, #10B981)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] text-center w-[44.42px]">
          <p className="leading-[16px] whitespace-pre-wrap">추가 입력</p>
        </div>
      </div>
    </div>
  );
}

function Button3() {
  const { setIsChatOpen } = useApp();
  
  const handleAdditionalInput = () => {
    alert('추가 입력 기능이 활성화되었습니다. 추가로 상품을 말씀해주세요.');
    setIsChatOpen(true);
  };
  
  return (
    <div 
      className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px] cursor-pointer hover:bg-green-50 transition-colors" 
      data-name="Button"
      onClick={handleAdditionalInput}
    >
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col gap-[6px] items-center justify-center px-[9px] py-[13px] relative w-full">
          <Container9 />
          <Container10 />
        </div>
      </div>
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="content-stretch flex gap-[12px] items-start justify-center pt-[4px] relative shrink-0 w-full" data-name="Action Buttons">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function VoiceInputSection() {
  return (
    <div className="relative shrink-0 w-full" data-name="Voice Input Section">
      <div className="content-stretch flex flex-col gap-[12px] items-start pb-[16px] pt-[24px] px-[24px] relative w-full">
        <Container />
        <SpeechBubble />
        <ActionButtons />
      </div>
    </div>
  );
}

function Background() {
  const { cartItems } = useApp();
  return (
    <div className="bg-[#137fec] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white w-[7.67px]">
        <p className="leading-[16px] whitespace-pre-wrap">{cartItems.length}</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px] w-[66.38px]">
        <p className="leading-[28px] whitespace-pre-wrap">담긴 상품</p>
      </div>
      <Background />
    </div>
  );
}

function Button4() {
  const { clearCart } = useApp();
  const [showModal, setShowModal] = useState(false);
  
  const handleClearAll = () => {
    setShowModal(true);
  };
  
  const confirmClear = () => {
    clearCart();
    setShowModal(false);
  };
  
  return (
    <>
      <div 
        className="content-stretch flex flex-col items-center justify-center relative shrink-0 cursor-pointer hover:text-red-500 transition-colors" 
        data-name="Button"
        onClick={handleClearAll}
      >
        <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[12px] text-center w-[44.42px]">
          <p className="leading-[16px] whitespace-pre-wrap">전체 삭제</p>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-[24px]" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[16px] w-full max-w-[320px] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-[24px] pb-[20px]">
              <h3 className="text-[18px] font-['Pretendard:Bold',sans-serif] text-[#0f172a] mb-[8px]">
                전체 삭제
              </h3>
              <p className="text-[14px] font-['Pretendard:Regular',sans-serif] text-[#64748b] leading-[20px]">
                장바구니의 모든 상품을 삭제하시겠습니까?
              </p>
            </div>
            <div className="flex gap-[8px] p-[16px] pt-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-[12px] px-[16px] bg-[#f1f5f9] rounded-[8px] text-[14px] font-['Pretendard:Medium',sans-serif] text-[#475569] hover:bg-[#e2e8f0] transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmClear}
                className="flex-1 py-[12px] px-[16px] bg-[#f43f5e] rounded-[8px] text-[14px] font-['Pretendard:Medium',sans-serif] text-white hover:bg-[#e11d48] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Button4 />
    </div>
  );
}

function Background1() {
  return (
    <div className="relative shrink-0 size-[56px]" data-name="Background">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
        <g id="Background">
          <rect fill="var(--fill-0, #FEF2F2)" height="56" rx="8" width="56" />
          <path d={svgPaths.p3d25d900} fill="var(--fill-0, #1E293B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[86.66px]">
        <p className="leading-[24px] whitespace-pre-wrap">국내산 삼겹살</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 size-[9.896px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.89648 9.89648">
        <g id="Container">
          <path d={svgPaths.p3eaf9a98} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  const { removeCartItem } = useApp();
  
  return (
    <div 
      className="absolute content-stretch flex flex-col items-center justify-center left-0 p-[8px] top-[-4px] cursor-pointer hover:bg-red-50 rounded-full transition-colors" 
      data-name="Button"
      onClick={() => removeCartItem('item1')}
    >
      <Container15 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="h-[40px] relative shrink-0 w-[26px]" data-name="Button:margin">
      <Button5 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <ButtonMargin />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] w-[95.47px]">
        <p className="leading-[20px] whitespace-pre-wrap">100g당 2,580원</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[1.313px] relative shrink-0 w-[9.313px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3125 1.3125">
        <g id="Container">
          <path d={svgPaths.p15748800} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  const { cartItems, updateCartItemQuantity } = useApp();
  const item = cartItems.find(i => i.id === 'item1');
  
  const handleDecrease = () => {
    if (item) {
      const newQuantity = item.quantity - (item.unit === 'g' ? 100 : 1);
      if (newQuantity >= (item.unit === 'g' ? 100 : 1)) {
        updateCartItemQuantity('item1', newQuantity);
      }
    }
  };
  
  return (
    <div 
      className="content-stretch flex h-full items-center justify-center relative shrink-0 w-[32px] cursor-pointer hover:bg-gray-200 rounded-l-[8px] transition-colors" 
      data-name="Button"
      onClick={handleDecrease}
    >
      <Container18 />
    </div>
  );
}

function Container19() {
  const { cartItems } = useApp();
  const item = cartItems.find(i => i.id === 'item1');
  
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[40px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Semi_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center">
        <p className="leading-[20px] whitespace-pre-wrap">{item ? `${item.quantity}${item.unit}` : '600g'}</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 size-[9.313px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3125 9.3125">
        <g id="Container">
          <path d={svgPaths.pa24ab00} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  const { cartItems, updateCartItemQuantity } = useApp();
  const item = cartItems.find(i => i.id === 'item1');
  
  const handleIncrease = () => {
    if (item) {
      const newQuantity = item.quantity + (item.unit === 'g' ? 100 : 1);
      updateCartItemQuantity('item1', newQuantity);
    }
  };
  
  return (
    <div 
      className="content-stretch flex h-full items-center justify-center relative shrink-0 w-[32px] cursor-pointer hover:bg-gray-200 rounded-r-[8px] transition-colors" 
      data-name="Button"
      onClick={handleIncrease}
    >
      <Container20 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex h-[32px] items-center relative rounded-[8px] shrink-0" data-name="Background">
      <Button6 />
      <Container19 />
      <Button7 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <Background2 />
    </div>
  );
}

function Container13() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Container14 />
        <Container16 />
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 1">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[17px] relative w-full">
          <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]" data-name="Item 1:shadow" />
          <Background1 />
          <Container13 />
        </div>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="relative shrink-0 size-[56px]" data-name="Background">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
        <g id="Background">
          <rect fill="var(--fill-0, #EFF6FF)" height="56" rx="8" width="56" />
          <path d={svgPaths.p3d25d900} fill="var(--fill-0, #1E293B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[75.23px]">
        <p className="leading-[24px] whitespace-pre-wrap">서울우유 1L</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 size-[9.896px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.89648 9.89648">
        <g id="Container">
          <path d={svgPaths.p3eaf9a98} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  const { removeCartItem } = useApp();
  
  return (
    <div 
      className="absolute content-stretch flex flex-col items-center justify-center left-0 p-[8px] top-[-4px] cursor-pointer hover:bg-red-50 rounded-full transition-colors" 
      data-name="Button"
      onClick={() => removeCartItem('item2')}
    >
      <Container23 />
    </div>
  );
}

function ButtonMargin1() {
  return (
    <div className="h-[40px] relative shrink-0 w-[26px]" data-name="Button:margin">
      <Button8 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <ButtonMargin1 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] w-[49.25px]">
        <p className="leading-[20px] whitespace-pre-wrap">2,980원</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[1.313px] relative shrink-0 w-[9.313px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3125 1.3125">
        <g id="Container">
          <path d={svgPaths.p15748800} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button9() {
  const { cartItems, updateCartItemQuantity } = useApp();
  const item = cartItems.find(i => i.id === 'item2');
  
  const handleDecrease = () => {
    if (item) {
      const newQuantity = item.quantity - (item.unit === 'g' ? 100 : 1);
      if (newQuantity >= (item.unit === 'g' ? 100 : 1)) {
        updateCartItemQuantity('item2', newQuantity);
      }
    }
  };
  
  return (
    <div 
      className="content-stretch flex h-full items-center justify-center relative shrink-0 w-[32px] cursor-pointer hover:bg-gray-200 rounded-l-[8px] transition-colors" 
      data-name="Button"
      onClick={handleDecrease}
    >
      <Container26 />
    </div>
  );
}

function Container27() {
  const { cartItems } = useApp();
  const item = cartItems.find(i => i.id === 'item2');
  
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[32px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Semi_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center">
        <p className="leading-[20px] whitespace-pre-wrap">{item ? `${item.quantity}${item.unit}` : '2개'}</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 size-[9.313px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3125 9.3125">
        <g id="Container">
          <path d={svgPaths.pa24ab00} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  const { cartItems, updateCartItemQuantity } = useApp();
  const item = cartItems.find(i => i.id === 'item2');
  
  const handleIncrease = () => {
    if (item) {
      const newQuantity = item.quantity + (item.unit === 'g' ? 100 : 1);
      updateCartItemQuantity('item2', newQuantity);
    }
  };
  
  return (
    <div 
      className="content-stretch flex h-full items-center justify-center relative shrink-0 w-[32px] cursor-pointer hover:bg-gray-200 rounded-r-[8px] transition-colors" 
      data-name="Button"
      onClick={handleIncrease}
    >
      <Container28 />
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex h-[32px] items-center relative rounded-[8px] shrink-0" data-name="Background">
      <Button9 />
      <Container27 />
      <Button10 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <Background4 />
    </div>
  );
}

function Container21() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Container22 />
        <Container24 />
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 2">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[17px] relative w-full">
          <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]" data-name="Item 2:shadow" />
          <Background3 />
          <Container21 />
        </div>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="relative shrink-0 size-[56px]" data-name="Background">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
        <g id="Background">
          <rect fill="var(--fill-0, #FEFCE8)" height="56" rx="8" width="56" />
          <path d={svgPaths.p3d25d900} fill="var(--fill-0, #1E293B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[124.95px]">
        <p className="leading-[24px] whitespace-pre-wrap">무항생제 특란 30구</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="relative shrink-0 size-[9.896px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.89648 9.89648">
        <g id="Container">
          <path d={svgPaths.p3eaf9a98} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  const { removeCartItem } = useApp();
  
  return (
    <div 
      className="absolute content-stretch flex flex-col items-center justify-center left-0 p-[8px] top-[-4px] cursor-pointer hover:bg-red-50 rounded-full transition-colors" 
      data-name="Button"
      onClick={() => removeCartItem('item3')}
    >
      <Container31 />
    </div>
  );
}

function ButtonMargin2() {
  return (
    <div className="h-[40px] relative shrink-0 w-[26px]" data-name="Button:margin">
      <Button11 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Heading4 />
      <ButtonMargin2 />
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] w-[49.06px]">
        <p className="leading-[20px] whitespace-pre-wrap">8,900원</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[1.313px] relative shrink-0 w-[9.313px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3125 1.3125">
        <g id="Container">
          <path d={svgPaths.p15748800} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  const { cartItems, updateCartItemQuantity } = useApp();
  const item = cartItems.find(i => i.id === 'item3');
  
  const handleDecrease = () => {
    if (item) {
      const newQuantity = item.quantity - (item.unit === 'g' ? 100 : 1);
      if (newQuantity >= (item.unit === 'g' ? 100 : 1)) {
        updateCartItemQuantity('item3', newQuantity);
      }
    }
  };
  
  return (
    <div 
      className="content-stretch flex h-full items-center justify-center relative shrink-0 w-[32px] cursor-pointer hover:bg-gray-200 rounded-l-[8px] transition-colors" 
      data-name="Button"
      onClick={handleDecrease}
    >
      <Container34 />
    </div>
  );
}

function Container35() {
  const { cartItems } = useApp();
  const item = cartItems.find(i => i.id === 'item3');
  
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[32px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Semi_Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center">
        <p className="leading-[20px] whitespace-pre-wrap">{item ? `${item.quantity}${item.unit}` : '1개'}</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 size-[9.313px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3125 9.3125">
        <g id="Container">
          <path d={svgPaths.pa24ab00} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button13() {
  const { cartItems, updateCartItemQuantity } = useApp();
  const item = cartItems.find(i => i.id === 'item3');
  
  const handleIncrease = () => {
    if (item) {
      const newQuantity = item.quantity + (item.unit === 'g' ? 100 : 1);
      updateCartItemQuantity('item3', newQuantity);
    }
  };
  
  return (
    <div 
      className="content-stretch flex h-full items-center justify-center relative shrink-0 w-[32px] cursor-pointer hover:bg-gray-200 rounded-r-[8px] transition-colors" 
      data-name="Button"
      onClick={handleIncrease}
    >
      <Container36 />
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex h-[32px] items-center relative rounded-[8px] shrink-0" data-name="Background">
      <Button12 />
      <Container35 />
      <Button13 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container33 />
      <Background6 />
    </div>
  );
}

function Container29() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <Container30 />
        <Container32 />
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Item 3">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[17px] relative w-full">
          <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]" data-name="Item 3:shadow" />
          <Background5 />
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Container12() {
  const { cartItems } = useApp();
  
  if (cartItems.length === 0) {
    return (
      <div className="content-stretch flex flex-col gap-[16px] items-center justify-center py-[40px] relative shrink-0 w-full" data-name="Container">
        <p className="text-[#94a3b8] text-[14px]">장바구니가 비어있습니다</p>
      </div>
    );
  }
  
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      {cartItems.map((item) => {
        if (item.id === 'item1') return <Item key={item.id} />;
        if (item.id === 'item2') return <Item1 key={item.id} />;
        if (item.id === 'item3') return <Item2 key={item.id} />;
        return null;
      })}
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 size-[10.477px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.4766 10.4766">
        <g id="Container">
          <path d={svgPaths.p197d6240} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] text-center w-[155.45px]">
          <p className="leading-[20px] whitespace-pre-wrap">직접 상품 검색해서 추가하기</p>
        </div>
      </div>
    </div>
  );
}

function AddManualItemButton() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center pb-[13px] pt-[9px] px-px relative rounded-[12px] shrink-0 w-full" data-name="Add Manual Item Button">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-dashed inset-0 pointer-events-none rounded-[12px]" />
      <Container37 />
      <Container38 />
    </div>
  );
}

function ParsedListSection() {
  return (
    <div className="relative shrink-0 w-full" data-name="Parsed List Section">
      <div className="content-stretch flex flex-col gap-[20px] items-start pb-[40px] pt-[24px] px-[24px] relative w-full">
        <Container11 />
        <Container12 />
        <AddManualItemButton />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[18.973px] relative shrink-0 w-[10.84px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8398 18.9727">
        <g id="Container">
          <path d={svgPaths.p3eff8440} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button14() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 cursor-pointer hover:bg-slate-100" data-name="Button" onClick={() => setCurrentScreen('HOME')}>
      <Container40 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Pretendard:Semi_Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[18px]">
        <p className="leading-[28px] whitespace-nowrap">음성 입력 확인</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[4.031px] relative shrink-0 w-[16.031px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.0312 4.03125">
        <g id="Container">
          <path d={svgPaths.pa0a2d00} fill="var(--fill-0, #1E293B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button15() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center opacity-0 p-[8px] relative rounded-[9999px] shrink-0" data-name="Button">
      <Container41 />
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pl-[16px] pr-[16.02px] relative size-full">
          <Button14 />
          <Heading />
          <Button15 />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.9)] content-stretch flex flex-col items-start left-0 pb-px right-0 top-0" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <Container39 />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] w-[64.08px]">
        <p className="leading-[20px] whitespace-pre-wrap">총 3개 상품</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[28px] leading-[0] not-italic relative shrink-0 w-[114.05px]" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Bold',sans-serif] h-[28px] justify-center left-0 text-[#0f172a] text-[18px] top-[13.5px] w-[93.3px]">
        <p className="leading-[28px] whitespace-pre-wrap">{`~28,800원 `}</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Pretendard:Regular',sans-serif] h-[16px] justify-center left-[93.3px] text-[#94a3b8] text-[12px] top-[16px] w-[20.75px]">
        <p className="leading-[16px] whitespace-pre-wrap">예상</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[4px] relative w-full">
          <Container43 />
          <Paragraph />
        </div>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white w-[97.5px]">
        <p className="leading-[28px] whitespace-pre-wrap">장바구니 담기</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[16.641px] relative shrink-0 w-[16.672px]" data-name="Container">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6725 16.6406">
        <g id="Container">
          <path d={svgPaths.pa649e00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button16() {
  const { setCurrentScreen } = useApp();
  return (
    <div className="bg-[#137fec] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-blue-600 transition-colors" data-name="Button" onClick={() => setCurrentScreen('MODE_SELECTION')}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center py-[14px] relative w-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_8px_30px_-4px_rgba(19,127,236,0.25)]" data-name="Button:shadow" />
        <Container44 />
        <Container45 />
      </div>
    </div>
  );
}

function BottomFixedAction() {
  return (
    <div className="backdrop-blur-[8px] bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col gap-[12px] items-start pb-[16px] pt-[17px] px-[16px] shrink-0 w-full" data-name="Bottom Fixed Action">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-solid border-t left-0 right-0 top-0 pointer-events-none" />
      <Container42 />
      <Button16 />
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full overflow-y-auto" data-name="음성 입력 확인 및 수정" style={{ backgroundImage: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%), linear-gradient(90deg, rgb(246, 247, 248) 0%, rgb(246, 247, 248) 100%)" }}>
      <div className="min-h-full flex flex-col">
        <Header />
        <div className="pt-[57px] flex-1 flex flex-col">
          <VoiceInputSection />
          <div className="bg-[#f6f7f8] h-[8px] shrink-0 w-full" data-name="Divider" />
          <ParsedListSection />
          <BottomFixedAction />
        </div>
      </div>
    </div>
  );
}