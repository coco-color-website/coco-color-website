# QA 卡片本地向量 RAG

本说明用于在本地运行基于 Embedding 的 QA 卡片相似召回，供 COCO 主理人 AI 分身使用。

## 核心设计

- **Embedding 模型**：`Xenova/bge-small-zh-v1.5`（本地 ONNX，512 维）。
- **检索文本**：`category + question + answer_points.join("\n")`。
- **向量库**：`data/qa-cards-embeddings.json`，纯本地 JSON，无需数据库。
- **相似度**：余弦相似度（向量已归一化，点积即余弦相似度）。
- **入库与查询**：使用同一个本地模型，确保语义空间一致。

## 文件结构

```
data/qa-cards.json              # 10 张人工确认的 QA 卡片
data/qa-cards-embeddings.json   # 卡片向量库
lib/embedding.ts                # 本地 Embedding 封装
lib/rag.ts                      # 向量召回逻辑
scripts/generate-qa-embeddings.ts  # 离线生成向量脚本
patches/@xenova+transformers+2.17.2.patch  # 让文本任务无需 sharp 原生依赖
```

## 更新 QA 卡片或重新生成向量的流程

1. 编辑 `data/qa-cards.json`。
2. 运行生成脚本：

   ```bash
   npx tsx scripts/generate-qa-embeddings.ts
   ```

3. 提交 `data/qa-cards.json` 和 `data/qa-cards-embeddings.json`。

## 验证召回效果

```bash
npx tsx scripts/test-rag.ts
```

会打印每个测试问题的 Top-2 召回卡片及余弦相似度。

## API 路由运行时

因为本地 Embedding 需要 Node.js 文件系统与 ONNX Runtime，相关 API 路由已切换到 `runtime = "nodejs"`：

- `app/api/aicoco/chat/route.ts`
- `app/api/teacher-ai/chat/route.ts`
- `app/api/admin/seed-qa-cards/route.ts`

> **部署注意**：Node.js runtime 与 Cloudflare Pages Edge（`pages:build`）不兼容。如果主部署目标是 Cloudflare Pages，需要改为客户端生成 query embedding 再传给服务端，或改用其他支持 Node runtime 的平台（Vercel、Netlify、自有服务器）。

## 首次安装依赖

```bash
npm install
```

`postinstall` 会自动执行 `patch-package`，应用 `@xenova/transformers` 的补丁，让文本 Embedding 不需要 sharp 原生二进制。

如果由于网络原因 `@xenova/transformers` 的 sharp 没有成功跳过，可以：

```bash
npm install --ignore-scripts
npx patch-package
```

## 模型文件

`local_models/bge-small-zh-v1.5/` 下已预置：

- `config.json`
- `tokenizer.json`
- `tokenizer_config.json`
- `onnx/model_quantized.onnx`

如需更换模型，请保持文件名与目录结构一致，并同步修改 `lib/embedding.ts` 中的 `EMBEDDING_MODEL`。

## 安全提示

- 不要把 `LLM_API_KEY`、Supabase service role key 等敏感信息提交到仓库。
- `data/qa-cards-embeddings.json` 只包含公开 QA 卡片的向量，不含用户数据，可以提交。
