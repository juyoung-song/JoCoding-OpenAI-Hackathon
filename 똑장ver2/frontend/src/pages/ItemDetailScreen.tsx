import { ArrowLeft } from "lucide-react";
import { useApp } from "../app/store/AppContext";

const formatPrice = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

export default function ItemDetailScreen() {
  const { setCurrentScreen, selectedPlan } = useApp();

  if (!selectedPlan) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b flex items-center gap-4">
          <button onClick={() => setCurrentScreen("PLAN_DETAIL")} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold">상품 상세</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          선택된 플랜이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <button onClick={() => setCurrentScreen("PLAN_DETAIL")} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-900">상품 상세</h1>
      </div>

      <div className="p-5 space-y-3 overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-900">{selectedPlan.mart_name}</p>
          <p className="text-xs text-gray-600 mt-1">{selectedPlan.price_notice ?? "가격은 변동될 수 있습니다."}</p>
        </div>

        {selectedPlan.items.map((item, index) => (
          <div key={`${item.item_name}-${index}`} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900">
              {item.brand ? `${item.brand} ` : ""}
              {item.item_name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {item.size ?? "규격 미지정"} · {item.quantity}개
            </p>
            <p className="text-sm font-bold text-gray-900 mt-2">{formatPrice(item.price)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

