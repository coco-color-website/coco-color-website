import { supabase } from "./supabase";
import type { QACard } from "./qa-cards";

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

/**
 * 读取 embedding 配置。
 * 支持 OpenAI 兼容接口（OpenAI、火山方舟等）。
 * 仅在服务端调用。
 */
export function getEmbeddingConfig(): EmbeddingConfig {
  const apiBase = (
    process.env.EMBEDDING_API_BASE || "https://api.openai.com/v1"
  ).trim();
  const apiKey = (process.env.EMBEDDING_API_KEY || "").trim();
  const model = (
    process.env.EMBEDDING_MODEL || "text-embedding-3-small"
  ).trim();
  const dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536", 10);

  if (
    !apiKey ||
    apiKey === "your_embedding_api_key_here" ||
    apiKey.startsWith("your_") ||
    apiKey.startsWith("sk-placeholder")
  ) {
    throw new Error(
      "EMBEDDING_API_KEY 未配置或仍是占位符，请在 .env.local 中设置真实 Key"
    );
  }

  return { apiBase, apiKey, model, dimensions };
}

/**
 * 调用 Embedding API 生成向量。
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const { apiBase, apiKey, model, dimensions } = getEmbeddingConfig();

  const res = await fetch(`${apiBase}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model,
      dimensions,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Embedding failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const embedding: number[] | undefined = data.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error("Embedding returned empty embedding");
  }

  if (embedding.length === dimensions) {
    return embedding;
  }

  // 部分模型（如 Doubao-embedding）可能忽略 dimensions 参数返回完整向量。
  // 如果返回维度大于预期，截取前 N 维（Matryoshka 语义下前 N 维有效）。
  if (embedding.length > dimensions) {
    return embedding.slice(0, dimensions);
  }

  throw new Error(
    `Embedding returned unexpected dimensions: ${embedding.length}, expected ${dimensions}`
  );
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
