import { promises as fs } from "fs";
import path from "path";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LogEntry {
  timestamp: string;
  messages: ChatMessage[];
  answer: string;
  model: string;
  error?: string;
}

const LOG_PATH = path.join(process.cwd(), "data", "aicoco-log.json");

const SYSTEM_PROMPT = `你是 AICOCO，Coco Color 可可色彩诊断工作室的 AI 助理。你只回答与色彩诊断、四季型、个人色彩、妆容、穿搭、配饰、韩妆风格、预约流程相关的问题。如果用户问到无关话题，请礼貌地引导回色彩诊断相关话题。回答要简洁、友好、专业，控制在 200 字以内。`;

export async function callLLM(
  messages: ChatMessage[]
): Promise<{ content: string; model: string }> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_API_BASE || "https://api.deepseek.com/v1";
  const model = process.env.LLM_MODEL || "deepseek-chat";

  if (!apiKey || apiKey === "your_llm_api_key_here") {
    return { content: getMockResponse(messages), model: "mock" };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM API failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM API returned empty content");
  }

  return { content, model };
}

function getMockResponse(messages: ChatMessage[]): string {
  const lastUser =
    messages.filter((m) => m.role === "user").pop()?.content || "";

  if (lastUser.includes("季型") || lastUser.includes("四季")) {
    return "四季型色彩诊断把人的肤色、发色、瞳色等天然色调分为春、夏、秋、冬四大类，每一类都有最适合的服饰色、彩妆色和配饰色。想知道自己属于哪一季型，建议预约一次到店诊断，老师会结合自然光和专业工具给出准确判断。";
  }

  if (
    lastUser.includes("价格") ||
    lastUser.includes("多少钱") ||
    lastUser.includes("预约")
  ) {
    return "我们的诊断项目有多种选择，从基础肤色诊断到全套色彩+妆容+购物顾问服务都有。你可以在首页「诊断项目」里查看大概方向，具体价格和预约时间建议直接到店或通过电话/微信沟通确认。";
  }

  if (lastUser.includes("韩妆") || lastUser.includes("妆容")) {
    return "韩妆风格强调清透底妆、自然眉形、柔和的眼影和显气色的唇色。我们会根据你的季型推荐最适合的色调，比如春季型适合珊瑚橘、蜜桃粉，冬季型适合玫红、冷调正红等。";
  }

  return "你好！我是 AICOCO，Coco Color 的 AI 小助手。我可以帮你初步了解色彩诊断、四季型、韩妆风格、穿搭配色和预约流程。如果你需要更精准的分析，建议预约一次到店诊断哦。";
}

export async function logChat(entry: LogEntry) {
  try {
    let logs: LogEntry[] = [];
    try {
      const raw = await fs.readFile(LOG_PATH, "utf-8");
      logs = JSON.parse(raw);
    } catch {
      // file does not exist yet or is invalid
    }
    logs.push(entry);
    await fs.writeFile(LOG_PATH, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    // Netlify/serverless runtimes often have read-only filesystems.
    // Logging should not break the chat experience.
    const message = err instanceof Error ? err.message : String(err);
    console.warn("AICOCO log skipped:", message);
  }
}
