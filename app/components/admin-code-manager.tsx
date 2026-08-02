"use client";

import { useEffect, useState } from "react";

interface CodeRecord {
  id: string;
  code: string;
  service_days: number;
  term: string | null;
  note: string | null;
  is_active: boolean;
  created_at: string;
  activated_at: string | null;
}

interface AdminCodeManagerProps {
  adminPassword: string;
}

export default function AdminCodeManager({ adminPassword }: AdminCodeManagerProps) {
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [count, setCount] = useState(10);
  const [serviceDays, setServiceDays] = useState(365);
  const [term, setTerm] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCodes();
  }, []);

  async function fetchCodes() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/codes", {
        headers: { "x-admin-password": adminPassword },
      });
      const data = await res.json();
      if (res.ok) {
        setCodes(data.codes || []);
      } else {
        setError(data.error || "获取授权码失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取授权码失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (generating) return;

    setGenerating(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({
          count: Number(count),
          serviceDays: Number(serviceDays),
          term: term.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const newCodes = data.codes || [];
        setCodes((prev) => [...newCodes, ...prev]);
        setMessage(`成功生成 ${newCodes.length} 个授权码`);
        setCount(10);
        setTerm("");
        setNote("");
      } else {
        setError(data.error || "生成失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("zh-CN");
  }

  return (
    <div className="space-y-8">
      {/* 生成表单 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[var(--pink-soft)]">
        <h2 className="mb-4 font-semibold">生成授权码</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm">生成数量</label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
              />
              <p className="mt-1 text-xs text-[var(--foreground)]/50">一次最多 100 个</p>
            </div>
            <div>
              <label className="text-sm">服务天数</label>
              <input
                type="number"
                min={1}
                value={serviceDays}
                onChange={(e) => setServiceDays(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
              />
            </div>
            <div>
              <label className="text-sm">期次 / 批次</label>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="例如 2026 春季班"
                className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
              />
            </div>
            <div>
              <label className="text-sm">备注</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="内部备注"
                className="mt-1 w-full rounded-lg border border-[var(--pink-soft)] px-3 py-2 outline-none focus:border-[var(--pink-deep)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={generating}
              className="rounded-xl bg-[var(--pink-deep)] px-6 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {generating ? "生成中..." : "生成授权码"}
            </button>
            <button
              type="button"
              onClick={fetchCodes}
              disabled={loading}
              className="rounded-xl border border-[var(--pink-soft)] px-6 py-2 text-sm transition hover:bg-[var(--pink-soft)]/30 disabled:opacity-50"
            >
              {loading ? "刷新中..." : "刷新列表"}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>

      {/* 授权码列表 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[var(--pink-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">授权码列表</h2>
          <span className="text-sm text-[var(--foreground)]/60">
            共 {codes.length} 个
          </span>
        </div>

        {loading && codes.length === 0 ? (
          <p className="text-center text-sm text-[var(--foreground)]/60">加载中...</p>
        ) : codes.length === 0 ? (
          <p className="text-center text-sm text-[var(--foreground)]/60">
            还没有授权码，请先生成一批。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--pink-soft)] text-[var(--foreground)]/60">
                  <th className="py-3 pr-4 font-medium">授权码</th>
                  <th className="py-3 pr-4 font-medium">服务天数</th>
                  <th className="py-3 pr-4 font-medium">期次</th>
                  <th className="py-3 pr-4 font-medium">备注</th>
                  <th className="py-3 pr-4 font-medium">状态</th>
                  <th className="py-3 pr-4 font-medium">激活时间</th>
                  <th className="py-3 font-medium">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr
                    key={code.id}
                    className="border-b border-[var(--pink-soft)]/50 last:border-0"
                  >
                    <td className="py-3 pr-4 font-mono font-medium">{code.code}</td>
                    <td className="py-3 pr-4">{code.service_days}</td>
                    <td className="py-3 pr-4">{code.term || "—"}</td>
                    <td className="py-3 pr-4">{code.note || "—"}</td>
                    <td className="py-3 pr-4">
                      {code.activated_at ? (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          已激活
                        </span>
                      ) : code.is_active ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          未使用
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                          已禁用
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-[var(--foreground)]/60">
                      {formatDate(code.activated_at)}
                    </td>
                    <td className="py-3 text-[var(--foreground)]/60">
                      {formatDate(code.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
