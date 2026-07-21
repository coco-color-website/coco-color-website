# QA 卡片向量 RAG（Doubao Embedding + SQLite）

本说明用于配置基于火山方舟 Doubao Embedding API 和 SQLite 的 QA 卡片相似召回，供 COCO 主理人 AI 分身使用。

## 核心设计

- **Embedding 模型**：`doubao-embedding-vision-251215`（火山方舟多模态 Embedding API，仅使用 text 输入）。
- **检索文本**：`category + question + answer_points.join("\n")`。
- **向量库**：`data/qa-vectors.sqlite`，纯本地 SQLite（由 `sql.js` 驱动，无原生依赖）。
- **相似度**：余弦相似度。
- **入库与查询**：使用同一个 Doubao 模型，保证语义空间一致。

## 前置条件

在 `.env.local` 中配置：

```env
EMBEDDING_API_BASE=https://ark.cn-beijing.volces.com/api/v3
EMBEDDING_API_KEY=你的火山方舟 API Key
EMBEDDING_MODEL=doubao-embedding-vision-251215
EMBEDDING_DIMENSIONS=2048
```

## 文件结构

```
data/qa-cards.json              # 10 张人工确认的 QA 卡片
data/qa-vectors.sqlite          # SQLite 向量库（运行时自动生成）
lib/embedding.ts                # Doubao Embedding API 封装
lib/qa-db.ts                    # SQLite 读写封装
lib/rag.ts                      # 向量召回逻辑
scripts/generate-qa-embeddings.ts  # 离线生成向量脚本
```

## 生成/更新向量

1. 编辑 `data/qa-cards.json`。
2. 运行：

   ```bash
   npx tsx --env-file=.env.local scripts/generate-qa-embeddings.ts
   ```

3. 提交 `data/qa-cards.json` 和 `data/qa-vectors.sqlite`。

> `sql.js` 是纯 JavaScript 实现的 SQLite，不需要编译原生模块，Windows/macOS/Linux 都能直接跑。

## 验证召回效果

```bash
npx tsx --env-file=.env.local scripts/test-rag.ts
```

## API 路由

因为 `sql.js` 在 Edge Runtime 中也能运行（纯 JS/WASM），相关路由**可以**使用 Edge Runtime。当前保留 `nodejs` 运行时已足够稳定。

- `app/api/aicoco/chat/route.ts`
- `app/api/teacher-ai/chat/route.ts`
- `app/api/admin/seed-qa-cards/route.ts`

## 切换 Embedding 模型

如需更换 Doubao 模型：

1. 修改 `.env.local` 中的 `EMBEDDING_MODEL` 和 `EMBEDDING_DIMENSIONS`。
2. 重新运行生成脚本。
3. 注意：入库和查询必须使用同一个模型。

## 安全提示

- 不要把 `EMBEDDING_API_KEY`、`LLM_API_KEY`、Supabase service role key 提交到仓库。
- `data/qa-vectors.sqlite` 只包含公开 QA 卡片的向量，不含用户数据，可以提交。
