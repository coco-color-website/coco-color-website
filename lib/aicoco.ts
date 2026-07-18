import { supabase } from "./supabase";
import siteContent from "@/data/content.json";
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

function buildCocoSystemPrompt(): string {
  const coco = siteContent.teachers.find((t) => t.name === "COCO");
  if (!coco) {
    return SYSTEM_PROMPT;
  }

  const serviceLines = siteContent.services
    .filter((s) => s.price.COCO)
    .map(
      (s) =>
        `- ${s.zh}（${s.en}）：COCO 主理人 ¥${s.price.COCO}，时长 ${s.duration}。${s.desc}`
    )
    .join("\n");

  return `${buildKnowledgePrompt()}

=== COCO 主理人身份 ===
你是 COCO，Coco Color 可可色彩诊断工作室的创始人与主理人。你以第一人称"我"与用户交流。

你的头衔与资质：
${coco.bio.map((line) => `- ${line}`).join("\n")}

=== Coco Color 服务项目（COCO 主理人）===
${serviceLines}

门店地址：广州市天河区华强路2号富力盈丰大厦A座 3楼336室。
营业时间：11:00 - 18:00。
预约方式：建议用户到店或通过线上沟通确认具体时间。

=== 你的说话方式 ===
你不是客服，也不是复读机。你是 COCO，一个有自己判断和表达习惯的老师。跟学员对话时，做到这几点：

1. 先听懂问题。不要只抓关键词就回答，先想想用户真正卡在哪里：是想了解一个概念，还是在纠结要不要做诊断，又或者是做完诊断后不知道怎么落地。
2. 有自己的取舍。该直接给价格就给价格，该澄清概念就澄清概念，该劝用户先别急着买东西就先劝住。不要为了讨好用户而说漂亮话。
3. 把复杂的事情讲清楚。遇到四季型、骨骼体型、穿搭逻辑这类专业问题，先用一个贴近生活的类比把人带进门，再给出具体建议。不要堆砌术语，也不要为了显得专业把话说绕。
4. 从长期目标倒推当下动作。比如用户问"我适合什么颜色"，先提醒她得先知道季型；用户问"要不要买这个包"，先帮她判断这个包和她的骨骼类型、使用场景是否匹配，而不是直接说"买"或"不买"。
5. 照顾用户的时间、精力和情绪。给出的建议要具体、可执行，不要一次性列十件事让人无从下手。如果用户明显在焦虑，先接住情绪，再给一小步能动的建议。
6. 真诚、有边界。只回答色彩诊断、四季型/八季型、骨骼体型、脸型体型、妆容、穿搭、配饰、韩妆风格、Coco Color 服务与预约相关的问题。遇到无关话题，自然地把它拉回形象美学，不生硬、不冒犯。
7. 不编造。不猜测用户的季型、骨骼类型或体型。如果用户没说明，先问她的诊断结果，或者请她描述肤色、五官、身材特征，再给出方向。
8. 控制长度。每次回复 300 字以内，复杂内容分点说。结尾可以自然邀请用户"到店我们当面聊"或"加微信约个时间"，但不要每句都硬塞。`;
}

export async function callLLM(
  messages: ChatMessage[],
  persona: "aicoco" | "coco" = "aicoco"
): Promise<{ content: string; model: string }> {
  const apiKey = (process.env.LLM_API_KEY || "").trim();
  const baseUrl = process.env.LLM_API_BASE || "https://api.deepseek.com/v1";
  const model = process.env.LLM_MODEL || "deepseek-chat";

  const systemPrompt =
    persona === "coco" ? buildCocoSystemPrompt() : SYSTEM_PROMPT;

  const isPlaceholder =
    !apiKey ||
    apiKey === "your_llm_api_key_here" ||
    apiKey.startsWith("your_") ||
    apiKey.startsWith("sk-placeholder");

  if (isPlaceholder) {
    return { content: getKnowledgeMockResponse(messages, persona), model: "mock" };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
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

function getKnowledgeMockResponse(
  messages: ChatMessage[],
  persona: "aicoco" | "coco" = "aicoco"
): string {
  const lastUser =
    messages.filter((m) => m.role === "user").pop()?.content || "";
  const q = lastUser.toLowerCase();

  if (persona === "coco") {
    if (
      q.includes("价格") ||
      q.includes("多少钱") ||
      q.includes("预约") ||
      q.includes("项目")
    ) {
      return "目前 COCO 主理人的诊断项目：\n- 基础色彩测试 ¥699，40 分钟\n- 进阶色彩测试 ¥899，1 小时\n- 高阶色彩测试 ¥1098，1.5 小时\n- 骨骼体型诊断 ¥1098，1 小时\n- 婚礼诊断 ¥1198，1 小时\n\n门店在广州天河区华强路2号富力盈丰大厦A座 3楼336室，营业时间 11:00-18:00。想预约的话可以先加我微信或电话，我们确认具体时间。";
    }

    return "嗨，我是 COCO。你可以问我关于色彩诊断、骨骼体型、韩妆风格、穿搭配色，或者 Coco Color 的项目价格和预约方式。告诉我你的情况，我会尽量给你实在的建议。";
  }

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
