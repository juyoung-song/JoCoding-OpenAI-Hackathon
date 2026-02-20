import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../app/store/AppContext';
import { ChevronLeft, User, ThumbsUp, ThumbsDown, Settings, CreditCard, Bell, HelpCircle, LogOut, ShoppingBag, Sparkles, CalendarClock } from 'lucide-react';
import { AuthAPI, PreferencesAPI } from '../api';
import { useToast } from '../shared/ui/ToastProvider';

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-bold text-gray-500 mt-6 mb-2 px-4 uppercase tracking-wider">
      {title}
    </h2>
  );
}

function MenuItem({ icon: Icon, label, onClick, subLabel }: { icon: React.ElementType, label: string, onClick?: () => void, subLabel?: string }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-full text-gray-600">
          <Icon size={20} />
        </div>
        <span className="text-gray-900 font-medium text-[15px]">{label}</span>
      </div>
      {subLabel && (
        <span className="text-gray-400 text-sm">{subLabel}</span>
      )}
    </div>
  );
}

export default function MyPageScreen() {
  const { setCurrentScreen, userProfile, orderHistory, shoppingReservations } = useApp();
  const { showToast } = useToast();
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [dislikeCount, setDislikeCount] = useState<number | null>(null);
  const initials = useMemo(() => {
    const compact = userProfile.name.replace(/\s+/g, "");
    return compact.length >= 2 ? compact.slice(0, 2).toUpperCase() : "DK";
  }, [userProfile.name]);

  useEffect(() => {
    let isMounted = true;

    const loadCounts = async () => {
      try {
        const [likeRes, dislikeRes] = await Promise.all([
          PreferencesAPI.getBrands('like'),
          PreferencesAPI.getBrands('dislike'),
        ]);
        if (!isMounted) return;
        setLikeCount(likeRes.brands.length);
        setDislikeCount(dislikeRes.brands.length);
      } catch (error) {
        console.error("Failed to fetch brand counts", error);
        if (!isMounted) return;
        setLikeCount(0);
        setDislikeCount(0);
      }
    };

    void loadCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => setCurrentScreen('HOME')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">마이페이지</h1>
      </div>

      {/* Profile Summary */}
      <div className="bg-white p-6 mb-2 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold border-2 border-white shadow-sm">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{userProfile.name}</h2>
          <p className="text-sm text-gray-500">{userProfile.email}</p>
          <button className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 px-2 py-1 rounded-md">
            회원등급: Gold
          </button>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">월간 구독</p>
              <h3 className="text-base font-bold mt-0.5">똑장 프라임+</h3>
              <p className="text-xs mt-1 opacity-90">배송비 절감 + 프리미엄 추천 리포트</p>
            </div>
            <Sparkles size={20} />
          </div>
          <button className="mt-3 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
            구독 살펴보기
          </button>
        </div>
      </div>

      {/* Main Menu Sections */}
      <div className="flex flex-col gap-2">

        {/* My Activity */}
        <div className="bg-white">
          <SectionHeader title="나의 쇼핑" />
          <MenuItem
            icon={ShoppingBag}
            label="주문 내역"
            subLabel={`최근 ${orderHistory.length}건`}
            onClick={() => setCurrentScreen('HISTORY')}
          />
        </div>
        {/* Account Management */}
        <div className="bg-white">
          <SectionHeader title="계정 관리" />
          <MenuItem icon={User} label="내 정보 관리" subLabel="수정" onClick={() => setCurrentScreen('ACCOUNT_INFO')} />
          <MenuItem icon={CreditCard} label="결제 수단 관리" onClick={() => setCurrentScreen('PAYMENT_METHODS')} />
        </div>

        {/* Preferences */}
        <div className="bg-white">
          <SectionHeader title="쇼핑 설정" />
          <MenuItem
            icon={ThumbsUp}
            label="선호 브랜드 관리"
            subLabel={likeCount === null ? '...' : `${likeCount}개`}
            onClick={() => setCurrentScreen('PREFERRED_BRANDS')}
          />
          <MenuItem
            icon={ThumbsDown}
            label="비선호 브랜드 관리"
            subLabel={dislikeCount === null ? '...' : `${dislikeCount}개`}
            onClick={() => setCurrentScreen('NON_PREFERRED_BRANDS')}
          />
          <MenuItem
            icon={CalendarClock}
            label="장보기 예약 관리"
            subLabel={`${shoppingReservations.length}건`}
            onClick={() => setCurrentScreen('RECOMMENDATION')}
          />
        </div>

        {/* App Settings */}
        <div className="bg-white">
          <SectionHeader title="앱 설정" />
          <MenuItem icon={Bell} label="알림 설정" />
          <MenuItem icon={Settings} label="환경 설정" onClick={() => setCurrentScreen('SETTINGS')} />
          <MenuItem icon={HelpCircle} label="고객센터" />
        </div>

        {/* Logout */}
        <div className="bg-white mt-4 mb-8">
          <MenuItem
            icon={LogOut}
            label="로그아웃"
            onClick={async () => {
              await AuthAPI.logout();
              showToast('로그아웃되었습니다.', 'info');
              setCurrentScreen('LOGIN');
            }}
          />
        </div>
      </div>
    </div>
  );
}
