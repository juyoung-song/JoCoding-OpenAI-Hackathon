const API_BASE = "/api/v1";
const TOKEN_STORAGE_KEY = "ddokjang.auth.tokens.v1";

interface StoredTokens {
    access_token: string;
    refresh_token: string;
}

let accessToken = "";
let refreshToken = "";

const canUseStorage = () => typeof window !== "undefined";

const loadTokens = () => {
    if (!canUseStorage()) return;
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw) as StoredTokens;
        accessToken = parsed.access_token ?? "";
        refreshToken = parsed.refresh_token ?? "";
    } catch {
        accessToken = "";
        refreshToken = "";
    }
};

const persistTokens = () => {
    if (!canUseStorage()) return;
    if (!accessToken || !refreshToken) {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        return;
    }
    sessionStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({ access_token: accessToken, refresh_token: refreshToken })
    );
};

loadTokens();

const setTokens = (nextAccessToken: string, nextRefreshToken: string) => {
    accessToken = nextAccessToken;
    refreshToken = nextRefreshToken;
    persistTokens();
};

const clearTokens = () => {
    accessToken = "";
    refreshToken = "";
    persistTokens();
};

const parseErrorMessage = async (res: Response): Promise<string> => {
    try {
        const data = await res.json();
        if (typeof data?.detail === "string") return data.detail;
        if (typeof data?.detail?.message === "string") return data.detail.message;
        if (typeof data?.message === "string") return data.message;
    } catch {
        // ignore json parse errors
    }
    return `Request failed (${res.status})`;
};

const tryRefreshToken = async (): Promise<boolean> => {
    if (!refreshToken) return false;
    const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
        clearTokens();
        return false;
    }

    const data = (await res.json()) as AuthTokenResponse;
    setTokens(data.access_token, data.refresh_token);
    return true;
};

const request = async (
    path: string,
    init: RequestInit = {},
    requireAuth: boolean = true,
    allowRetry: boolean = true
): Promise<Response> => {
    const headers = new Headers(init.headers ?? {});
    if (!headers.has("Content-Type") && init.body) {
        headers.set("Content-Type", "application/json");
    }

    if (requireAuth && accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
    });

    if (
        res.status === 401 &&
        requireAuth &&
        allowRetry &&
        !path.startsWith("/auth/") &&
        refreshToken
    ) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            return request(path, init, requireAuth, false);
        }
    }

    return res;
};

const requestJson = async <T>(
    path: string,
    init: RequestInit = {},
    requireAuth: boolean = true
): Promise<T> => {
    const res = await request(path, init, requireAuth);
    if (!res.ok) {
        throw new Error(await parseErrorMessage(res));
    }
    return res.json() as Promise<T>;
};

export const hasAuthSession = (): boolean => Boolean(accessToken && refreshToken);

export interface AuthUserResponse {
    user_id: string;
    email: string;
    name?: string | null;
}

export interface AuthTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: AuthUserResponse;
}

export const AuthAPI = {
    async login(email: string, name?: string): Promise<AuthTokenResponse> {
        const data = await requestJson<AuthTokenResponse>(
            "/auth/login",
            {
                method: "POST",
                body: JSON.stringify({ email, name }),
            },
            false
        );
        setTokens(data.access_token, data.refresh_token);
        return data;
    },

    async refresh(): Promise<AuthTokenResponse> {
        if (!refreshToken) {
            throw new Error("No refresh token");
        }
        const data = await requestJson<AuthTokenResponse>(
            "/auth/refresh",
            {
                method: "POST",
                body: JSON.stringify({ refresh_token: refreshToken }),
            },
            false
        );
        setTokens(data.access_token, data.refresh_token);
        return data;
    },

    async logout(): Promise<void> {
        if (!accessToken && !refreshToken) {
            clearTokens();
            return;
        }
        await request(
            "/auth/logout",
            {
                method: "POST",
                body: JSON.stringify({ refresh_token: refreshToken || undefined }),
            },
            true,
            false
        );
        clearTokens();
    },

    async me(): Promise<AuthUserResponse> {
        return requestJson<AuthUserResponse>("/auth/me", { method: "GET" }, true);
    },

    clearSession() {
        clearTokens();
    },

    hasSession() {
        return hasAuthSession();
    },
};

export interface BasketItemResponse {
    item_name: string;
    brand?: string | null;
    size?: string | null;
    quantity: number;
    category?: string | null;
    mode: "fixed" | "recommend";
    canonical_id?: string | null;
}

export interface BasketResponse {
    items: BasketItemResponse[];
}

export interface PlanItemResponse {
    item_name: string;
    brand?: string | null;
    size?: string | null;
    quantity: number;
    price: number;
    store_name: string;
    url?: string | null;
    is_sold_out: boolean;
}

export interface PlanAlternativeResponse {
    item_name: string;
    brand?: string | null;
    size?: string | null;
    unit_price: number;
    reason: string;
}

export interface MissingPlanItemResponse {
    item_name: string;
    requested_brand?: string | null;
    requested_size?: string | null;
    reason: string;
    alternative?: PlanAlternativeResponse | null;
}

export interface PlanResponse {
    plan_type: "cheapest" | "nearest" | "balanced";
    mart_name: string;
    mart_icon?: string | null;
    items: PlanItemResponse[];
    estimated_total: number;
    coverage: number;
    total_basket_items: number;
    coverage_ratio: number;
    distance_km?: number | null;
    travel_minutes?: number | null;
    delivery_info?: string | null;
    badges: string[];
    missing_items?: MissingPlanItemResponse[];
    explanation: string;
    cart_url?: string | null;
    price_source?: string;
    price_observed_at?: string | null;
    price_notice?: string | null;
    data_source?: string | null;
    mall_product_links?: string[];
    direct_cart_supported?: boolean;
    expected_delivery_hours?: number | null;
}

export type PlanTravelMode = "walk" | "transit" | "car";

export interface PlanUserContextRequest {
    lat?: number | null;
    lng?: number | null;
    travel_mode?: PlanTravelMode | null;
    max_travel_minutes?: number | null;
    source?: string | null;
    address?: string | null;
}

export interface EffectivePlanContext {
    lat: number;
    lng: number;
    travel_mode: PlanTravelMode;
    max_travel_minutes: number;
    source: string;
    address?: string | null;
}

export interface PlanGenerationMeta {
    request_id: string;
    generated_at: string;
    degraded_providers: string[];
    effective_context: EffectivePlanContext;
    weather_note?: string | null;
}

export interface PlanListResponse {
    top3: PlanResponse[];
    headline: string;
    last_updated: string;
    alternatives: PlanResponse[];
    meta?: PlanGenerationMeta | null;
}

export interface OfflinePlanSelectResponse {
    status: string;
    store_name: string;
    store_address: string;
    navigation_url: string;
    selected_at: string;
}

export interface OnlinePlanSelectResponse {
    status: string;
    mall_name: string;
    cart_redirect_url: string;
    selected_at: string;
    direct_cart_supported: boolean;
}

export interface DiffItemResponse {
    action: string;
    item: BasketItemResponse;
    reason: string;
}

export interface ChatMessageResponse {
    role: "assistant" | "user";
    content: string;
    diff?: DiffItemResponse[] | null;
    suggestions: string[];
}

export interface AddressEntry {
    id: string;
    label: string;
    roadAddress: string;
    detailAddress: string;
    isDefault: boolean;
}

export interface UserProfileResponse {
    name: string;
    email: string;
    phone: string;
    addresses: AddressEntry[];
}

export interface OrdersResponse {
    orders: Record<string, unknown>[];
}

export const BasketAPI = {
    async getBasket(): Promise<BasketResponse> {
        return requestJson<BasketResponse>("/basket", { method: "GET" }, true);
    },

    async addToBasket(
        item_name: string,
        quantity: number = 1,
        size?: string,
        brand?: string
    ): Promise<BasketResponse> {
        return requestJson<BasketResponse>(
            "/basket/items",
            {
                method: "POST",
                body: JSON.stringify({
                    item_name,
                    quantity,
                    size,
                    brand,
                    mode: brand ? "fixed" : "recommend",
                }),
            },
            true
        );
    },

    async updateBasketItemQuantity(item_name: string, quantity: number): Promise<BasketResponse> {
        return requestJson<BasketResponse>(
            `/basket/items/${encodeURIComponent(item_name)}`,
            {
                method: "PATCH",
                body: JSON.stringify({ item_name, quantity, mode: "recommend" }),
            },
            true
        );
    },

    async removeFromBasket(item_name: string): Promise<BasketResponse> {
        return requestJson<BasketResponse>(
            `/basket/items/${encodeURIComponent(item_name)}`,
            { method: "DELETE" },
            true
        );
    },

    async clearBasket(): Promise<BasketResponse> {
        return requestJson<BasketResponse>("/basket", { method: "DELETE" }, true);
    },
};

export interface BrandPreferenceResponse {
    user_id: string;
    type: string;
    brands: string[];
}

export const PreferencesAPI = {
    async getBrands(type: "like" | "dislike" = "like"): Promise<BrandPreferenceResponse> {
        return requestJson<BrandPreferenceResponse>(
            `/preferences/brands?type=${type}`,
            { method: "GET" },
            true
        );
    },

    async addBrand(brand: string, type: "like" | "dislike" = "like"): Promise<BrandPreferenceResponse> {
        return requestJson<BrandPreferenceResponse>(
            "/preferences/brands",
            {
                method: "POST",
                body: JSON.stringify({ brand, type }),
            },
            true
        );
    },

    async removeBrand(brand: string, type: "like" | "dislike" = "like"): Promise<BrandPreferenceResponse> {
        return requestJson<BrandPreferenceResponse>(
            `/preferences/brands/${encodeURIComponent(brand)}?type=${type}`,
            { method: "DELETE" },
            true
        );
    },

    async clearBrands(type: "like" | "dislike" = "like"): Promise<BrandPreferenceResponse> {
        return requestJson<BrandPreferenceResponse>(
            `/preferences/brands?type=${type}`,
            { method: "DELETE" },
            true
        );
    },
};

export const PlansAPI = {
    async generatePlans(
        items: { item_name: string; quantity: number; size?: string; brand?: string | null }[],
        mode?: "ONLINE" | "OFFLINE" | null,
        userContext?: PlanUserContextRequest | null
    ): Promise<PlanListResponse> {
        const normalizedMode = mode === "OFFLINE" ? "offline" : "online";
        const endpoint = normalizedMode === "offline" ? "/offline/plans/generate" : "/online/plans/generate";
        return requestJson<PlanListResponse>(
            endpoint,
            {
                method: "POST",
                body: JSON.stringify({
                    items,
                    user_context: userContext ?? undefined,
                }),
            },
            true
        );
    },

    async generatePlansCompat(
        items: { item_name: string; quantity: number; size?: string; brand?: string | null }[],
        mode?: "ONLINE" | "OFFLINE" | null,
        userContext?: PlanUserContextRequest | null
    ): Promise<PlanListResponse> {
        const query = mode ? `?mode=${mode.toLowerCase()}` : "";
        return requestJson<PlanListResponse>(
            `/plans/generate${query}`,
            {
                method: "POST",
                body: JSON.stringify({
                    items,
                    user_context: userContext ?? undefined,
                }),
            },
            true
        );
    },

    async selectOfflinePlan(
        requestId: string,
        selectedPlanType: PlanResponse["plan_type"],
        storeId?: string
    ): Promise<OfflinePlanSelectResponse> {
        return requestJson<OfflinePlanSelectResponse>(
            "/offline/plans/select",
            {
                method: "POST",
                body: JSON.stringify({
                    request_id: requestId,
                    selected_plan_type: selectedPlanType,
                    store_id: storeId,
                }),
            },
            true
        );
    },

    async selectOnlinePlan(params: {
        requestId: string;
        selectedPlanType: PlanResponse["plan_type"];
        mallName: string;
        cartRedirectUrl?: string;
    }): Promise<OnlinePlanSelectResponse> {
        return requestJson<OnlinePlanSelectResponse>(
            "/online/plans/select",
            {
                method: "POST",
                body: JSON.stringify({
                    request_id: params.requestId,
                    selected_plan_type: params.selectedPlanType,
                    mall_name: params.mallName,
                    cart_redirect_url: params.cartRedirectUrl,
                }),
            },
            true
        );
    },
};

export interface CreatePaymentIntentRequest {
    request_id?: string;
    amount_won: number;
    currency?: string;
    mall_name: string;
    plan_type?: string;
    budget_cap_won?: number;
    allowed_malls?: string[];
}

export interface PaymentIntentResponse {
    intent_id: string;
    request_id?: string | null;
    amount_won: number;
    currency: string;
    mall_name: string;
    plan_type?: string | null;
    status: "requires_confirmation" | "succeeded" | "failed" | "canceled";
    client_secret: string;
    created_at: string;
    updated_at: string;
    confirmed_at?: string | null;
}

export interface ConfirmPaymentIntentRequest {
    payment_method_token?: string;
    simulate_result?: "success" | "fail";
}

export const PaymentsAPI = {
    async createIntent(
        payload: CreatePaymentIntentRequest,
        idempotencyKey?: string
    ): Promise<PaymentIntentResponse> {
        return requestJson<PaymentIntentResponse>(
            "/payments/intents",
            {
                method: "POST",
                headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
                body: JSON.stringify(payload),
            },
            true
        );
    },

    async getIntent(intentId: string): Promise<PaymentIntentResponse> {
        return requestJson<PaymentIntentResponse>(
            `/payments/intents/${encodeURIComponent(intentId)}`,
            { method: "GET" },
            true
        );
    },

    async confirmIntent(
        intentId: string,
        payload: ConfirmPaymentIntentRequest = { simulate_result: "success" }
    ): Promise<PaymentIntentResponse> {
        return requestJson<PaymentIntentResponse>(
            `/payments/intents/${encodeURIComponent(intentId)}/confirm`,
            {
                method: "POST",
                body: JSON.stringify({
                    payment_method_token: payload.payment_method_token,
                    simulate_result: payload.simulate_result ?? "success",
                }),
            },
            true
        );
    },
};

export type ReservationWeekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface ReservationEntryResponse {
    id: string;
    label: string;
    weekday: ReservationWeekday;
    time: string;
    enabled: boolean;
    status: string;
    schedule_type: "one_time" | "weekly";
    next_run_at?: string | null;
    timezone: string;
    channel: "push" | "in_app";
    source_order_id?: string | null;
    source_mart_name?: string | null;
    planned_items?: string[] | null;
    created_at: string;
    last_run_at?: string | null;
    last_result_status?: string | null;
    retry_count: number;
}

export interface CreateReservationRequest {
    label: string;
    weekday: ReservationWeekday;
    time: string;
    enabled?: boolean;
    schedule_type?: "one_time" | "weekly";
    next_run_at?: string | null;
    timezone?: string;
    channel?: "push" | "in_app";
    source_order_id?: string | null;
    source_mart_name?: string | null;
    planned_items?: string[] | null;
}

export interface UpdateReservationRequest {
    label?: string;
    weekday?: ReservationWeekday;
    time?: string;
    enabled?: boolean;
    status?: string;
    schedule_type?: "one_time" | "weekly";
    next_run_at?: string | null;
    timezone?: string;
    channel?: "push" | "in_app";
    planned_items?: string[] | null;
    last_run_at?: string | null;
    last_result_status?: string | null;
    retry_count?: number;
}

export interface ReservationListResponse {
    user_id: string;
    reservations: ReservationEntryResponse[];
}

export const ReservationsAPI = {
    async listReservations(): Promise<ReservationListResponse> {
        return requestJson<ReservationListResponse>("/reservations", { method: "GET" }, true);
    },

    async createReservation(payload: CreateReservationRequest): Promise<ReservationEntryResponse> {
        return requestJson<ReservationEntryResponse>(
            "/reservations",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
            true
        );
    },

    async updateReservation(
        reservationId: string,
        payload: UpdateReservationRequest
    ): Promise<ReservationEntryResponse> {
        return requestJson<ReservationEntryResponse>(
            `/reservations/${encodeURIComponent(reservationId)}`,
            {
                method: "PATCH",
                body: JSON.stringify(payload),
            },
            true
        );
    },

    async deleteReservation(reservationId: string): Promise<ReservationListResponse> {
        return requestJson<ReservationListResponse>(
            `/reservations/${encodeURIComponent(reservationId)}`,
            { method: "DELETE" },
            true
        );
    },
};

export const UserDataAPI = {
    async getProfile(): Promise<UserProfileResponse> {
        return requestJson<UserProfileResponse>("/users/me/profile", { method: "GET" }, true);
    },

    async updateProfile(payload: UserProfileResponse): Promise<UserProfileResponse> {
        return requestJson<UserProfileResponse>(
            "/users/me/profile",
            {
                method: "PUT",
                body: JSON.stringify(payload),
            },
            true
        );
    },

    async getOrders(): Promise<OrdersResponse> {
        return requestJson<OrdersResponse>("/users/me/orders", { method: "GET" }, true);
    },

    async createOrder(payload: Record<string, unknown>): Promise<{ order: Record<string, unknown> }> {
        return requestJson<{ order: Record<string, unknown> }>(
            "/users/me/orders",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
            true
        );
    },
};

export const ChatAPI = {
    async getGreeting(): Promise<ChatMessageResponse> {
        return requestJson<ChatMessageResponse>("/chat/greeting", { method: "GET" }, true);
    },

    async sendMessage(message: string): Promise<ChatMessageResponse> {
        return requestJson<ChatMessageResponse>(
            "/chat/message",
            {
                method: "POST",
                body: JSON.stringify({ message }),
            },
            true
        );
    },

    async clearHistory(): Promise<{ status: string; message: string }> {
        return requestJson<{ status: string; message: string }>(
            "/chat/clear",
            { method: "POST" },
            true
        );
    },
};
