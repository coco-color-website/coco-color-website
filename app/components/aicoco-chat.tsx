"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AicocoChatProps {
  persona?: "aicoco" | "coco";
}

const PERSONA_CONFIG = {
  aicoco: {
    name: "AICOCO",
    avatar: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--pink-deep)] text-sm font-semibold text-white">
        AI
      </div>
    ),
    intro:
      "你好！我是 AICOCO，Coco Color 的 AI 小助手。我可以根据 Coco 的专业课程体系，帮你解答色彩诊断（四季型/八季型）、骨骼体型诊断、脸型体型、妆容、穿搭、配饰相关问题。告诉我你的季型或骨骼类型，我会给出更针对性的建议。",
  },
  coco: {
    name: "COCO 主理人",
    avatar: (
      <img
        src="/coco.jpg"
        alt="COCO"
        className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-[var(--pink-soft)]"
      />
    ),
    intro:
      "你好，我是 COCO，Coco Color 的主理人。深耕韩国形象美学 7 年，韩国色彩诊断协会一级认证诊断师。我可以帮你解答色彩诊断、骨骼体型、韩妆风格、穿搭配色等问题，也可以直接问我 Coco Color 的诊断项目和预约方式。告诉我你的情况，我们慢慢聊。",
  },
};

export default function AicocoChat({ persona = "aicoco" }: AicocoChatProps) {
  const config = PERSONA_CONFIG[persona];
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: config.intro },
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
          persona,
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
              {m.role === "assistant" && config.avatar}
              <div className="mx-2 max-w-[80%]">
                {m.role === "assistant" && (
                  <p className="mb-1 text-xs text-[var(--foreground)]/50">
                    {config.name}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--pink-deep)] text-white"
                      : "bg-[var(--pink-soft)] text-[var(--foreground)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              {config.avatar}
              <div className="mx-2 max-w-[80%]">
                <p className="mb-1 text-xs text-[var(--foreground)]/50">
                  {config.name}
                </p>
                <div className="rounded-2xl bg-[var(--pink-soft)] px-4 py-3 text-sm text-[var(--foreground)]/60">
                  {config.name}正在思考…
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
