import { useState } from "react";
import { ArrowLeft, Mail, Phone, UserRound, MapPin } from "lucide-react";
import { useApp } from "../app/store/AppContext";
import { useToast } from "../shared/ui/ToastProvider";

export default function AccountInfoScreen() {
  const { setCurrentScreen, userProfile, updateUserName, updatePhoneNumber } = useApp();
  const { showToast } = useToast();
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);

  const handleSave = () => {
    updateUserName(name.trim() || userProfile.name);
    updatePhoneNumber(phone.trim() || userProfile.phone);
    showToast("내 정보가 저장되었습니다.", "success");
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => setCurrentScreen("MY_PAGE")}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900">내 정보 관리</h1>
      </div>

      <div className="p-5 space-y-4 flex-1 overflow-y-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="text-xs text-gray-500 flex items-center gap-2 mb-2">
            <UserRound size={14} />
            이름
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-blue-500"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="text-xs text-gray-500 flex items-center gap-2 mb-2">
            <Mail size={14} />
            이메일 (변경 불가)
          </label>
          <input
            value={userProfile.email}
            readOnly
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="text-xs text-gray-500 flex items-center gap-2 mb-2">
            <Phone size={14} />
            전화번호
          </label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => {
            sessionStorage.setItem("ddokjang.address.return.screen", "ACCOUNT_INFO");
            setCurrentScreen("ADDRESS_BOOK");
          }}
          className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-900">배송지 관리</span>
          </div>
          <span className="text-xs text-gray-500">{userProfile.addresses.length}개 등록됨</span>
        </button>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
