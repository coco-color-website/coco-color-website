import qaCardsJson from "@/data/qa-cards.json";

export interface QACard {
  id: string;
  category: string;
  question: string;
  answer_points: string[];
  test_target: string;
}

export function loadQACards(): QACard[] {
  // Edge Runtime 也能直接 import JSON（tsconfig 已开启 resolveJsonModule）。
  return qaCardsJson as QACard[];
}

export function formatCardsForPrompt(cards: QACard[]): string {
  if (!cards.length) {
    return "（暂无匹配 QA 卡片）";
  }

  return cards
    .map(
      (card, index) => `--- 参考卡片 ${index + 1} [${card.id}] ---
用户可能问的问题：${card.question}
回答要点：
${card.answer_points.map((p) => `- ${p}`).join("\n")}
`
    )
    .join("\n");
}
