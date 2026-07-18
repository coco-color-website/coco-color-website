"use client";

import { useState } from "react";
import AicocoChat from "@/app/components/aicoco-chat";

export default function AicocoPageContent() {
  const [persona, setPersona] = useState<"aicoco" | "coco">("coco");

  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <div className="text-center">
        <h1 className="serif text-4xl uppercase text-[var(--pink-deep)] sm:text-5xl">
          {persona === "coco" ? "Ask COCO" : "Ask AICOCO"}
        </h1>
        <p className="mt-3 text-[var(--foreground)]/70">
          {persona === "coco"
            ? "COCO 主理人在线，陪你聊色彩、穿搭与形象设计"
            : "色彩诊断、四季型、骨骼体型、韩妆风格、穿搭配色的智能问答助手"}
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-md justify-center gap-3">
        <button
          onClick={() => setPersona("aicoco")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            persona === "aicoco"
              ? "bg-[var(--pink-deep)] text-white"
              : "bg-white/70 text-[var(--foreground)]/70 ring-1 ring-[var(--pink-soft)] hover:text-[var(--pink-deep)]"
          }`}
        >
          AICOCO 通用助手
        </button>
        <button
          onClick={() => setPersona("coco")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            persona === "coco"
              ? "bg-[var(--pink-deep)] text-white"
              : "bg-white/70 text-[var(--foreground)]/70 ring-1 ring-[var(--pink-soft)] hover:text-[var(--pink-deep)]"
          }`}
        >
          COCO 主理人分身
        </button>
      </div>

      <div className="mt-12">
        <AicocoChat persona={persona} />
      </div>
    </main>
  );
}
