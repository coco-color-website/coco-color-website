"use client";

import { useEffect, useState } from "react";

interface Service {
  en: string;
  zh: string;
  desc: string;
  price: number;
}

interface DetailGroup {
  en: string;
  zh: string;
  items: string[];
}

interface SiteContent {
  brand: {
    title: string;
    subtitle: string;
    heroText: string;
  };
  teacher: {
    name: string;
    role: string;
    bio: string[];
  };
  services: Service[];
  details: DetailGroup[];
}

const emptyContent: SiteContent = {
  brand: { title: "", subtitle: "", heroText: "" },
  teacher: { name: "", role: "", bio: ["", ""] },
  services: [],
  details: [],
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [content, setContent] = useState<SiteContent>(emptyContent);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loggedIn) {
      fetchContent();
    }
  }, [loggedIn]);

  async function fetchContent() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (res.ok) {
        setContent(data);
      } else {
        setMessage(`读取失败：${data.error}`);
      }
    } catch (err) {
      setMessage(`读取失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setLoggedIn(true);
      localStorage.setItem("admin-password", password);
    } else {
      setMessage(data.error || "登录失败");
    }
  }

  async function handleSave() {
    setLoading(true);
    setMessage("");
    try {
      const stored = localStorage.getItem("admin-password") || password;
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": stored,
        },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("保存成功！网站将在 1～2 分钟后自动更新。");
      } else {
        setMessage(`保存失败：${data.error}`);
      }
    } catch (err) {
      setMessage(`保存失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  function updateBrand(field: keyof SiteContent["brand"], value: string) {
    setContent((c) => ({ ...c, brand: { ...c.brand, [field]: value } }));
  }

  function updateTeacher(field: keyof SiteContent["teacher"], value: string) {
    setContent((c) => ({ ...c, teacher: { ...c.teacher, [field]: value } }));
  }

  function updateTeacherBio(index: number, value: string) {
    setContent((c) => {
      const bio = [...c.teacher.bio];
      bio[index] = value;
      return { ...c, teacher: { ...c.teacher, bio } };
    });
  }

  function updateService(index: number, field: keyof Service, value: string) {
    setContent((c) => {
      const services = [...c.services];
      services[index] = {
        ...services[index],
        [field]: field === "price" ? Number(value) || 0 : value,
      };
      return { ...c, services };
    });
  }

  function updateDetailItem(gIndex: number, iIndex: number, value: string) {
    setContent((c) => {
      const details = [...c.details];
      const items = [...details[gIndex].items];
      items[iIndex] = value;
      details[gIndex] = { ...details[gIndex], items };
      return { ...c, details };
    });
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[var(--pink-soft)]"
        >
          <h1 className="text-center text-xl font-semibold">Coco Color 管理后台</h1>
          <p className="mt-2 text-center text-sm text-[var(--foreground)]/60">
            请输入管理密码
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-5 w-full rounded-xl border border-[var(--pink)] px-4 py-2.5 outline-none focus:border-[var(--pink-deep)]"
            placeholder="密码"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-[var(--pink-deep)] py-2.5 font-medium text-white transition hover:opacity-90"
          >
            登录
          </button>
          {message && (
            <p className="mt-3 text-center text-sm text-red-500">{message}</p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Coco Color 管理后台</h1>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-[var(--pink-deep)] px-6 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存并发布"}
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-[var(--pink-soft)] p-4 text-sm text-[var(--pink-deep)]">
            {message}
          </div>
        )}

        {loading && content.services.length === 0 ? (
          <p className="text-center text-sm text-[var(--foreground)]/60">加载中...</p>
        ) : (
          <div className="space-y-8">
            {/* 品牌文案 */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[var(--pink-soft)]">
              <h2 className="mb-4 font-semibold">首页品牌文案</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">品牌标题</label>
                  <input
                    value={content.brand.title}
                    onChange={(e) => updateBrand("title", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                  />
                </div>
                <div>
                  <label className="text-sm">副标题</label>
                  <input
                    value={content.brand.subtitle}
                    onChange={(e) => updateBrand("subtitle", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                  />
                </div>
                <div>
                  <label className="text-sm">Hero 介绍文字</label>
                  <textarea
                    value={content.brand.heroText}
                    onChange={(e) => updateBrand("heroText", e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                  />
                </div>
              </div>
            </section>

            {/* 老师介绍 */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[var(--pink-soft)]">
              <h2 className="mb-4 font-semibold">诊断老师</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">名字</label>
                    <input
                      value={content.teacher.name}
                      onChange={(e) => updateTeacher("name", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm">头衔</label>
                    <input
                      value={content.teacher.role}
                      onChange={(e) => updateTeacher("role", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                    />
                  </div>
                </div>
                {content.teacher.bio.map((text, i) => (
                  <div key={i}>
                    <label className="text-sm">介绍段落 {i + 1}</label>
                    <textarea
                      value={text}
                      onChange={(e) => updateTeacherBio(i, e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 诊断项目 */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[var(--pink-soft)]">
              <h2 className="mb-4 font-semibold">诊断项目</h2>
              <div className="space-y-5">
                {content.services.map((s, i) => (
                  <div key={s.en} className="rounded-xl bg-[var(--pink-soft)]/30 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs">英文标识</label>
                        <input
                          value={s.en}
                          onChange={(e) => updateService(i, "en", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs">中文名称</label>
                        <input
                          value={s.zh}
                          onChange={(e) => updateService(i, "zh", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs">简介</label>
                      <input
                        value={s.desc}
                        onChange={(e) => updateService(i, "desc", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                      />
                    </div>
                    <div className="mt-3">
                      <label className="text-xs">价格（元）</label>
                      <input
                        type="number"
                        value={s.price}
                        onChange={(e) => updateService(i, "price", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 诊断明细 */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[var(--pink-soft)]">
              <h2 className="mb-4 font-semibold">诊断明细</h2>
              <div className="space-y-6">
                {content.details.map((g, gi) => (
                  <div key={g.en} className="rounded-xl bg-[var(--pink-soft)]/30 p-4">
                    <p className="font-medium">{g.zh}（{g.en}）</p>
                    <div className="mt-3 space-y-2">
                      {g.items.map((item, ii) => (
                        <input
                          key={ii}
                          value={item}
                          onChange={(e) => updateDetailItem(gi, ii, e.target.value)}
                          className="w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--pink-deep)]"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
