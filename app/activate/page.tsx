"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "coco_access_token";

export default function ActivatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function formatCode(value: string): string {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length <= 4) return cleaned;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCode(formatCode(e.target.value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "激活失败");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setSuccess(true);

      // 2 秒后跳转到 COCO 分身
      setTimeout(() => {
        router.push("/aicoco?persona=coco");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "激活失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-[var(--pink-soft)]">
        <h1 className="text-center text-xl font-semibold text-[var(--pink-deep)]">
          激活 COCO 主理人分身
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--foreground)]/60">
          输入授权码，设置你的登录账号
        </p>

        {success ? (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-center text-sm text-green-700">
            <p className="font-medium">🎉 激活成功！</p>
            <p className="mt-1">正在进入 COCO 主理人分身…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-[var(--foreground)]/70">
                授权码
              </label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="XXXX-XXXX"
                maxLength={9}
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-[var(--pink-soft)] px-4 py-2.5 text-sm uppercase tracking-widest outline-none focus:border-[var(--pink-deep)]"
              />
            </div>

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
              <p className="mt-1 text-xs text-[var(--foreground)]/50">
                3-20 位字母或数字
              </p>
            </div>

            <div>
              <label className="block text-sm text-[var(--foreground)]/70">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-[var(--pink-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--pink-deep)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--foreground)]/70">
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-[var(--pink-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--pink-deep)]"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                code.length < 9 ||
                !username.trim() ||
                !password ||
                !confirmPassword
              }
              className="w-full rounded-xl bg-[var(--pink-deep)] py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "激活中…" : "激活并登录"}
            </button>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
