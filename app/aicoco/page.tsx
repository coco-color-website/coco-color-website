import type { Metadata } from "next";
import AicocoPageContent from "@/app/components/aicoco-page-content";

export const metadata: Metadata = {
  title: "AICOCO 答疑 · Coco Color",
  description:
    "向 AICOCO 或 COCO 主理人 AI 分身提问色彩诊断、四季型、骨骼体型、妆容穿搭相关问题，获取即时解答。",
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

      <AicocoPageContent />
    </div>
  );
}
