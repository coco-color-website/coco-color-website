import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getEmbeddings, EMBEDDING_MODEL } from "../lib/embedding.js";
import qaCards from "../data/qa-cards.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "data", "qa-cards-embeddings.json");

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
  console.log(`使用模型：${EMBEDDING_MODEL}`);
  console.log(`准备为 ${cards.length} 张 QA 卡片生成 Embedding...`);

  const texts = cards.map(buildRetrievalText);
  const embeddings = await getEmbeddings(texts);

  const records = cards.map((card, index) => ({
    id: card.id,
    embedding: embeddings[index],
  }));

  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), "utf-8");

  console.log(`已保存 ${records.length} 条 Embedding 到：${outputPath}`);
  console.log(`向量维度：${embeddings[0]?.length ?? 0}`);
}

main().catch((err) => {
  console.error("生成 Embedding 失败：", err);
  process.exit(1);
});
