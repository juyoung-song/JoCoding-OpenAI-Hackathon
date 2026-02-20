import React from 'react';
import { AppProvider, useApp } from './store/AppContext';


// Pages
import OnboardingScreen from '../pages/OnboardingScreen';
import VoiceInputScreen from '../pages/VoiceInputScreen';
import ModeSelectionScreen from '../pages/ModeSelectionScreen';
import PlanDetailScreen from '../pages/PlanDetailScreen';
import PaymentScreen from '../pages/PaymentScreen';
import CompletionScreen from '../pages/CompletionScreen';
import RecommendationScreen from '../pages/RecommendationScreen';
import ItemDetailScreen from '../pages/ItemDetailScreen';
import MyPageScreen from '../pages/MyPageScreen';
import Top3ResultScreen from '../pages/Top3ResultScreen';
import PreferredBrandsScreen from '../pages/PreferredBrandsScreen';
import NonPreferredBrandsScreen from '../pages/NonPreferredBrandsScreen';
import CartViewScreen from '../pages/CartViewScreen';
import LoadingScreen from '../pages/LoadingScreen';
import HistoryScreen from '../pages/HistoryScreen';
import SettingsScreen from '../pages/SettingsScreen';
import HomeScreen from '../pages/HomeScreen';
import LoginScreen from '../pages/LoginScreen';
import NotificationsScreen from '../pages/NotificationsScreen';
import AccountInfoScreen from '../pages/AccountInfoScreen';
import PaymentMethodsScreen from '../pages/PaymentMethodsScreen';
import TermsScreen from '../pages/TermsScreen';
import PrivacyPolicyScreen from '../pages/PrivacyPolicyScreen';
import AddressBookScreen from '../pages/AddressBookScreen';


// Features
import ChatModal from '../features/chat/AiChatModal';

import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Home as HomeIcon, User } from 'lucide-react';
import { cn } from '../shared/ui/utils';


// Providers
import { ToastProvider } from '../shared/ui/ToastProvider';
import { BottomSheetProvider } from '../shared/ui/GlobalBottomSheet';

// Layout Component with Bottom Navigation
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isChatOpen, setIsChatOpen, currentScreen, setCurrentScreen } = useApp();

  const showBottomNav = ['HOME', 'MY_PAGE'].includes(currentScreen) || isChatOpen;

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="relative w-full h-screen bg-gray-50 flex flex-col overflow-hidden max-w-md mx-auto shadow-2xl">
        {/* Main Content - Hide when chat is open */}
        {!isChatOpen && (
          <div className={cn("flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide", showBottomNav ? "pb-24" : "")}>
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
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto bg-white border-t border-gray-200 py-3 px-6 flex justify-around items-center">
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
          {currentScreen === 'LOGIN' && <LoginScreen />}
          {currentScreen === 'HOME' && <HomeScreen />}
          {currentScreen === 'NOTIFICATIONS' && <NotificationsScreen />}
          {currentScreen === 'VOICE_INPUT_CONFIRM' && <VoiceInputScreen />}
          {currentScreen === 'MODE_SELECTION' && <ModeSelectionScreen />}
          {currentScreen === 'LOADING' && <LoadingScreen />} {/* Add Route */}
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
          {currentScreen === 'HISTORY' && <HistoryScreen />}
          {currentScreen === 'SETTINGS' && <SettingsScreen />}
          {currentScreen === 'ACCOUNT_INFO' && <AccountInfoScreen />}
          {currentScreen === 'PAYMENT_METHODS' && <PaymentMethodsScreen />}
          {currentScreen === 'TERMS' && <TermsScreen />}
          {currentScreen === 'PRIVACY_POLICY' && <PrivacyPolicyScreen />}
          {currentScreen === 'ADDRESS_BOOK' && <AddressBookScreen />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BottomSheetProvider>
          <AppContent />
        </BottomSheetProvider>
      </AppProvider>
    </ToastProvider>
  );
}
