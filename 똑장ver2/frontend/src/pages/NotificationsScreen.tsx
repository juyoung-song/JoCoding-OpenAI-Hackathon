import { ArrowLeft, Bell, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "../app/store/AppContext";

const formatOccurredAt = (iso?: string) => {
  if (!iso) return "시간 정보 없음";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "시간 정보 없음";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

export default function NotificationsScreen() {
  const {
    setCurrentScreen,
    reservationAlerts,
    unreadReservationAlertCount,
    markReservationAlertRead,
    openReservationFromAlert,
    shoppingReservations,
  } = useApp();

  const awaitingApprovalReservations = useMemo(
    () => shoppingReservations.filter((entry) => entry.status === "awaiting_approval"),
    [shoppingReservations]
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => setCurrentScreen("HOME")} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">알림 센터</h1>
          <p className="text-xs text-gray-500">읽지 않은 예약 알림 {unreadReservationAlertCount}건</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {awaitingApprovalReservations.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">승인 대기 예약</p>
            <div className="space-y-2">
              {awaitingApprovalReservations.map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-lg border border-amber-100 p-3">
                  <p className="text-sm font-semibold text-gray-900">{reservation.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    예약 시간: {reservation.time} · 상태: 승인 대기
                  </p>
                  <button
                    onClick={() => void openReservationFromAlert(reservation.id)}
                    className="mt-2 px-3 py-1.5 rounded-md bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600"
                  >
                    장바구니 반영하고 비교하기
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {reservationAlerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Bell size={16} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{alert.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatOccurredAt(alert.occurredAt)}</p>
                </div>
              </div>
              {alert.read ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">읽음</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600">NEW</span>
              )}
            </div>

            {alert.plannedItems.length > 0 ? (
              <p className="text-xs text-gray-500 mt-2">품목: {alert.plannedItems.join(", ")}</p>
            ) : null}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  markReservationAlertRead(alert.id);
                }}
                className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 flex items-center gap-1"
              >
                <CheckCircle2 size={12} />
                읽음 처리
              </button>
              <button
                onClick={() => void openReservationFromAlert(alert.reservationId)}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                장바구니 반영
              </button>
            </div>
          </div>
        ))}

        {reservationAlerts.length === 0 && awaitingApprovalReservations.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-gray-400">도착한 알림이 없습니다.</div>
        ) : null}
      </div>
    </div>
  );
}

