export type VoiceInputOrigin = "home" | "chat";

export const VOICE_INPUT_ORIGIN_KEY = "ddokjang.voice.origin.v1";

export const setVoiceInputOrigin = (origin: VoiceInputOrigin): void => {
  try {
    sessionStorage.setItem(VOICE_INPUT_ORIGIN_KEY, origin);
  } catch {
    // sessionStorage unavailable
  }
};

export const getVoiceInputOrigin = (): VoiceInputOrigin => {
  try {
    const raw = sessionStorage.getItem(VOICE_INPUT_ORIGIN_KEY);
    return raw === "chat" ? "chat" : "home";
  } catch {
    return "home";
  }
};

export const clearVoiceInputOrigin = (): void => {
  try {
    sessionStorage.removeItem(VOICE_INPUT_ORIGIN_KEY);
  } catch {
    // sessionStorage unavailable
  }
};

