import { createContext, useContext, useState, ReactNode } from 'react';
// AppContext for managing global app state
type Screen = 
  | 'ONBOARDING'
  | 'HOME'
  | 'VOICE_INPUT_CONFIRM'
  | 'MODE_SELECTION'
  | 'LOADING'
  | 'TOP3_RESULT'
  | 'PLAN_DETAIL'
  | 'ITEM_DETAIL'
  | 'PAYMENT'
  | 'COMPLETION'
  | 'RECOMMENDATION'
  | 'MY_PAGE'
  | 'PREFERRED_BRANDS'
  | 'NON_PREFERRED_BRANDS'
  | 'CART_VIEW';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  unit: string;
  bgColor: string;
}

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  selectedMode: 'ONLINE' | 'OFFLINE' | null;
  setSelectedMode: (mode: 'ONLINE' | 'OFFLINE' | null) => void;
  pendingChatMessage: string;
  setPendingChatMessage: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('ONBOARDING');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'item1',
      name: '국내산 삼겹살',
      price: '100g당 2,580원',
      quantity: 600,
      unit: 'g',
      bgColor: '#FEF2F2'
    },
    {
      id: 'item2',
      name: '서울우유 1L',
      price: '2,980원',
      quantity: 2,
      unit: '개',
      bgColor: '#EFF6FF'
    },
    {
      id: 'item3',
      name: '무항생제 특란 30구',
      price: '8,900원',
      quantity: 1,
      unit: '개',
      bgColor: '#FEFCE8'
    }
  ]);
  const [selectedMode, setSelectedMode] = useState<'ONLINE' | 'OFFLINE' | null>(null);
  const [pendingChatMessage, setPendingChatMessage] = useState('');

  const removeCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(id);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      isChatOpen,
      setIsChatOpen,
      cartItems,
      setCartItems,
      removeCartItem,
      clearCart,
      updateCartItemQuantity,
      selectedMode,
      setSelectedMode,
      pendingChatMessage,
      setPendingChatMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};