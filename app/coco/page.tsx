import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "主理人介绍 · Coco Color",
  description:
    "Coco Color 主理人 COCO 的学习与职业履历：韩国郑瑄茉化妆学院毕业、师从明星造型顾问 Kate 邢星、与 Theory 及珠宝品牌合作色彩沙龙。",
};

const credentials = [
  {
    title: "郑瑄茉化妆学院毕业",
    desc: "COCO 毕业于韩国郑瑄茉（JUNG SAEM MOOL）化妆学院，系统学习韩式妆容、底妆技法与个人形象设计，将专业的韩妆理念融入色彩诊断与形象顾问服务。",
    images: [
      { src: "/coco/jung-saem-mool-graduation.jpg", alt: "郑瑄茉化妆学院毕业" },
    ],
    beforeAfter: [
      { src: "/coco/jsm-before-after-1.jpg", alt: "妆前妆后对比 1" },
      { src: "/coco/jsm-before-after-2.jpg", alt: "妆前妆后对比 2" },
      { src: "/coco/jsm-before-after-3.jpg", alt: "妆前妆后对比 3" },
      { src: "/coco/jsm-before-after-4.jpg", alt: "妆前妆后对比 4" },
    ],
  },
  {
    title: "师从 Kate 邢星",
    desc: "师从高奢品牌御用造型顾问 Kate 邢星，深入学习高级时装造型、身形比例分析与整体形象搭配，把一线明星造型经验转化为日常可落地的诊断方案。",
    images: [
      { src: "/coco/kate-class.jpg", alt: "Kate 邢星造型课程" },
      { src: "/coco/kate-class-1.jpg", alt: "Kate 邢星造型课堂" },
      { src: "/coco/kate-class-2.jpg", alt: "Kate 邢星课程实录" },
      { src: "/coco/kate-class-3.jpg", alt: "Kate 邢星课堂指导" },
      { src: "/coco/kate-class-4.jpg", alt: "Kate 邢星课程现场" },
      { src: "/coco/kate-styling.jpg", alt: "一对一造型指导" },
      { src: "/coco/kate-runway.jpg", alt: "秀场造型实践" },
      { src: "/coco/kate-event.jpg", alt: "Kate 邢星活动合影" },
    ],
  },
  {
    title: "品牌合作沙龙",
    desc: "多次与 Theory、珠宝品牌等高端商业品牌合作色彩沙龙与形象活动，为品牌 VIP 客户提供一对一色彩诊断、穿搭指导与造型建议，积累丰富的实战经验。",
    images: [
      { src: "/coco/theory-store.jpg", alt: "Theory 品牌合作" },
      { src: "/coco/theory-color-analysis.jpg", alt: "Theory 色彩诊断沙龙" },
      { src: "/coco/theory-salon-1.jpg", alt: "Theory 沙龙现场" },
      { src: "/coco/theory-salon-2.jpg", alt: "Theory 一对一诊断" },
      { src: "/coco/jewelry-salon.jpg", alt: "珠宝沙龙色彩诊断" },
      { src: "/coco/jewelry-salon-1.jpg", alt: "珠宝沙龙现场" },
      { src: "/coco/jewelry-salon-2.jpg", alt: "珠宝沙龙指导" },
      { src: "/coco/jewelry-salon-3.jpg", alt: "珠宝沙龙互动" },
    ],
  },
];

export default function CocoPage() {
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
          <span className="font-semibold tracking-wide">主理人介绍</span>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16">
        {/* 标题区 */}
        <div className="text-center">
          <h1 className="serif text-4xl uppercase text-[var(--pink-deep)] sm:text-5xl">
            COCO
          </h1>
          <p className="mt-3 text-lg font-medium text-[var(--foreground)]">
            主理人介绍
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[var(--foreground)]/70">
            从韩国郑瑄茉化妆学院到高奢品牌御用造型顾问，再到与高端品牌的色彩沙龙合作，
            COCO 把一线学习与实战经验，化作每一次精准、可落地的形象诊断。
          </p>
          <div className="mx-auto mt-5 h-px w-16 bg-[var(--pink)]" />
        </div>

        {/* 履历板块 */}
        <section className="mt-16 space-y-20">
          {credentials.map((c, idx) => (
            <div key={c.title} className="space-y-6">
              {/* 标题与描述 */}
              <div
                className={`grid items-start gap-6 md:grid-cols-2 ${
                  idx % 2 === 1 ? "" : ""
                }`}
              >
                <div className={`space-y-3 ${idx % 2 === 1 ? "md:order-2" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="serif text-3xl text-[var(--pink)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-xl font-semibold text-[var(--pink-deep)]">
                      {c.title}
                    </h2>
                  </div>
                  <p className="leading-relaxed text-[var(--foreground)]/75">
                    {c.desc}
                  </p>
                </div>
              </div>

              {/* 图片网格 */}
              <div
                className={`grid gap-4 ${
                  c.images.length === 1
                    ? "grid-cols-1 place-items-center"
                    : c.images.length === 2
                      ? "grid-cols-2 lg:grid-cols-4"
                      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {c.images.map((img) => (
                  <div
                    key={img.src}
                    className={`overflow-hidden rounded-2xl bg-white/70 p-1.5 shadow-sm ring-1 ring-[var(--pink-soft)] ${
                      c.images.length === 1 ? "w-full max-w-sm" : ""
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={600}
                      height={900}
                      className="aspect-[2/3] w-full rounded-xl object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ))}
              </div>

              {/* 妆前妆后对比 */}
              {c.beforeAfter && c.beforeAfter.length > 0 && (
                <div className="space-y-4">
                  <p className="text-center text-sm font-medium text-[var(--foreground)]/70">
                    学员妆前妆后作品
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {c.beforeAfter.map((img) => (
                      <div
                        key={img.src}
                        className="overflow-hidden rounded-2xl bg-white/70 p-1.5 shadow-sm ring-1 ring-[var(--pink-soft)]"
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          width={900}
                          height={600}
                          className="aspect-[3/2] w-full rounded-xl object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* 预约诊断 */}
        <section className="mt-20 text-center">
          <div className="mx-auto max-w-2xl rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-[var(--pink-soft)]">
            <p className="text-lg font-semibold">预约 COCO 一对一诊断</p>
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
