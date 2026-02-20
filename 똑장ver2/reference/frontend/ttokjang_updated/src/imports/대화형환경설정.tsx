import React, { useState, useEffect, useRef } from 'react';
import svgPaths from "./svg-fuednmcveo";
import { useApp } from "../app/store/AppContext";
import { motion, AnimatePresence } from 'motion/react';

// --- Components for the Chat UI ---

function AiMessageBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-[12px] items-start w-full mb-6"
    >
      <div className="bg-[rgba(19,127,236,0.1)] flex items-center justify-center rounded-full shrink-0 size-[32px]">
        <div className="h-[14px] w-[16px]">
          <svg className="block size-full" fill="none" viewBox="0 0 17 15">
            <path d={svgPaths.p2e295e00} fill="#137FEC" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-[4px] max-w-[280px]">
        <div className="text-[#6b7280] text-[12px] mb-1">똑장이</div>
        <div className="bg-[#f3f4f6] rounded-tl-none rounded-[16px] p-[14px] shadow-sm">
          <div className="text-[#1f2937] text-[15px] leading-relaxed whitespace-pre-wrap">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UserMessageBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, x: 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-[8px] items-end justify-end w-full mb-6"
    >
      <div className="bg-[#137fec] text-white rounded-tr-none rounded-[16px] p-[14px] max-w-[280px] shadow-md">
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-[#e5e7eb] flex gap-[6px] items-center px-[17px] py-[9px] rounded-full hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
    >
      <div className="h-[16px] w-[10px]">
         {/* Simple icon placeholder */}
         <svg className="block size-full" fill="none" viewBox="0 0 10 16">
            <path d={svgPaths.pd8a2740} fill="#374151" />
         </svg>
      </div>
      <span className="text-[#374151] text-[14px] font-medium">{label}</span>
    </button>
  );
}

// --- Main Component ---

type Message = {
  id: string;
  sender: 'AI' | 'USER';
  text: string | React.ReactNode;
};

export default function OnboardingScreen() {
  const { setCurrentScreen } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'AI',
      text: (
        <>
          안녕하세요! 👋<br />
          최적의 장보기를 도와드리기 위해 몇 가지 설정이 필요해요.
        </>
      ),
    },
    {
      id: '2',
      sender: 'AI',
      text: (
        <>
          먼저, 현재 거주하시는 지역을 알려주시겠어요?
        </>
      ),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<'LOCATION' | 'TRANSPORT' | 'DONE'>('LOCATION');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'USER',
      text: inputText,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Process logic based on step
    if (step === 'LOCATION') {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + 'ai',
            sender: 'AI',
            text: (
              <>
                네, 확인했어요! 장보러 가실 때 주로 어떤 <strong>교통수단</strong>을 이용하시나요? 🛒
              </>
            ),
          },
        ]);
        setStep('TRANSPORT');
      }, 600);
    } else if (step === 'TRANSPORT') {
        finishOnboarding();
    }
  };

  const handleChipClick = (label: string) => {
      // Simulate user typing/sending the chip value
      const newMessage: Message = {
          id: Date.now().toString(),
          sender: 'USER',
          text: label,
      };
      setMessages((prev) => [...prev, newMessage]);

      if (step === 'TRANSPORT') {
          finishOnboarding();
      } else {
        // Fallback or generic handling
        setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString() + 'ai',
                sender: 'AI',
                text: "확인했습니다! 다음 설정을 진행할게요.",
              },
            ]);
          }, 600);
      }
  };

  const finishOnboarding = () => {
    setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + 'ai',
            sender: 'AI',
            text: "설정이 완료되었습니다! 똑장 홈으로 이동합니다.",
          },
        ]);
        setStep('DONE');
        setTimeout(() => {
            setCurrentScreen('HOME');
        }, 1500);
      }, 600);
  }

  return (
    <div className="relative h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 pt-6 flex justify-between items-center shrink-0 z-10">
        <button className="p-2 -ml-2 rounded-full hover:bg-gray-100" onClick={() => setCurrentScreen('HOME')}>
            {/* Back Icon placeholder */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <h1 className="text-[16px] font-bold text-gray-900">초기 설정</h1>
        <button onClick={() => setCurrentScreen('HOME')} className="text-gray-400 text-sm font-medium hover:text-gray-600">
          건너뛰기
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-2 bg-white shrink-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-blue-500 font-bold text-xs">
            {step === 'LOCATION' ? '1/2 단계' : step === 'TRANSPORT' ? '2/2 단계' : '완료'}
          </span>
          <span className="text-gray-400 text-xs font-medium">
             {step === 'LOCATION' ? '50%' : step === 'TRANSPORT' ? '90%' : '100%'}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: step === 'LOCATION' ? '50%' : step === 'TRANSPORT' ? '90%' : '100%' }}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 bg-white pb-32">
        {/* Date Separator */}
        <div className="flex justify-center mb-6">
          <span className="bg-gray-50 text-gray-400 text-[10px] px-3 py-1 rounded-full">
            오늘
          </span>
        </div>

        {messages.map((msg) => (
          msg.sender === 'AI' ? (
            <AiMessageBubble key={msg.id}>{msg.text}</AiMessageBubble>
          ) : (
            <UserMessageBubble key={msg.id}>{msg.text}</UserMessageBubble>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 z-20">
        {step === 'TRANSPORT' && (
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <SuggestionChip label="도보" onClick={() => handleChipClick('도보')} />
                <SuggestionChip label="대중교통" onClick={() => handleChipClick('대중교통')} />
                <SuggestionChip label="차량" onClick={() => handleChipClick('차량')} />
                <SuggestionChip label="온라인 결제" onClick={() => handleChipClick('온라인 결제')} />
             </div>
        )}
        
        {step === 'LOCATION' && (
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <SuggestionChip label="서울 강남구" onClick={() => { setInputText('서울 강남구'); handleSendMessage(); }} />
                <SuggestionChip label="현재 위치 찾기" onClick={() => { setInputText('현재 위치 찾기'); handleSendMessage(); }} />
             </div>
        )}

        <div className="flex gap-2 items-center bg-gray-50 rounded-xl px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-colors">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm py-2"
            placeholder={step === 'LOCATION' ? "거주하시는 지역을 입력해주세요" : "메시지를 입력하세요..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={step === 'DONE'}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || step === 'DONE'}
            className={`p-2 rounded-lg transition-colors ${inputText.trim() ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
