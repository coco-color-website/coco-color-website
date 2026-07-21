import type { QACard } from "./qa-cards";
import { loadQACards } from "./qa-cards";
import { getEmbedding, getEmbeddingConfig } from "./embedding";
import { loadQACardsWithEmbeddings } from "./qa-db";

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
 * 用用户问题的向量，在 SQLite 中的 QA 卡片向量做余弦相似度召回。
 */
export async function searchSimilarCards(
  queryEmbedding: number[],
  options: RetrievalOptions = {}
): Promise<RetrievedCard[]> {
  const { limit = 3, threshold = 0.5 } = options;
  const cards = await loadQACardsWithEmbeddings();

  const scored = cards
    .map((card) => ({
      ...card,
      similarity: cosineSimilarity(queryEmbedding, card.embedding),
    }))
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

/**
 * 把 QA 卡片写入/更新到 SQLite 向量库。
 */
export async function upsertQACards(cards?: QACard[]): Promise<void> {
  const targetCards = cards ?? loadQACards();
  const { getEmbeddings } = await import("./embedding");
  const texts = targetCards.map(buildRetrievalText);
  const embeddings = await getEmbeddings(texts);
  await upsertQACardsToDb(targetCards, embeddings);
  console.log(`[rag] 已写入 ${targetCards.length} 张 QA 卡片到 SQLite 向量库`);
}

function buildRetrievalText(card: QACard): string {
  return [
    `分类：${card.category}`,
    `问题：${card.question}`,
    "回答要点：",
    ...card.answer_points,
  ].join("\n");
}

async function upsertQACardsToDb(
  cards: QACard[],
  embeddings: number[][]
): Promise<void> {
  const { upsertQACards: dbUpsert } = await import("./qa-db");
  await dbUpsert(cards, embeddings);
}

export { getEmbedding, getEmbeddingConfig };
