import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Database, SqlJsStatic } from "sql.js";
import type { QACard } from "./qa-cards";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const DB_PATH = path.join(projectRoot, "data", "qa-vectors.sqlite");

let db: Database | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  // sql.js 是 UMD 模块，在 Next.js 打包环境下静态导入可能出错，
  // 用动态导入可以更稳定地拿到 default export（即 initSqlJs 函数）。
  const sqlModule = (await import("sql.js")) as unknown as {
    default: () => Promise<SqlJsStatic>;
  };
  return sqlModule.default();
}

async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await getSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // 创建表（如果不存在）
  db.run(`
    CREATE TABLE IF NOT EXISTS qa_cards (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer_points TEXT NOT NULL,
      test_target TEXT NOT NULL,
      embedding TEXT NOT NULL
    )
  `);

  return db;
}

/**
 * 保存或更新 QA 卡片及其向量。
 */
export async function upsertQACards(
  cards: QACard[],
  embeddings: number[][]
): Promise<void> {
  const database = await getDb();

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO qa_cards (id, category, question, answer_points, test_target, embedding)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < cards.length; i++) {
    stmt.run([
      cards[i].id,
      cards[i].category,
      cards[i].question,
      JSON.stringify(cards[i].answer_points),
      cards[i].test_target,
      JSON.stringify(embeddings[i]),
    ]);
  }

  stmt.free();

  // 持久化到文件
  const data = database.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * 加载所有卡片和向量。
 */
export async function loadQACardsWithEmbeddings(): Promise<
  Array<QACard & { embedding: number[] }>
> {
  const database = await getDb();

  const stmt = database.prepare("SELECT * FROM qa_cards");
  const results: Array<QACard & { embedding: number[] }> = [];

  while (stmt.step()) {
    const row = stmt.getAsObject() as {
      id: string;
      category: string;
      question: string;
      answer_points: string;
      test_target: string;
      embedding: string;
    };

    results.push({
      id: row.id,
      category: row.category,
      question: row.question,
      answer_points: JSON.parse(row.answer_points),
      test_target: row.test_target,
      embedding: JSON.parse(row.embedding),
    });
  }

  stmt.free();
  return results;
}

/**
 * 检查数据库中是否已有卡片。
 */
export async function hasQACards(): Promise<boolean> {
  const database = await getDb();
  const stmt = database.prepare("SELECT COUNT(*) as count FROM qa_cards");
  stmt.step();
  const row = stmt.getAsObject() as { count: number };
  stmt.free();
  return row.count > 0;
}
