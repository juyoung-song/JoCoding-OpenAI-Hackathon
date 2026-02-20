import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, Square, Send } from "lucide-react";
import { useApp } from "../app/store/AppContext";
import {
  clearVoiceInputOrigin,
  getVoiceInputOrigin,
} from "../app/voiceInputOrigin";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
};

type WindowWithSpeech = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export default function VoiceInputScreen() {
  const { setCurrentScreen, setPendingChatMessage, setIsChatOpen } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const unsupportedHint = (() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("firefox")) {
      return "Firefox는 Web Speech API를 지원하지 않습니다. Chrome 또는 Edge에서 이용해주세요.";
    }
    if (ua.includes("safari") && !ua.includes("chrome")) {
      return "Safari 환경에서는 음성 인식이 제한될 수 있습니다. Chrome 또는 Edge 사용을 권장합니다.";
    }
    return "현재 브라우저에서 음성 인식을 지원하지 않습니다. 텍스트 입력으로 이용해주세요.";
  })();
  const returnToChat = getVoiceInputOrigin() === "chat";

  useEffect(() => {
    const win = window as WindowWithSpeech;
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ko-KR";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: unknown) => {
      const results = (event as { results?: ArrayLike<ArrayLike<{ transcript: string }>> }).results;
      if (!results || results.length === 0) return;
      const latest = results[results.length - 1];
      const text = Array.from(latest).map((item) => item.transcript).join(" ").trim();
      setTranscript(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setIsManualEdit(false);
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const sendTranscript = () => {
    if (!transcript.trim()) return;
    setPendingChatMessage(transcript.trim());
    clearVoiceInputOrigin();
    setCurrentScreen("HOME");
    setIsChatOpen(true);
  };

  const handleBack = () => {
    clearVoiceInputOrigin();
    setCurrentScreen("HOME");
    if (returnToChat) {
      setIsChatOpen(true);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="font-bold text-gray-900">음성 입력</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white ${
            isListening ? "bg-red-500" : "bg-blue-600"
          } disabled:bg-gray-300`}
        >
          {isListening ? <Square size={28} /> : <Mic size={28} />}
        </button>

        <p className="mt-4 text-sm text-gray-600">
          {isListening ? "듣고 있어요..." : "버튼을 눌러 음성 입력을 시작하세요"}
        </p>

        {!isSupported ? (
          <p className="text-xs text-red-500 mt-2 text-center">{unsupportedHint}</p>
        ) : null}

        <div className="mt-6 w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-24">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">인식 결과</p>
            <button
              onClick={() => setIsManualEdit((prev) => !prev)}
              className="text-xs px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              {isManualEdit ? "수정 완료" : "수동으로 수정"}
            </button>
          </div>

          {isManualEdit ? (
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="인식된 문장을 직접 수정할 수 있어요."
              className="w-full min-h-24 p-3 rounded-lg border border-gray-300 text-sm text-gray-900 outline-none focus:border-blue-500 resize-none bg-white"
            />
          ) : (
            <p className="text-sm text-gray-900">{transcript || "아직 인식된 내용이 없습니다."}</p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={sendTranscript}
          disabled={!transcript.trim()}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300"
        >
          <Send size={16} />
          AI 채팅으로 보내기
        </button>
      </div>
    </div>
  );
}
