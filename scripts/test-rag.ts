// 测试：验证本地向量召回效果
// 运行：npx tsx scripts/test-rag.ts

import { retrieveCardsForQuestion, getEmbeddingConfig } from "../lib/rag";

const testQueries = [
  "我想预约 COCO 主理人的高阶色彩测试，多少钱？",
  "我皮肤偏黄，是不是就是秋季型？",
  "直线型和曲线型骨骼，在选领口上有什么区别？",
  "我刚做完诊断，但是不知道该怎么开始改变形象",
  "老师你今天心情怎么样？",
  "韩妆风格适合我吗？",
  "到店诊断前要准备什么？",
  "基础测试和进阶测试有什么区别？",
  "骨骼诊断和色彩诊断是一回事吗？",
  "春季型适合什么口红？",
];

async function main() {
  console.log("Embedding 配置：", getEmbeddingConfig());
  console.log("\n开始测试召回...\n");

  for (const query of testQueries) {
    console.log("====================================");
    console.log("提问：", query);
    try {
      const results = await retrieveCardsForQuestion(query, {
        limit: 2,
        threshold: 0.5,
      });
      if (results.length === 0) {
        console.log("未召回卡片");
      } else {
        for (const card of results) {
          console.log(
            `- [${card.id}] 相似度 ${card.similarity} | ${card.question}`
          );
        }
      }
    } catch (err) {
      console.error("召回失败：", err instanceof Error ? err.message : err);
    }
  }
}

main().catch((err) => {
  console.error("测试失败：", err);
  process.exit(1);
});
