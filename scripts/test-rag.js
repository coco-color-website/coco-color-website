// 临时测试：验证本地关键词匹配召回效果
// 运行：node scripts/test-rag.js

const fs = require("fs");
const path = require("path");

const cardsPath = path.join(__dirname, "..", "data", "qa-cards.json");
const cards = JSON.parse(fs.readFileSync(cardsPath, "utf-8"));

const STOP_WORDS = new Set([
  "的", "了", "是", "在", "我", "有", "和", "就", "不", "人", "都", "一",
  "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有",
  "看", "好", "自己", "这", "那", "之", "与", "及", "或", "但", "而", "如果",
]);

function tokenize(text) {
  const normalized = text
    .toLowerCase()
    .replace(/[，。！？、；：“”‘’（）【】\"',.!?;:\[\]()]/g, " ")
    .trim();

  const tokens = [];
  for (const char of normalized) {
    if (/[一-龥]/.test(char) && !STOP_WORDS.has(char)) {
      tokens.push(char);
    }
  }

  const words = normalized
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9一-龥]/g, ""))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  return Array.from(new Set([...tokens, ...words]));
}

function scoreCard(queryTokens, card) {
  if (queryTokens.length === 0) return 0;

  const questionTokens = tokenize(card.question);
  const categoryTokens = tokenize(card.category);
  const answerTokens = tokenize(card.answer_points.join("\n"));

  let rawScore = 0;
  let maxPossible = 0;

  for (const token of queryTokens) {
    const weight = 3;
    maxPossible += weight;
    if (questionTokens.includes(token)) rawScore += weight;
    else if (categoryTokens.includes(token)) rawScore += 2;
    else if (answerTokens.includes(token)) rawScore += 1;
  }

  const normalized = Math.min(1, rawScore / maxPossible);
  return Math.round(normalized * 100) / 100;
}

function retrieveCardsForQuestion(question, options = {}) {
  const { limit = 3, threshold = 0.1 } = options;
  const queryTokens = tokenize(question);

  if (queryTokens.length === 0) {
    return [];
  }

  return cards
    .map((card) => ({ ...card, similarity: scoreCard(queryTokens, card) }))
    .filter((card) => card.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

const testQueries = [
  "我想预约 COCO 主理人的高阶色彩测试，多少钱？",
  "我皮肤偏黄，是不是就是秋季型？",
  "直线型和曲线型骨骼，在选领口上有什么区别？",
  "我刚做完诊断，但是不知道该怎么开始改变形象",
  "老师你今天心情怎么样？",
];

for (const query of testQueries) {
  console.log("\n====================================");
  console.log("提问：", query);
  const results = retrieveCardsForQuestion(query, { limit: 2, threshold: 0.1 });
  if (results.length === 0) {
    console.log("未召回卡片");
  } else {
    for (const card of results) {
      console.log(`- [${card.id}] 相似度 ${card.similarity} | ${card.question}`);
    }
  }
}
