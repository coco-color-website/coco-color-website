"use client";

import { useState } from "react";
import Link from "next/link";

interface CocoAccessGateProps {
  onSuccess: (token: string) => void;
}

export default function CocoAccessGate({ onSuccess }: CocoAccessGateProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/aicoco/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "登录失败");
      }

      if (!data.token) {
        throw new Error("登录失败，未返回 token");
      }

      localStorage.setItem("coco_access_token", data.token);
      onSuccess(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[var(--pink-soft)]">
        <h2 className="text-center text-xl font-semibold text-[var(--pink-deep)]">
          COCO 主理人分身
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--foreground)]/60">
          会员专属，请先登录
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-[var(--foreground)]/70">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例如 coco123"
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-[var(--pink-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--pink-deep)]"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--foreground)]/70">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-[var(--pink-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--pink-deep)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full rounded-xl bg-[var(--pink-deep)] py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "登录中…" : "登录"}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
        </form>

        <div className="mt-5 border-t border-[var(--pink-soft)] pt-5 text-center">
          <p className="text-sm text-[var(--foreground)]/60">
            还没有账号？
          </p>
          <Link
            href="/activate"
            className="mt-2 inline-block text-sm font-medium text-[var(--pink-deep)] hover:underline"
          >
            使用授权码激活 →
          </Link>
        </div>
      </div>
    </div>
  );
}
