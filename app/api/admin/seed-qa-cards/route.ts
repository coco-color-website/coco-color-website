import { NextResponse } from "next/server";
import { loadQACards } from "@/lib/qa-cards";

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

    return NextResponse.json({
      success: true,
      mode: "keyword-match",
      message:
        "当前 QA 卡片使用本地 JSON + 关键词匹配，无需写入向量库。如需更新卡片，请直接修改 data/qa-cards.json 后重新部署。",
      count: cards.length,
      ids: cards.map((c) => c.id),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
