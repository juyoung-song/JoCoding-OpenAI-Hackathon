import { useState } from "react";
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useApp } from "../app/store/AppContext";
import { useToast } from "../shared/ui/ToastProvider";

const ADDRESS_RETURN_KEY = "ddokjang.address.return.screen";

export default function AddressBookScreen() {
  const { setCurrentScreen, userProfile, addAddress, updateAddress, removeAddress, setDefaultAddress } = useApp();
  const { showToast } = useToast();
  const returnScreen = (sessionStorage.getItem(ADDRESS_RETURN_KEY) as "PAYMENT" | "ACCOUNT_INFO" | null) ?? "ACCOUNT_INFO";
  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState("집");
  const [roadAddress, setRoadAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const startAdd = () => {
    setEditingId(null);
    setLabel("집");
    setRoadAddress("");
    setDetailAddress("");
    setIsAdding(true);
  };

  const startEdit = (id: string) => {
    const target = userProfile.addresses.find((addr) => addr.id === id);
    if (!target) return;
    setEditingId(id);
    setLabel(target.label);
    setRoadAddress(target.roadAddress);
    setDetailAddress(target.detailAddress);
    setIsAdding(true);
  };

  const saveAddress = () => {
    if (!roadAddress.trim()) {
      showToast("주소를 입력해주세요.", "info");
      return;
    }

    if (editingId) {
      updateAddress(editingId, {
        label: label.trim() || "주소",
        roadAddress: roadAddress.trim(),
        detailAddress: detailAddress.trim(),
      });
      showToast("배송지가 수정되었습니다.", "success");
    } else {
      addAddress({
        label: label.trim() || "주소",
        roadAddress: roadAddress.trim(),
        detailAddress: detailAddress.trim(),
      });
      showToast("배송지가 추가되었습니다.", "success");
    }

    setIsAdding(false);
    setEditingId(null);
    if (returnScreen === "PAYMENT") {
      setCurrentScreen("PAYMENT");
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => setCurrentScreen(returnScreen)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900">배송지 관리</h1>
      </div>

      <div className="p-5 space-y-3 flex-1 overflow-y-auto">
        {userProfile.addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-500 mt-1" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{address.label}</span>
                    {address.isDefault ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">기본</span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{address.roadAddress}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{address.detailAddress || "상세주소 없음"}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!address.isDefault ? (
                  <button
                    onClick={() => {
                      setDefaultAddress(address.id);
                      showToast("기본 배송지로 설정했습니다.", "success");
                    }}
                    className="p-2 rounded-lg hover:bg-green-50"
                    title="기본 배송지로 설정"
                  >
                    <CheckCircle2 size={16} className="text-green-600" />
                  </button>
                ) : null}
                <button onClick={() => startEdit(address.id)} className="p-2 rounded-lg hover:bg-gray-100" title="수정">
                  <Pencil size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => {
                    removeAddress(address.id);
                    showToast("배송지가 삭제되었습니다.", "info");
                  }}
                  className="p-2 rounded-lg hover:bg-red-50"
                  title="삭제"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <button
          onClick={startAdd}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} />
          배송지 추가
        </button>
      </div>

      {isAdding ? (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-5 z-30">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? "배송지 수정" : "배송지 추가"}</h2>
            <div className="space-y-3">
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="라벨 (예: 집, 회사)"
                className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
              <input
                value={roadAddress}
                onChange={(event) => setRoadAddress(event.target.value)}
                placeholder="도로명 주소"
                className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
              <input
                value={detailAddress}
                onChange={(event) => setDetailAddress(event.target.value)}
                placeholder="상세 주소"
                className="w-full px-3 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              >
                취소
              </button>
              <button onClick={saveAddress} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
                저장
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
