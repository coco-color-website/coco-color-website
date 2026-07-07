import type { Metadata } from "next";
import AicocoChat from "@/app/components/aicoco-chat";

export const metadata: Metadata = {
  title: "AICOCO 答疑 · Coco Color",
  description:
    "向 AICOCO 提问色彩诊断、四季型、骨骼体型、妆容穿搭相关问题，获取即时解答。",
};

export default function AicocoPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--pink-soft)] bg-[var(--background)]/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a
            href="/"
            className="text-sm font-medium text-[var(--pink-deep)] transition hover:opacity-80"
          >
            ← 返回首页
          </a>
          <span className="font-semibold tracking-wide">AICOCO 答疑</span>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="text-center">
          <h1 className="serif text-4xl uppercase text-[var(--pink-deep)] sm:text-5xl">
            Ask AICOCO
          </h1>
          <p className="mt-3 text-[var(--foreground)]/70">
            色彩诊断、四季型、骨骼体型、韩妆风格、穿搭配色的智能问答助手
          </p>
        </div>

        <div className="mt-12">
          <AicocoChat />
        </div>
      </main>
    </div>
  );
}
