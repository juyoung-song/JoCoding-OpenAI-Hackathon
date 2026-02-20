
import { useState } from 'react';
import { useApp } from '../app/store/AppContext';
import { ArrowLeft, ChevronRight, FileText, Smartphone, Trash2 } from 'lucide-react';
import packageJson from '../../package.json';

export default function SettingsScreen() {
    const { setCurrentScreen } = useApp();
    const [marketingConsent, setMarketingConsent] = useState(true);
    const appVersion = `v${packageJson.version}`;

    const toggleMarketing = () => setMarketingConsent(!marketingConsent);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => setCurrentScreen('MY_PAGE')}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">환경 설정</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* App Info */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase">앱 정보</h2>
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Smartphone size={20} className="text-gray-400" />
                            <span className="text-gray-900 font-medium">현재 버전</span>
                        </div>
                        <span className="text-blue-600 font-bold">{appVersion}</span>
                    </div>
                </div>

                {/* Policies */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <h2 className="text-sm font-bold text-gray-500 p-4 pb-2 uppercase">약관 및 정책</h2>
                    <div className="divide-y divide-gray-100">
                        <button
                            onClick={() => setCurrentScreen('TERMS')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <FileText size={20} className="text-gray-400" />
                                <span className="text-gray-900 font-medium">서비스 이용약관</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </button>
                        <button
                            onClick={() => setCurrentScreen('PRIVACY_POLICY')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 text-left"
                        >
                            <div className="flex items-center gap-3">
                                <FileText size={20} className="text-gray-400" />
                                <span className="text-gray-900 font-medium">개인정보 처리방침</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Permissions */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase">권한 설정</h2>
                    <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col">
                            <span className="text-gray-900 font-medium">마케팅 정보 수신 동의</span>
                            <span className="text-xs text-gray-400 mt-0.5">이벤트 및 혜택 알림을 받습니다.</span>
                        </div>
                        <button
                            onClick={toggleMarketing}
                            className={`w-12 h-7 rounded-full transition-colors relative ${marketingConsent ? 'bg-blue-500' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${marketingConsent ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 active:bg-red-100 text-left group">
                        <div className="flex items-center gap-3">
                            <Trash2 size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                            <span className="text-gray-900 font-medium group-hover:text-red-600 transition-colors">회원 탈퇴</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-red-300 transition-colors" />
                    </button>
                </div>

            </div>
        </div>
    );
}
