import type { QACard } from "./qa-cards";
import { loadQACards } from "./qa-cards";
import { getEmbedding, getEmbeddingConfig } from "./embedding";
import qaEmbeddingsJson from "@/data/qa-embeddings.json";

export interface EmbeddingConfig {
  apiBase: string;
  apiKey: string;
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

const embeddingsById: Record<string, number[]> = {};
for (const record of qaEmbeddingsJson as EmbeddingRecord[]) {
  embeddingsById[record.id] = record.embedding;
}

/**
 * 计算两个向量之间的余弦相似度。
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `向量维度不一致：${a.length} vs ${b.length}。请检查是否使用同一模型生成。`
    );
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 用用户问题的向量，在 QA 卡片向量中做余弦相似度召回。
 * 线上 Edge Runtime 直接读取 data/qa-embeddings.json，不依赖 SQLite。
 */
export async function searchSimilarCards(
  queryEmbedding: number[],
  options: RetrievalOptions = {}
): Promise<RetrievedCard[]> {
  const { limit = 3, threshold = 0.5 } = options;
  const cards = loadQACards();

  const scored = cards
    .map((card) => {
      const embedding = embeddingsById[card.id];
      if (!embedding) return null;
      return {
        ...card,
        similarity: cosineSimilarity(queryEmbedding, embedding),
      };
    })
    .filter((card): card is RetrievedCard => card !== null)
    .filter((card) => card.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  // 返回时去掉 embedding 字段，保留 similarity。
  return scored.map((card) => ({
    id: card.id,
    category: card.category,
    question: card.question,
    answer_points: card.answer_points,
    test_target: card.test_target,
    similarity: Math.round(card.similarity * 100) / 100,
  }));
}

/**
 * 一站式召回：问题 → Embedding API → 相似 QA 卡片。
 * 入库和查询使用同一个 Doubao 模型，保证语义空间一致。
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

export { getEmbedding, getEmbeddingConfig };
