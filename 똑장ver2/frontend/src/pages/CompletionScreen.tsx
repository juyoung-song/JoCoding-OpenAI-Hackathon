import { useApp } from "../app/store/AppContext";
import { CheckCircle, Home, Receipt, MapPin, Truck, Lightbulb } from 'lucide-react';

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

const estimateArrivalLabel = (hours?: number | null) => {
  if (!hours || hours <= 0) return "도착 예정 시간 계산 중";
  const eta = new Date(Date.now() + hours * 60 * 60 * 1000);
  return `${eta.toLocaleDateString("ko-KR")} ${eta.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })} 도착 예정`;
};

export default function CompletionScreen() {
  const { setCurrentScreen, selectedPlan, userProfile, orderHistory } = useApp();

  // Fallback if no plan selected (e.g. direct access)
  const totalPrice = selectedPlan?.estimated_total || 0;
  const planName = selectedPlan?.mart_name || "똑장 알뜰 플랜";

  const defaultAddress = userProfile.addresses.find((address) => address.isDefault) ?? userProfile.addresses[0];
  const deliveryAddress = defaultAddress?.roadAddress ?? "배송지를 등록해주세요";
  const deliveryDetail = defaultAddress?.detailAddress ?? "";
  const latestOrder = orderHistory[0];
  const deliveryInfo = selectedPlan?.delivery_info ?? latestOrder?.deliveryInfo ?? "배송 정보 확인 중";
  const arrivalLabel = estimateArrivalLabel(selectedPlan?.expected_delivery_hours);
  const tipText = latestOrder
    ? `이번 주문은 ${latestOrder.itemCount}개 품목, 총 ${formatPrice(latestOrder.totalPrice)}입니다. 다음 장보기도 같은 흐름으로 빠르게 진행할 수 있어요.`
    : "주문 내역이 쌓이면 구매 패턴을 분석해 맞춤 소비 팁을 제공할 예정이에요.";

  return (
    <div className="h-full flex flex-col bg-green-50/50">
      {/* Header Guard (Simulated Mobile Header) */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setCurrentScreen('HOME')}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Main Success Message */}
        <div className="flex flex-col items-center mt-4 mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-sm">
            <CheckCircle size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다!</h1>
          <p className="text-center text-gray-500 text-sm leading-relaxed">
            똑똑한 장보기가 시작되었습니다.<br />
            주문하신 내역을 확인해주세요.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          {/* Decorative Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500" />

          {/* Total Amount */}
          <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
            <span className="text-sm text-gray-500 mb-1">총 결제 금액</span>
            <span className="text-3xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
            <span className="text-xs text-brand-600 font-medium bg-brand-50 px-2 py-1 rounded mt-2">
              {planName} 적용됨
            </span>
          </div>

          {/* Delivery Info */}
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                <Truck size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">배송 예정</p>
                <p className="font-bold text-gray-900 text-sm">{arrivalLabel}</p>
                <p className="text-xs text-green-600 mt-0.5">{deliveryInfo}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">배송지</p>
                <p className="font-medium text-gray-900 text-sm">{deliveryAddress}</p>
                <p className="text-xs text-gray-500 text-sm">{deliveryDetail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Tip */}
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex gap-3 items-start">
          <Lightbulb size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">AI 소비 분석 팁</h3>
            <p className="text-sm text-gray-600 leading-snug">
              {tipText}
            </p>
          </div>
        </div>

        {latestOrder ? (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">이번 주문 플랜 근거</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                {latestOrder.planType ?? "plan"} · 커버리지 {latestOrder.coverage ?? latestOrder.itemCount}/
                {latestOrder.totalBasketItems ?? latestOrder.itemCount}
                {typeof latestOrder.coverageRatio === "number"
                  ? ` (${Math.round(latestOrder.coverageRatio * 100)}%)`
                  : ""}
              </p>
              {latestOrder.deliveryInfo ? <p>{latestOrder.deliveryInfo}</p> : null}
              {latestOrder.priceSource ? <p>가격 출처: {latestOrder.priceSource}</p> : null}
              {latestOrder.priceObservedAt ? <p>관측 시점: {latestOrder.priceObservedAt}</p> : null}
              {latestOrder.priceNotice ? <p className="text-amber-700">{latestOrder.priceNotice}</p> : null}
              {latestOrder.missingItemsCount ? <p>미포함 품목 {latestOrder.missingItemsCount}개</p> : null}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex justify-center text-xs text-gray-400">
          주문번호: {latestOrder?.id ?? `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}ORD0000`}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-white border-t border-gray-200 p-4 pb-8">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setCurrentScreen('HOME')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>홈으로 돌아가기</span>
            <Home size={18} />
          </button>
          <button
            onClick={() => setCurrentScreen('HISTORY')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-4 rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <span>영수증 보기</span>
            <Receipt size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
