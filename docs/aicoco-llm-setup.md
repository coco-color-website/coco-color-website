# AICOCO 大模型配置说明

AICOCO 的 `/api/aicoco/chat` 使用 **OpenAI 兼容的 Chat Completions API**，所以 DeepSeek、OpenAI ChatGPT、Azure OpenAI、SiliconFlow 等都可以用同一套配置接入。

## 本地配置

在项目根目录创建或编辑 `.env.local`，填入你的大模型信息：

### ChatGPT（OpenAI）

```env
LLM_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=sk-你的OpenAIKey
```

模型建议：
- `gpt-4o-mini`：便宜、速度快，适合日常问答
- `gpt-4o`：回答质量更高，系统提示词里知识量大时效果更稳

### DeepSeek（当前默认）

```env
LLM_API_BASE=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
LLM_API_KEY=sk-你的DeepSeekKey
```

### 其他 OpenAI 兼容服务

只要 API 地址以 `/v1/chat/completions` 结尾、返回格式与 OpenAI 一致即可：

```env
LLM_API_BASE=https://你的服务商域名/v1
LLM_MODEL=模型名称
LLM_API_KEY=你的Key
```

## 没有 Key 时会怎样？

如果 `LLM_API_KEY` 为空或还是占位符 `your_llm_api_key_here`，AICOCO 会自动进入 **mock 模式**，从 `lib/aicoco-knowledge.ts` 里直接匹配知识库给出专业回答。Mock 模式不需要联网、不消耗 Token，适合本地演示和测试。

## 验证是否接通

配置完成后启动本地服务：

```bash
npm run dev
```

然后在 `/aicoco` 页面发送一条消息。回答末尾会标注模型名：

- `mock`：说明还在用本地知识库，检查 Key 是否填对
- `gpt-4o-mini` 或你填的模型名：说明已成功调用大模型

## 费用提示

AICOCO 的系统提示词包含了完整的专业知识库（约几千 Token）。每次对话都会把系统提示词一起发送，所以：

- 使用 `gpt-4o-mini` 成本较低，适合初期
- 如果日活量变大，可以考虑把知识库改成 RAG（检索增强）或精简系统提示词来降低 Token 消耗

## 安全提示

- **不要把 API Key 提交到 Git**。`.env.local` 已被 `.gitignore` 忽略。
- 线上部署时，把 Key 配置到平台环境变量里（如 Netlify / Vercel / Cloudflare Pages 的 Environment variables），不要写进代码。
