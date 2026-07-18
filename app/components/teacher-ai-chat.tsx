"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import siteContent from "@/data/content.json";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const TEACHER_INTRO =
  "你好！我是老师的 AI 分身。你可以向我提问任何与课程、学习或专业相关的问题，我会尽量给你清晰、有用的回答。";

export default function TeacherAIChat() {
  const [teacherName, setTeacherName] = useState(siteContent.teachers[0]?.name || "COCO");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: TEACHER_INTRO },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg || loading) return;

    setInput("");
    setError("");

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: userMsg },
    ];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/teacher-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          teacherName,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "请求失败");
      }

      if (!res.body) {
        throw new Error("响应流为空");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      // 先插入一条空的 assistant 消息，流式填充
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split("\n\n");

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(event.slice(6));
            if (data.error) {
              throw new Error(data.error);
            }
            if (data.content) {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch (parseErr) {
            if (parseErr instanceof Error) {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* 老师选择器 */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <label className="text-sm text-[var(--foreground)]/70">选择老师：</label>
        <select
          value={teacherName}
          onChange={(e) => {
            setTeacherName(e.target.value);
            setMessages([
              {
                role: "assistant",
                content: `你好！我是 ${e.target.value} 老师的 AI 分身。有任何问题都可以问我。`,
              },
            ]);
            setError("");
          }}
          disabled={loading}
          className="rounded-full border border-[var(--pink-soft)] bg-white/70 px-4 py-2 text-sm outline-none focus:border-[var(--pink-deep)] disabled:opacity-50"
        >
          {siteContent.teachers.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name} — {t.role}
            </option>
          ))}
        </select>
      </div>

      {/* 聊天窗口 */}
      <div className="flex h-[60vh] min-h-[360px] flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[var(--pink-soft)]">
        <div className="scrollable flex-1 space-y-4 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="mx-2 max-w-[85%]">
                {m.role === "assistant" && (
                  <p className="mb-1 text-xs text-[var(--foreground)]/50">
                    {teacherName} 老师 AI 分身
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--pink-deep)] text-white"
                      : "bg-[var(--pink-soft)] text-[var(--foreground)]"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content || " "}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="mx-2 max-w-[85%]">
                <p className="mb-1 text-xs text-[var(--foreground)]/50">
                  {teacherName} 老师 AI 分身
                </p>
                <div className="rounded-2xl bg-[var(--pink-soft)] px-4 py-3 text-sm text-[var(--foreground)]/60">
                  正在思考…
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex gap-3 border-t border-[var(--pink-soft)] pt-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题，例如：适合亮春型的口红色号有哪些？"
            disabled={loading}
            className="flex-1 rounded-xl border border-[var(--pink-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--pink-deep)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-[var(--pink-deep)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
