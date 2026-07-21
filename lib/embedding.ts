import { pipeline, type FeatureExtractionPipeline, env } from "@xenova/transformers";
import path from "path";
import { fileURLToPath } from "url";

// 使用中文语义检索效果较好的轻量模型。
// 模型文件已预下载到 local_models/，首次调用无需联网。
// 入库和查询必须使用同一个模型，以保证向量在同一语义空间。
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const EMBEDDING_MODEL = "bge-small-zh-v1.5";

// 强制使用本地模型，避免运行时联网下载。
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.useBrowserCache = false;
env.useFS = true;
env.localModelPath = path.join(projectRoot, "local_models");

let extractor: FeatureExtractionPipeline | null = null;

/**
 * 获取共享的 Embedding pipeline 实例。
 * 首次调用会加载模型，后续调用复用。
 */
async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);
  }
  return extractor;
}

/**
 * 把文本转成向量。
 * @param text 要编码的文本。对 QA 卡片建议传入：category + question + answer_points。
 * @returns 归一化后的浮点向量，可直接用于余弦相似度计算。
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const pipe = await getExtractor();
  const result = await pipe(text, {
    pooling: "mean",
    normalize: true,
  });
  // result.data 是 Float32Array，转成普通数组便于 JSON 序列化。
  return Array.from(result.data as Float32Array);
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

export { EMBEDDING_MODEL };
