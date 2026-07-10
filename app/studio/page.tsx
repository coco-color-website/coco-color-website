import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "诊断环境 · Coco Color",
  description:
    "Coco Color 诊断工作室位于广州天河区，拥有自然光诊断环境、进口诊断工具与专业彩妆试色区，为每一次色彩诊断提供可对照、可带走、可长期参考的结果。",
};

const highlights = [
  {
    title: "自然光诊断环境",
    desc: "大面落地窗引入自然光，让肤色与色布的判断更贴近日常场景。诊断区正对窗外城市景观，光线柔和稳定，确保每一次测色都真实可靠。",
    images: [
      { src: "/studio/studio-wide-1.jpg", alt: "自然光诊断工作室全景", width: 800, height: 600 },
    ],
  },
  {
    title: "进口诊断工具",
    desc: "韩国色彩诊断专用色布、肤色测量仪与四季型参考图，覆盖经典八季型到二十一季型体系，精准测定每位顾客的肤色基调与适配色域。",
    images: [
      { src: "/studio/color-swatches-1.jpg", alt: "色彩诊断专用色布", width: 800, height: 600 },
      { src: "/studio/color-swatches-2.jpg", alt: "多季型色布挂架", width: 800, height: 600 },
      { src: "/studio/color-swatches-3.jpg", alt: "窗边色布陈列", width: 800, height: 600 },
      { src: "/studio/accessories-display.jpg", alt: "香水与配饰陈列", width: 800, height: 600 },
    ],
  },
  {
    title: "专业彩妆试色区",
    desc: "粉底液、腮红、口红、眼影等大牌彩妆现场试色，配合专业化妆镜与充足光线，找到真正适合你的色号与妆容风格。",
    images: [
      { src: "/studio/makeup-collection.jpg", alt: "大牌彩妆集合试色区", width: 800, height: 600 },
      { src: "/studio/makeup-vanity.jpg", alt: "专业彩妆试色化妆台", width: 600, height: 800 },
    ],
  },
  {
    title: "舒适私密空间",
    desc: "一对一诊断区域与休息区分离，预约制服务，保证隐私与体验。休息区配备软椅与四季型参考展示，让你在轻松氛围中完成整个诊断流程。",
    images: [
      { src: "/studio/waiting-area.jpg", alt: "舒适休息等候区", width: 600, height: 800 },
    ],
  },
];

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-[var(--pink-soft)] bg-[var(--background)]/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a
            href="/"
            className="text-sm font-medium text-[var(--pink-deep)] transition hover:opacity-80"
          >
            ← 返回首页
          </a>
          <span className="font-semibold tracking-wide">诊断环境</span>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16">
        {/* 标题区 */}
        <div className="text-center">
          <h1 className="serif text-4xl uppercase text-[var(--pink-deep)] sm:text-5xl">
            Studio
          </h1>
          <p className="mt-3 text-lg font-medium text-[var(--foreground)]">
            诊断环境
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[var(--foreground)]/70">
            我们把韩国色彩诊断工作室的标准带到广州：自然光、进口工具、专业彩妆试色区，
            让每一位顾客在舒适私密的环境中完成专属诊断。
          </p>
          <div className="mx-auto mt-5 h-px w-16 bg-[var(--pink)]" />
        </div>

        {/* 图文配对的亮点 */}
        <section className="mt-16 space-y-16">
          {highlights.map((h, idx) => (
            <div
              key={h.title}
              className="grid items-center gap-8 md:grid-cols-2"
            >
              {/* 文字 */}
              <div
                className={`space-y-4 ${
                  idx % 2 === 1 ? "md:order-2" : "md:order-1"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="serif text-3xl text-[var(--pink)]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-semibold text-[var(--pink-deep)]">
                    {h.title}
                  </h2>
                </div>
                <p className="leading-relaxed text-[var(--foreground)]/75">
                  {h.desc}
                </p>
              </div>

              {/* 图片 */}
              <div
                className={`space-y-4 ${
                  idx % 2 === 1 ? "md:order-1" : "md:order-2"
                }`}
              >
                <div
                  className={`grid gap-4 ${
                    h.images.length === 4 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {h.images.map((img) => (
                    <div
                      key={img.src}
                      className="overflow-hidden rounded-3xl bg-white/70 p-2 shadow-sm ring-1 ring-[var(--pink-soft)]"
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        className="aspect-[4/3] w-full rounded-2xl object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 地址与预约 */}
        <section className="mt-20 text-center">
          <div className="mx-auto max-w-2xl rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-[var(--pink-soft)]">
            <p className="text-lg font-semibold">到店诊断请提前预约</p>
            <p className="mt-2 text-sm text-[var(--foreground)]/70">
              广州市天河区 华强路2号 富力盈丰大厦A座 3楼336室
            </p>
            <p className="mt-1 text-sm text-[var(--foreground)]/70">
              营业时间：11:00 - 18:00
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-full bg-[var(--pink-deep)] px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              返回首页了解项目
            </a>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="mt-10 border-t border-[var(--pink-soft)] bg-[var(--pink-soft)]/40">
        <div className="mx-auto max-w-6xl px-5 py-8 text-center">
          <p className="text-sm text-[var(--foreground)]/60">
            Coco Color · 色彩诊断 · 整体形象设计
          </p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">
            © 2026 Coco Color Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
