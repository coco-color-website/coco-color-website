import Image from "next/image";

const navItems = [
  { href: "#brand", label: "品牌介绍" },
  { href: "#teacher", label: "诊断老师" },
  { href: "#projects", label: "诊断项目" },
  { href: "#details", label: "诊断明细" },
  { href: "#ask", label: "AICOCO 答疑" },
  { href: "#test", label: "线上诊断" },
  { href: "#reviews", label: "评论区" },
];

const detailGroups = [
  {
    en: "BASIC",
    zh: "基础色彩诊断",
    items: [
      "讲解色彩诊断知识",
      "肤色测量仪诊断肤色",
      "服装色彩诊断【经典八季型定基调】",
      "首饰适配材质诊断",
      "适配发色推荐",
      "现有化妆包筛查 + 适配彩妆推荐",
      "实体纸质诊断报告 / 随身购物参考色卡 / PDF 电子存档报告",
    ],
  },
  {
    en: "PLUS",
    zh: "进阶色彩诊断",
    items: [
      "讲解十二季型与十六季型色彩理论",
      "在经典八季型基础上深入冷暖、明度、纯度三维分析",
      "定位个人专属季型，避免简单「春/夏/秋/冬」一刀切",
      "服装用色范围与禁区色明确标注",
      "眼影、腮红、唇色适配推荐",
      "日常通勤妆与约会/聚会场合妆容区分设计",
      "个人色彩与衣橱单品匹配建议",
      "适配发色与挑染方案建议",
      "首饰材质与配色进阶搭配",
      "季节性衣橱胶囊搭配思路",
      "电子诊断报告 + 随身参考色卡",
      "诊断后 7 日线上答疑跟进",
    ],
  },
  {
    en: "ADVANCED",
    zh: "高阶色彩诊断",
    items: [
      "讲解色彩诊断知识",
      "肤色测量仪诊断肤色",
      "二十一季型色彩定位诊断",
      "骨骼体型诊断",
      "服装色彩诊断",
      "首饰适配材质诊断",
      "适配发色推荐",
      "现有化妆包筛查 + 适配彩妆推荐",
      "美瞳颜色推荐",
      "美甲颜色推荐",
      "纹绣颜色推荐",
      "医美项目推荐",
      "个人形象设计报告",
      "永久线上答疑",
    ],
  },
  {
    en: "BODY",
    zh: "骨骼体型诊断",
    items: [
      "骨骼、肌肉、脂肪三维度体型分析",
      "判断直线型 / 曲线型 / 自然型骨架",
      "肩、背、腰、臀线条比例测量",
      "适合的面料、廓形、图案推荐",
      "H 型 / A 型 / X 型 / O 型外套适配",
      "领型、袖型、裤型适配建议",
      "裙长、腰线与视觉比例平衡法则",
      "鞋包配饰与体型平衡建议",
      "腰臀比优化与显瘦穿搭策略",
      "日常穿搭避雷指南",
      "配饰点位：项链、耳环、腰带建议",
      "四季必备单品购物清单",
      "整体形象设计方案 PDF 报告",
    ],
  },
];

const services = [
  { en: "BASIC", zh: "基础色彩测试", desc: "经典八季型定基调，快速了解自身适配色。" },
  { en: "PLUS", zh: "进阶色彩测试", desc: "在八季型基础上细分，色彩判断更精准。" },
  { en: "ADVANCED", zh: "高阶色彩测试", desc: "二十一季型深度诊断，全维度色彩适配。" },
  { en: "BODY", zh: "骨骼体型诊断", desc: "分析骨骼与体型，定制整体形象设计方案。" },
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

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-[var(--pink-soft)] bg-[var(--background)]/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#top" className="flex items-center gap-2.5">
            <Image src="/logo-icon.png" alt="Coco Color" width={48} height={48} />
            <span className="flex flex-col leading-tight">
              <span className="font-semibold tracking-wide">Coco Color</span>
              <span className="text-[11px] text-[var(--foreground)]/60">
                色彩诊断 · 整体形象设计
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
            色彩诊断 · 整体形象设计
          </p>
          <p className="mt-6 max-w-xl text-[var(--foreground)]/75">
            韩国一站式全套形象诊断体系，用专业的色彩科学，
            找到最适合你的颜色、妆容与风格。
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
              Coco Color 专注色彩诊断与整体形象设计，提供从肤色诊断、服装色彩、
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
          <SectionTitle en="Stylist" zh="诊断老师" />
          <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl shadow-sm ring-1 ring-[var(--pink-soft)]">
              <Image
                src="/coco.jpg"
                alt="主理人 COCO 老师"
                width={600}
                height={750}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <p className="serif text-2xl text-[var(--pink-deep)]">COCO</p>
              <p className="text-sm tracking-widest text-[var(--foreground)]/60">
                主理人 · 资深形象顾问
              </p>
              <p className="leading-relaxed text-[var(--foreground)]/80">
                COCO 老师拥有韩国系统的形象设计训练背景，累计完成数千例色彩与
                形象诊断，擅长结合东方肤色特点，给出真正可落地的色彩与造型建议。
              </p>
              <p className="leading-relaxed text-[var(--foreground)]/80">
                每一位顾客都由老师现场亲自诊断，确保结果精准、贴合个人气质。
              </p>
            </div>
          </div>
        </section>

        {/* 诊断项目 */}
        <section id="projects" className="py-20">
          <SectionTitle en="Service" zh="诊断项目" />
          <p className="mt-6 text-center text-xs text-[var(--foreground)]/50">
            ↕ 区域内上下滑动查看全部项目
          </p>
          <div className="mx-auto mt-5 max-w-2xl">
            <div className="h-[360px] snap-y snap-mandatory space-y-5 overflow-y-auto rounded-3xl pr-2">
              {services.map((s, i) => (
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
            {detailGroups.map((g, idx) => (
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
            未来你可以在这里向 AICOCO 提问任何关于色彩、穿搭与妆容的问题，
            获得即时解答。
          </p>
          <ComingSoon note="AI 答疑功能将在下一阶段上线" />
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
      </main>

      {/* 页脚 */}
      <footer className="mt-10 border-t border-[var(--pink-soft)] bg-[var(--pink-soft)]/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-12 text-center">
          <Image src="/logo-icon.png" alt="Coco Color" width={48} height={48} />
          <p className="font-semibold tracking-wide">Coco Color · 色彩诊断 · 整体形象设计</p>
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
