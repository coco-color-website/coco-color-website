// 使用火山方舟 Doubao 多模态 Embedding API。
// 入库和查询必须使用同一个模型，以保证向量在同一语义空间。

const API_BASE = process.env.EMBEDDING_API_BASE || "https://ark.cn-beijing.volces.com/api/v3";
const API_KEY = process.env.EMBEDDING_API_KEY || "";
const MODEL = process.env.EMBEDDING_MODEL || "doubao-embedding-vision-251215";
const DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "2048", 10);

export interface EmbeddingConfig {
  apiBase: string;
  apiKey: string;
  model: string;
  dimensions: number;
}

export function getEmbeddingConfig(): EmbeddingConfig {
  const maskedKey = API_KEY
    ? `${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`
    : "";
  return {
    apiBase: API_BASE,
    apiKey: maskedKey,
    model: MODEL,
    dimensions: DIMENSIONS,
  };
}

interface DoubaoEmbeddingResponse {
  data?: {
    embedding: number[];
  };
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * 调用 Doubao 多模态 Embedding API 生成文本向量。
 * 只使用 text 类型输入，不传图片。
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!API_KEY) {
    throw new Error("EMBEDDING_API_KEY 未配置");
  }

  const url = `${API_BASE.replace(/\/$/, "")}/embeddings/multimodal`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        {
          type: "text",
          text,
        },
      ],
    }),
  });

  const result = (await response.json()) as DoubaoEmbeddingResponse;

  if (!response.ok || result.error) {
    const message = result.error?.message || `Embedding API failed: ${response.status}`;
    throw new Error(message);
  }

  const embedding = result.data?.embedding;
  if (!embedding || embedding.length === 0) {
    throw new Error("Embedding API returned empty embedding");
  }

  return embedding;
}

/**
 * 批量生成向量。
 * 顺序执行，避免一次性占用过多内存；生产环境可视情况改为并行。
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    const vector = await getEmbedding(text);
    embeddings.push(vector);
  }
  return embeddings;
}
