const KEYWORD_TO_EMOJI: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ["우유", "밀크"], emoji: "🥛" },
  { keywords: ["계란", "달걀"], emoji: "🥚" },
  { keywords: ["삼겹살", "돼지고기", "고기"], emoji: "🥩" },
  { keywords: ["라면"], emoji: "🍜" },
  { keywords: ["두부"], emoji: "⬜" },
  { keywords: ["김치"], emoji: "🥬" },
  { keywords: ["사과"], emoji: "🍎" },
  { keywords: ["바나나"], emoji: "🍌" },
  { keywords: ["양파"], emoji: "🧅" },
  { keywords: ["감자"], emoji: "🥔" },
  { keywords: ["참이슬", "소주"], emoji: "🍶" },
  { keywords: ["비타500", "비타 500", "비타"], emoji: "🍋" },
];

export const getItemEmoji = (itemName: string) => {
  const normalized = itemName.toLowerCase();
  const match = KEYWORD_TO_EMOJI.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(keyword))
  );
  return match?.emoji ?? "🛒";
};
