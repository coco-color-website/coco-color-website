import type { QACard } from "./qa-cards";
import { loadQACards } from "./qa-cards";

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

// 常见中文停用字/词，避免它们拉高无意义匹配。
const STOP_WORDS = new Set([
  "的", "了", "是", "在", "我", "有", "和", "就", "不", "人", "都", "一",
  "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有",
  "看", "好", "自己", "这", "那", "之", "与", "及", "或", "但", "而", "如果",
]);

/**
 * 把文本切分为可用于关键词匹配的 token。
 * - 中文字符逐字切分（单字匹配对短查询足够有效）。
 * - 英文/数字按连续词切分。
 * - 过滤标点、纯停用字和过短词。
 */
function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    // 把常见标点换成空格
    .replace(/[，。！？、；：“”‘’（）【】\"',.!?;:\[\]()]/g, " ")
    .trim();

  const tokens: string[] = [];

  for (const char of normalized) {
    if (/[一-龥]/.test(char) && !STOP_WORDS.has(char)) {
      tokens.push(char);
    }
  }

  const words = normalized
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9一-龥]/g, ""))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  return Array.from(new Set([...tokens, ...words]));
}

/**
 * 基于关键词重叠给卡片打分。
 * - 问题字段匹配权重最高（3）。
 * - 分类字段匹配权重次之（2）。
 * - 回答要点匹配权重为 1。
 */
function scoreCard(queryTokens: string[], card: QACard): number {
  if (queryTokens.length === 0) return 0;

  const questionTokens = tokenize(card.question);
  const categoryTokens = tokenize(card.category);
  const answerTokens = tokenize(card.answer_points.join("\n"));

  let rawScore = 0;
  let maxPossible = 0;

  for (const token of queryTokens) {
    const weight = 3;
    maxPossible += weight;
    if (questionTokens.includes(token)) rawScore += weight;
    else if (categoryTokens.includes(token)) rawScore += 2;
    else if (answerTokens.includes(token)) rawScore += 1;
  }

  // 归一化到 0~1，保留两位小数。
  const normalized = Math.min(1, rawScore / maxPossible);
  return Math.round(normalized * 100) / 100;
}

/**
 * 基于关键词从本地 QA 卡片中召回相关卡片。
 * 不依赖 Embedding API，不依赖 Supabase 向量表，零额外费用。
 */
export async function searchSimilarCards(
  _embedding: number[],
  options: RetrievalOptions = {}
): Promise<RetrievedCard[]> {
  // 为保持旧接口兼容而保留 _embedding 参数，实际不再使用。
  return retrieveCardsForQuestion("", options);
}

/**
 * 一站式召回：问题 → 关键词匹配 → 相似 QA 卡片。
 */
export async function retrieveCardsForQuestion(
  question: string,
  options: RetrievalOptions = {}
): Promise<RetrievedCard[]> {
  const { limit = 3, threshold = 0.1 } = options;
  const cards = loadQACards();
  const queryTokens = tokenize(question);

  if (queryTokens.length === 0) {
    return [];
  }

  const scored = cards
    .map((card) => ({
      ...card,
      similarity: scoreCard(queryTokens, card),
    }))
    .filter((card) => card.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored;
}

/**
 * 把 QA 卡片写入/更新到存储。
 * 当前使用本地 JSON + 关键词匹配，此方法不再调用 Embedding API，
 * 仅作为兼容性入口保留，避免上游调用方报错。
 */
export async function upsertQACards(cards?: QACard[]): Promise<void> {
  const targetCards = cards ?? loadQACards();
  console.log(
    `[rag] 当前使用本地关键词匹配，无需写入向量库。已加载 ${targetCards.length} 张 QA 卡片。`
  );
}

/**
 * 兼容性入口：读取 embedding 配置。
 * 关键词匹配模式下不再真正调用 Embedding API，
 * 返回一个占位配置以避免类型报错。
 */
export function getEmbeddingConfig(): EmbeddingConfig {
  return {
    apiBase: process.env.EMBEDDING_API_BASE || "",
    apiKey: process.env.EMBEDDING_API_KEY || "",
    model: process.env.EMBEDDING_MODEL || "keyword-match",
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || "0", 10),
  };
}

/**
 * 兼容性入口：生成向量。
 * 关键词匹配模式下直接返回空数组。
 */
export async function getEmbedding(_text: string): Promise<number[]> {
  return [];
}
