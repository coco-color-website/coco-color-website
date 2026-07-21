// 本地 seed 脚本（已改为兼容提示）
// 当前 QA 卡片使用本地 JSON + 关键词匹配，无需写入 Supabase 向量库。
// 如需更新卡片，请直接修改 data/qa-cards.json 后重新部署。
//
// 用法：node scripts/seed-qa-cards.js

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "coco2026";
const PORT = process.env.PORT || "3002";

async function main() {
  const res = await fetch(`http://localhost:${PORT}/api/admin/seed-qa-cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Seed check failed:");
    console.error("Status:", res.status);
    console.error("Response:", data);
    process.exit(1);
  }

  console.log("QA 卡片模式：", data.mode);
  console.log("卡片数量：", data.count);
  console.log("提示：", data.message);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
