import React from 'react';
import { useApp } from '../store/AppContext';
import { ChevronLeft, User, ThumbsUp, ThumbsDown, Settings, CreditCard, Bell, HelpCircle, LogOut } from 'lucide-react';

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
  const { setCurrentScreen } = useApp();

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
          JD
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">John Doe</h2>
          <p className="text-sm text-gray-500">example@email.com</p>
          <button className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 px-2 py-1 rounded-md">
            회원등급: Gold
          </button>
        </div>
      </div>

      {/* Main Menu Sections */}
      <div className="flex flex-col gap-2">
        
        {/* Account Management */}
        <div className="bg-white">
          <SectionHeader title="계정 관리" />
          <MenuItem icon={User} label="내 정보 관리" subLabel="수정" />
          <MenuItem icon={CreditCard} label="결제 수단 관리" />
        </div>

        {/* Preferences */}
        <div className="bg-white">
          <SectionHeader title="쇼핑 설정" />
          <MenuItem 
            icon={ThumbsUp} 
            label="선호 브랜드 관리" 
            subLabel="3개" 
            onClick={() => setCurrentScreen('PREFERRED_BRANDS')}
          />
          <MenuItem 
            icon={ThumbsDown} 
            label="비선호 브랜드 관리" 
            subLabel="0개" 
            onClick={() => setCurrentScreen('NON_PREFERRED_BRANDS')}
          />
        </div>

        {/* App Settings */}
        <div className="bg-white">
          <SectionHeader title="앱 설정" />
          <MenuItem icon={Bell} label="알림 설정" />
          <MenuItem icon={Settings} label="환경 설정" />
          <MenuItem icon={HelpCircle} label="고객센터" />
        </div>

        {/* Logout */}
        <div className="bg-white mt-4 mb-8">
          <MenuItem icon={LogOut} label="로그아웃" onClick={() => setCurrentScreen('ONBOARDING')} />
        </div>
      </div>
    </div>
  );
}