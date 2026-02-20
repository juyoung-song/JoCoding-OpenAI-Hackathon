import { ArrowLeft } from "lucide-react";
import { useApp } from "../app/store/AppContext";

const SECTIONS = [
  {
    title: "1. 수집 항목",
    body: "이메일, 이름, 전화번호, 배송지, 장바구니/선호, 주문 및 예약 이력, 인증 세션 정보(토큰 해시, 기기 정보)가 수집될 수 있습니다.",
  },
  {
    title: "2. 이용 목적",
    body: "계정 인증, 장보기 플랜 생성, 주문 실행, 예약 알림, 고객 문의 대응, 서비스 품질 및 보안 개선을 위해 개인정보를 처리합니다.",
  },
  {
    title: "3. 보관 및 파기",
    body: "개인정보는 서비스 제공 기간 동안 보관되며, 목적 달성 또는 탈퇴 시 관련 법령에 따라 지체 없이 파기하거나 분리 보관합니다.",
  },
  {
    title: "4. 제3자 제공 및 위탁",
    body: "법령 근거가 있거나 사용자 동의가 있는 경우를 제외하고 개인정보를 외부에 제공하지 않습니다. 인프라/알림 등 일부 처리는 위탁될 수 있습니다.",
  },
  {
    title: "5. 안전성 확보 조치",
    body: "접근통제, 로그 마스킹, 전송구간 보호, 세션 만료/폐기, 취약점 점검 등 기술적·관리적 보호조치를 적용합니다.",
  },
  {
    title: "6. 이용자 권리",
    body: "사용자는 자신의 개인정보 조회·정정·삭제·처리정지를 요청할 수 있으며, 운영자는 관련 법령에 따라 지체 없이 처리합니다.",
  },
  {
    title: "7. 문의",
    body: "개인정보 관련 문의는 앱 내 문의 채널 또는 운영팀 공식 연락처로 접수할 수 있습니다.",
  },
] as const;

export default function PrivacyPolicyScreen() {
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
        <h1 className="font-bold text-gray-900">개인정보 처리방침</h1>
      </div>

      <div className="p-5 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-sm text-gray-700 leading-6 space-y-4">
          <div>
            <p className="font-semibold text-gray-900">똑장 개인정보 처리방침 (클로즈드 베타)</p>
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
