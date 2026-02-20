import { useApp } from '../store/AppContext';
import { ChevronLeft, Check, Award } from 'lucide-react';

// Mock data for Top 3 marts
const mockTop3Plans = [
  {
    rank: 1,
    badge: "최저가",
    badgeColor: "#59A22F",
    martName: "똑장 알뜰 플랜",
    description: "배달비 포함 • 30분 내 도착",
    totalPrice: "42,500원",
    matchingRate: "9/10 품목",
    matchingPercent: 90,
    borderColor: "rgba(89,162,47,0.3)",
    bgColor: "rgba(89,162,47,0.05)",
    overlayColor: "rgba(89,162,47,0.1)",
  },
  {
    rank: 2,
    badge: "2위",
    badgeColor: "#137fec",
    martName: "똑장 균형 플랜",
    description: "배달비 포함 • 40분 내 도착",
    totalPrice: "43,200원",
    matchingRate: "10/10 품목",
    matchingPercent: 100,
    borderColor: "rgba(19,127,236,0.3)",
    bgColor: "rgba(19,127,236,0.05)",
    overlayColor: "rgba(19,127,236,0.1)",
  },
  {
    rank: 3,
    badge: "3위",
    badgeColor: "#f59e0b",
    martName: "똑장 프리미엄 플랜",
    description: "배달비 포함 • 20분 내 도착",
    totalPrice: "45,800원",
    matchingRate: "10/10 품목",
    matchingPercent: 100,
    borderColor: "rgba(245,158,11,0.3)",
    bgColor: "rgba(245,158,11,0.05)",
    overlayColor: "rgba(245,158,11,0.1)",
  },
];

const RankBadge = ({ rank, badgeColor, badgeText }: { rank: number; badgeColor: string; badgeText: string }) => (
  <div 
    className="absolute left-0 top-0 px-3 py-1 rounded-md flex items-center gap-1.5"
    style={{ backgroundColor: badgeColor }}
  >
    {rank === 1 && <Award size={14} className="text-white" />}
    <span className="text-white text-xs font-medium">{badgeText}</span>
  </div>
);

const PlanCard = ({ plan, onSelect }: { plan: typeof mockTop3Plans[0]; onSelect: () => void }) => {
  return (
    <div 
      className="relative w-full rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{ 
        backgroundColor: plan.bgColor,
        border: `1.5px solid ${plan.borderColor}`
      }}
      onClick={onSelect}
    >
      {/* Decorative gradient overlay */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 -mt-16 -mr-16"
        style={{ backgroundColor: plan.badgeColor }}
      />
      
      {/* Rank Badge */}
      <RankBadge rank={plan.rank} badgeColor={plan.badgeColor} badgeText={plan.badge} />
      
      {/* Content */}
      <div className="mt-8 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.martName}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        
        {/* Divider */}
        <div className="border-t" style={{ borderColor: plan.borderColor }} />
        
        {/* Info Row */}
        <div className="flex items-end justify-between">
          {/* Price */}
          <div>
            <p className="text-xs text-gray-500 mb-1">총 예상 금액</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: plan.rank === 1 ? '#59A22F' : '#137fec' }}
            >
              {plan.totalPrice}
            </p>
          </div>
          
          {/* Matching Rate */}
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">매칭률</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{plan.matchingRate}</span>
              {/* Progress bar */}
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${plan.matchingPercent}%`,
                    backgroundColor: plan.badgeColor
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust Indicator */}
      <div className="mt-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2.5 flex items-center justify-center gap-2">
        <Check size={14} className="text-green-600" />
        <span className="text-xs text-gray-600">실시간 재고 확인됨</span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-600">5분 전 업데이트</span>
      </div>
    </div>
  );
};

export default function Top3ResultScreen() {
  const { setCurrentScreen } = useApp();
  
  const handleSelectPlan = (rank: number) => {
    // Navigate to payment screen when plan is selected
    setCurrentScreen('PAYMENT');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setCurrentScreen('MODE_SELECTION')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-base font-medium text-gray-900">Top 3 추천 플랜</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-5 pb-32 space-y-4">
        {/* Info Header */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(89,162,47,0.1)' }}>
              <Award size={20} style={{ color: '#59A22F' }} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">총 4개 품목</h2>
              <p className="text-sm text-gray-600">가격과 접근성을 기준으로 최적의 플랜을 추천했어요</p>
            </div>
          </div>
        </div>
        
        {/* Top 3 Cards */}
        {mockTop3Plans.map((plan) => (
          <PlanCard 
            key={plan.rank} 
            plan={plan} 
            onSelect={() => handleSelectPlan(plan.rank)}
          />
        ))}
        
        {/* Bottom Spacer for scroll */}
        <div className="h-8" />
      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">총 4개 품목</span>
          <span className="text-lg font-bold" style={{ color: '#59A22F' }}>{mockTop3Plans[0].totalPrice}</span>
        </div>
        <button
          onClick={() => handleSelectPlan(1)}
          className="w-full text-white font-medium py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: '#59A22F',
            boxShadow: '0 10px 25px -5px rgba(89,162,47,0.3), 0 4px 6px -2px rgba(89,162,47,0.2)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4d8f28'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#59A22F'}
          onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#427920'}
          onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#4d8f28'}
        >
          <span>1위 플랜으로 결정하기</span>
          <Check size={18} />
        </button>
      </div>
    </div>
  );
}
