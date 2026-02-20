import { useMemo } from "react";
import { useApp } from "../app/store/AppContext";
import { ArrowLeft, Check, AlertCircle, MapPin, Clock } from "lucide-react";
import { MissingPlanItemResponse, PlanItemResponse, PlanResponse, PlansAPI } from "../api";
import { useToast } from "../shared/ui/ToastProvider";
import { getItemEmoji } from "../utils/productVisual";

const formatPrice = (price: number) => `${new Intl.NumberFormat("ko-KR").format(price)}원`;
const formatObservedAt = (value?: string | null) => {
  if (!value) return "갱신 시점 정보 없음";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ko-KR", { hour12: false });
};

const PlanItem = ({ item }: { item: PlanItemResponse }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 items-start shadow-sm">
    <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100">
      <span className="text-2xl">{getItemEmoji(item.item_name)}</span>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
          {item.brand ? `${item.brand} ${item.item_name}` : item.item_name}
        </h3>
        {!item.is_sold_out ? (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded text-[10px] text-green-700 font-medium flex-shrink-0">
            <Check size={10} />
            <span>재고확인</span>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-gray-500 mt-1">
        {(item.size || "규격 미지정")} • {item.quantity}개
      </p>

      <div className="mt-3 flex justify-between items-end">
        {item.is_sold_out ? (
          <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
            <AlertCircle size={12} />
            <span>품절 (대체상품 검색 필요)</span>
          </div>
        ) : (
          <span className="text-base font-bold text-gray-900">{formatPrice(item.price)}</span>
        )}
      </div>
    </div>
  </div>
);

export default function PlanDetailScreen() {
  const { setCurrentScreen, selectedPlan, cartItems, selectedMode, planMeta } = useApp();
  const { showToast } = useToast();

  if (!selectedPlan) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">선택된 플랜이 없습니다</h2>
        <p className="text-sm text-gray-500 mb-6">다시 플랜을 선택해주세요.</p>
        <button
          onClick={() => setCurrentScreen("TOP3_RESULT")}
          className="bg-[#59A22F] text-white px-6 py-3 rounded-xl font-medium"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const plan = selectedPlan as PlanResponse;

  const missingItems = useMemo<MissingPlanItemResponse[]>(() => {
    if (plan.missing_items && plan.missing_items.length > 0) {
      return plan.missing_items;
    }
    const purchasedNames = new Set(plan.items.map((item) => item.item_name.trim()));
    return cartItems
      .map((item) => item.name.trim())
      .filter((name, index, self) => self.indexOf(name) === index)
      .filter((name) => !purchasedNames.has(name))
      .map((name) => ({
        item_name: name,
        reason: "재고 없음",
      }));
  }, [cartItems, plan.items, plan.missing_items]);

  const itemCount = plan.items.length;
  const missingCount = missingItems.length;
  const itemsSubtotal = plan.items.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = Math.max(plan.estimated_total - itemsSubtotal, 0);
  const finalPrice = plan.estimated_total;
  const badge = plan.badges?.[0];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 flex-shrink-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setCurrentScreen("TOP3_RESULT")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-base font-medium text-gray-900">상세 품목 확인</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mt-10 -mr-10 pointer-events-none" />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{plan.mart_name}</h2>
                <p className="text-sm text-gray-500">{plan.explanation || "최적의 가격과 거리를 고려한 플랜"}</p>
              </div>
              {badge ? (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">{badge}</span>
              ) : null}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-5">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                <span>{plan.delivery_info || "거리 정보 없음"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                <span>{plan.travel_minutes ? `${plan.travel_minutes}분 내 도착` : "소요시간 계산 중"}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex items-end justify-between">
              <span className="text-gray-500 text-sm">총 {itemCount}개 품목</span>
              <div className="text-right">
                <span className="text-xs text-blue-600 font-medium">예상 결제 금액</span>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(finalPrice)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100/50 rounded-lg p-3 flex items-center justify-center gap-2 text-xs text-gray-500 border border-gray-200/50">
          <Check size={12} className="text-green-600" />
          <span>가격 출처: {plan.price_source ?? "unknown"}</span>
          <span className="w-px h-3 bg-gray-300 mx-1" />
          <span>{formatObservedAt(plan.price_observed_at)}</span>
        </div>
        <p className="text-xs text-amber-700 -mt-4">{plan.price_notice ?? "가격은 변동될 수 있어요."}</p>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-gray-900">
              포함된 상품 <span className="text-green-600">{itemCount}</span>
            </h3>
            <span className="text-xs text-gray-400">가격 변동 가능성 있음</span>
          </div>

          <div className="space-y-3">
            {plan.items.map((item, idx) => (
              <PlanItem key={`${item.item_name}-${idx}`} item={item} />
            ))}
          </div>
        </div>

        {missingCount > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <AlertCircle size={16} className="text-orange-500" />
              <h3 className="font-bold text-gray-900">
                미포함 상품 <span className="text-orange-500">{missingCount}</span>
              </h3>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <ul className="list-disc list-inside space-y-1">
                {missingItems.map((item, idx) => (
                  <li key={`${item.item_name}-${idx}`} className="text-sm text-gray-700">
                    {item.item_name}{" "}
                    <span className="text-gray-400 text-xs">({item.reason || "재고 없음"})</span>
                    {item.alternative ? (
                      <div className="text-xs text-green-700 mt-1 ml-5">
                        대체: {item.alternative.brand ? `${item.alternative.brand} ` : ""}
                        {item.alternative.item_name}
                        {item.alternative.size ? ` ${item.alternative.size}` : ""} ·{" "}
                        {formatPrice(item.alternative.unit_price)}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div className="bg-white border-t border-gray-200 p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-gray-600">상품 {formatPrice(itemsSubtotal)} + 배송비 {formatPrice(deliveryFee)}</span>
          <span className="font-bold text-gray-900 text-lg">{formatPrice(finalPrice)}</span>
        </div>
        <button
          onClick={() => {
            showToast("플랜이 선택되었습니다", "success");
            setCurrentScreen("PAYMENT");
          }}
          className="w-full bg-[#137fec] hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>이 플랜으로 결정하기</span>
          <Check size={18} />
        </button>
        {selectedMode === "ONLINE" ? (
          <button
            onClick={async () => {
              try {
                if (!planMeta?.request_id) {
                  throw new Error("request_id missing");
                }
                const result = await PlansAPI.selectOnlinePlan({
                  requestId: planMeta.request_id,
                  selectedPlanType: plan.plan_type,
                  mallName: plan.mart_name,
                });
                window.open(result.cart_redirect_url, "_blank", "noopener,noreferrer");
                showToast("온라인 몰 실행 링크를 열었습니다.", "success");
              } catch (error) {
                console.error("Failed to open online mall redirect", error);
                const fallback = plan.cart_url ?? plan.mall_product_links?.[0];
                if (fallback) {
                  window.open(fallback, "_blank", "noopener,noreferrer");
                  showToast("기본 실행 링크를 열었습니다.", "info");
                  return;
                }
                showToast("실행 가능한 온라인 링크가 없습니다.", "error");
              }
            }}
            className="w-full mt-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 rounded-xl transition-colors"
          >
            온라인 몰에서 바로 실행
          </button>
        ) : null}
      </div>
    </div>
  );
}
