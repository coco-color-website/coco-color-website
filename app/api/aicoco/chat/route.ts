import { NextResponse } from "next/server";
import { callLLM, logChat, ChatMessage } from "@/lib/aicoco";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[] } = {};

  try {
    body = await request.json();
    const messages: ChatMessage[] = body.messages || [];

    if (!messages.length || !messages.some((m) => m.role === "user")) {
      return NextResponse.json(
        { error: "请至少输入一个问题" },
        { status: 400 }
      );
    }

    const { content, model } = await callLLM(messages);

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
