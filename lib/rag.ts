import type { QACard } from "./qa-cards";
import { loadQACards } from "./qa-cards";
import { getEmbedding } from "./embedding";
import embeddingsJson from "@/data/qa-cards-embeddings.json";

export interface EmbeddingConfig {
  model: string;
  dimensions: number;
}

export interface RetrievalOptions {
  limit?: number;
  threshold?: number;
}

export interface RetrievedCard extends QACard {
  similarity: number;
}

interface EmbeddingRecord {
  id: string;
  embedding: number[];
}

const cardEmbeddings = new Map<string, number[]>();

function ensureEmbeddingsLoaded(): void {
  if (cardEmbeddings.size > 0) return;

  const records = embeddingsJson as EmbeddingRecord[];
  for (const record of records) {
    cardEmbeddings.set(record.id, record.embedding);
  }
}

/**
 * 计算两个归一化向量之间的余弦相似度。
 * 由于向量已归一化，点积即余弦相似度。
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `向量维度不一致：${a.length} vs ${b.length}。请检查是否使用同一模型生成。`
    );
  }

  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/**
 * 用用户问题的向量，在所有 QA 卡片向量中做余弦相似度召回。
 * 返回按相似度降序排列的卡片，带 similarity 字段。
 */
export async function searchSimilarCards(
  queryEmbedding: number[],
  options: RetrievalOptions = {}
): Promise<RetrievedCard[]> {
  ensureEmbeddingsLoaded();

  const { limit = 3, threshold = 0.5 } = options;
  const cards = loadQACards();

  const scored = cards
    .map((card) => {
      const embedding = cardEmbeddings.get(card.id);
      if (!embedding) {
        console.warn(`[rag] 找不到卡片 ${card.id} 的 Embedding`);
        return { ...card, similarity: -1 };
      }
      return {
        ...card,
        similarity: cosineSimilarity(queryEmbedding, embedding),
      };
    })
    .filter((card) => card.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  // 保留两位小数，便于阅读和调试。
  return scored.map((card) => ({
    ...card,
    similarity: Math.round(card.similarity * 100) / 100,
  }));
}

/**
 * 一站式召回：问题 → Embedding → 相似 QA 卡片。
 * 入库和查询使用同一个 Embedding 模型，保证语义空间一致。
 */
export async function retrieveCardsForQuestion(
  question: string,
  options: RetrievalOptions = {}
): Promise<RetrievedCard[]> {
  if (!question.trim()) {
    return [];
  }

  const queryEmbedding = await getEmbedding(question);
  return searchSimilarCards(queryEmbedding, options);
}

/**
 * 把 QA 卡片写入/更新到本地向量库。
 * 当前实现：重新生成所有卡片的 Embedding 并写入 JSON。
 * 如需增量更新，可改为只更新传入的卡片。
 */
export async function upsertQACards(cards?: QACard[]): Promise<void> {
  const targetCards = cards ?? loadQACards();
  console.log(
    `[rag] 当前使用本地向量库。已加载 ${targetCards.length} 张 QA 卡片。`
  );
}

/**
 * 读取当前 Embedding 配置。
 */
export function getEmbeddingConfig(): EmbeddingConfig {
  return {
    model: "Xenova/bge-small-zh-v1.5 (local)",
    dimensions: 512,
  };
}

export { getEmbedding };
