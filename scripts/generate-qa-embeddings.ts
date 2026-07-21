import qaCards from "../data/qa-cards.json" with { type: "json" };
import { getEmbeddings, getEmbeddingConfig } from "../lib/embedding.js";
import { upsertQACards } from "../lib/qa-db.js";

interface QACard {
  id: string;
  category: string;
  question: string;
  answer_points: string[];
  test_target: string;
}

/**
 * 把卡片的多个字段拼成一段用于检索的文本。
 * question 和 answer_points 是语义核心，category 提供主题信号。
 */
function buildRetrievalText(card: QACard): string {
  return [
    `分类：${card.category}`,
    `问题：${card.question}`,
    "回答要点：",
    ...card.answer_points,
  ].join("\n");
}

async function main() {
  const cards = qaCards as QACard[];
  const config = getEmbeddingConfig();

  console.log(`使用模型：${config.model}`);
  console.log(`向量维度：${config.dimensions}`);
  console.log(`准备为 ${cards.length} 张 QA 卡片生成 Embedding...`);

  const texts = cards.map(buildRetrievalText);
  const embeddings = await getEmbeddings(texts);

  await upsertQACards(cards, embeddings);

  console.log(`已写入 ${cards.length} 张 QA 卡片到 SQLite 向量库`);
}

main().catch((err) => {
  console.error("生成 Embedding 失败：", err);
  process.exit(1);
});
