import { ArrowLeft, CreditCard, MapPin } from "lucide-react";
import { useApp } from "../app/store/AppContext";
import { useToast } from "../shared/ui/ToastProvider";
import { useState } from "react";
import { PaymentsAPI } from "../api";

const formatPrice = (price: number) => `${new Intl.NumberFormat("ko-KR").format(price)}원`;

export default function PaymentScreen() {
  const { setCurrentScreen, selectedPlan, userProfile, completeCurrentOrder, planMeta } = useApp();
  const { showToast } = useToast();
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestIntentId, setLatestIntentId] = useState<string | null>(null);
  const defaultAddress = userProfile.addresses.find((address) => address.isDefault) ?? userProfile.addresses[0];

  const totalPrice = selectedPlan?.estimated_total ?? 0;
  const martName = selectedPlan?.mart_name ?? "똑장 추천 플랜";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <button onClick={() => setCurrentScreen("PLAN_DETAIL")} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900">결제하기</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">결제 플랜</p>
          <p className="text-sm font-semibold text-gray-900">{martName}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatPrice(totalPrice)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <MapPin size={16} />
            <span className="text-sm font-semibold">배송지</span>
          </div>
          <p className="text-sm text-gray-900">{defaultAddress?.roadAddress ?? "배송지를 등록해주세요."}</p>
          <p className="text-xs text-gray-500 mt-1">{defaultAddress?.detailAddress ?? ""}</p>
          <button
            onClick={() => {
              sessionStorage.setItem("ddokjang.address.return.screen", "PAYMENT");
              setCurrentScreen("ADDRESS_BOOK");
            }}
            className="mt-3 text-xs text-blue-600 font-medium hover:text-blue-700"
          >
            배송지 관리로 이동
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <CreditCard size={16} />
            <span className="text-sm font-semibold">결제 수단</span>
          </div>
          <p className="text-sm text-gray-900">등록된 결제 수단 없음 (베타 샌드박스 준비중)</p>
          {latestIntentId ? (
            <p className="text-xs text-gray-500 mt-2">최근 샌드박스 결제 ID: {latestIntentId}</p>
          ) : null}
          <button
            onClick={() => setCurrentScreen("PAYMENT_METHODS")}
            className="mt-3 text-xs text-blue-600 font-medium hover:text-blue-700"
          >
            결제 수단 관리로 이동
          </button>
        </div>

        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-sm font-semibold text-amber-900 mb-2">사전 승인 확인 (필수)</p>
          <label className="flex items-start gap-2 text-sm text-amber-900">
            <input
              type="checkbox"
              checked={isApproved}
              onChange={(event) => setIsApproved(event.target.checked)}
              className="mt-1"
            />
            <span>배송지/결제수단/총액을 확인했고, 이 주문을 실행하는 데 동의합니다.</span>
          </label>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4 pb-8">
        <button
          onClick={async () => {
            if (!isApproved) {
              showToast("결제 전에 사전 승인 확인이 필요합니다.", "info");
              return;
            }
            if (!selectedPlan) {
              showToast("선택된 플랜이 없어 결제를 진행할 수 없습니다.", "error");
              return;
            }
            if (!defaultAddress) {
              showToast("기본 배송지를 먼저 등록해주세요.", "info");
              return;
            }
            if (isSubmitting) return;
            setIsSubmitting(true);
            try {
              const idempotencyKey = [
                "sandbox",
                planMeta?.request_id ?? "manual",
                selectedPlan.plan_type,
                String(totalPrice),
              ].join(":");

              const intent = await PaymentsAPI.createIntent(
                {
                  request_id: planMeta?.request_id ?? undefined,
                  amount_won: Math.max(totalPrice, 1000),
                  currency: "KRW",
                  mall_name: martName,
                  plan_type: selectedPlan.plan_type,
                  budget_cap_won: Math.max(totalPrice, 1000),
                  allowed_malls: [martName],
                },
                idempotencyKey
              );
              setLatestIntentId(intent.intent_id);

              const confirmed = await PaymentsAPI.confirmIntent(intent.intent_id, {
                simulate_result: "success",
              });
              if (confirmed.status !== "succeeded") {
                throw new Error("결제 승인에 실패했습니다.");
              }

              await completeCurrentOrder();
              showToast("샌드박스 결제가 완료되었습니다.", "success");
              setCurrentScreen("COMPLETION");
            } catch (error) {
              const message = error instanceof Error ? error.message : "결제 요청이 실패했습니다.";
              showToast(message, "error");
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={!isApproved || isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "샌드박스 결제 처리 중..." : "승인 후 샌드박스 결제 완료하기"}
        </button>
      </div>
    </div>
  );
}
