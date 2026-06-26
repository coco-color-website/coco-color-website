import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { ok: false, error: "Server misconfiguration: ADMIN_PASSWORD not set" },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "密码错误" }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
