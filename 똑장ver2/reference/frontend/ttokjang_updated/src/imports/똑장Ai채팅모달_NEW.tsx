import React, { useState, useEffect } from "react";
import { useApp } from "../app/store/AppContext";
export default function AiChatFullScreen() {
  const { setIsChatOpen, pendingChatMessage, setPendingChatMessage } = useApp();
  const [chatInput, setChatInput] = useState('');

  // 홈에서 전달된 메시지를 채팅 입력창에 반영
  useEffect(() => {
    if (pendingChatMessage) {
      setChatInput(pendingChatMessage);
      setPendingChatMessage('');
    }
  }, [pendingChatMessage, setPendingChatMessage]);

  const handleSend = () => {
    if (chatInput.trim()) {
      console.log('메시지 전송:', chatInput);
      setChatInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
              <path stroke="#137FEC" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">똑장 AI</h1>
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Smart Agent</p>
          </div>
        </div>
        <button 
          onClick={() => setIsChatOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
            <path stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" d="M5 15L15 5M5 5L15 15" />
          </svg>
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
        <div className="flex flex-col gap-6">
          {/* AI Message */}
          <div className="flex gap-3 items-start">
            <div className="bg-blue-600 p-2.5 rounded-full shrink-0 shadow-lg shadow-blue-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5 max-w-sm">
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-800 leading-relaxed">
                  안녕하세요! 오늘 구매하신 물건들과 어울리는 상품들을 추천해 드릴까요?
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 px-2">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span>오전 11:20 · AI 분석 완료</span>
              </div>
            </div>
          </div>

          {/* Quick Reply Buttons */}
          <div className="flex gap-2 flex-wrap px-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-sm transition-colors">
              네, 추천해주세요!
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium px-4 py-2.5 rounded-full border border-gray-200 transition-colors">
              비슷한 스타일 더 보기
            </button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
          {/* 마이크 버튼 */}
          <button className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" d="M10 12.5a2.5 2.5 0 002.5-2.5V5a2.5 2.5 0 00-5 0v5A2.5 2.5 0 0010 12.5zm0 0v2.5m-5-5a5 5 0 0010 0" />
            </svg>
          </button>
          
          {/* 입력창 */}
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AI에게 물어보세요..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
          />
          
          {/* 첨부 버튼 */}
          <button className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" d="M15.833 6.667l-7.5 7.5-3.333-3.334" />
            </svg>
          </button>
          
          {/* 전송 버튼 */}
          <button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 p-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200 shrink-0"
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
