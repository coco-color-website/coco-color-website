// 本地 seed 脚本：把 QA 卡片写入 Supabase 向量库
// 用法：node scripts/seed-qa-cards.js

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "coco2026";
const PORT = process.env.PORT || "3002";

async function main() {
  const res = await fetch(
    `http://localhost:${PORT}/api/admin/seed-qa-cards`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: ADMIN_PASSWORD }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Seed failed:");
    console.error("Status:", res.status);
    console.error("Response:", data);
    process.exit(1);
  }

  console.log("Seed success:");
  console.log(data);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
