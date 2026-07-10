import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "色彩诊断视频 · Coco Color",
  description:
    "Coco Color 色彩诊断真实视频记录，直观感受专业色彩诊断带来的改变。",
};

const videos = [
  {
    title: "色彩诊断实录 1",
    desc: "真实客户的色彩诊断过程记录。",
    url: "https://2122308406-space-xangho.vod.cn-north-1.volcvideo.com/7a8e528319f32c3b4341c8679ab1b9d0.mp4?preview=1&auth_key=1783509242-51eae77a9e-0-d8fa4e97563786847ea65bf8d4213c53",
  },
  {
    title: "色彩诊断实录 2",
    desc: "真实客户的色彩诊断过程记录。",
    url: "https://2122308406-space-xangho.vod.cn-north-1.volcvideo.com/b1ed752c20b80689588ef6cf0d88b5a3.mp4?preview=1&auth_key=1783509251-414e599987-0-ef10cc4cd0929149259ff0b347a17bc4",
  },
  {
    title: "色彩诊断实录 3",
    desc: "真实客户的色彩诊断过程记录。",
    url: "https://2122308406-space-xangho.vod.cn-north-1.volcvideo.com/4ed7618962d8be3bb72d38763773f619.mp4?preview=1&auth_key=1783506369-d0663eccfd-0-dd10055dbb64cb9f9a45a4f09fba4d97",
  },
  {
    title: "色彩诊断实录 4",
    desc: "真实客户的色彩诊断过程记录。",
    url: "https://2122308406-space-xangho.vod.cn-north-1.volcvideo.com/d1d881a93b6505e0a00b604f8ff217d5.mp4?preview=1&auth_key=1783507926-d2d3f95035-0-6b09da5b291d0ebea3ec5ce5acd85e0a",
  },
  {
    title: "色彩诊断实录 5",
    desc: "真实客户的色彩诊断过程记录。",
    url: "https://2122308406-space-xangho.vod.cn-north-1.volcvideo.com/51831c0c0252b891534118424eac0faa.mp4?preview=1&auth_key=1783507940-5e456f5dde-0-a011776a29a0902dd0f2f90d120dd631",
  },
];

export default function VideosPage() {
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
          <span className="font-semibold tracking-wide">色彩诊断视频</span>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16">
        {/* 标题区 */}
        <div className="text-center">
          <h1 className="serif text-4xl uppercase text-[var(--pink-deep)] sm:text-5xl">
            Videos
          </h1>
          <p className="mt-3 text-lg font-medium text-[var(--foreground)]">
            色彩诊断视频
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[var(--foreground)]/70">
            真实客户的色彩诊断过程与效果记录，直观感受专业诊断带来的改变。
          </p>
          <div className="mx-auto mt-5 h-px w-16 bg-[var(--pink)]" />
        </div>

        {/* 视频网格 */}
        <section className="mt-16">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl bg-white/70 p-1.5 shadow-sm ring-1 ring-[var(--pink-soft)]"
              >
                <video
                  src={video.url}
                  controls
                  preload="metadata"
                  className="w-full rounded-xl bg-black"
                />
                <div className="px-3 pb-3 pt-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {video.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 预约诊断 */}
        <section className="mt-20 text-center">
          <div className="mx-auto max-w-2xl rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-[var(--pink-soft)]">
            <p className="text-lg font-semibold">想体验同样的诊断？</p>
            <p className="mt-2 text-sm text-[var(--foreground)]/70">
              广州市天河区 华强路2号 富力盈丰大厦A座 3楼336室
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
