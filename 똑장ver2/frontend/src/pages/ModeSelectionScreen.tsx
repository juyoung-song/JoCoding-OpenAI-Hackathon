import { useApp } from "../app/store/AppContext";
import { ShoppingCart, Store, ArrowLeft, Sparkles, Truck } from 'lucide-react';

export default function ModeSelectionScreen() {
  const { setCurrentScreen, setSelectedMode, cartItems, fetchPlans } = useApp();

  const handleModeSelect = async (mode: 'ONLINE' | 'OFFLINE') => {
    if (cartItems.length === 0) {
      setCurrentScreen('CART_VIEW');
      return;
    }
    setSelectedMode(mode);
    await fetchPlans(mode);
  };

  const handleAIRecommend = () => {
    // Simple AI Logic based on item count/type
    // In real app, this would be more sophisticated
    const isOnlineBetter = cartItems.length >= 5;
    const recommendedMode = isOnlineBetter ? 'ONLINE' : 'OFFLINE';
    const reason = isOnlineBetter
      ? "장바구니가 무거워요! 온라인 배송을 추천해요."
      : "소량 구매는 가까운 매장이 더 빨라요.";

    alert(`AI 추천: ${reason}`); // Simple feedback
    void handleModeSelect(recommendedMode);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-5 pt-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => setCurrentScreen('HOME')}
          className="mb-6 p-2 -ml-2 hover:bg-gray-100 rounded-full w-fit transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-900" />
        </button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">
            어떻게 장을<br />보시겠어요?
          </h1>
          <p className="text-gray-500 text-sm">
            장바구니에 담은 상품의 구매 방식을 선택해주세요.
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">

        {/* Online Option */}
        <button
          onClick={() => {
            void handleModeSelect('ONLINE');
          }}
          className="w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShoppingCart size={80} className="text-blue-500" />
          </div>

          <div className="relative">
            <div className="bg-blue-100/50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <Truck size={24} />
            </div>

            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">온라인 주문</h3>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">편리해요</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">집 앞으로 배송 받기</p>

            <div className="flex flex-col gap-1 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-blue-400" />오늘 밤 11시 전 주문 시 내일 도착</span>
              <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-blue-400" />무거운 짐 없이 간편하게</span>
            </div>
          </div>
        </button>

        {/* Offline Option */}
        <button
          onClick={() => {
            void handleModeSelect('OFFLINE');
          }}
          className="w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-green-200 hover:bg-green-50/30 transition-all text-left group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Store size={80} className="text-brand-500" />
          </div>

          <div className="relative">
            <div className="bg-brand-100/50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-brand-600">
              <Store size={24} />
            </div>

            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">오프라인 방문</h3>
              <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full">빨라요</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">매장에서 직접 구매하기</p>

            <div className="flex flex-col gap-1 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-brand-400" />가장 가까운 매장 재고 확인</span>
              <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-brand-400" />퇴근길에 바로 픽업</span>
            </div>
          </div>
        </button>

        {/* AI Recommendation Button */}
        <button
          onClick={handleAIRecommend}
          className="w-full py-4 flex items-center justify-center gap-2 text-purple-600 font-medium bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
        >
          <Sparkles size={18} />
          <span>AI에게 추천받기</span>
        </button>

      </div>

      {/* Footer Disclaimer */}
      <div className="p-6 pb-10">
        <div className="bg-gray-100/50 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-400">
          <div className="shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p>온/오프라인 구매 시 상품 가격이 상이할 수 있으며, 실제 매장 재고 상황에 따라 달라질 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
