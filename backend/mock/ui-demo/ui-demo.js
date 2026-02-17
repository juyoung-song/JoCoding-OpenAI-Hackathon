const setupScreen = document.getElementById("setup-screen");
const loadingScreen = document.getElementById("loading-screen");
const resultScreen = document.getElementById("result-screen");
const detailScreen = document.getElementById("detail-screen");
const plansList = document.getElementById("plans-list");
const degradedBanner = document.getElementById("degraded-banner");
const confirmBtn = document.getElementById("confirm-btn");
const confirmResult = document.getElementById("confirm-result");
const candidateSelector = document.getElementById("candidate-selector");
const candidateList = document.getElementById("candidate-list");
const candidateApply = document.getElementById("candidate-apply");
const candidateCancel = document.getElementById("candidate-cancel");
const candidateClose = document.getElementById("candidate-close");
const resetAppBtn = document.getElementById("reset-app");
const restartFromResultBtn = document.getElementById("restart-from-result");

const state = {
  requestId: null,
  plans: [],
  selectedPlan: null,
  useGpsCoordinates: false,
  pendingBasketItems: null,
  pendingMatchRows: null,
};

function show(screen) {
  for (const section of [setupScreen, loadingScreen, resultScreen, detailScreen]) {
    section.classList.add("hidden");
  }
  screen.classList.remove("hidden");
}

function parseBasket(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseBasketLine);
}

function parsePositiveInt(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d+)/);
  const n = Number(match ? match[1] : raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

function extractSizeAndQuantity(raw) {
  let text = String(raw || "").trim();
  let quantity = null;
  let size = null;

  const quantityMatch = text.match(/(?:\s|^)(\d+)\s*(개|봉|팩|통|병|캔|묶음|줄|판|ea)?$/i);
  if (quantityMatch) {
    quantity = parsePositiveInt(quantityMatch[1]);
    text = text.slice(0, quantityMatch.index).trim();
  }

  const sizeMatch = text.match(/(?:\s|^)(\d+(?:\.\d+)?)\s*(kg|g|mg|ml|l|리터|밀리리터|그램|구)$/i);
  if (sizeMatch) {
    size = `${sizeMatch[1]}${sizeMatch[2]}`;
    text = text.slice(0, sizeMatch.index).trim();
  }

  return { itemName: text, quantity, size };
}

function parseBasketLine(line) {
  const parts = String(line || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  const itemPart = parts[0] || "";
  const extracted = extractSizeAndQuantity(itemPart);
  const item_name = (extracted.itemName || itemPart).trim();

  const parsedQty = parsePositiveInt(parts[1]);
  const quantity = parsedQty || extracted.quantity || 1;
  const size = (parts[2] || extracted.size || "").trim();

  if (size) {
    return { item_name, quantity, size };
  }
  return { item_name, quantity };
}

function formatBasketLine(item) {
  const base = `${item.item_name},${item.quantity || 1}`;
  return item.size ? `${base},${item.size}` : base;
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function relativeTime(iso) {
  if (!iso) return "-";
  const diffMin = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (diffMin < 60) return `${diffMin}분 전`;
  const h = Math.round(diffMin / 60);
  return `${h}시간 전`;
}

function coverageText(plan) {
  const matched = Array.isArray(plan.matched_items) ? plan.matched_items.length : 0;
  const total = matched + (Array.isArray(plan.missing_items) ? plan.missing_items.length : 0);
  return `${matched}/${total || matched} 발견`;
}

function planLabel(planType) {
  if (planType === "lowest") return "#1 최저가 추천";
  if (planType === "nearest") return "#2 최단 시간";
  return "#3 균형 추천";
}

function tagStyle(tag) {
  if (tag === "최저가") return "bg-green-100 text-green-700";
  if (tag === "가성비") return "bg-yellow-100 text-yellow-700";
  if (tag === "AI추천") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

function renderPlans() {
  plansList.innerHTML = "";
  state.plans.forEach((plan) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl border border-slate-200 shadow-sm p-4";
    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div>
          <div class="text-xs font-bold text-primary">${planLabel(plan.plan_type)}</div>
          <h3 class="text-lg font-bold mt-1">${plan.store_name}</h3>
          <p class="text-xs text-slate-500 mt-0.5">${plan.store_address}</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-primary">${formatCurrency(plan.total_price_won)}</p>
          <p class="text-xs text-slate-500 mt-1">이동 ${plan.travel_minutes}분 · ${plan.distance_km}km</p>
        </div>
      </div>
      <div class="flex items-center justify-between text-xs mb-2">
        <span class="font-medium">커버리지</span>
        <span class="font-bold text-primary">${coverageText(plan)}</span>
      </div>
      <div class="w-full h-2 rounded-full bg-slate-100 mb-3">
        <div class="h-full rounded-full bg-primary" style="width:${Math.round((plan.coverage_ratio || 0) * 100)}%"></div>
      </div>
      <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-slate-700">
        <div class="font-bold mb-1">왜 이 추천이 좋은가요?</div>
        <div>${plan.recommendation_reason || "-"}</div>
        <div class="mt-2 pt-2 border-t border-blue-100 text-slate-600">
          <span class="font-semibold">날씨:</span> ${plan.weather_note || "정보 없음"}
        </div>
      </div>
      <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>출처: ${plan.price_source}</span>
        <span>업데이트: ${relativeTime(plan.price_observed_at)}</span>
      </div>
      <button class="detail-btn w-full mt-3 bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-semibold">상세 보기</button>
    `;
    card.querySelector(".detail-btn").addEventListener("click", () => openDetail(plan));
    plansList.appendChild(card);
  });
}

function openDetail(plan) {
  state.selectedPlan = plan;
  show(detailScreen);
  confirmBtn.classList.remove("hidden");
  confirmResult.classList.add("hidden");

  document.getElementById("detail-summary").innerHTML = `
    <div class="flex items-start justify-between">
      <div>
        <div class="inline-flex px-2 py-1 rounded text-xs font-bold bg-primary text-white">${planLabel(plan.plan_type)}</div>
        <h3 class="text-lg font-bold mt-2">${plan.store_name}</h3>
        <p class="text-xs text-slate-500 mt-1">${plan.store_address}</p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold text-primary">${formatCurrency(plan.total_price_won)}</p>
        <p class="text-xs text-slate-500">총 예상 금액</p>
      </div>
    </div>
    <div class="mt-3 text-xs text-slate-600">${plan.weather_note || "-"}</div>
  `;

  const matchedList = document.getElementById("matched-list");
  matchedList.innerHTML = "";
  (plan.matched_items || []).forEach((item) => {
    const row = document.createElement("div");
    row.className = "bg-white border border-slate-200 rounded-xl p-3";
    row.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="font-semibold text-sm">${item.item_name}</div>
          <div class="text-xs text-slate-500 mt-1">${item.brand || "브랜드 없음"} · ${item.size_display || "-"} · 수량 ${item.quantity}</div>
          <div class="text-xs text-slate-400 mt-1">검증: ${item.price_verified_at ? relativeTime(item.price_verified_at) : "-"}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-bold">${formatCurrency(item.subtotal_won)}</div>
          <div class="text-xs text-slate-500">단가 ${formatCurrency(item.unit_price_won)}</div>
          <span class="inline-block mt-1 text-[11px] px-2 py-0.5 rounded ${tagStyle(item.item_tag)}">${item.item_tag || "일반"}</span>
        </div>
      </div>
    `;
    matchedList.appendChild(row);
  });

  const missing = plan.missing_items || [];
  const partialBox = document.getElementById("partial-box");
  const missingList = document.getElementById("missing-list");
  missingList.innerHTML = "";
  if (missing.length > 0) {
    partialBox.classList.remove("hidden");
    missing.forEach((item) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs";
      row.innerHTML = `<span class="font-medium">${item.item_name}</span><span class="text-amber-700">${item.reason}</span>`;
      missingList.appendChild(row);
    });
  } else {
    partialBox.classList.add("hidden");
  }

  const alternativeList = document.getElementById("alternative-list");
  alternativeList.innerHTML = "";
  let alternativeCount = 0;
  missing.forEach((item) => {
    if (!item.alternative) return;
    const alt = item.alternative;
    alternativeCount += 1;
    const row = document.createElement("div");
    row.className = "bg-blue-50 border border-blue-100 rounded-xl p-3";
    row.innerHTML = `
      <div class="text-xs text-slate-500 mb-1">원상품: ${item.item_name}</div>
      <div class="font-semibold text-sm">${alt.item_name}</div>
      <div class="text-xs text-slate-600 mt-1">${alt.brand || "브랜드 없음"} · ${formatCurrency(alt.unit_price_won)}</div>
      <div class="text-xs text-primary mt-1">${alt.tag || "대체 추천"} · ${formatCurrency(alt.saving_won || 0)} 절약</div>
    `;
    alternativeList.appendChild(row);
  });
  if (alternativeCount === 0) {
    const empty = document.createElement("div");
    empty.className = "bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500";
    empty.textContent = "현재 매장 데이터 기준으로 제시할 AI 대체 추천이 없습니다.";
    alternativeList.appendChild(empty);
  }
}

async function generatePlans() {
  const address = document.getElementById("address").value.trim();
  let lat;
  let lng;
  if (state.useGpsCoordinates) {
    lat = Number(document.getElementById("lat").value);
    lng = Number(document.getElementById("lng").value);
  } else {
    const resolved = await resolveAddressToCoordinates(address);
    if (!resolved) {
      alert("주소를 좌표로 변환하지 못했습니다. 주소를 조금 더 구체적으로 입력해주세요.");
      return;
    }
    lat = resolved.lat;
    lng = resolved.lng;
    document.getElementById("lat").value = String(lat);
    document.getElementById("lng").value = String(lng);
    document.getElementById("location-status").textContent = `변환 완료: ${resolved.resolved_address}`;
  }

  const travel_mode = document.getElementById("travel_mode").value;
  const max_travel_minutes = Number(document.getElementById("max_travel").value);
  let basket_items = parseBasket(document.getElementById("basket").value);
  const resolution = await fetchMatchCandidates(basket_items);
  if (!resolution) return;
  if (resolution.unresolved.length > 0) {
    state.pendingBasketItems = basket_items;
    state.pendingMatchRows = resolution.rows;
    openCandidateSelector(resolution.unresolved);
    return;
  }
  basket_items = applyResolvedItems(basket_items, resolution.rows);

  show(loadingScreen);
  confirmBtn.classList.add("hidden");
  confirmResult.classList.add("hidden");

  const payload = { user_context: { lat, lng, travel_mode, max_travel_minutes }, basket_items };
  const res = await fetch("/v1/offline/plans/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    alert(`요청 실패: ${res.status}\n${JSON.stringify(data)}`);
    show(setupScreen);
    return;
  }

  state.requestId = data.meta.request_id;
  state.plans = data.plans || [];

  const degraded = data.meta.degraded_providers || [];
  if (degraded.length > 0) {
    degradedBanner.classList.remove("hidden");
    degradedBanner.textContent = `일부 정보가 fallback으로 계산되었습니다: ${degraded.join(", ")}`;
  } else {
    degradedBanner.classList.add("hidden");
  }

  renderPlans();
  show(resultScreen);
}

async function fetchMatchCandidates(items) {
  try {
    const res = await fetch("/v1/offline/utils/match-candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) return { rows: [], unresolved: [] };
    const data = await res.json();
    const rows = data.items || [];
    const unresolved = rows.filter((r) => !r.matched && (r.candidates || []).length > 0);
    return { rows, unresolved };
  } catch {
    return { rows: [], unresolved: [] };
  }
}

function applyResolvedItems(items, rows, selectionByItem = null) {
  const map = new Map(rows.map((r) => [r.item_name, r]));
  return items.map((item) => {
    const row = map.get(item.item_name);
    if (!row || row.matched || !row.candidates || row.candidates.length === 0) return item;
    const index = selectionByItem && selectionByItem[item.item_name] != null ? selectionByItem[item.item_name] : 0;
    const picked = row.candidates[Math.min(index, row.candidates.length - 1)];
    return {
      ...item,
      item_name: picked.normalized_name,
      brand: picked.brand || item.brand,
      size: picked.size_display || item.size,
    };
  });
}

function candidateKey(name) {
  return String(name || "").replace(/[^0-9a-zA-Z가-힣]/g, "_").slice(0, 80);
}

function candidateThumb(name) {
  const labels = ["우유", "계란", "사과", "쌀", "콩", "라면", "두부"];
  const colors = ["#DBEAFE", "#DCFCE7", "#FEF3C7", "#FCE7F3", "#EDE9FE", "#FFE4E6", "#ECFCCB"];
  const idx = Math.abs([...String(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0)) % labels.length;
  return { label: labels[idx], color: colors[idx] };
}

function openCandidateSelector(unresolved) {
  candidateList.innerHTML = "";
  unresolved.forEach((row) => {
    const key = candidateKey(row.item_name);
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl border border-slate-200 bg-white p-3 shadow-sm";

    const options = (row.candidates || [])
      .map((c, idx) => {
        const thumb = candidateThumb(c.normalized_name);
        const scorePct = Math.max(5, Math.min(100, Math.round((c.score || 0) * 100)));
        return `
          <label class="flex items-start gap-2 rounded-lg border ${idx === 0 ? "border-primary/40 bg-blue-50/40" : "border-slate-200"} px-2 py-2 text-xs cursor-pointer hover:border-primary/40">
            <input type="radio" class="mt-1" name="cand-${key}" value="${idx}" ${idx === 0 ? "checked" : ""} />
            <div class="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-700" style="background:${thumb.color}">${thumb.label}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="font-semibold text-slate-800">${c.normalized_name}</span>
                ${idx === 0 ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white">추천</span>' : ""}
              </div>
              <div class="text-slate-500 mt-0.5">${c.brand || "무브랜드"} ${c.size_display || ""}</div>
              <div class="mt-1.5">
                <div class="w-full h-1.5 rounded-full bg-slate-100"><div class="h-full rounded-full bg-primary" style="width:${scorePct}%"></div></div>
                <div class="text-[10px] text-slate-400 mt-0.5">매칭 점수 ${(c.score || 0).toFixed(2)}</div>
              </div>
            </div>
          </label>
        `;
      })
      .join("");

    wrap.innerHTML = `
      <div class="text-xs font-bold mb-2 flex items-center gap-1"><span class="material-icons-round text-amber-500 text-sm">priority_high</span>${row.item_name}</div>
      <div class="space-y-1.5">${options}</div>
    `;
    candidateList.appendChild(wrap);
  });
  candidateSelector.classList.remove("hidden");
}

function closeCandidateSelector() {
  candidateSelector.classList.add("hidden");
  candidateList.innerHTML = "";
}

async function resolveAddressToCoordinates(address) {
  if (!address) return null;
  try {
    const res = await fetch(`/v1/offline/utils/geocode?query=${encodeURIComponent(address)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function useCurrentLocation() {
  const status = document.getElementById("location-status");
  if (!navigator.geolocation) {
    status.textContent = "이 브라우저는 위치 정보를 지원하지 않습니다.";
    return;
  }
  status.textContent = "현재 위치를 가져오는 중...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      document.getElementById("lat").value = String(latitude);
      document.getElementById("lng").value = String(longitude);
      document.getElementById("address").value = `현재 위치 (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      state.useGpsCoordinates = true;
      status.textContent = "현재 위치를 적용했습니다.";
    },
    () => {
      status.textContent = "현재 위치를 가져오지 못했습니다. 주소를 직접 입력해주세요.";
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

async function selectPlan() {
  if (!state.selectedPlan || !state.requestId) return;
  const payload = {
    request_id: state.requestId,
    selected_plan_type: state.selectedPlan.plan_type,
    store_id: state.selectedPlan.store_id,
  };
  const res = await fetch("/v1/offline/plans/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  confirmResult.classList.remove("hidden");
  if (!res.ok) {
    confirmResult.textContent = `선택 실패: ${res.status}`;
    return;
  }
  confirmResult.innerHTML = `
    <div class="space-y-2">
      <p class="text-emerald-700 font-semibold">선택 완료: ${data.store_name}</p>
      <div class="grid grid-cols-1 gap-2">
        <a href="${data.navigation_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-lg bg-primary text-white py-2 font-semibold">네이버 길찾기 열기</a>
        <button id="restart-after-select" type="button" class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white py-2 font-semibold text-slate-700">처음 화면으로 돌아가기</button>
      </div>
    </div>
  `;
  const restartBtn = document.getElementById("restart-after-select");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      resetToSetup();
    });
  }
}

function resetToSetup() {
  state.requestId = null;
  state.plans = [];
  state.selectedPlan = null;
  state.pendingBasketItems = null;
  state.pendingMatchRows = null;
  state.useGpsCoordinates = false;
  degradedBanner.classList.add("hidden");
  plansList.innerHTML = "";
  confirmBtn.classList.add("hidden");
  confirmResult.classList.add("hidden");
  confirmResult.innerHTML = "";
  closeCandidateSelector();
  document.getElementById("location-status").textContent = "입력한 주소를 좌표로 변환해 사용합니다.";
  show(setupScreen);
}

document.getElementById("start-btn").addEventListener("click", generatePlans);
document.getElementById("address").addEventListener("input", () => {
  state.useGpsCoordinates = false;
});
document.getElementById("use-current-location").addEventListener("click", useCurrentLocation);
document.getElementById("back-to-results").addEventListener("click", () => {
  show(resultScreen);
  confirmBtn.classList.add("hidden");
  confirmResult.classList.add("hidden");
});
confirmBtn.addEventListener("click", selectPlan);

candidateApply.addEventListener("click", async () => {
  if (!state.pendingBasketItems || !state.pendingMatchRows) return;
  const selectionByItem = {};
  const unresolved = state.pendingMatchRows.filter((r) => !r.matched && (r.candidates || []).length > 0);
  unresolved.forEach((row) => {
    const key = candidateKey(row.item_name);
    const selected = document.querySelector(`input[name="cand-${key}"]:checked`);
    selectionByItem[row.item_name] = selected ? Number(selected.value) : 0;
  });

  const nextItems = applyResolvedItems(state.pendingBasketItems, state.pendingMatchRows, selectionByItem);
  document.getElementById("basket").value = nextItems.map(formatBasketLine).join("\n");
  state.pendingBasketItems = null;
  state.pendingMatchRows = null;
  closeCandidateSelector();
  await generatePlans();
});
candidateCancel.addEventListener("click", () => {
  closeCandidateSelector();
});
candidateClose.addEventListener("click", () => {
  closeCandidateSelector();
});
resetAppBtn.addEventListener("click", resetToSetup);
restartFromResultBtn.addEventListener("click", resetToSetup);
