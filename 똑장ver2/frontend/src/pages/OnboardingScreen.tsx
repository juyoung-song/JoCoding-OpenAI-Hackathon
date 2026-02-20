import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowUp, MapPin, Bus, Globe, Heart, Ban } from "lucide-react";
import { useApp } from "../app/store/AppContext";
import { PreferencesAPI, type PlanTravelMode } from "../api";
import { getLastLoginEmail, markOnboardingCompleted } from "../app/onboardingState";
import ddokjangLogo from "../assets/ddokjang-logo.png";

function AiMessageBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.35 }}
      className="flex gap-3 items-start w-full mb-6"
    >
      <div className="bg-brand-50 flex items-center justify-center rounded-full shrink-0 size-9 border border-brand-100 overflow-hidden">
        <img src={ddokjangLogo} alt="똑장 로고" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className="text-gray-500 text-xs ml-1">똑장이</div>
        <div className="bg-white border border-gray-100 rounded-tl-none rounded-[20px] p-4 shadow-sm text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function UserMessageBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-end justify-end w-full mb-6"
    >
      <div className="bg-brand-500 text-white rounded-tr-none rounded-[20px] p-3.5 max-w-[85%] shadow-md text-[15px] leading-relaxed whitespace-pre-wrap">
        {children}
      </div>
    </motion.div>
  );
}

function SuggestionChip({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 flex gap-2 items-center px-4 py-2.5 rounded-full hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 active:scale-95 transition-all shadow-sm shrink-0"
    >
      {icon}
      <span className="text-gray-700 text-sm font-medium">{label}</span>
    </button>
  );
}

type Message = {
  id: string;
  sender: "AI" | "USER";
  text: string | ReactNode;
};

type Step =
  | "LOCATION"
  | "TRANSPORT"
  | "ONLINE_PREF"
  | "BRAND_PREF"
  | "DISLIKE_PREF"
  | "DONE";

const NO_PREFERENCE_INPUTS = ["없음", "없어요", "없다", "상관없음", "괜찮아요", "패스"];

const isNoPreference = (value: string) => {
  const normalized = value.replace(/\s/g, "").toLowerCase();
  return NO_PREFERENCE_INPUTS.some((token) => normalized.includes(token.replace(/\s/g, "").toLowerCase()));
};

const splitBrands = (value: string) =>
  value
    .split(/[,\n/]/)
    .map((item) => item.trim())
    .filter(Boolean);

const LOCATION_PRESETS: Array<{ keywords: string[]; lat: number; lng: number }> = [
  { keywords: ["강남", "역삼", "테헤란"], lat: 37.4985, lng: 127.0292 },
  { keywords: ["송파", "잠실"], lat: 37.5133, lng: 127.1028 },
  { keywords: ["마포", "홍대"], lat: 37.5563, lng: 126.9220 },
  { keywords: ["분당", "판교"], lat: 37.3947, lng: 127.1112 },
];

const MAX_TRAVEL_MINUTES_BY_MODE: Record<PlanTravelMode, number> = {
  walk: 30,
  transit: 45,
  car: 35,
};

const normalizeToken = (value: string) => value.replace(/\s/g, "").toLowerCase();

const parseTravelMode = (input: string): PlanTravelMode => {
  const normalized = normalizeToken(input);
  if (normalized.includes("대중") || normalized.includes("버스") || normalized.includes("지하철")) {
    return "transit";
  }
  if (normalized.includes("자차") || normalized.includes("자동차") || normalized.includes("차")) {
    return "car";
  }
  return "walk";
};

const getCurrentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 300000,
    });
  });

const resolveLocationContext = async (input: string) => {
  const normalized = normalizeToken(input);
  if (normalized.includes("현재위치")) {
    try {
      const position = await getCurrentPosition();
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        source: "gps",
        address: "현재 위치",
      };
    } catch {
      return {
        source: "gps_failed",
        address: input,
      };
    }
  }

  const matchedPreset = LOCATION_PRESETS.find((preset) =>
    preset.keywords.some((keyword) => normalized.includes(normalizeToken(keyword)))
  );
  if (matchedPreset) {
    return {
      lat: matchedPreset.lat,
      lng: matchedPreset.lng,
      source: "preset",
      address: input,
    };
  }

  return {
    source: "manual",
    address: input,
  };
};

export default function OnboardingScreen() {
  const { setCurrentScreen, updatePlanUserContext, userProfile } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "AI",
      text: (
        <>
          안녕하세요! 👋
          <br />
          최적의 장보기를 도와드리기 위해 <strong>기본 설정</strong>을 진행할게요.
        </>
      ),
    },
    { id: "2", sender: "AI", text: "먼저, 현재 거주하시는 지역을 알려주세요." },
  ]);
  const [inputText, setInputText] = useState("");
  const [step, setStep] = useState<Step>("LOCATION");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addAiMessage = (content: ReactNode, delay = 450) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-ai`, sender: "AI", text: content },
      ]);
    }, delay);
  };

  const saveBrandPreference = async (rawInput: string, type: "like" | "dislike") => {
    if (!rawInput.trim() || isNoPreference(rawInput)) return;
    const brands = splitBrands(rawInput);
    for (const brand of brands) {
      try {
        await PreferencesAPI.addBrand(brand, type);
      } catch (error) {
        console.error(`Failed to save ${type} brand`, error);
      }
    }
  };

  const finishOnboarding = () => {
    const markerEmail = (userProfile.email || getLastLoginEmail()).trim().toLowerCase();
    markOnboardingCompleted(markerEmail);
    addAiMessage("모든 설정이 완료되었습니다! 똑장 홈으로 이동할게요. 🚀");
    setStep("DONE");
    setTimeout(() => {
      setCurrentScreen("HOME");
    }, 1400);
  };

  const handleSendMessage = async (forcedText?: string) => {
    const outgoingText = (forcedText ?? inputText).trim();
    if (!outgoingText) return;

    setMessages((prev) => [...prev, { id: `${Date.now()}`, sender: "USER", text: outgoingText }]);
    setInputText("");

    if (step === "LOCATION") {
      const locationContext = await resolveLocationContext(outgoingText);
      updatePlanUserContext({
        lat: locationContext.lat ?? null,
        lng: locationContext.lng ?? null,
        source: locationContext.source,
        address: locationContext.address ?? outgoingText,
      });
      addAiMessage(
        <>
          네, <strong>{outgoingText}</strong>(으)로 설정했어요.
          <br />
          장보러 가실 때 주로 어떤 교통수단을 이용하시나요? 🚌
        </>
      );
      setStep("TRANSPORT");
      return;
    }

    if (step === "TRANSPORT") {
      const travelMode = parseTravelMode(outgoingText);
      updatePlanUserContext({
        travel_mode: travelMode,
        max_travel_minutes: MAX_TRAVEL_MINUTES_BY_MODE[travelMode],
        source: "onboarding",
      });
      addAiMessage(
        <>
          알겠습니다!
          <br />
          다음으로, <strong>온라인 장보기</strong>를 할 때 주로 이용하는 곳이 있나요?
        </>
      );
      setStep("ONLINE_PREF");
      return;
    }

    if (step === "ONLINE_PREF") {
      addAiMessage(
        <>
          확인했어요.
          <br />
          <strong>선호하는 식품 브랜드</strong>가 있다면 알려주세요.
        </>
      );
      setStep("BRAND_PREF");
      return;
    }

    if (step === "BRAND_PREF") {
      await saveBrandPreference(outgoingText, "like");
      addAiMessage(
        <>
          좋아요! 이제 <strong>비선호 브랜드</strong>가 있다면 알려주세요.
          <br />
          (없으면 "없음"이라고 입력하세요)
        </>
      );
      setStep("DISLIKE_PREF");
      return;
    }

    if (step === "DISLIKE_PREF") {
      await saveBrandPreference(outgoingText, "dislike");
      finishOnboarding();
    }
  };

  const getProgress = () => {
    switch (step) {
      case "LOCATION":
        return 20;
      case "TRANSPORT":
        return 40;
      case "ONLINE_PREF":
        return 60;
      case "BRAND_PREF":
        return 80;
      case "DISLIKE_PREF":
        return 90;
      case "DONE":
        return 100;
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-gray-50">
      <div className="bg-white/80 backdrop-blur border-b border-gray-200 p-4 pt-6 flex justify-between items-center shrink-0 z-10 sticky top-0">
        <div className="w-10" />
        <h1 className="text-base font-bold text-gray-900">맞춤 설정</h1>
        <button
          onClick={() => {
            const markerEmail = (userProfile.email || getLastLoginEmail()).trim().toLowerCase();
            markOnboardingCompleted(markerEmail);
            setCurrentScreen("HOME");
          }}
          className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
        >
          건너뛰기
        </button>
      </div>

      <div className="bg-white px-6 py-3 border-b border-gray-100 shadow-sm sticky top-[65px] z-10">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-brand-600 font-bold text-xs">설정 진행률</span>
          <span className="text-gray-400 text-xs font-medium">{getProgress()}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-500 ease-out"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-2">
        <div className="flex justify-center my-4 opacity-50">
          <span className="bg-gray-200 text-gray-500 text-[10px] px-3 py-1 rounded-full">오늘</span>
        </div>

        {messages.map((message) =>
          message.sender === "AI" ? (
            <AiMessageBubble key={message.id}>{message.text}</AiMessageBubble>
          ) : (
            <UserMessageBubble key={message.id}>{message.text}</UserMessageBubble>
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {step === "LOCATION" ? (
            <>
              <SuggestionChip
                label="서울 강남구"
                icon={<MapPin size={14} />}
                onClick={() => {
                  void handleSendMessage("서울 강남구");
                }}
              />
              <SuggestionChip
                label="현재 위치 찾기"
                icon={<MapPin size={14} />}
                onClick={() => {
                  void handleSendMessage("현재 위치");
                }}
              />
            </>
          ) : null}

          {step === "TRANSPORT" ? (
            <>
              <SuggestionChip label="도보" icon={<MapPin size={14} />} onClick={() => void handleSendMessage("도보")} />
              <SuggestionChip label="대중교통" icon={<Bus size={14} />} onClick={() => void handleSendMessage("대중교통")} />
              <SuggestionChip label="자차" icon={<Bus size={14} />} onClick={() => void handleSendMessage("자차")} />
            </>
          ) : null}

          {step === "ONLINE_PREF" ? (
            <>
              <SuggestionChip label="쿠팡" icon={<Globe size={14} />} onClick={() => void handleSendMessage("쿠팡")} />
              <SuggestionChip label="마켓컬리" icon={<Globe size={14} />} onClick={() => void handleSendMessage("마켓컬리")} />
              <SuggestionChip label="이마트몰" icon={<Globe size={14} />} onClick={() => void handleSendMessage("이마트몰")} />
              <SuggestionChip label="상관없음" onClick={() => void handleSendMessage("상관없음")} />
            </>
          ) : null}

          {step === "BRAND_PREF" ? (
            <>
              <SuggestionChip label="CJ제일제당" icon={<Heart size={14} />} onClick={() => void handleSendMessage("CJ제일제당")} />
              <SuggestionChip label="풀무원" icon={<Heart size={14} />} onClick={() => void handleSendMessage("풀무원")} />
              <SuggestionChip label="서울우유" icon={<Heart size={14} />} onClick={() => void handleSendMessage("서울우유")} />
              <SuggestionChip label="없음" onClick={() => void handleSendMessage("없음")} />
            </>
          ) : null}

          {step === "DISLIKE_PREF" ? (
            <>
              <SuggestionChip label="오뚜기" icon={<Ban size={14} />} onClick={() => void handleSendMessage("오뚜기")} />
              <SuggestionChip label="특정 브랜드 없음" icon={<Ban size={14} />} onClick={() => void handleSendMessage("없음")} />
            </>
          ) : null}
        </div>

        <div className="flex gap-2 items-center bg-gray-100 rounded-[20px] px-4 py-2 border border-transparent focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm py-2"
            placeholder={
              step === "LOCATION"
                ? "지역을 입력해주세요"
                : step === "BRAND_PREF"
                ? "선호 브랜드를 입력하세요"
                : step === "DISLIKE_PREF"
                ? "비선호 브랜드를 입력하세요"
                : "메시지를 입력하세요..."
            }
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSendMessage();
              }
            }}
            disabled={step === "DONE"}
          />
          <button
            onClick={() => {
              void handleSendMessage();
            }}
            disabled={!inputText.trim() || step === "DONE"}
            className={`p-2 rounded-full transition-all ${
              inputText.trim()
                ? "bg-brand-500 text-white shadow-md hover:bg-brand-600"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
