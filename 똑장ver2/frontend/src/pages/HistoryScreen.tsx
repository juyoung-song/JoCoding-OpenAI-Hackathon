import { useMemo, useState } from "react";
import { useApp } from "../app/store/AppContext";
import { ArrowLeft, ShoppingBag, ChevronRight, CalendarClock, Trash2, X } from "lucide-react";
import ReservationComposerCard from "../features/reservation/ReservationComposerCard";

const weekdayLabel: Record<string, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
};

export default function HistoryScreen() {
  const {
    setCurrentScreen,
    orderHistory,
    shoppingReservations,
    openReservationFromAlert,
    createReservationFromLatestOrder,
    toggleReservation,
    removeReservation,
  } = useApp();
  const [activeTab, setActiveTab] = useState<"orders" | "reservations">("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const summary = useMemo(
    () => ({
      orders: orderHistory.length,
      reservations: shoppingReservations.length,
    }),
    [orderHistory.length, shoppingReservations.length]
  );
  const selectedOrder = useMemo(
    () => orderHistory.find((entry) => entry.id === selectedOrderId) ?? null,
    [orderHistory, selectedOrderId]
  );
  const formatPrice = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => setCurrentScreen("MY_PAGE")}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">주문/예약 내역</h1>
      </div>

      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === "orders" ? "bg-blue-50 text-blue-700" : "text-gray-500 bg-gray-50"
            }`}
          >
            주문 내역 {summary.orders}건
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === "reservations" ? "bg-green-50 text-green-700" : "text-gray-500 bg-gray-50"
            }`}
          >
            장보기 예약 {summary.reservations}건
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "orders"
          ? orderHistory.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{order.date}</span>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded text-[10px] font-medium">
                      {order.status}
                    </span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedOrderId(order.id);
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{order.martName}</h3>
                    <p className="text-sm text-gray-500">
                      {order.items[0] || "상품 정보 없음"} {order.itemCount > 1 ? `외 ${order.itemCount - 1}건` : ""}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                  <p>
                    플랜 근거: {order.planType ?? "unknown"} · 커버리지 {order.coverage ?? order.itemCount}/
                    {order.totalBasketItems ?? order.itemCount}
                    {typeof order.coverageRatio === "number" ? ` (${Math.round(order.coverageRatio * 100)}%)` : ""}
                  </p>
                  {order.deliveryInfo ? <p>이동/배송: {order.deliveryInfo}</p> : null}
                  {order.missingItemsCount ? <p>미포함 품목: {order.missingItemsCount}개</p> : null}
                  {order.badges && order.badges.length > 0 ? <p>적용 배지: {order.badges.join(", ")}</p> : null}
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center text-sm">
                  <span className="text-gray-500">결제금액</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {new Intl.NumberFormat("ko-KR").format(order.totalPrice)}원
                  </span>
                </div>
              </div>
            ))
          : null}

        {activeTab === "orders" && orderHistory.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <ShoppingBag size={48} className="mb-4 opacity-50" />
            <p>주문 내역이 없습니다.</p>
          </div>
        ) : null}

        {activeTab === "reservations" ? (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">현재 기능 범위</h3>
              <p className="text-xs text-gray-600 mb-3">
                예약은 주문 내역 기반 생성과 직접 품목 예약(요일/시간 설정) 모두 지원합니다.
              </p>
              <button
                onClick={createReservationFromLatestOrder}
                className="w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium"
              >
                최근 주문으로 예약 만들기
              </button>
            </div>

            <ReservationComposerCard />

            {shoppingReservations.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <CalendarClock size={18} className="text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{entry.label}</p>
                      <p className="text-xs text-gray-500">
                        매주 {weekdayLabel[entry.weekday] ?? entry.weekday}요일 {entry.time}
                      </p>
                      {entry.sourceMartName ? (
                        <p className="text-xs text-gray-400 mt-1">기준 주문: {entry.sourceMartName}</p>
                      ) : null}
                      {entry.plannedItems && entry.plannedItems.length > 0 ? (
                        <p className="text-xs text-gray-500 mt-1">예약 품목: {entry.plannedItems.join(", ")}</p>
                      ) : null}
                      {entry.status ? <p className="text-xs text-gray-500 mt-1">상태: {entry.status}</p> : null}
                    </div>
                  </div>
                  <button onClick={() => removeReservation(entry.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
                {entry.status === "awaiting_approval" ? (
                  <button
                    onClick={() => void openReservationFromAlert(entry.id)}
                    className="mt-3 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600"
                  >
                    승인 대기 처리: 장바구니 반영
                  </button>
                ) : null}
                <button
                  onClick={() => toggleReservation(entry.id)}
                  className={`mt-3 px-3 py-1.5 rounded-md text-xs font-medium ${
                    entry.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {entry.enabled ? "활성화됨" : "비활성화됨"}
                </button>
              </div>
            ))}

            {shoppingReservations.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                생성된 예약이 없습니다.
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center px-4 py-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">영수증 상세</h2>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>주문번호</span>
                <span className="font-medium text-gray-900">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>주문일시</span>
                <span className="font-medium text-gray-900">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>주문처</span>
                <span className="font-medium text-gray-900">{selectedOrder.martName}</span>
              </div>
              <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/60">
                <p className="text-xs text-gray-500 mb-2">주문 품목</p>
                <ul className="space-y-1 text-gray-700">
                  {selectedOrder.items.map((item, index) => (
                    <li key={`${selectedOrder.id}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-gray-600">총 결제금액</span>
                <span className="text-base font-bold text-gray-900">{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
