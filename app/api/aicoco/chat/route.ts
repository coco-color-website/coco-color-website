import { NextResponse } from "next/server";
import { callLLM, logChat, ChatMessage, retrieveCocoCardsForAicoco } from "@/lib/aicoco";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[]; persona?: string } = {};

  try {
    body = await request.json();
    const messages: ChatMessage[] = body.messages || [];
    const persona = body.persona === "coco" ? "coco" : "aicoco";

    if (!messages.length || !messages.some((m) => m.role === "user")) {
      return NextResponse.json(
        { error: "请至少输入一个问题" },
        { status: 400 }
      );
    }

    // COCO 主理人分身启用 QA 卡片 RAG。
    let retrievedCards: Awaited<ReturnType<typeof retrieveCocoCardsForAicoco>> = [];
    if (persona === "coco") {
      const lastUserQuestion =
        messages.filter((m) => m.role === "user").pop()?.content || "";
      retrievedCards = await retrieveCocoCardsForAicoco(lastUserQuestion);
    }

    const { content, model } = await callLLM(messages, persona, retrievedCards);

    await logChat({
      timestamp: new Date().toISOString(),
      messages,
      answer: content,
      model,
    });

    return NextResponse.json({ answer: content, model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    try {
      await logChat({
        timestamp: new Date().toISOString(),
        messages: body.messages || [],
        answer: "",
        model: "error",
        error: message,
      });
    } catch {
      // ignore logging failure
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
