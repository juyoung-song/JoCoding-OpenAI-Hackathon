import { ArrowLeft } from "lucide-react";
import { useApp } from "../app/store/AppContext";

const SECTIONS = [
  {
    title: "제1조 (목적)",
    body: "본 약관은 똑장(이하 '서비스')의 이용조건, 사용자와 운영자의 권리·의무 및 책임사항을 규정합니다.",
  },
  {
    title: "제2조 (서비스 범위)",
    body: "서비스는 장보기 품목 관리, 온/오프라인 가격 비교, 예약 재주문, 결제 샌드박스 기능을 제공합니다. 베타 기간에는 일부 기능이 제한될 수 있습니다.",
  },
  {
    title: "제3조 (계정 및 인증)",
    body: "서비스 이용을 위해 로그인이 필요하며, 계정 보안(토큰 관리 포함)의 책임은 사용자에게 있습니다. 비정상 접근이 감지되면 세션이 강제 종료될 수 있습니다.",
  },
  {
    title: "제4조 (주문 실행 승인)",
    body: "사용자는 주문 실행 전 총액/배송지/판매처를 확인하고 명시적으로 승인해야 합니다. 승인 없는 자동결제는 베타 기간 중 제공하지 않습니다.",
  },
  {
    title: "제5조 (가격/재고 고지)",
    body: "표시 가격과 재고 정보는 외부 제공처 기준으로 실시간 변동될 수 있으며, 실제 결제 시점 금액/재고와 차이가 발생할 수 있습니다.",
  },
  {
    title: "제6조 (서비스 안정성)",
    body: "외부 API 장애 또는 네트워크 문제 발생 시 일부 기능이 제한되거나 degraded 상태로 제공될 수 있습니다. 운영자는 장애 복구를 위해 합리적으로 노력합니다.",
  },
  {
    title: "제7조 (면책)",
    body: "천재지변, 통신장애, 외부 제공처 정책 변경 등 운영자가 통제하기 어려운 사유로 인한 손해에 대해 법령이 허용하는 범위 내에서 책임이 제한됩니다.",
  },
  {
    title: "제8조 (약관 변경)",
    body: "약관 변경 시 앱 공지 또는 적절한 방법으로 사전 안내하며, 변경 후 계속 사용 시 개정 약관에 동의한 것으로 간주될 수 있습니다.",
  },
] as const;

export default function TermsScreen() {
  const { setCurrentScreen } = useApp();

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => setCurrentScreen("SETTINGS")}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900">서비스 이용약관</h1>
      </div>

      <div className="p-5 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-sm text-gray-700 leading-6 space-y-4">
          <div>
            <p className="font-semibold text-gray-900">똑장 서비스 이용약관 (클로즈드 베타)</p>
            <p className="text-xs text-gray-500 mt-1">시행일: 2026-02-20</p>
          </div>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="font-semibold text-gray-900">{section.title}</p>
              <p className="mt-1">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
