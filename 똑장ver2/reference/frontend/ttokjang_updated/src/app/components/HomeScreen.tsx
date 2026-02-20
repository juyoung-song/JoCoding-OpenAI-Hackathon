import { Mic, Search, ChevronRight } from 'lucide-react';

// Brand Character Image
const brandCharacterImg = 'https://images.unsplash.com/photo-1659018966820-de07c94e0d01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwM2QlMjByb2JvdCUyMGNoYXJhY3RlciUyMGdyZWVuJTIwc2hvcHBpbmclMjBhc3Npc3RhbnR8ZW58MXx8fHwxNzcxMzk0MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

export default function HomeScreen() {
  const { setCurrentScreen, setIsChatOpen, setPendingChatMessage } = useApp();
  const [searchText, setSearchText] = useState('');

  const handleSendMessage = () => {
    if (searchText.trim()) {
      setPendingChatMessage(searchText);
      setIsChatOpen(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-y-auto pb-24">
      {/* Header Area */}
      <div className="bg-white p-6 pb-8 rounded-b-[32px] shadow-sm relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              똑장
            </div>
            <span className="font-bold text-slate-800 text-lg">똑똑한 장보기</span>
          </div>
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="text-slate-400 text-xs">My</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
            퇴근하면 장바구니가<br />이미 준비돼 있습니다.
          </h1>
          <p className="text-slate-500 text-sm">
            AI가 당신의 취향과 예산을 분석해<br />최적의 장보기를 도와드려요.
          </p>
        </div>

        {/* Brand Character */}
        <div className="flex justify-center mb-6 -mt-4">
          <div className="w-48 h-48 relative">
            <ImageWithFallback 
              src={brandCharacterImg} 
              alt="Brand Character" 
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Chat Input / Voice Search */}
        <div className="relative mb-4">
          <input 
            type="text" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="오늘 저녁에 삼겹살 먹고 싶어" 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          />
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
            onClick={handleSendMessage}
          >
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* Recent Carts / Reserved Cards */}
      <div className="px-6 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-lg">최근 장바구니</h2>
          <button className="text-blue-500 text-sm font-medium">전체보기</button>
        </div>

        {/* Card 1 */}
        <div 
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer"
          onClick={() => setCurrentScreen('VOICE_INPUT_CONFIRM')}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">
              지난주 금요일
            </div>
            <button className="text-slate-300">
              <ChevronRight size={20} />
            </button>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">삼겹살 파티 세트</h3>
          <p className="text-slate-500 text-sm mb-4">삼겹살 600g, 상추, 쌈장 외 3개</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">42,500원</span>
            <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded-md">
              2,400원 절약
            </span>
          </div>
        </div>

         {/* Card 2 - Reserved */}
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
            예약됨
          </div>
          <div className="flex justify-between items-start mb-3">
            <div className="bg-slate-50 text-slate-500 text-xs font-bold px-2 py-1 rounded-md">
              매주 금요일 18:00
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">주말 장보기 루틴</h3>
          <p className="text-slate-500 text-sm mb-4">우유, 계란, 두부 외 5개</p>
          <button 
            onClick={() => setCurrentScreen('CART_VIEW')}
            className="w-full py-3 bg-[#59A22F] text-white font-semibold rounded-xl text-sm hover:bg-[#4a8a26] transition-colors shadow-md"
          >
            이번주 장바구니 확인하기
          </button>
        </div>
      </div>

      {/* Floating CTA for Compare Start */}
      <div className="fixed bottom-24 left-0 right-0 px-6 pointer-events-none flex justify-center z-30">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-blue-200 pointer-events-auto w-full max-w-sm flex items-center justify-center gap-2 transform transition-all active:scale-95"
          onClick={() => setCurrentScreen('MODE_SELECTION')}
        >
          <span>가격 비교 시작하기</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}