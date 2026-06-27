import Image from "next/image";
import { getContent } from "@/lib/content";

const navItems = [
  { href: "#brand", label: "品牌介绍" },
  { href: "#teacher", label: "诊断老师" },
  { href: "#projects", label: "诊断项目" },
  { href: "#details", label: "诊断明细" },
  { href: "#ask", label: "AICOCO 答疑" },
  { href: "#test", label: "线上诊断" },
  { href: "#reviews", label: "评论区" },
];

const process = [
  { step: "01", title: "线上沟通", desc: "了解需求，预约到店时间" },
  { step: "02", title: "现场到诊", desc: "自然光环境，仪器测肤" },
  { step: "03", title: "全彩诊断", desc: "服装 / 妆容 / 配饰逐项分析" },
  { step: "04", title: "诊断报告", desc: "纸质报告 + 色卡 + 电子存档" },
];

function ComingSoon({ note }: { note: string }) {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-[var(--pink)] bg-[var(--pink-soft)]/40 px-6 py-10 text-center">
      <p className="text-sm font-medium tracking-wide text-[var(--pink-deep)]">
        敬请期待
      </p>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">{note}</p>
    </div>
  );
}

function SectionTitle({ en, zh }: { en: string; zh: string }) {
  return (
    <div className="text-center">
      <h2 className="serif text-3xl uppercase text-[var(--pink-deep)] sm:text-4xl">
        {en}
      </h2>
      <p className="mt-2 text-lg font-medium text-[var(--foreground)]">{zh}</p>
      <div className="mx-auto mt-4 h-px w-16 bg-[var(--pink)]" />
    </div>
  );
}

export default async function Home() {
  const content = await getContent();

  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-[var(--pink-soft)] bg-[var(--background)]/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#top" className="flex items-center gap-2.5">
            <Image src="/logo-icon.png" alt="Coco Color" width={48} height={48} />
            <span className="flex flex-col leading-tight">
              <span className="font-semibold tracking-wide">{content.brand.title}</span>
              <span className="text-[11px] text-[var(--foreground)]/60">
                {content.brand.subtitle}
              </span>
            </span>
          </a>
          <ul className="hidden gap-6 text-sm text-[var(--foreground)]/70 md:flex">
            {navItems.map((it) => (
              <li key={it.href}>
                <a href={it.href} className="transition hover:text-[var(--pink-deep)]">
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="relative overflow-hidden bg-gradient-to-b from-[var(--pink-soft)] via-[var(--background)] to-[var(--background)]"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center px-5 py-24 text-center">
          <Image
            src="/logo-icon.png"
            alt="Coco Color Logo"
            width={200}
            height={200}
            priority
          />
          <p className="mt-6 text-lg tracking-[0.3em] text-[var(--pink-deep)]">
            {content.brand.subtitle}
          </p>
          <p className="mt-6 max-w-xl text-[var(--foreground)]/75">
            {content.brand.heroText}
          </p>
          <a
            href="#projects"
            className="mt-9 rounded-full bg-[var(--pink-deep)] px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            了解诊断项目
          </a>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-5">
        {/* 品牌介绍 */}
        <section id="brand" className="py-20">
          <SectionTitle en="Brand" zh="品牌介绍" />
          <div className="mx-auto mt-10 max-w-3xl space-y-5 text-center leading-relaxed text-[var(--foreground)]/80">
            <p>
              {content.brand.title} 专注色彩诊断与整体形象设计，提供从肤色诊断、服装色彩、
              妆容配饰到购物顾问的一站式服务。
            </p>
            <p>
              我们坚持自然光诊断环境与进口诊断工具精准测肤，让每一次诊断都有
              可对照、可带走、可长期参考的结果。
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { t: "进口诊断工具", d: "进口顶级工具精准测定肤色基调" },
              { t: "专业诊断师", d: "资深诊断师现场亲自一对一诊断" },
              { t: "终身答疑", d: "诊断后持续线上跟进答疑" },
            ].map((c) => (
              <div
                key={c.t}
                className="rounded-3xl bg-white/70 p-7 text-center shadow-sm ring-1 ring-[var(--pink-soft)]"
              >
                <p className="text-lg font-semibold text-[var(--pink-deep)]">{c.t}</p>
                <p className="mt-2 text-sm text-[var(--foreground)]/70">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 诊断老师 */}
        <section id="teacher" className="py-20">
          <SectionTitle en="Stylists" zh="诊断老师" />
          <div className="mt-12 space-y-16">
            {content.teachers.map((teacher) => (
              <div
                key={teacher.name}
                className="grid items-center gap-10 md:grid-cols-2"
              >
                <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl shadow-sm ring-1 ring-[var(--pink-soft)]">
                  <Image
                    src={teacher.image}
                    alt={`${teacher.name} 老师`}
                    width={600}
                    height={750}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <p className="serif text-2xl text-[var(--pink-deep)]">
                    {teacher.name}
                  </p>
                  <p className="text-sm tracking-widest text-[var(--foreground)]/60">
                    {teacher.role}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {teacher.bio.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-2xl bg-[var(--pink-soft)]/50 p-4 text-sm leading-relaxed text-[var(--foreground)]/80 shadow-sm"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--pink-deep)] text-xs font-semibold text-white">
                          {i + 1}
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 诊断项目 */}
        <section id="projects" className="py-20">
          <SectionTitle en="Service" zh="诊断项目" />

          {/* COCO 主理人 */}
          <div className="mx-auto mt-10 max-w-2xl">
            <h3 className="text-center text-lg font-semibold text-[var(--foreground)]">
              COCO 主理人
            </h3>
            <p className="mt-2 text-center text-xs text-[var(--foreground)]/50">
              ↕ 区域内上下滑动查看全部项目
            </p>
            <div className="mt-4 h-[360px] snap-y snap-mandatory space-y-5 overflow-y-auto rounded-3xl pr-2">
              {content.services
                .filter((s) => s.price.COCO)
                .map((s, i) => (
                  <div
                    key={s.en}
                    className={`snap-start rounded-3xl p-8 shadow-sm ${
                      i % 2 === 0
                        ? "bg-white/70 ring-1 ring-[var(--pink-soft)]"
                        : "bg-gradient-to-br from-[var(--pink-soft)] to-white ring-1 ring-[var(--pink)]"
                    }`}
                  >
                    <p className="serif text-xl text-[var(--pink-deep)]">{s.en}</p>
                    <p className="mt-1 text-lg font-semibold">{s.zh}</p>
                    <p className="mt-3 text-sm text-[var(--foreground)]/70">{s.desc}</p>
                    <p className="mt-4 text-lg font-semibold text-[var(--pink-deep)]">
                      ¥{s.price.COCO}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* S级诊断师 乐飞 */}
          <div className="mx-auto mt-14 max-w-2xl">
            <h3 className="text-center text-lg font-semibold text-[var(--foreground)]">
              S级诊断师 乐飞
            </h3>
            <p className="mt-2 text-center text-xs text-[var(--foreground)]/50">
              ↕ 区域内上下滑动查看全部项目
            </p>
            <div className="mt-4 h-[360px] snap-y snap-mandatory space-y-5 overflow-y-auto rounded-3xl pr-2">
              {content.services
                .filter((s) => s.price.乐飞)
                .map((s, i) => (
                  <div
                    key={s.en}
                    className={`snap-start rounded-3xl p-8 shadow-sm ${
                      i % 2 === 0
                        ? "bg-white/70 ring-1 ring-[var(--pink-soft)]"
                        : "bg-gradient-to-br from-[var(--pink-soft)] to-white ring-1 ring-[var(--pink)]"
                    }`}
                  >
                    <p className="serif text-xl text-[var(--pink-deep)]">{s.en}</p>
                    <p className="mt-1 text-lg font-semibold">{s.zh}</p>
                    <p className="mt-3 text-sm text-[var(--foreground)]/70">{s.desc}</p>
                    <p className="mt-4 text-lg font-semibold text-[var(--pink-deep)]">
                      ¥{s.price.乐飞}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* 诊断明细 */}
        <section id="details" className="py-20">
          <SectionTitle en="Details" zh="诊断明细" />
          <p className="mt-6 text-center text-xs text-[var(--foreground)]/50">
            ↕ 列表内上下滑动查看完整明细
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.details.map((g, idx) => (
              <div
                key={g.en}
                className={`flex h-[420px] flex-col rounded-3xl p-6 shadow-sm ${
                  idx % 2 === 0
                    ? "bg-white/70 ring-1 ring-[var(--pink-soft)]"
                    : "bg-gradient-to-br from-[var(--pink-soft)] to-white ring-1 ring-[var(--pink)]"
                }`}
              >
                <p className="serif text-lg text-[var(--pink-deep)]">{g.en}</p>
                <p className="text-base font-semibold">{g.zh}</p>
                <ul className="scrollable mt-4 min-h-0 flex-1 space-y-2.5 pr-1">
                  {g.items.map((it, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-xs leading-relaxed text-[var(--foreground)]/80"
                    >
                      <span className="shrink-0 font-semibold text-[var(--pink-deep)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* AICOCO 答疑 */}
        <section id="ask" className="py-20">
          <SectionTitle en="AICOCO" zh="AICOCO 答疑" />
          <p className="mx-auto mt-6 max-w-xl text-center text-[var(--foreground)]/70">
            向 AICOCO 提问任何关于色彩、穿搭与妆容的问题，获得即时解答。
          </p>
          <div className="mx-auto mt-8 max-w-md rounded-3xl bg-white/70 p-8 text-center shadow-sm ring-1 ring-[var(--pink-soft)]">
            <p className="text-sm text-[var(--foreground)]/70">
              色彩诊断 · 四季型 · 韩妆风格 · 穿搭配色
            </p>
            <a
              href="/aicoco"
              className="mt-5 inline-block rounded-full bg-[var(--pink-deep)] px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              开始提问
            </a>
          </div>
        </section>

        {/* 线上色彩诊断 */}
        <section id="test" className="py-20">
          <SectionTitle en="Online Test" zh="线上色彩诊断" />
          <p className="mx-auto mt-6 max-w-xl text-center text-[var(--foreground)]/70">
            上传一张自然光下的素颜照，AI 将为你初步分析季型与适配色彩。
          </p>
          <ComingSoon note="线上诊断功能将在后续阶段上线" />
        </section>

        {/* 评论区 */}
        <section id="reviews" className="py-20">
          <SectionTitle en="Reviews" zh="顾客评论" />
          <p className="mx-auto mt-6 max-w-xl text-center text-[var(--foreground)]/70">
            真实顾客的诊断体验与反馈，将在这里展示。
          </p>
          <ComingSoon note="评论区功能将在后续阶段上线" />
        </section>

        {/* 预约流程 */}
        <section className="py-20">
          <SectionTitle en="Process" zh="预约流程" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <div
                key={p.step}
                className="rounded-3xl bg-white/70 p-7 text-center shadow-sm ring-1 ring-[var(--pink-soft)]"
              >
                <p className="serif text-3xl text-[var(--pink)]">{p.step}</p>
                <p className="mt-2 font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-[var(--foreground)]/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 门店地址 */}
        <section id="contact" className="py-20">
          <SectionTitle en="Contact" zh="门店地址" />
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl bg-white/70 p-8 text-center shadow-sm ring-1 ring-[var(--pink-soft)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-10 w-10 text-[var(--pink-deep)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <p className="mt-4 text-lg font-semibold">
              广州市天河区 华强路2号 富力盈丰大厦A座 3楼336室
            </p>
            <p className="mt-2 text-sm text-[var(--foreground)]/70">
              营业时间：11:00 - 18:00
            </p>
            <a
              href="https://map.baidu.com/search/%E5%B9%BF%E5%B7%9E%E5%B8%82%E5%A4%A9%E6%B2%B3%E5%8C%BA%E5%8D%8E%E5%BC%BA%E8%B7%AF2%E5%8F%B7%E5%AF%8C%E5%8A%9B%E7%9B%88%E4%B8%B0%E5%A4%A7%E5%8E%A6A%E5%BA%203%E6%A5%BC336%E5%AE%A4"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full bg-[var(--pink-deep)] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              查看地图
            </a>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="mt-10 border-t border-[var(--pink-soft)] bg-[var(--pink-soft)]/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-12 text-center">
          <Image src="/logo-icon.png" alt="Coco Color" width={48} height={48} />
          <p className="font-semibold tracking-wide">{content.brand.title} · {content.brand.subtitle}</p>
          <p className="text-sm text-[var(--foreground)]/60">
            预约请通过线上沟通 · 现场到店诊断
          </p>
          <p className="mt-2 text-xs text-[var(--foreground)]/40">
            © 2026 Coco Color Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
