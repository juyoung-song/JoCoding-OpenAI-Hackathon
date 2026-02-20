import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "../../app/store/AppContext";
import { useToast } from "../../shared/ui/ToastProvider";

const weekdayOptions: Array<{ value: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"; label: string }> = [
  { value: "mon", label: "월요일" },
  { value: "tue", label: "화요일" },
  { value: "wed", label: "수요일" },
  { value: "thu", label: "목요일" },
  { value: "fri", label: "금요일" },
  { value: "sat", label: "토요일" },
  { value: "sun", label: "일요일" },
];

const parseItems = (raw: string): string[] =>
  raw
    .split(/[,|\n]/)
    .map((token) => token.trim())
    .filter((token, index, arr) => token.length > 0 && arr.indexOf(token) === index);

export default function ReservationComposerCard() {
  const { createReservationFromItems } = useApp();
  const { showToast } = useToast();
  const [label, setLabel] = useState("직접 작성 장보기");
  const [weekday, setWeekday] = useState<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">("sat");
  const [time, setTime] = useState("10:00");
  const [itemsText, setItemsText] = useState("우유, 계란, 두부");
  const parsedItems = useMemo(() => parseItems(itemsText), [itemsText]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      showToast("예약 이름을 입력해주세요.", "info");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      showToast("시간 형식은 HH:MM으로 입력해주세요.", "info");
      return;
    }
    await createReservationFromItems({
      label: trimmedLabel,
      weekday,
      time,
      plannedItems: parsedItems,
    });
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">직접 품목으로 예약 만들기</h3>
      <div className="grid grid-cols-1 gap-2">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder="예: 주말 장보기"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={weekday}
            onChange={(event) => setWeekday(event.target.value as "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            {weekdayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <textarea
          value={itemsText}
          onChange={(event) => setItemsText(event.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-20"
          placeholder="우유, 계란, 두부"
        />
      </div>
      <p className="text-xs text-gray-500">
        예약 품목 {parsedItems.length}개: {parsedItems.join(", ") || "없음"}
      </p>
      <button
        type="submit"
        className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5"
      >
        <Plus size={14} />
        직접 예약 생성
      </button>
    </form>
  );
}
