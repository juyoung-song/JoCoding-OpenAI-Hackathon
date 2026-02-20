import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useApp } from "../../app/store/AppContext";
import { ChatAPI, DiffItemResponse } from "../../api";
import ddokjangLogo from "../../assets/ddokjang-logo.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_STORAGE_KEY = "ddokjang.chat.history.v2";
const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content: "안녕하세요! 장바구니에 담고 싶은 품목을 말씀해주시면 바로 반영해드릴게요.",
  },
];

const loadStoredMessages = (storageKey: string): Message[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return INITIAL_MESSAGES;
    const parsed = JSON.parse(raw) as Message[];
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_MESSAGES;
    return parsed.filter((item) => item && typeof item.content === "string" && (item.role === "user" || item.role === "assistant"));
  } catch {
    return INITIAL_MESSAGES;
  }
};

const buildChatStorageKey = (email: string | undefined): string | null => {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) return null;
  return `${CHAT_STORAGE_KEY}:${normalized}`;
};

const buildDiffSummary = (diff: DiffItemResponse[] | null | undefined): string => {
  if (!diff || diff.length === 0) return "";
  const pieces = diff.slice(0, 3).map((entry) => {
    const action = entry.action === "remove" ? "삭제" : "추가";
    const quantity = entry.item.quantity ?? 1;
    return `${entry.item.item_name} ${quantity}개 ${action}`;
  });
  const suffix = diff.length > 3 ? ` 외 ${diff.length - 3}건` : "";
  return `장바구니 반영: ${pieces.join(", ")}${suffix}`;
};

export default function AiChatFullScreen() {
  const { setIsChatOpen, pendingChatMessage, setPendingChatMessage, refreshBasket, userProfile } = useApp();
  const chatStorageKey = useMemo(() => buildChatStorageKey(userProfile.email), [userProfile.email]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!chatStorageKey) {
      setMessages(INITIAL_MESSAGES);
      return;
    }
    setMessages(loadStoredMessages(chatStorageKey));
  }, [chatStorageKey]);

  useEffect(() => {
    if (!chatStorageKey) return;
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    } catch {
      // localStorage 사용 불가 환경이면 무시
    }
  }, [messages, chatStorageKey]);

  useEffect(() => {
    if (!pendingChatMessage) return;
    void handleSend(pendingChatMessage);
    setPendingChatMessage("");
  }, [pendingChatMessage, setPendingChatMessage]);

  const handleSend = async (messageText: string = chatInput) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await ChatAPI.sendMessage(messageText);
      const diffSummary = buildDiffSummary(response.diff);
      const content = diffSummary ? `${response.content}\n\n${diffSummary}` : response.content;
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "죄송합니다. 요청을 처리하지 못했어요. 다시 시도해주세요." },
      ]);
    } finally {
      await refreshBasket();
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-brand-50 p-1.5 rounded-xl border border-brand-100">
            <img src={ddokjangLogo} alt="똑장 로고" className="w-8 h-8 object-cover rounded-lg" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">똑장 AI</h1>
            <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide">Smart Agent</p>
          </div>
        </div>
        <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
            <path stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" d="M5 15L15 5M5 5L15 15" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 scrollbar-hide">
        <div className="flex flex-col gap-6">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex gap-3 items-start ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              {message.role === "assistant" ? (
                <div className="bg-brand-500 p-1.5 rounded-full shrink-0 shadow-lg shadow-green-200">
                  <img src={ddokjangLogo} alt="AI" className="w-6 h-6 rounded-full object-cover" />
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5 max-w-[80%]">
                <div
                  className={`p-4 shadow-sm border ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm border-blue-600"
                      : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border-gray-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "assistant" ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 px-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <span>AI 분석 완료</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {isLoading ? (
            <div className="flex gap-3 items-start">
              <div className="bg-brand-500 p-2.5 rounded-full shrink-0 shadow-lg shadow-green-200">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">답변을 생각하고 있어요...</p>
              </div>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-4 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
          <input
            type="text"
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSend();
              }
            }}
            placeholder="AI에게 물어보세요..."
            disabled={isLoading}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
          />
          <button
            onClick={() => {
              void handleSend();
            }}
            disabled={!chatInput.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 p-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200 shrink-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
              <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" d="M14.667 1.333L7.333 8.667M14.667 1.333l-4 12-3.334-5.333-5.333-3.333 12.667-4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
