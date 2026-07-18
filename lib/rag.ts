import { supabase } from "./supabase";
import type { QACard } from "./qa-cards";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export interface OpenAIEmbeddingConfig {
  apiKey: string;
  model: string;
}

export interface RetrievalOptions {
  limit?: number;
  threshold?: number;
}

/**
 * 读取 OpenAI embedding 配置。
 * 仅在服务端调用。
 */
export function getOpenAIEmbeddingConfig(): OpenAIEmbeddingConfig {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();

  if (
    !apiKey ||
    apiKey === "your_openai_api_key_here" ||
    apiKey.startsWith("your_") ||
    apiKey.startsWith("sk-placeholder")
  ) {
    throw new Error(
      "OPENAI_API_KEY 未配置或仍是占位符，请在 .env.local 中设置真实 Key"
    );
  }

  return { apiKey, model: EMBEDDING_MODEL };
}

/**
 * 调用 OpenAI Embedding API 生成向量。
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const { apiKey, model } = getOpenAIEmbeddingConfig();

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI embedding failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const embedding: number[] | undefined = data.data?.[0]?.embedding;

  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `OpenAI embedding returned unexpected dimensions: ${embedding?.length}`
    );
  }

  return embedding;
}

export interface RetrievedCard extends QACard {
  similarity: number;
}

interface MatchQACardsRow {
  id: string;
  category: string;
  question: string;
  answer_points: string[];
  test_target: string;
  similarity: number;
}

/**
 * 基于向量从 Supabase 召回相似 QA 卡片。
 */
export async function searchSimilarCards(
  embedding: number[],
  options: RetrievalOptions = {}
): Promise<RetrievedCard[]> {
  if (!supabase) {
    throw new Error("Supabase client is not configured");
  }

  const { limit = 3, threshold = 0.5 } = options;

  const { data, error } = await supabase.rpc("match_qa_cards", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    throw new Error(`Supabase match_qa_cards failed: ${error.message}`);
  }

  const rows = (data || []) as MatchQACardsRow[];

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    question: row.question,
    answer_points: row.answer_points,
    test_target: row.test_target,
    similarity: row.similarity,
  }));
}

/**
 * 一站式召回：问题 → embedding → 相似 QA 卡片。
 */
export async function retrieveCardsForQuestion(
  question: string,
  options?: RetrievalOptions
): Promise<RetrievedCard[]> {
  const embedding = await getEmbedding(question);
  return searchSimilarCards(embedding, options);
}

/**
 * 把 QA 卡片写入/更新到 Supabase 向量表。
 */
export async function upsertQACards(cards: QACard[]): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase client is not configured");
  }

  const records = await Promise.all(
    cards.map(async (card) => {
      const textForEmbedding = `${card.question}\n${card.answer_points.join(
        "\n"
      )}`;
      const embedding = await getEmbedding(textForEmbedding);
      return {
        id: card.id,
        category: card.category,
        question: card.question,
        answer_points: card.answer_points,
        test_target: card.test_target,
        embedding,
      };
    })
  );

  const { error } = await supabase.from("qa_cards").upsert(records, {
    onConflict: "id",
  });

  if (error) {
    throw new Error(`Supabase upsert qa_cards failed: ${error.message}`);
  }
}
