import { supabase } from "./supabase";
import {
  buildKnowledgePrompt,
  colorSeasonProfiles,
  boneTypeProfiles,
  bodyShapeProfiles,
  colorMatchingMethods,
  styleRecommendations,
  colorDiagnosisCaveats,
  bodyMeasurementGuide,
} from "./aicoco-knowledge";

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

const SYSTEM_PROMPT = `${buildKnowledgePrompt()}

=== 通用边界 ===
你是 AICOCO，Coco Color 可可色彩诊断工作室的 AI 助理。你使用上面的专业知识回答用户问题。只回答与色彩诊断、四季型、八季型、骨骼体型诊断、脸型体型、妆容、穿搭、配饰、韩妆风格、预约流程相关的问题。如果用户问到无关话题，请礼貌地引导回色彩诊断相关话题。回答要简洁、友好、专业，控制在 300 字以内。不要编造用户的具体季型或骨骼类型；如用户未说明，先询问其诊断结果再给出建议。`;

export async function callLLM(
  messages: ChatMessage[]
): Promise<{ content: string; model: string }> {
  const apiKey = (process.env.LLM_API_KEY || "").trim();
  const baseUrl = process.env.LLM_API_BASE || "https://api.deepseek.com/v1";
  const model = process.env.LLM_MODEL || "deepseek-chat";

  const isPlaceholder =
    !apiKey ||
    apiKey === "your_llm_api_key_here" ||
    apiKey.startsWith("your_") ||
    apiKey.startsWith("sk-placeholder");

  if (isPlaceholder) {
    return { content: getKnowledgeMockResponse(messages), model: "mock" };
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
      max_tokens: 700,
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

function getKnowledgeMockResponse(messages: ChatMessage[]): string {
  const lastUser =
    messages.filter((m) => m.role === "user").pop()?.content || "";
  const q = lastUser.toLowerCase();

  // 季型匹配
  for (const season of colorSeasonProfiles) {
    if (q.includes(season.name) || (season.english && q.includes(season.english.toLowerCase()))) {
      return `【${season.name}】代表人物有 ${season.celebrities}。\n\n印象：${season.impression}。\n\n肤色/发色/瞳孔：${season.skinHairEyes}\n\n妆容建议：${season.makeup}\n\n推荐发色：${season.hairColor}\n\n穿搭方向：${season.clothing} 推荐面料如 ${season.fabric.replace(/。$/, "")}，图案可选 ${season.patterns.replace(/。$/, "")}。\n\n代表色：${season.colors.join("、")}。\n\n如果你还没做过专业诊断，建议预约到店，由老师结合自然光和专业工具判断哦。`;
    }
  }

  // 骨骼类型匹配
  for (const bone of boneTypeProfiles) {
    const names = bone.name.toLowerCase().split(/\s*\/\s*/);
    if (names.some((n) => q.includes(n))) {
      return `【${bone.name}】代表人物：${bone.celebrities}。\n\n特征：${bone.characteristics}\n\n整体穿搭：${bone.clothing}\n\n领口：${bone.necklines}\n\n面料：${bone.fabrics}\n\n图案：${bone.patterns}\n\n发型：${bone.hairstyles}\n\n如果不确定自己是哪种骨骼类型，建议预约到店做专业骨骼-体型诊断。`;
    }
  }

  // 体型匹配
  for (const shape of bodyShapeProfiles) {
    const names = [shape.name, shape.aliases].flatMap((n) =>
      n.toLowerCase().split(/\s*[\/、,，]\s*/)
    );
    if (names.some((n) => q.includes(n))) {
      return `【${shape.name}】${shape.features}\n\n推荐：${shape.best}\n\n避免：${shape.worst}\n\n体型只是参考，具体还要结合骨骼类型和身高比例综合判断。`;
    }
  }

  // 主题匹配
  if (q.includes("配色") || q.includes("怎么搭") || q.includes("搭配")) {
    return `${colorMatchingMethods}\n\n如果想获得更贴合你季型的配色方案，可以告诉我你的色彩诊断结果。`;
  }

  if (q.includes("风格") || q.includes("穿什么风格")) {
    return `${styleRecommendations}\n\n告诉我你的季型，我可以给出更精准的风格建议。`;
  }

  if (q.includes("诊断") && (q.includes("注意") || q.includes("误区"))) {
    return `${colorDiagnosisCaveats}\n\n专业诊断能有效避免这些错视和误判，建议到店体验。`;
  }

  if (q.includes("测量") || q.includes("怎么量") || q.includes("比例")) {
    return `${bodyMeasurementGuide}\n\n测量只是辅助判断，最终建议需要结合骨骼和体型综合诊断。`;
  }

  if (q.includes("季型") || q.includes("四季") || q.includes("八季")) {
    return "四季型色彩诊断把人的肤色、发色、瞳色等天然色调分为春、夏、秋、冬四大类，每一类再细分为两个亚型（共八季型：浅春、亮春、浅夏、柔夏、柔秋、深秋、亮冬、深冬）。每个季型都有最适合的服饰色、彩妆色、发色和配饰色。想知道自己属于哪一季型，建议预约一次到店诊断，老师会结合自然光和专业工具给出准确判断。";
  }

  if (
    q.includes("价格") ||
    q.includes("多少钱") ||
    q.includes("预约")
  ) {
    return "我们的诊断项目有多种选择，从基础肤色诊断到全套色彩+妆容+购物顾问服务都有。你可以在首页「诊断项目」里查看大概方向，具体价格和预约时间建议直接到店或通过电话/微信沟通确认。";
  }

  if (q.includes("韩妆") || q.includes("妆容")) {
    return "韩妆风格强调清透底妆、自然眉形、柔和的眼影和显气色的唇色。我们会根据你的季型推荐最适合的色调，比如春季型适合珊瑚橘、蜜桃粉，冬季型适合玫红、冷调正红等。告诉我你的季型，我可以给更具体的韩妆配色建议。";
  }

  return "你好！我是 AICOCO，Coco Color 的 AI 小助手。我可以根据 Coco 的专业课程体系，帮你解答色彩诊断（四季型/八季型）、骨骼体型诊断、脸型体型、妆容、穿搭、配饰相关问题。如果你已经做过诊断，告诉我你的季型和骨骼类型，我会给出更针对性的建议；也可以直接问我某个季型的特点或穿搭方向。";
}

export async function logChat(entry: LogEntry) {
  // Edge Runtime 不支持 fs 写文件，本地文件备份已移除。
  // 如需保留本地日志，可改由 Node.js 脚本或 Supabase 实现。
  if (supabase) {
    try {
      const lastUser =
        entry.messages.filter((m) => m.role === "user").pop()?.content || "";
      const { error } = await supabase.from("aicoco_logs").insert({
        question: lastUser,
        answer: entry.answer,
        model: entry.model,
        error: entry.error || null,
        messages: entry.messages,
      });
      if (error) {
        console.warn("AICOCO supabase log failed:", error.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("AICOCO supabase log error:", message);
    }
  }
}
