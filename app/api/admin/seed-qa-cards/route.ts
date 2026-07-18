import { NextResponse } from "next/server";
import { loadQACards } from "@/lib/qa-cards";
import { upsertQACards } from "@/lib/rag";

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
    await upsertQACards(cards);

    return NextResponse.json({
      success: true,
      count: cards.length,
      ids: cards.map((c) => c.id),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
