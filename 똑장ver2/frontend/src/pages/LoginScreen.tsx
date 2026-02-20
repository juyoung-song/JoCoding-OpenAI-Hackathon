import { useState } from "react";
import { LogIn } from "lucide-react";

import { AuthAPI, PreferencesAPI } from "../api";
import { useApp } from "../app/store/AppContext";
import { hasCompletedOnboarding, markOnboardingCompleted, setLastLoginEmail } from "../app/onboardingState";
import { useToast } from "../shared/ui/ToastProvider";

export default function LoginScreen() {
  const { setCurrentScreen } = useApp();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-full bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">클로즈드 베타 로그인</h1>
        <p className="text-sm text-gray-500 mb-5">
          베타 준비중 버전입니다. 승인된 계정 이메일로 로그인해주세요.
        </p>

        <label className="block text-sm text-gray-700 mb-2">이름 (선택)</label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="홍길동"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 mb-4"
        />

        <label className="block text-sm text-gray-700 mb-2">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="beta@ddokjang.ai"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 mb-4"
        />

        <button
          disabled={submitting}
          onClick={async () => {
            const normalizedEmail = email.trim().toLowerCase();
            if (!normalizedEmail.includes("@")) {
              showToast("올바른 이메일을 입력해주세요.", "info");
              return;
            }

            setSubmitting(true);
            try {
              const loginResponse = await AuthAPI.login(normalizedEmail, name.trim() || undefined);
              const userEmail = (loginResponse.user?.email ?? normalizedEmail).trim().toLowerCase();
              setLastLoginEmail(userEmail);

              let needsOnboarding = !hasCompletedOnboarding(userEmail);
              if (needsOnboarding) {
                try {
                  const [likeBrands, dislikeBrands] = await Promise.all([
                    PreferencesAPI.getBrands("like"),
                    PreferencesAPI.getBrands("dislike"),
                  ]);
                  const hasSavedPreference =
                    (likeBrands.brands?.length ?? 0) + (dislikeBrands.brands?.length ?? 0) > 0;
                  if (hasSavedPreference) {
                    markOnboardingCompleted(userEmail);
                    needsOnboarding = false;
                  }
                } catch (preferenceError) {
                  console.warn("Failed to load preference snapshot on login", preferenceError);
                }
              }

              showToast("베타 로그인에 성공했습니다.", "success");
              setCurrentScreen(needsOnboarding ? "ONBOARDING" : "HOME");
            } catch (error) {
              console.error("Login failed", error);
              showToast("로그인에 실패했습니다. 이메일을 다시 확인해주세요.", "error");
            } finally {
              setSubmitting(false);
            }
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <LogIn size={16} />
          {submitting ? "로그인 중..." : "베타 로그인"}
        </button>
      </div>
    </div>
  );
}
