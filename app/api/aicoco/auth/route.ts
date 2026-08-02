import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  isAlphanumericUsername,
  verifyPassword,
  signCocoToken,
  CocoAuthError,
} from "@/lib/coco-auth";

export const runtime = "edge";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: "数据库未配置" }, { status: 500 });
  }

  let body: LoginBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const username = (body.username || "").trim();
  const password = body.password || "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "请输入用户名和密码" },
      { status: 400 }
    );
  }

  if (!isAlphanumericUsername(username)) {
    return NextResponse.json(
      { error: "用户名只能包含字母和数字" },
      { status: 400 }
    );
  }

  try {
    const { data: student, error } = await supabase
      .from("students")
      .select("username, password_hash, expires_at")
      .eq("username", username)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    if (student.expires_at && new Date(student.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: "会员已过期，请联系管理员续期" },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, student.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const token = await signCocoToken(student.username);
    return NextResponse.json({ token });
  } catch (err) {
    const message =
      err instanceof CocoAuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "登录失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
