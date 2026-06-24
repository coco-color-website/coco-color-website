"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AicocoChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "你好！我是 AICOCO，Coco Color 的 AI 小助手。我可以帮你初步了解色彩诊断、四季型、韩妆风格、穿搭配色和预约流程。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setError("");

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: userMsg },
    ];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/aicoco/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "请求失败");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex h-[60vh] min-h-[360px] flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[var(--pink-soft)]">
        <div className="scrollable flex-1 space-y-4 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[var(--pink-deep)] text-white"
                    : "bg-[var(--pink-soft)] text-[var(--foreground)]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[var(--pink-soft)] px-4 py-3 text-sm text-[var(--foreground)]/60">
                AICOCO 正在思考…
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
            placeholder="输入你的问题，例如：什么是四季型色彩诊断？"
            className="flex-1 rounded-xl border border-[var(--pink-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--pink-deep)]"
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
