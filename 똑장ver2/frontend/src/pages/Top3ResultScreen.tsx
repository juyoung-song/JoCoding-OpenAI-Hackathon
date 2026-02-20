import { useEffect, useMemo, useState } from "react";
import { useApp } from "../app/store/AppContext";
import { ChevronLeft, Check, Award, Loader2, CircleAlert } from "lucide-react";
import { PlanResponse } from "../api";

interface UiPlan {
  rank: number;
  badge: string;
  badgeColor: string;
  martName: string;
  description: string;
  totalPrice: string;
  matchingRate: string;
  matchingPercent: number;
  routeInfo: string;
  pricingBasis: string;
  priceSource: string;
  observedAt: string;
  priceNotice: string;
  missingCount: number;
  borderColor: string;
  bgColor: string;
  original: PlanResponse;
}

const formatPrice = (value: number) => `${value.toLocaleString()}원`;
const formatObservedAt = (value?: string | null) => {
  if (!value) return "갱신 시점 정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", { hour12: false });
};

const planLabel = (planType: PlanResponse["plan_type"]) => {
  const nameMap: Record<PlanResponse["plan_type"], string> = {
    cheapest: "똑장 알뜰 플랜",
    nearest: "똑장 근접 플랜",
    balanced: "똑장 균형 플랜",
  };
  return nameMap[planType];
};

const planStyle = (index: number) => {
  if (index === 1) {
    return {
      badgeColor: "#137FEC",
      borderColor: "rgba(19,127,236,0.3)",
      bgColor: "rgba(19,127,236,0.05)",
    };
  }

  if (index === 2) {
    return {
      badgeColor: "#F59E0B",
      borderColor: "rgba(245,158,11,0.3)",
      bgColor: "rgba(245,158,11,0.05)",
    };
  }

  return {
    badgeColor: "#59A22F",
    borderColor: "rgba(89,162,47,0.3)",
    bgColor: "rgba(89,162,47,0.05)",
  };
};

const mapPlanToDisplay = (plan: PlanResponse, index: number): UiPlan => {
  const rank = index + 1;
  const totalItems = Math.max(plan.total_basket_items || plan.coverage, 1);
  const matchingPercent = Math.round((plan.coverage / totalItems) * 100);
  const itemsTotal = plan.items.reduce((sum, item) => sum + item.price, 0);
  const logisticsCost = Math.max(plan.estimated_total - itemsTotal, 0);
  const style = planStyle(index);

  return {
    rank,
    badge:
      plan.plan_type === "cheapest"
        ? "최저가"
        : plan.plan_type === "nearest"
        ? "가까운 매장"
        : "균형 추천",
    badgeColor: style.badgeColor,
    martName: plan.mart_name || planLabel(plan.plan_type),
    description: plan.explanation || "최적의 장보기 조합",
    totalPrice: formatPrice(plan.estimated_total),
    matchingRate: `${plan.coverage}/${totalItems} 품목`,
    matchingPercent,
    pricingBasis:
      logisticsCost > 0 ? `상품 ${formatPrice(itemsTotal)} + 배송/이동 ${formatPrice(logisticsCost)}` : `상품 ${formatPrice(itemsTotal)}`,
    priceSource: plan.price_source ?? "unknown",
    observedAt: formatObservedAt(plan.price_observed_at),
    priceNotice: plan.price_notice ?? "가격은 변동될 수 있어요.",
    missingCount: plan.missing_items?.length ?? Math.max(totalItems - plan.coverage, 0),
    routeInfo:
      plan.distance_km && plan.travel_minutes
        ? `${plan.distance_km}km · ${plan.travel_minutes}분`
        : plan.delivery_info || "거리 정보 없음",
    borderColor: style.borderColor,
    bgColor: style.bgColor,
    original: plan,
  };
};

const RankBadge = ({ rank, badgeColor, badgeText }: { rank: number; badgeColor: string; badgeText: string }) => (
  <div
    className="absolute left-0 top-0 px-3 py-1 rounded-md flex items-center gap-1.5"
    style={{ backgroundColor: badgeColor }}
  >
    {rank === 1 && <Award size={14} className="text-white" />}
    <span className="text-white text-xs font-medium">{badgeText}</span>
  </div>
);

const PlanCard = ({ plan, onSelect }: { plan: UiPlan; onSelect: () => void }) => (
  <div
    className="relative w-full rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    style={{
      backgroundColor: plan.bgColor,
      border: `1.5px solid ${plan.borderColor}`,
    }}
    onClick={onSelect}
  >
    <RankBadge rank={plan.rank} badgeColor={plan.badgeColor} badgeText={plan.badge} />

    <div className="mt-8 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.martName}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{plan.description}</p>
        <p className="text-xs text-gray-500 mt-1">{plan.routeInfo}</p>
        <p className="text-xs text-gray-400 mt-1">{plan.pricingBasis}</p>
        <p className="text-[11px] text-gray-500 mt-1">
          출처: {plan.priceSource} · 관측: {plan.observedAt}
        </p>
        <p className="text-[11px] text-amber-700 mt-0.5">{plan.priceNotice}</p>
      </div>

      <div className="border-t" style={{ borderColor: plan.borderColor }} />

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">총 예상 금액</p>
          <p className="text-2xl font-bold text-gray-900">{plan.totalPrice}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">매칭률</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">{plan.matchingRate}</span>
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${plan.matchingPercent}%`,
                  backgroundColor: plan.badgeColor,
                }}
              />
            </div>
          </div>
        </div>
        {plan.missingCount > 0 ? (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
            미포함 {plan.missingCount}개 품목은 상세에서 대체 추천을 확인할 수 있어요.
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

export default function Top3ResultScreen() {
  const {
    setCurrentScreen,
    plans,
    fetchPlans,
    isPlansLoading,
    setSelectedPlan,
    selectedMode,
    setSelectedMode,
    planHeadline,
    planLastUpdated,
    planMeta,
    planAlternatives,
  } = useApp();
  const [hasAutoRequested, setHasAutoRequested] = useState(false);
  const effectiveMode: "ONLINE" | "OFFLINE" = selectedMode ?? "ONLINE";

  useEffect(() => {
    if (plans.length === 0 && !isPlansLoading && !hasAutoRequested) {
      setHasAutoRequested(true);
      void fetchPlans(effectiveMode);
    }
  }, [plans.length, isPlansLoading, hasAutoRequested, fetchPlans, effectiveMode]);

  const uiPlans = useMemo(() => plans.map((plan, index) => mapPlanToDisplay(plan, index)), [plans]);
  const bestPlan = uiPlans[0];

  const handleSelectPlan = (plan: UiPlan) => {
    setSelectedPlan(plan.original);
    setCurrentScreen("PLAN_DETAIL");
  };

  const handleModeToggle = (nextMode: "ONLINE" | "OFFLINE") => {
    if (isPlansLoading || nextMode === effectiveMode) return;
    setSelectedMode(nextMode);
    void fetchPlans(nextMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setCurrentScreen("MODE_SELECTION")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-base font-medium text-gray-900">Top 3 추천 플랜</h1>
          <div className="w-10" />
        </div>
        <div className="px-4 pb-3">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden mb-2">
            <button
              onClick={() => handleModeToggle("ONLINE")}
              className={`px-3 py-1.5 text-xs font-medium ${
                effectiveMode === "ONLINE" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              온라인
            </button>
            <button
              onClick={() => handleModeToggle("OFFLINE")}
              className={`px-3 py-1.5 text-xs font-medium ${
                effectiveMode === "OFFLINE" ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              오프라인
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-1">
            {effectiveMode === "OFFLINE"
              ? "오프라인 모드: 거리/이동시간을 우선 반영했어요."
              : "온라인 모드: 총 결제 금액을 우선 반영했어요."}
          </p>
          {planHeadline ? <p className="text-xs text-gray-700 font-medium">{planHeadline}</p> : null}
          {planLastUpdated ? <p className="text-[11px] text-gray-400 mt-1">{planLastUpdated}</p> : null}
        </div>
      </div>

      <div className="flex-1 p-5 pb-32 space-y-4">
        {planMeta ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">분석 근거</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                기준 위치/이동수단: {planMeta.effective_context.source} · {planMeta.effective_context.travel_mode} ·{" "}
                {planMeta.effective_context.max_travel_minutes}분
              </p>
              {planMeta.weather_note ? <p>날씨 참고: {planMeta.weather_note}</p> : null}
              {planMeta.degraded_providers.length > 0 ? (
                <div className="flex items-center gap-1.5 text-amber-700">
                  <CircleAlert size={12} />
                  <span>일부 제공자 fallback: {planMeta.degraded_providers.join(", ")}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {isPlansLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-[#59A22F] mb-4" />
            <p className="text-gray-500">최적의 플랜을 찾고 있어요...</p>
          </div>
        ) : null}

        {!isPlansLoading && uiPlans.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <p className="text-gray-600 mb-3">추천 가능한 플랜이 아직 없어요.</p>
            <button
              onClick={() => setCurrentScreen("MODE_SELECTION")}
              className="px-4 py-2 rounded-lg bg-[#59A22F] text-white text-sm"
            >
              다시 시도하기
            </button>
          </div>
        ) : null}

        {!isPlansLoading &&
          uiPlans.map((plan) => (
            <PlanCard key={`${plan.martName}-${plan.rank}`} plan={plan} onSelect={() => handleSelectPlan(plan)} />
          ))}

        {!isPlansLoading && planAlternatives.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">대안 매장</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              {planAlternatives.slice(0, 3).map((alternative, index) => (
                <li key={`${alternative.mart_name}-${index}`}>
                  {alternative.mart_name} · {formatPrice(alternative.estimated_total)} · 커버리지{" "}
                  {Math.round(alternative.coverage_ratio * 100)}%
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {bestPlan ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">총 {bestPlan.matchingRate}</span>
            <span className="text-lg font-bold" style={{ color: "#59A22F" }}>
              {bestPlan.totalPrice}
            </span>
          </div>
          <button
            onClick={() => handleSelectPlan(bestPlan)}
            className="w-full text-white font-medium py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#59A22F",
              boxShadow: "0 10px 25px -5px rgba(89,162,47,0.3), 0 4px 6px -2px rgba(89,162,47,0.2)",
            }}
          >
            <span>1위 플랜으로 결정하기</span>
            <Check size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
