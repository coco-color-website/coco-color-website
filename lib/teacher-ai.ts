export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface TeacherLLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

/**
 * 校验并读取 LLM 环境变量。
 * 仅在服务端调用，确保 API key 不会泄露到前端。
 */
export function getTeacherLLMConfig(): TeacherLLMConfig {
  const apiKey = (process.env.LLM_API_KEY || "").trim();
  const baseUrl = process.env.LLM_API_BASE || "https://api.deepseek.com/v1";
  const model = process.env.LLM_MODEL || "deepseek-chat";

  if (
    !apiKey ||
    apiKey === "your_llm_api_key_here" ||
    apiKey.startsWith("your_") ||
    apiKey.startsWith("sk-placeholder")
  ) {
    throw new Error(
      "LLM_API_KEY 未配置或仍是占位符，请在 .env.local 中设置真实 Key"
    );
  }

  return { apiKey, baseUrl, model };
}

/**
 * 第一版极简 system prompt，不注入外部知识库。
 */
export function buildTeacherSystemPrompt(teacherName: string): string {
  return `你是 ${teacherName} 老师的 AI 分身。请以第一人称"我"与用户交流。

回答要求：
- 亲切自然、专业可信；
- 如果用户问题与课程、教学或老师专业领域无关，请礼貌引导回相关话题；
- 不要编造用户未提供的信息（如具体季型、骨骼类型等），如用户未说明，可先询问；
- 复杂问题可分点说明，控制回复长度。`;
}

export interface StreamChunk {
  content?: string;
  error?: string;
}
