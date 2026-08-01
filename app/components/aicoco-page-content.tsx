"use client";

import { useEffect, useState } from "react";
import AicocoChat from "@/app/components/aicoco-chat";
import CocoAccessGate from "@/app/components/coco-access-gate";

const TOKEN_KEY = "coco_access_token";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function AicocoPageContent() {
  const [persona, setPersona] = useState<"aicoco" | "coco">("aicoco");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAccessToken(localStorage.getItem(TOKEN_KEY));
    setReady(true);
  }, []);

  function handleAuthExpired() {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken(null);
    setPersona("aicoco");
  }

  function handleSelectPersona(next: "aicoco" | "coco") {
    if (next === "coco" && !accessToken) {
      setPersona("coco");
      return;
    }
    setPersona(next);
  }

  if (!ready) {
    return (
      <main className="mx-auto flex max-w-6xl items-center justify-center px-5 py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--pink-soft)] border-t-[var(--pink-deep)]" />
      </main>
    );
  }

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
          onClick={() => handleSelectPersona("aicoco")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            persona === "aicoco"
              ? "bg-[var(--pink-deep)] text-white"
              : "bg-white/70 text-[var(--foreground)]/70 ring-1 ring-[var(--pink-soft)] hover:text-[var(--pink-deep)]"
          }`}
        >
          AICOCO 通用助手
        </button>
        <button
          onClick={() => handleSelectPersona("coco")}
          className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition ${
            persona === "coco"
              ? "bg-[var(--pink-deep)] text-white"
              : "bg-white/70 text-[var(--foreground)]/70 ring-1 ring-[var(--pink-soft)] hover:text-[var(--pink-deep)]"
          }`}
        >
          {!accessToken && <LockIcon className="h-3.5 w-3.5" />}
          COCO 主理人分身
        </button>
      </div>

      <div className="mt-12">
        {persona === "aicoco" ? (
          <AicocoChat persona="aicoco" />
        ) : accessToken ? (
          <AicocoChat
            persona="coco"
            accessToken={accessToken}
            onAuthExpired={handleAuthExpired}
          />
        ) : (
          <CocoAccessGate onSuccess={setAccessToken} />
        )}
      </div>
    </main>
  );
}
