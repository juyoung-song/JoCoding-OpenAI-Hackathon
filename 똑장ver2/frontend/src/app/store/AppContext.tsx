import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import {
  AuthAPI,
  BasketAPI,
  BasketResponse,
  PlanGenerationMeta,
  PlanResponse,
  PlanUserContextRequest,
  PlansAPI,
  ReservationEntryResponse,
  ReservationsAPI,
  UserDataAPI,
  UserProfileResponse,
  hasAuthSession,
} from "../../api";
import { useToast } from "../../shared/ui/ToastProvider";

type Screen =
  | "LOGIN"
  | "ONBOARDING"
  | "HOME"
  | "NOTIFICATIONS"
  | "VOICE_INPUT_CONFIRM"
  | "MODE_SELECTION"
  | "LOADING"
  | "TOP3_RESULT"
  | "PLAN_DETAIL"
  | "ITEM_DETAIL"
  | "PAYMENT"
  | "COMPLETION"
  | "RECOMMENDATION"
  | "MY_PAGE"
  | "PREFERRED_BRANDS"
  | "NON_PREFERRED_BRANDS"
  | "CART_VIEW"
  | "HISTORY"
  | "SETTINGS"
  | "ACCOUNT_INFO"
  | "PAYMENT_METHODS"
  | "TERMS"
  | "PRIVACY_POLICY"
  | "ADDRESS_BOOK";

export interface CartItem {
  id: string;
  name: string;
  brand?: string | null;
  price: string;
  quantity: number;
  unit: "개" | "g";
  sizeLabel?: string;
  bgColor: string;
}

export interface AddressEntry {
  id: string;
  label: string;
  roadAddress: string;
  detailAddress: string;
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  addresses: AddressEntry[];
}

export interface OrderHistoryEntry {
  id: string;
  date: string;
  martName: string;
  totalPrice: number;
  items: string[];
  itemCount: number;
  status: string;
  selectedMode?: "ONLINE" | "OFFLINE" | null;
  planType?: PlanResponse["plan_type"] | null;
  coverage?: number;
  totalBasketItems?: number;
  coverageRatio?: number;
  distanceKm?: number | null;
  travelMinutes?: number | null;
  deliveryInfo?: string | null;
  badges?: string[];
  missingItemsCount?: number;
  explanation?: string;
  comparedAt?: string;
  comparisonHeadline?: string;
  effectiveTravelMode?: string | null;
  weatherNote?: string | null;
  degradedProviders?: string[];
  priceSource?: string | null;
  priceObservedAt?: string | null;
  priceNotice?: string | null;
}

export interface ShoppingReservationEntry {
  id: string;
  label: string;
  weekday: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  time: string;
  enabled: boolean;
  scheduleType?: "one_time" | "weekly";
  status?: string;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  lastResultStatus?: string | null;
  retryCount?: number;
  createdAt?: string;
  sourceOrderId?: string;
  sourceMartName?: string;
  plannedItems?: string[];
}

export interface ReservationAlertEntry {
  id: string;
  reservationId: string;
  label: string;
  message: string;
  occurredAt: string;
  plannedItems: string[];
  read: boolean;
}

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  cartItems: CartItem[];
  setCartItems: Dispatch<SetStateAction<CartItem[]>>;
  removeCartItem: (id: string, name: string) => Promise<void>;
  clearCart: () => Promise<void>;
  updateCartItemQuantity: (id: string, name: string, quantity: number) => Promise<void>;
  addToCart: (name: string, quantity: number, size?: string, brand?: string) => Promise<void>;
  selectedMode: "ONLINE" | "OFFLINE" | null;
  setSelectedMode: (mode: "ONLINE" | "OFFLINE" | null) => void;
  pendingChatMessage: string;
  setPendingChatMessage: (message: string) => void;
  plans: PlanResponse[];
  setPlans: Dispatch<SetStateAction<PlanResponse[]>>;
  fetchPlans: (modeOverride?: "ONLINE" | "OFFLINE" | null) => Promise<void>;
  isPlansLoading: boolean;
  selectedPlan: PlanResponse | null;
  setSelectedPlan: Dispatch<SetStateAction<PlanResponse | null>>;
  planHeadline: string;
  planLastUpdated: string;
  planMeta: PlanGenerationMeta | null;
  planAlternatives: PlanResponse[];
  refreshBasket: () => Promise<void>;
  orderHistory: OrderHistoryEntry[];
  completeCurrentOrder: () => Promise<void>;
  shoppingReservations: ShoppingReservationEntry[];
  reservationAlerts: ReservationAlertEntry[];
  unreadReservationAlertCount: number;
  markReservationAlertRead: (alertId: string) => void;
  openReservationFromAlert: (reservationId: string) => Promise<void>;
  createReservationFromLatestOrder: () => Promise<void>;
  createReservationFromItems: (payload: {
    label: string;
    weekday: ShoppingReservationEntry["weekday"];
    time: string;
    plannedItems: string[];
  }) => Promise<void>;
  toggleReservation: (id: string) => Promise<void>;
  removeReservation: (id: string) => Promise<void>;
  planUserContext: PlanUserContextRequest;
  updatePlanUserContext: (patch: Partial<PlanUserContextRequest>) => void;
  userProfile: UserProfile;
  updateUserName: (name: string) => void;
  updatePhoneNumber: (phone: string) => void;
  addAddress: (entry: Omit<AddressEntry, "id" | "isDefault">) => void;
  updateAddress: (id: string, patch: Partial<Omit<AddressEntry, "id">>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BG_COLORS = ["#FEF2F2", "#EFF6FF", "#FEFCE8", "#ECFDF5", "#F3F4F6", "#FFF1F2"];
const KNOWN_PRICE_STORAGE_KEY = "ddokjang.known.prices.v2";
const RESERVATION_ALERT_STORAGE_KEY = "ddokjang.reservation.alerts.v1";
const RESERVATION_ALERT_ENTRIES_STORAGE_KEY = "ddokjang.reservation.alert.entries.v1";
const RESERVATION_ALERT_WINDOW_MS = 30 * 60 * 1000;
const RESERVATION_ALERT_POLL_MS = 30 * 1000;

const defaultPlanUserContext: PlanUserContextRequest = {
  travel_mode: "walk",
  max_travel_minutes: 30,
  source: "default",
};

const defaultProfile: UserProfile = {
  name: "",
  email: "",
  phone: "",
  addresses: [],
};

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const formatPrice = (price?: number) =>
  typeof price === "number" && Number.isFinite(price)
    ? `${new Intl.NumberFormat("ko-KR").format(price)}원`
    : "예상가 준비 중";

const normalize = (value: string | undefined | null) => (value ?? "").trim().toLowerCase();
const makePriceKey = (name: string, brand?: string | null, size?: string | null) =>
  [normalize(brand), normalize(name), normalize(size)].filter(Boolean).join("|");

const guessQuantityUnit = (size?: string | null): "개" | "g" => {
  if (!size) return "개";
  const normalized = size.trim().toLowerCase();
  return normalized === "g" || normalized.endsWith(" g") ? "g" : "개";
};

const toCartItems = (basketData: BasketResponse, knownPriceMap: Record<string, number>): CartItem[] =>
  basketData.items.map((item, index) => {
    const exactKey = makePriceKey(item.item_name, item.brand, item.size);
    const nameKey = makePriceKey(item.item_name);
    const price = knownPriceMap[exactKey] ?? knownPriceMap[nameKey];
    const unit = guessQuantityUnit(item.size);
    const sizeLabel = item.size && unit !== "g" ? item.size : undefined;

    return {
      id: `${item.item_name}-${item.brand ?? "no-brand"}-${item.size ?? "no-size"}`,
      name: item.item_name,
      brand: item.brand ?? null,
      price: formatPrice(price),
      quantity: item.quantity,
      unit,
      sizeLabel,
      bgColor: BG_COLORS[index % BG_COLORS.length],
    };
  });

const toShoppingReservationEntry = (entry: ReservationEntryResponse): ShoppingReservationEntry => ({
  id: entry.id,
  label: entry.label,
  weekday: entry.weekday,
  time: entry.time,
  enabled: entry.enabled,
  scheduleType: entry.schedule_type,
  status: entry.status,
  nextRunAt: entry.next_run_at ?? null,
  lastRunAt: entry.last_run_at ?? null,
  lastResultStatus: entry.last_result_status ?? null,
  retryCount: entry.retry_count,
  createdAt: entry.created_at,
  sourceOrderId: entry.source_order_id ?? undefined,
  sourceMartName: entry.source_mart_name ?? undefined,
  plannedItems: entry.planned_items ?? undefined,
});

const parseIsoTs = (value?: string | null): number => {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
};

const sortShoppingReservations = (entries: ShoppingReservationEntry[]): ShoppingReservationEntry[] => {
  return [...entries].sort((a, b) => {
    const aPriority = a.enabled ? 0 : 1;
    const bPriority = b.enabled ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;

    const aNext = parseIsoTs(a.nextRunAt);
    const bNext = parseIsoTs(b.nextRunAt);
    if (aNext !== bNext) return aNext - bNext;

    const aCreated = parseIsoTs(a.createdAt);
    const bCreated = parseIsoTs(b.createdAt);
    return bCreated - aCreated;
  });
};

const toUserProfile = (profile: UserProfileResponse): UserProfile => ({
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  addresses: profile.addresses,
});

const toOrderHistoryEntry = (raw: Record<string, unknown>): OrderHistoryEntry => {
  const items = Array.isArray(raw.items) ? raw.items.map((item) => String(item)) : [];
  return {
    id: String(raw.id ?? `ORD-${Date.now()}`),
    date: String(raw.date ?? ""),
    martName: String(raw.martName ?? "똑장 추천 플랜"),
    totalPrice: Number(raw.totalPrice ?? 0),
    items,
    itemCount: Number(raw.itemCount ?? items.length),
    status: String(raw.status ?? "완료"),
    selectedMode: (raw.selectedMode as "ONLINE" | "OFFLINE" | null) ?? null,
    planType: (raw.planType as PlanResponse["plan_type"] | null) ?? null,
    coverage: typeof raw.coverage === "number" ? raw.coverage : undefined,
    totalBasketItems: typeof raw.totalBasketItems === "number" ? raw.totalBasketItems : undefined,
    coverageRatio: typeof raw.coverageRatio === "number" ? raw.coverageRatio : undefined,
    distanceKm: typeof raw.distanceKm === "number" ? raw.distanceKm : null,
    travelMinutes: typeof raw.travelMinutes === "number" ? raw.travelMinutes : null,
    deliveryInfo: (raw.deliveryInfo as string | null) ?? null,
    badges: Array.isArray(raw.badges) ? raw.badges.map((badge) => String(badge)) : [],
    missingItemsCount: typeof raw.missingItemsCount === "number" ? raw.missingItemsCount : undefined,
    explanation: (raw.explanation as string | undefined) ?? "",
    comparedAt: (raw.comparedAt as string | undefined) ?? undefined,
    comparisonHeadline: (raw.comparisonHeadline as string | undefined) ?? undefined,
    effectiveTravelMode: (raw.effectiveTravelMode as string | null) ?? null,
    weatherNote: (raw.weatherNote as string | null) ?? null,
    degradedProviders: Array.isArray(raw.degradedProviders)
      ? raw.degradedProviders.map((provider) => String(provider))
      : [],
    priceSource: (raw.priceSource as string | null) ?? null,
    priceObservedAt: (raw.priceObservedAt as string | null) ?? null,
    priceNotice: (raw.priceNotice as string | null) ?? null,
  };
};

const isAuthError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("401") || message.includes("unauthorized") || message.includes("session");
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>(hasAuthSession() ? "HOME" : "LOGIN");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"ONLINE" | "OFFLINE" | null>(null);
  const [pendingChatMessage, setPendingChatMessage] = useState("");
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanResponse | null>(null);
  const [planHeadline, setPlanHeadline] = useState("");
  const [planLastUpdated, setPlanLastUpdated] = useState("");
  const [planMeta, setPlanMeta] = useState<PlanGenerationMeta | null>(null);
  const [planAlternatives, setPlanAlternatives] = useState<PlanResponse[]>([]);
  const [knownPriceMap, setKnownPriceMap] = useState<Record<string, number>>(() =>
    safeParse<Record<string, number>>(localStorage.getItem(KNOWN_PRICE_STORAGE_KEY), {})
  );
  const reservationAlertMapRef = useRef<Record<string, string>>(
    safeParse<Record<string, string>>(localStorage.getItem(RESERVATION_ALERT_STORAGE_KEY), {})
  );
  const [reservationAlerts, setReservationAlerts] = useState<ReservationAlertEntry[]>(() =>
    safeParse<ReservationAlertEntry[]>(
      localStorage.getItem(RESERVATION_ALERT_ENTRIES_STORAGE_KEY),
      []
    )
  );
  const [planUserContext, setPlanUserContext] = useState<PlanUserContextRequest>(defaultPlanUserContext);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>([]);
  const [shoppingReservations, setShoppingReservations] = useState<ShoppingReservationEntry[]>([]);
  const unreadReservationAlertCount = useMemo(
    () => reservationAlerts.filter((entry) => !entry.read).length,
    [reservationAlerts]
  );
  const sessionAvailable = hasAuthSession();

  const handleAuthFailure = useCallback(() => {
    AuthAPI.clearSession();
    setCurrentScreen("LOGIN");
  }, []);

  useEffect(() => {
    localStorage.setItem(KNOWN_PRICE_STORAGE_KEY, JSON.stringify(knownPriceMap));
  }, [knownPriceMap]);

  useEffect(() => {
    localStorage.setItem(
      RESERVATION_ALERT_ENTRIES_STORAGE_KEY,
      JSON.stringify(reservationAlerts)
    );
  }, [reservationAlerts]);

  const updatePlanUserContext = useCallback((patch: Partial<PlanUserContextRequest>) => {
    setPlanUserContext((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const updateKnownPrices = useCallback((planList: PlanResponse[]) => {
    setKnownPriceMap((prev) => {
      const next = { ...prev };
      for (const plan of planList) {
        for (const item of plan.items) {
          next[makePriceKey(item.item_name, item.brand, item.size)] = item.price;
          next[makePriceKey(item.item_name)] = item.price;
        }
      }
      return next;
    });
  }, []);

  const refreshBasket = useCallback(async () => {
    if (!AuthAPI.hasSession()) return;
    try {
      const basketData = await BasketAPI.getBasket();
      setCartItems(toCartItems(basketData, knownPriceMap));
    } catch (error) {
      console.error("Failed to fetch basket", error);
      if (isAuthError(error)) handleAuthFailure();
    }
  }, [knownPriceMap, handleAuthFailure]);

  const refreshReservations = useCallback(async () => {
    if (!AuthAPI.hasSession()) return;
    try {
      const response = await ReservationsAPI.listReservations();
      const mappedReservations = sortShoppingReservations(
        response.reservations.map(toShoppingReservationEntry)
      );
      setShoppingReservations(mappedReservations);

      const nextAlertMap = { ...reservationAlertMapRef.current };
      const activeIds = new Set(response.reservations.map((entry) => entry.id));
      let hasMapChanged = false;
      const nowMs = Date.now();

      for (const reservationId of Object.keys(nextAlertMap)) {
        if (!activeIds.has(reservationId)) {
          delete nextAlertMap[reservationId];
          hasMapChanged = true;
        }
      }

      for (const reservation of response.reservations) {
        const lastRunAt = reservation.last_run_at;
        if (!lastRunAt) continue;
        if (nextAlertMap[reservation.id] === lastRunAt) continue;

        const runAtMs = Date.parse(lastRunAt);
        if (
          Number.isFinite(runAtMs) &&
          Math.abs(nowMs - runAtMs) <= RESERVATION_ALERT_WINDOW_MS
        ) {
          const alertId = `resv:${reservation.id}:${lastRunAt}`;
          const alertEntry: ReservationAlertEntry = {
            id: alertId,
            reservationId: reservation.id,
            label: reservation.label,
            message: "예약 실행 시간이 도래해 승인 대기 상태가 되었습니다.",
            occurredAt: lastRunAt,
            plannedItems: reservation.planned_items ?? [],
            read: false,
          };
          setReservationAlerts((prev) => {
            if (prev.some((entry) => entry.id === alertId)) return prev;
            return [alertEntry, ...prev].slice(0, 50);
          });
          showToast(
            `예약 알림: '${reservation.label}' 실행 시간이 도래했어요. 승인 대기 상태를 확인해주세요.`,
            "info"
          );
        }

        nextAlertMap[reservation.id] = lastRunAt;
        hasMapChanged = true;
      }

      if (hasMapChanged) {
        reservationAlertMapRef.current = nextAlertMap;
        localStorage.setItem(RESERVATION_ALERT_STORAGE_KEY, JSON.stringify(nextAlertMap));
      }
    } catch (error) {
      console.error("Failed to fetch reservations", error);
      if (isAuthError(error)) handleAuthFailure();
    }
  }, [handleAuthFailure, showToast]);

  const refreshProfile = useCallback(async () => {
    if (!AuthAPI.hasSession()) return;
    try {
      const profile = await UserDataAPI.getProfile();
      setUserProfile(toUserProfile(profile));
    } catch (error) {
      console.error("Failed to fetch profile", error);
      if (isAuthError(error)) handleAuthFailure();
    }
  }, [handleAuthFailure]);

  const refreshOrders = useCallback(async () => {
    if (!AuthAPI.hasSession()) return;
    try {
      const orders = await UserDataAPI.getOrders();
      const mapped = orders.orders.map((row) => toOrderHistoryEntry(row));
      setOrderHistory(mapped);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      if (isAuthError(error)) handleAuthFailure();
    }
  }, [handleAuthFailure]);

  useEffect(() => {
    if (!sessionAvailable) {
      setCurrentScreen("LOGIN");
      return;
    }

    const bootstrap = async () => {
      await Promise.all([refreshBasket(), refreshReservations(), refreshProfile(), refreshOrders()]);
    };

    void bootstrap();
  }, [sessionAvailable, refreshBasket, refreshReservations, refreshProfile, refreshOrders]);

  useEffect(() => {
    if (!sessionAvailable) return;
    const timerId = window.setInterval(() => {
      void refreshReservations();
    }, RESERVATION_ALERT_POLL_MS);
    return () => {
      window.clearInterval(timerId);
    };
  }, [sessionAvailable, refreshReservations]);

  const syncProfile = useCallback(
    async (profile: UserProfile) => {
      if (!AuthAPI.hasSession()) return;
      try {
        const saved = await UserDataAPI.updateProfile(profile);
        setUserProfile(toUserProfile(saved));
      } catch (error) {
        console.error("Failed to sync profile", error);
        if (isAuthError(error)) handleAuthFailure();
      }
    },
    [handleAuthFailure]
  );

  const addToCart = useCallback(
    async (name: string, quantity: number, size?: string, brand?: string) => {
      try {
        await BasketAPI.addToBasket(name, quantity, size, brand);
        await refreshBasket();
      } catch (error) {
        console.error("Failed to add to basket", error);
        if (isAuthError(error)) {
          handleAuthFailure();
          return;
        }
        showToast("장바구니 추가에 실패했습니다.", "error");
      }
    },
    [refreshBasket, handleAuthFailure, showToast]
  );

  const removeCartItem = useCallback(
    async (id: string, name: string) => {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      try {
        await BasketAPI.removeFromBasket(name);
      } catch (error) {
        console.error("Failed to remove from basket", error);
      } finally {
        await refreshBasket();
      }
    },
    [refreshBasket]
  );

  const clearCart = useCallback(async () => {
    try {
      await BasketAPI.clearBasket();
      setCartItems([]);
    } catch (error) {
      console.error("Failed to clear basket", error);
      if (isAuthError(error)) handleAuthFailure();
    }
  }, [handleAuthFailure]);

  const updateCartItemQuantity = useCallback(
    async (id: string, name: string, quantity: number) => {
      if (quantity <= 0) {
        await removeCartItem(id, name);
        return;
      }
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));

      try {
        await BasketAPI.updateBasketItemQuantity(name, quantity);
      } catch (error) {
        console.error("Failed to update basket item quantity", error);
      } finally {
        await refreshBasket();
      }
    },
    [removeCartItem, refreshBasket]
  );

  const fetchPlans = useCallback(
    async (modeOverride?: "ONLINE" | "OFFLINE" | null) => {
      setIsPlansLoading(true);
      if (currentScreen !== "TOP3_RESULT") {
        setCurrentScreen("LOADING");
      }

      try {
        if (modeOverride) {
          setSelectedMode(modeOverride);
        }

        let sourceCartItems = cartItems;
        if (sourceCartItems.length === 0) {
          const basketData = await BasketAPI.getBasket();
          const syncedCartItems = toCartItems(basketData, knownPriceMap);
          setCartItems(syncedCartItems);
          sourceCartItems = syncedCartItems;
        }

        if (sourceCartItems.length === 0) {
          setCurrentScreen("CART_VIEW");
          return;
        }

        const items = sourceCartItems.map((item) => ({
          item_name: item.name,
          brand: item.brand ?? undefined,
          quantity: item.quantity,
          size: item.sizeLabel ?? (item.unit === "g" ? "g" : undefined),
        }));

        const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1800));
        const effectiveMode = modeOverride ?? selectedMode ?? "ONLINE";
        const apiCall = PlansAPI.generatePlans(items, effectiveMode, planUserContext);
        const [planResult] = await Promise.all([apiCall, minLoadingTime]);

        setPlans(planResult.top3 ?? []);
        setPlanAlternatives(planResult.alternatives ?? []);
        setPlanHeadline(planResult.headline ?? "");
        setPlanLastUpdated(planResult.last_updated ?? "");
        setPlanMeta(planResult.meta ?? null);
        updateKnownPrices(planResult.top3 ?? []);
        setSelectedPlan(null);
        setCurrentScreen("TOP3_RESULT");
      } catch (error) {
        console.error("Failed to generate plans", error);
        if (isAuthError(error)) {
          handleAuthFailure();
          return;
        }
        showToast("플랜 생성에 실패했습니다. 잠시 후 다시 시도해주세요.", "error");
        setCurrentScreen("CART_VIEW");
      } finally {
        setIsPlansLoading(false);
      }
    },
    [
      cartItems,
      currentScreen,
      selectedMode,
      planUserContext,
      showToast,
      updateKnownPrices,
      handleAuthFailure,
      knownPriceMap,
    ]
  );

  const completeCurrentOrder = useCallback(async () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ".");
    const plan = selectedPlan;

    const items =
      plan?.items.map((item) => `${item.brand ? `${item.brand} ` : ""}${item.item_name}`) ??
      cartItems.map((item) => `${item.brand ? `${item.brand} ` : ""}${item.name}`);

    const newOrder: OrderHistoryEntry = {
      id: `ORD-${now.getTime()}`,
      date,
      martName: plan?.mart_name ?? "똑장 추천 플랜",
      totalPrice: plan?.estimated_total ?? 0,
      items,
      itemCount: items.length,
      status: "결제완료",
      selectedMode,
      planType: plan?.plan_type ?? null,
      coverage: plan?.coverage ?? items.length,
      totalBasketItems: plan?.total_basket_items ?? items.length,
      coverageRatio: plan?.coverage_ratio ?? 1,
      distanceKm: plan?.distance_km ?? null,
      travelMinutes: plan?.travel_minutes ?? null,
      deliveryInfo: plan?.delivery_info ?? null,
      badges: plan?.badges ?? [],
      missingItemsCount: plan?.missing_items?.length ?? 0,
      explanation: plan?.explanation ?? "",
      comparedAt: planLastUpdated || undefined,
      comparisonHeadline: planHeadline || undefined,
      effectiveTravelMode: planMeta?.effective_context?.travel_mode ?? null,
      weatherNote: planMeta?.weather_note ?? null,
      degradedProviders: planMeta?.degraded_providers ?? [],
      priceSource: plan?.price_source ?? null,
      priceObservedAt: plan?.price_observed_at ?? null,
      priceNotice: plan?.price_notice ?? null,
    };

    setOrderHistory((prev) => [newOrder, ...prev]);
    if (plan) {
      updateKnownPrices([plan]);
    }

    try {
      await UserDataAPI.createOrder(newOrder as unknown as Record<string, unknown>);
      await BasketAPI.clearBasket();
      setCartItems([]);
      await refreshOrders();
    } catch (error) {
      console.error("Failed to persist order", error);
      if (isAuthError(error)) handleAuthFailure();
    }
  }, [
    selectedPlan,
    cartItems,
    updateKnownPrices,
    selectedMode,
    planLastUpdated,
    planHeadline,
    planMeta,
    refreshOrders,
    handleAuthFailure,
  ]);

  const markReservationAlertRead = useCallback((alertId: string) => {
    setReservationAlerts((prev) =>
      prev.map((entry) => (entry.id === alertId ? { ...entry, read: true } : entry))
    );
  }, []);

  const openReservationFromAlert = useCallback(
    async (reservationId: string) => {
      const target = shoppingReservations.find((entry) => entry.id === reservationId);
      if (!target) {
        showToast("예약 정보를 찾을 수 없습니다. 예약 목록을 확인해주세요.", "error");
        setCurrentScreen("RECOMMENDATION");
        return;
      }

      try {
        const plannedItems = (target.plannedItems ?? [])
          .map((item) => item.trim())
          .filter((item, index, arr) => item.length > 0 && arr.indexOf(item) === index);

        if (plannedItems.length > 0) {
          const basket = await BasketAPI.getBasket();
          const existingNames = new Set(
            basket.items.map((item) => item.item_name.trim().toLowerCase())
          );

          for (const itemName of plannedItems) {
            const normalized = itemName.toLowerCase();
            if (existingNames.has(normalized)) continue;
            await BasketAPI.addToBasket(itemName, 1);
            existingNames.add(normalized);
          }
          await refreshBasket();
        }

        if (target.status === "awaiting_approval") {
          await ReservationsAPI.updateReservation(reservationId, {
            status: target.scheduleType === "one_time" ? "completed" : "active",
            enabled: target.scheduleType === "one_time" ? false : target.enabled,
            last_result_status: "approved_by_user",
          });
        }

        setReservationAlerts((prev) =>
          prev.map((entry) =>
            entry.reservationId === reservationId ? { ...entry, read: true } : entry
          )
        );
        await refreshReservations();
        setCurrentScreen("CART_VIEW");
        showToast("예약 품목을 장바구니에 반영했어요. 바로 플랜 비교를 진행해보세요.", "success");
      } catch (error) {
        console.error("Failed to open reservation alert", error);
        if (isAuthError(error)) {
          handleAuthFailure();
          return;
        }
        showToast("예약 실행 처리에 실패했습니다. 잠시 후 다시 시도해주세요.", "error");
      }
    },
    [shoppingReservations, showToast, refreshBasket, refreshReservations, handleAuthFailure]
  );

  const createReservationFromLatestOrder = useCallback(async () => {
    if (orderHistory.length === 0) {
      showToast("최근 주문 내역이 없어 예약을 생성할 수 없습니다.", "info");
      return;
    }

    const latest = orderHistory[0];
    try {
      const created = await ReservationsAPI.createReservation({
        label: `${latest.martName} 재주문`,
        weekday: "fri",
        time: "18:30",
        enabled: true,
        schedule_type: "weekly",
        timezone: "Asia/Seoul",
        channel: "in_app",
        source_order_id: latest.id,
        source_mart_name: latest.martName,
        planned_items: latest.items,
      });
      const mapped = toShoppingReservationEntry(created);
      setShoppingReservations((prev) =>
        sortShoppingReservations([mapped, ...prev.filter((entry) => entry.id !== mapped.id)])
      );
      await refreshReservations();
      showToast("장보기 예약이 생성되었습니다.", "success");
    } catch (error) {
      console.error("Failed to create reservation", error);
      if (isAuthError(error)) {
        handleAuthFailure();
        return;
      }
      showToast("예약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.", "error");
    }
  }, [orderHistory, showToast, handleAuthFailure, refreshReservations]);

  const createReservationFromItems = useCallback(
    async (payload: {
      label: string;
      weekday: ShoppingReservationEntry["weekday"];
      time: string;
      plannedItems: string[];
    }) => {
      const cleanedItems = payload.plannedItems
        .map((item) => item.trim())
        .filter((item, index, arr) => item.length > 0 && arr.indexOf(item) === index);
      if (cleanedItems.length === 0) {
        showToast("예약할 품목을 1개 이상 입력해주세요.", "info");
        return;
      }
      try {
        const created = await ReservationsAPI.createReservation({
          label: payload.label.trim(),
          weekday: payload.weekday,
          time: payload.time,
          enabled: true,
          schedule_type: "weekly",
          timezone: "Asia/Seoul",
          channel: "in_app",
          planned_items: cleanedItems,
        });
        const mapped = toShoppingReservationEntry(created);
        setShoppingReservations((prev) =>
          sortShoppingReservations([mapped, ...prev.filter((entry) => entry.id !== mapped.id)])
        );
        await refreshReservations();
        showToast("장보기 예약이 생성되었습니다.", "success");
      } catch (error) {
        console.error("Failed to create reservation from items", error);
        if (isAuthError(error)) {
          handleAuthFailure();
          return;
        }
        showToast("예약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.", "error");
      }
    },
    [showToast, handleAuthFailure, refreshReservations]
  );

  const toggleReservation = useCallback(
    async (id: string) => {
      const target = shoppingReservations.find((entry) => entry.id === id);
      if (!target) return;
      try {
        const updated = await ReservationsAPI.updateReservation(id, {
          enabled: !target.enabled,
          status: !target.enabled ? "active" : "paused",
        });
        const mapped = toShoppingReservationEntry(updated);
        setShoppingReservations((prev) =>
          sortShoppingReservations(prev.map((entry) => (entry.id === id ? mapped : entry)))
        );
        await refreshReservations();
      } catch (error) {
        console.error("Failed to toggle reservation", error);
        if (isAuthError(error)) {
          handleAuthFailure();
          return;
        }
        showToast("예약 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.", "error");
      }
    },
    [shoppingReservations, showToast, handleAuthFailure, refreshReservations]
  );

  const removeReservation = useCallback(
    async (id: string) => {
      try {
        const response = await ReservationsAPI.deleteReservation(id);
        setShoppingReservations(
          sortShoppingReservations(response.reservations.map(toShoppingReservationEntry))
        );
        await refreshReservations();
      } catch (error) {
        console.error("Failed to remove reservation", error);
        if (isAuthError(error)) {
          handleAuthFailure();
          return;
        }
        showToast("예약 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.", "error");
      }
    },
    [showToast, handleAuthFailure, refreshReservations]
  );

  const updateUserName = useCallback(
    (name: string) => {
      setUserProfile((prev) => {
        const next = { ...prev, name };
        void syncProfile(next);
        return next;
      });
    },
    [syncProfile]
  );

  const updatePhoneNumber = useCallback(
    (phone: string) => {
      setUserProfile((prev) => {
        const next = { ...prev, phone };
        void syncProfile(next);
        return next;
      });
    },
    [syncProfile]
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      setUserProfile((prev) => {
        const next = {
          ...prev,
          addresses: prev.addresses.map((addr) => ({ ...addr, isDefault: addr.id === id })),
        };
        void syncProfile(next);
        return next;
      });
    },
    [syncProfile]
  );

  const addAddress = useCallback(
    (entry: Omit<AddressEntry, "id" | "isDefault">) => {
      setUserProfile((prev) => {
        const created: AddressEntry = {
          id: `addr-${Date.now()}`,
          label: entry.label,
          roadAddress: entry.roadAddress,
          detailAddress: entry.detailAddress,
          isDefault: prev.addresses.length === 0,
        };
        const next = { ...prev, addresses: [...prev.addresses, created] };
        void syncProfile(next);
        return next;
      });
    },
    [syncProfile]
  );

  const updateAddress = useCallback(
    (id: string, patch: Partial<Omit<AddressEntry, "id">>) => {
      setUserProfile((prev) => {
        const next = {
          ...prev,
          addresses: prev.addresses.map((addr) => (addr.id === id ? { ...addr, ...patch } : addr)),
        };
        void syncProfile(next);
        return next;
      });
    },
    [syncProfile]
  );

  const removeAddress = useCallback(
    (id: string) => {
      setUserProfile((prev) => {
        const filtered = prev.addresses.filter((addr) => addr.id !== id);
        if (filtered.length > 0 && !filtered.some((addr) => addr.isDefault)) {
          filtered[0] = { ...filtered[0], isDefault: true };
        }
        const next = { ...prev, addresses: filtered };
        void syncProfile(next);
        return next;
      });
    },
    [syncProfile]
  );

  const value = useMemo(
    () => ({
      currentScreen,
      setCurrentScreen,
      isChatOpen,
      setIsChatOpen,
      cartItems,
      setCartItems,
      removeCartItem,
      clearCart,
      updateCartItemQuantity,
      addToCart,
      selectedMode,
      setSelectedMode,
      pendingChatMessage,
      setPendingChatMessage,
      plans,
      setPlans,
      fetchPlans,
      isPlansLoading,
      selectedPlan,
      setSelectedPlan,
      planHeadline,
      planLastUpdated,
      planMeta,
      planAlternatives,
      refreshBasket,
      orderHistory,
      completeCurrentOrder,
      shoppingReservations,
      reservationAlerts,
      unreadReservationAlertCount,
      markReservationAlertRead,
      openReservationFromAlert,
      createReservationFromLatestOrder,
      createReservationFromItems,
      toggleReservation,
      removeReservation,
      planUserContext,
      updatePlanUserContext,
      userProfile,
      updateUserName,
      updatePhoneNumber,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    }),
    [
      currentScreen,
      isChatOpen,
      cartItems,
      removeCartItem,
      clearCart,
      updateCartItemQuantity,
      addToCart,
      selectedMode,
      pendingChatMessage,
      plans,
      fetchPlans,
      isPlansLoading,
      selectedPlan,
      planHeadline,
      planLastUpdated,
      planMeta,
      planAlternatives,
      refreshBasket,
      orderHistory,
      completeCurrentOrder,
      shoppingReservations,
      reservationAlerts,
      unreadReservationAlertCount,
      markReservationAlertRead,
      openReservationFromAlert,
      createReservationFromLatestOrder,
      createReservationFromItems,
      toggleReservation,
      removeReservation,
      planUserContext,
      updatePlanUserContext,
      userProfile,
      updateUserName,
      updatePhoneNumber,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
