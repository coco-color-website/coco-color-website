import { NextResponse } from "next/server";
import {
  ChatMessage,
  buildTeacherSystemPrompt,
  buildCocoSystemPrompt,
  getTeacherLLMConfig,
  retrieveCocoCards,
  shouldUseRAG,
  StreamChunk,
} from "@/lib/teacher-ai";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[]; teacherName?: string } = {};

  try {
    body = await request.json();
    const messages: ChatMessage[] = body.messages || [];
    const teacherName = body.teacherName || "COCO";

    if (!messages.length || !messages.some((m) => m.role === "user")) {
      return NextResponse.json(
        { error: "请输入问题后再发送" },
        { status: 400 }
      );
    }

    const { apiKey, baseUrl, model } = getTeacherLLMConfig();

    // 只有 COCO 主理人分身启用 RAG，其他老师保持原逻辑。
    let systemPrompt = buildTeacherSystemPrompt(teacherName);
    if (shouldUseRAG(teacherName)) {
      const lastUserQuestion =
        messages.filter((m) => m.role === "user").pop()?.content || "";
      const retrievedCards = await retrieveCocoCards(lastUserQuestion);
      systemPrompt = buildCocoSystemPrompt(retrievedCards);
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `LLM API failed: ${res.status} ${text}` },
        { status: 500 }
      );
    }

    if (!res.body) {
      return NextResponse.json(
        { error: "模型返回为空，请稍后重试" },
        { status: 500 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  const payload: StreamChunk = { content };
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify(payload)}\n\n`
                    )
                  );
                }
              } catch {
                // 忽略无法解析的 chunk
              }
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Stream error";
          const payload: StreamChunk = { error: message };
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify(payload)}\n\n`
            )
          );
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // 环境变量缺失等初始化错误返回 JSON，方便前端展示
    if (
      message.includes("LLM_API_KEY") ||
      message.includes("OPENAI_API_KEY") ||
      message.includes("未配置") ||
      message.includes("占位符")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
