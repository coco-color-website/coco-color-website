"use client";

import { useEffect, useState } from "react";

interface Service {
  en: string;
  zh: string;
  desc: string;
  duration: string;
  price: Record<string, number>;
}

interface DetailGroup {
  en: string;
  zh: string;
  items: string[];
}

interface Teacher {
  name: string;
  role: string;
  image: string;
  bio: string[];
}

interface SiteContent {
  brand: {
    title: string;
    subtitle: string;
    heroText: string;
  };
  teachers: Teacher[];
  services: Service[];
  details: DetailGroup[];
}

const emptyContent: SiteContent = {
  brand: { title: "", subtitle: "", heroText: "" },
  teachers: [{ name: "", role: "", image: "", bio: [""] }],
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

  function updateTeacher(
    index: number,
    field: keyof Teacher,
    value: string
  ) {
    setContent((c) => {
      const teachers = [...c.teachers];
      teachers[index] = { ...teachers[index], [field]: value };
      return { ...c, teachers };
    });
  }

  function updateTeacherBio(teacherIndex: number, bioIndex: number, value: string) {
    setContent((c) => {
      const teachers = [...c.teachers];
      const bio = [...teachers[teacherIndex].bio];
      bio[bioIndex] = value;
      teachers[teacherIndex] = { ...teachers[teacherIndex], bio };
      return { ...c, teachers };
    });
  }

  function addTeacherBioRow(teacherIndex: number) {
    setContent((c) => {
      const teachers = [...c.teachers];
      const bio = [...teachers[teacherIndex].bio, ""];
      teachers[teacherIndex] = { ...teachers[teacherIndex], bio };
      return { ...c, teachers };
    });
  }

  function removeTeacherBioRow(teacherIndex: number, bioIndex: number) {
    setContent((c) => {
      const teachers = [...c.teachers];
      const bio = teachers[teacherIndex].bio.filter((_, i) => i !== bioIndex);
      teachers[teacherIndex] = { ...teachers[teacherIndex], bio };
      return { ...c, teachers };
    });
  }

  function updateService(index: number, field: keyof Omit<Service, "price">, value: string) {
    setContent((c) => {
      const services = [...c.services];
      services[index] = { ...services[index], [field]: value };
      return { ...c, services };
    });
  }

  function updateServicePrice(index: number, teacher: string, value: string) {
    setContent((c) => {
      const services = [...c.services];
      const price = { ...services[index].price };
      const num = Number(value);
      if (value === "" || Number.isNaN(num) || num <= 0) {
        delete price[teacher];
      } else {
        price[teacher] = num;
      }
      services[index] = { ...services[index], price };
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

  function addDetailItem(gIndex: number) {
    setContent((c) => {
      const details = [...c.details];
      const items = [...details[gIndex].items, ""];
      details[gIndex] = { ...details[gIndex], items };
      return { ...c, details };
    });
  }

  function removeDetailItem(gIndex: number, iIndex: number) {
    setContent((c) => {
      const details = [...c.details];
      const items = details[gIndex].items.filter((_, i) => i !== iIndex);
      details[gIndex] = { ...details[gIndex], items };
      return { ...c, details };
    });
  }

  function moveDetailItem(gIndex: number, iIndex: number, direction: -1 | 1) {
    setContent((c) => {
      const details = [...c.details];
      const items = [...details[gIndex].items];
      const target = iIndex + direction;
      if (target < 0 || target >= items.length) return c;
      [items[iIndex], items[target]] = [items[target], items[iIndex]];
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
              <div className="space-y-6">
                {content.teachers.map((teacher, ti) => (
                  <div key={ti} className="rounded-xl bg-[var(--pink-soft)]/30 p-4">
                    <p className="mb-3 text-sm font-medium">老师 {ti + 1}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs">名字</label>
                        <input
                          value={teacher.name}
                          onChange={(e) => updateTeacher(ti, "name", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs">头衔</label>
                        <input
                          value={teacher.role}
                          onChange={(e) => updateTeacher(ti, "role", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs">照片路径</label>
                      <input
                        value={teacher.image}
                        onChange={(e) => updateTeacher(ti, "image", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                      />
                    </div>
                    {teacher.bio.map((text, i) => (
                      <div key={i} className="mt-3">
                        <div className="mb-1 flex items-center justify-between">
                          <label className="text-xs">介绍段落 {i + 1}</label>
                          <button
                            type="button"
                            onClick={() => removeTeacherBioRow(ti, i)}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            删除此行
                          </button>
                        </div>
                        <textarea
                          value={text}
                          onChange={(e) => updateTeacherBio(ti, i, e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTeacherBioRow(ti)}
                      className="mt-3 w-full rounded-lg border border-dashed border-[var(--pink-deep)] py-2 text-sm text-[var(--pink-deep)] transition hover:bg-[var(--pink-soft)]/30"
                    >
                      + 添加介绍段落
                    </button>
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
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs">时长</label>
                        <input
                          value={s.duration}
                          onChange={(e) => updateService(i, "duration", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                        />
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      {content.teachers.map((teacher) => (
                        <div key={teacher.name}>
                          <label className="text-xs">{teacher.name} 价格（元）</label>
                          <input
                            type="number"
                            value={s.price[teacher.name] ?? ""}
                            onChange={(e) => updateServicePrice(i, teacher.name, e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
                          />
                        </div>
                      ))}
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
                        <div key={ii} className="flex items-center gap-2">
                          <input
                            value={item}
                            onChange={(e) => updateDetailItem(gi, ii, e.target.value)}
                            className="flex-1 rounded-lg border border-[var(--pink-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--pink-deep)]"
                          />
                          <button
                            type="button"
                            onClick={() => moveDetailItem(gi, ii, -1)}
                            disabled={ii === 0}
                            title="上移"
                            className="rounded-lg border border-[var(--pink-soft)] px-2 py-2 text-sm text-[var(--pink-deep)] transition hover:bg-[var(--pink-soft)]/40 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDetailItem(gi, ii, 1)}
                            disabled={ii === g.items.length - 1}
                            title="下移"
                            className="rounded-lg border border-[var(--pink-soft)] px-2 py-2 text-sm text-[var(--pink-deep)] transition hover:bg-[var(--pink-soft)]/40 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDetailItem(gi, ii)}
                            title="删除此条"
                            className="rounded-lg border border-red-200 px-2 py-2 text-sm text-red-500 transition hover:bg-red-50"
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addDetailItem(gi)}
                      className="mt-3 w-full rounded-lg border border-dashed border-[var(--pink-deep)] py-2 text-sm text-[var(--pink-deep)] transition hover:bg-[var(--pink-soft)]/30"
                    >
                      + 添加一条明细
                    </button>
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
