const ONBOARDING_DONE_PREFIX = "ddokjang.onboarding.done.v1";
const LAST_LOGIN_EMAIL_KEY = "ddokjang.auth.last_email.v1";

const canUseStorage = () => typeof window !== "undefined";

const normalizeEmail = (email: string | null | undefined): string => (email ?? "").trim().toLowerCase();

const onboardingKey = (email: string | null | undefined): string | null => {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return `${ONBOARDING_DONE_PREFIX}:${normalized}`;
};

export const setLastLoginEmail = (email: string | null | undefined) => {
  if (!canUseStorage()) return;
  const normalized = normalizeEmail(email);
  if (!normalized) {
    sessionStorage.removeItem(LAST_LOGIN_EMAIL_KEY);
    return;
  }
  sessionStorage.setItem(LAST_LOGIN_EMAIL_KEY, normalized);
};

export const getLastLoginEmail = (): string => {
  if (!canUseStorage()) return "";
  return normalizeEmail(sessionStorage.getItem(LAST_LOGIN_EMAIL_KEY));
};

export const hasCompletedOnboarding = (email: string | null | undefined): boolean => {
  if (!canUseStorage()) return false;
  const key = onboardingKey(email);
  if (!key) return false;
  return localStorage.getItem(key) === "true";
};

export const markOnboardingCompleted = (email: string | null | undefined): void => {
  if (!canUseStorage()) return;
  const key = onboardingKey(email);
  if (!key) return;
  localStorage.setItem(key, "true");
};

