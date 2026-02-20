import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import { useApp } from "../app/store/AppContext";
import { useToast } from "../shared/ui/ToastProvider";

export default function PaymentMethodsScreen() {
  const { setCurrentScreen } = useApp();
  const { showToast } = useToast();

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => setCurrentScreen("MY_PAGE")}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900">결제 수단 관리</h1>
      </div>

      <div className="p-5 flex-1">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3">
            <CreditCard size={24} className="text-gray-500" />
          </div>
          <p className="text-sm text-gray-700 mb-1">등록된 결제 수단이 없습니다.</p>
          <p className="text-xs text-gray-500">클로즈드 베타 준비중 단계로 결제수단 등록은 샌드박스에서만 지원됩니다.</p>
          <button
            onClick={() => showToast("결제수단 추가는 베타 샌드박스 준비중입니다.", "info")}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white inline-flex items-center gap-2"
          >
            <Plus size={14} />
            결제 수단 추가
          </button>
        </div>
      </div>
    </div>
  );
}
