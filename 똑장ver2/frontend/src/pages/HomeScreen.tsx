import { useMemo, useState } from "react";
import { Mic, ChevronRight, Bell } from "lucide-react";
import { useApp } from "../app/store/AppContext";
import ddokjangLogo from "../assets/ddokjang-logo.png";

// Brand Character Image
const brandCharacterImg = 'https://images.unsplash.com/photo-1659018966820-de07c94e0d01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwM2QlMjByb2JvdCUyMGNoYXJhY3RlciUyMGdyZWVuJTIwc2hvcHBpbmclMjBhc3Npc3RhbnR8ZW58MXx8fHwxNzcxMzk0MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
const weekdayLabel: Record<string, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
};

export default function HomeScreen() {
  const {
    setCurrentScreen,
    setIsChatOpen,
    setPendingChatMessage,
    orderHistory,
    shoppingReservations,
    unreadReservationAlertCount,
  } = useApp();
  const [searchText, setSearchText] = useState('');
  const recentOrders = useMemo(() => orderHistory.slice(0, 2), [orderHistory]);
  const nextReservation = useMemo(() => {
    const enabled = shoppingReservations.filter((entry) => entry.enabled);
    if (enabled.length === 0) return null;
    return [...enabled].sort((a, b) => {
      const aTs = Date.parse(a.nextRunAt ?? "");
      const bTs = Date.parse(b.nextRunAt ?? "");
      const aValid = Number.isFinite(aTs);
      const bValid = Number.isFinite(bTs);
      if (aValid && bValid) return aTs - bTs;
      if (aValid) return -1;
      if (bValid) return 1;
      return 0;
    })[0];
  }, [shoppingReservations]);

  const formatPrice = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

  const getOrderLabel = (dateText: string, index: number) => {
    const normalized = dateText.replace(/\./g, "-");
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      return index === 0 ? "최근 주문" : `주문 기록 ${index + 1}`;
    }

    const now = new Date();
    const diffDays = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "오늘 주문";
    if (diffDays === 1) return "어제 주문";
    if (diffDays < 7) return `${diffDays}일 전 주문`;
    return `${dateText} 주문`;
  };

  const handleSendMessage = () => {
    if (searchText.trim()) {
      setPendingChatMessage(searchText);
      setIsChatOpen(true);
      setSearchText('');
      return;
    }
    setCurrentScreen('VOICE_INPUT_CONFIRM');
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
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden border border-green-200">
              <img src={ddokjangLogo} alt="똑장 로고" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-800 text-lg">똑똑한 장보기</span>
          </div>
          <button
            onClick={() => setCurrentScreen("NOTIFICATIONS")}
            className="relative w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700"
            aria-label="알림"
          >
            <Bell size={16} />
            {unreadReservationAlertCount > 0 ? (
              <span className="absolute -mt-5 ml-5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">
                {unreadReservationAlertCount > 9 ? "9+" : unreadReservationAlertCount}
              </span>
            ) : null}
          </button>
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
            <img
              src={brandCharacterImg}
              alt="Brand Character"
              className="w-full h-full object-contain drop-shadow-xl"
              loading="lazy"
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
          <button
            onClick={() => setCurrentScreen('HISTORY')}
            className="text-blue-500 text-sm font-medium hover:text-blue-700"
          >
            전체보기
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="bg-slate-50 text-slate-500 text-xs font-bold px-2 py-1 rounded-md inline-block mb-3">
              최근 주문 없음
            </div>
            <h3 className="font-bold text-slate-800 mb-1">첫 장바구니를 만들어보세요</h3>
            <p className="text-slate-500 text-sm mb-4">AI 채팅으로 필요한 품목을 말하면 장바구니에 바로 담깁니다.</p>
            <button
              onClick={() => setCurrentScreen("CART_VIEW")}
              className="w-full py-3 bg-[#59A22F] text-white font-semibold rounded-xl text-sm hover:bg-[#4a8a26] transition-colors shadow-md"
            >
              장바구니 보러가기
            </button>
          </div>
        ) : (
          recentOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer"
              onClick={() => setCurrentScreen(index === 0 ? "CART_VIEW" : "HISTORY")}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">
                  {getOrderLabel(order.date, index)}
                </div>
                <button className="text-slate-300">
                  <ChevronRight size={20} />
                </button>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{order.martName}</h3>
              <p className="text-slate-500 text-sm mb-4">
                {order.items[0] || "상품 정보 없음"} {order.itemCount > 1 ? `외 ${order.itemCount - 1}개` : ""}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{formatPrice(order.totalPrice)}</span>
                <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded-md">
                  {index === 0 ? "재구매 추천" : `총 ${order.itemCount}개`}
                </span>
              </div>
            </div>
          ))
        )}

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-slate-50 text-slate-500 text-xs font-bold px-2 py-1 rounded-md inline-block mb-3">
            장보기 예약
          </div>
          <h3 className="font-bold text-slate-800 mb-1">원하는 시간에 장보기 예약</h3>
          <p className="text-slate-500 text-sm mb-4">
            {nextReservation
              ? `다음 예약: ${weekdayLabel[nextReservation.weekday] ?? nextReservation.weekday}요일 ${nextReservation.time} (${nextReservation.label})`
              : "최근 주문을 기준으로 반복 예약을 만들 수 있어요."}
          </p>
          <button
            onClick={() => setCurrentScreen("RECOMMENDATION")}
            className="w-full py-3 bg-[#59A22F] text-white font-semibold rounded-xl text-sm hover:bg-[#4a8a26] transition-colors shadow-md"
          >
            예약 관리하기
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
