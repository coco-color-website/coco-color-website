import siteContent from "@/data/content.json";

export interface SiteContent {
  brand: {
    title: string;
    subtitle: string;
    heroText: string;
  };
  teachers: Array<{
    name: string;
    role: string;
    image: string;
    bio: string[];
  }>;
  services: Array<{
    en: string;
    zh: string;
    desc: string;
    duration: string;
    price: Record<string, number>;
  }>;
  details: Array<{ en: string; zh: string; items: string[] }>;
}

const OWNER = process.env.GITHUB_OWNER || "coco-color-website";
const REPO = process.env.GITHUB_REPO || "coco-color-website";
const TOKEN = process.env.GITHUB_TOKEN;
const FILE_PATH = "data/content.json";

/**
 * 直接导入仓库里的 data/content.json。
 * 本地开发和线上构建都走同一个文件，保证代码和内容始终同步部署。
 * Edge Runtime 下不能使用 fs，因此改用静态 JSON 导入。
 */
export async function getContent(): Promise<SiteContent> {
  return siteContent as SiteContent;
}

function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binString);
}

export async function saveContent(content: SiteContent, message?: string) {
  const json = JSON.stringify(content, null, 2);

  // Cloudflare Pages / Edge Runtime 不支持 fs 写文件，
  // 所有环境（包括本地开发）都通过 GitHub API 提交内容更新。
  // 提交到 main 后会自动触发 Cloudflare Pages 重新部署。
  if (!TOKEN) {
    throw new Error("GITHUB_TOKEN not set");
  }

  // 先获取当前文件的 sha
  const getRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 0 },
    }
  );

  if (!getRes.ok) {
    throw new Error(`GitHub API GET sha failed: ${getRes.status}`);
  }

  const { sha } = await getRes.json();

  const putRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message || "Update site content from admin",
        content: base64Encode(json),
        sha,
      }),
    }
  );

  if (!putRes.ok) {
    throw new Error(`GitHub API PUT failed: ${putRes.status} ${await putRes.text()}`);
  }

  return await putRes.json();
}
