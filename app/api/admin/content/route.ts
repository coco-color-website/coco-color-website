import { NextResponse } from "next/server";
import { getContent, saveContent } from "@/lib/content";

export const runtime = "edge";

function checkAuth(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return { ok: false, error: "ADMIN_PASSWORD not set", status: 500 };
  }
  const provided = request.headers.get("x-admin-password");
  if (provided !== adminPassword) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }
  return { ok: true };
}

export async function GET() {
  try {
    const content = await getContent();
    return NextResponse.json(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = checkAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const result = await saveContent(body, "Update from admin panel");
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
