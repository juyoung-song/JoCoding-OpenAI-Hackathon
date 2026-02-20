import { useMemo } from "react";
import { useApp } from "../app/store/AppContext";
import { ArrowLeft, CalendarClock, Plus, Trash2 } from "lucide-react";
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

export default function RecommendationScreen() {
  const {
    setCurrentScreen,
    shoppingReservations,
    openReservationFromAlert,
    createReservationFromLatestOrder,
    toggleReservation,
    removeReservation,
    orderHistory,
  } = useApp();

  const activeCount = useMemo(
    () => shoppingReservations.filter((entry) => entry.enabled).length,
    [shoppingReservations]
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => setCurrentScreen("HOME")} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">장보기 예약 관리</h1>
          <p className="text-xs text-gray-500">
            총 {shoppingReservations.length}건 · 활성 {activeCount}건
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">기능 범위 안내</h2>
          <p className="text-xs text-gray-600 mb-3">
            최근 주문 기반 예약과 직접 품목 예약(요일/시간 반복)을 모두 지원합니다.
          </p>
          <button
            onClick={createReservationFromLatestOrder}
            disabled={orderHistory.length === 0}
            className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${
              orderHistory.length === 0
                ? "bg-gray-100 text-gray-400"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            <Plus size={14} />
            최근 주문으로 예약 생성
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
                  {entry.status ? (
                    <p className="text-xs text-gray-500 mt-1">상태: {entry.status}</p>
                  ) : null}
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
              {entry.enabled ? "예약 활성화됨" : "예약 비활성화됨"}
            </button>
          </div>
        ))}

        {shoppingReservations.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">
            생성된 예약이 없습니다.
          </div>
        ) : null}
      </div>
    </div>
  );
}
