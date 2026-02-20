import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import OnboardingScreen from '../imports/대화형환경설정';
import VoiceInputScreen from '../imports/음성입력확인및수정';
import ModeSelectionScreen from '../imports/구매방식선택';
import PlanDetailScreen from '../imports/상세품목및가격확인';
import PaymentScreen from '../imports/온라인주문결제확인';
import CompletionScreen from '../imports/주문및결제완료';
import RecommendationScreen from '../imports/식재료맞춤추천';
import ItemDetailScreen from '../imports/상품별상세정보및대체추천';
import ChatModal from '../imports/똑장Ai채팅모달_NEW';
import MyPageScreen from './components/MyPageScreen';
import Top3ResultScreen from './components/Top3ResultScreen';
import PreferredBrandsScreen from './components/PreferredBrandsScreen';
import NonPreferredBrandsScreen from './components/NonPreferredBrandsScreen';
import CartViewScreen from './components/CartViewScreen';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, ShoppingCart, Home as HomeIcon, Search, Heart, User } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
// Helper for tailwind classes
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Home Component (Custom built as it wasn't fully imported)
import HomeScreen from './components/HomeScreen';

// Layout Component with Bottom Navigation
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isChatOpen, setIsChatOpen, currentScreen, setCurrentScreen } = useApp();

  const showBottomNav = ['HOME', 'MY_PAGE'].includes(currentScreen) || isChatOpen;

  return (
    <div className="relative w-full h-full bg-gray-50 flex flex-col overflow-hidden max-w-md mx-auto shadow-2xl min-h-screen">
      {/* Main Content - Hide when chat is open */}
      {!isChatOpen && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {children}
        </div>
      )}

      {/* Full Screen Chat */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="flex-1 overflow-y-auto bg-white">
              <ChatModal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="bg-white border-t border-gray-200 py-3 px-6 flex justify-around items-center z-40 shrink-0">
          <NavIcon 
            icon={<HomeIcon size={24} />} 
            label="홈" 
            active={currentScreen === 'HOME' && !isChatOpen} 
            onClick={() => { setIsChatOpen(false); setCurrentScreen('HOME'); }}
          />
          <NavIcon 
            icon={<MessageCircle size={24} />} 
            label="AI 챗" 
            active={isChatOpen} 
            onClick={() => setIsChatOpen(true)}
          />
          <NavIcon 
            icon={<User size={24} />} 
            label="마이" 
            active={currentScreen === 'MY_PAGE' && !isChatOpen} 
            onClick={() => { setIsChatOpen(false); setCurrentScreen('MY_PAGE'); }}
          />
        </div>
      )}
    </div>
  );
};

const NavIcon = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    className={cn("flex flex-col items-center gap-1 cursor-pointer transition-colors", active ? "text-blue-600" : "text-gray-400 hover:text-gray-600")}
    onClick={onClick}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </div>
);

const AppContent = () => {
  const { currentScreen } = useApp();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {currentScreen === 'ONBOARDING' && <OnboardingScreen />}
          {currentScreen === 'HOME' && <HomeScreen />}
          {currentScreen === 'VOICE_INPUT_CONFIRM' && <VoiceInputScreen />}
          {currentScreen === 'MODE_SELECTION' && <ModeSelectionScreen />}
          {currentScreen === 'TOP3_RESULT' && <Top3ResultScreen />}
          {currentScreen === 'PLAN_DETAIL' && <PlanDetailScreen />}
          {currentScreen === 'ITEM_DETAIL' && <ItemDetailScreen />}
          {currentScreen === 'PAYMENT' && <PaymentScreen />}
          {currentScreen === 'COMPLETION' && <CompletionScreen />}
          {currentScreen === 'RECOMMENDATION' && <RecommendationScreen />}
          {currentScreen === 'MY_PAGE' && <MyPageScreen />}
          {currentScreen === 'PREFERRED_BRANDS' && <PreferredBrandsScreen />}
          {currentScreen === 'NON_PREFERRED_BRANDS' && <NonPreferredBrandsScreen />}
          {currentScreen === 'CART_VIEW' && <CartViewScreen />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}