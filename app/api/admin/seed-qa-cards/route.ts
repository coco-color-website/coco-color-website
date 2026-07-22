import { NextResponse } from "next/server";
import { loadQACards } from "@/lib/qa-cards";
import { getEmbeddingConfig } from "@/lib/rag";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      password?: string;
    };

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || body.password !== adminPassword) {
      return NextResponse.json(
        { error: "管理员密码错误或未配置" },
        { status: 401 }
      );
    }

    const cards = loadQACards();
    const config = getEmbeddingConfig();

    return NextResponse.json({
      success: true,
      mode: "vector-similarity",
      message:
        "当前 QA 卡片 RAG 使用 Doubao Embedding API + SQLite 向量库。如需更新卡片或 Embedding，请修改 data/qa-cards.json 后运行 `npx tsx --env-file=.env.local scripts/generate-qa-embeddings.ts`，然后重新部署。",
      count: cards.length,
      ids: cards.map((c) => c.id),
      embedding: config,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
