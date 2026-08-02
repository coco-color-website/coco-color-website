import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  isAlphanumericUsername,
  hashPassword,
  signCocoToken,
  CocoAuthError,
} from "@/lib/coco-auth";

export const runtime = "edge";

interface ActivateBody {
  code?: string;
  username?: string;
  password?: string;
}

function validateInput(body: ActivateBody): {
  code: string;
  username: string;
  password: string;
} {
  const code = (body.code || "").trim().toUpperCase();
  const username = (body.username || "").trim();
  const password = body.password || "";

  if (!code || !username || !password) {
    throw new CocoAuthError("请填写授权码、用户名和密码");
  }

  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    throw new CocoAuthError("授权码格式错误");
  }

  if (!isAlphanumericUsername(username)) {
    throw new CocoAuthError("用户名只能包含字母和数字");
  }

  if (username.length < 3 || username.length > 20) {
    throw new CocoAuthError("用户名长度需在 3-20 个字符之间");
  }

  if (password.length < 6) {
    throw new CocoAuthError("密码至少需要 6 位");
  }

  return { code, username, password };
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "数据库未配置" },
      { status: 500 }
    );
  }

  let body: ActivateBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  try {
    const { code, username, password } = validateInput(body);

    // 1. 查找有效授权码
    const { data: activationCode, error: codeError } = await supabase
      .from("activation_codes")
      .select("id, code, service_days, is_active, activated_at")
      .eq("code", code)
      .eq("is_active", true)
      .is("activated_at", null)
      .single();

    if (codeError || !activationCode) {
      throw new CocoAuthError("授权码无效、已禁用或已被使用");
    }

    // 2. 检查用户名是否已存在
    const { data: existingStudent, error: studentCheckError } = await supabase
      .from("students")
      .select("username")
      .eq("username", username)
      .single();

    if (studentCheckError && studentCheckError.code !== "PGRST116") {
      throw new CocoAuthError("检查用户名失败，请稍后重试");
    }

    if (existingStudent) {
      throw new CocoAuthError("用户名已被注册");
    }

    // 3. 再次确认该授权码未被绑定（防御并发）
    const { data: usedCode, error: usedCheckError } = await supabase
      .from("students")
      .select("id")
      .eq("code_id", activationCode.id)
      .single();

    if (usedCheckError && usedCheckError.code !== "PGRST116") {
      throw new CocoAuthError("检查授权码状态失败");
    }

    if (usedCode) {
      throw new CocoAuthError("授权码已被使用");
    }

    // 4. 计算过期时间
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + activationCode.service_days * 24 * 60 * 60 * 1000
    );

    // 5. 密码哈希
    const passwordHash = await hashPassword(password);

    // 6. 创建学员账号
    const { data: newStudent, error: insertError } = await supabase
      .from("students")
      .insert({
        username,
        password_hash: passwordHash,
        code_id: activationCode.id,
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select("id, username")
      .single();

    if (insertError || !newStudent) {
      throw new CocoAuthError("创建账号失败，请稍后重试");
    }

    // 7. 标记授权码已激活
    await supabase
      .from("activation_codes")
      .update({ activated_at: now.toISOString() })
      .eq("id", activationCode.id);

    // 8. 签发 token
    const token = await signCocoToken(username);

    return NextResponse.json({
      ok: true,
      token,
      username,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    const message =
      err instanceof CocoAuthError
        ? err.message
        : err instanceof Error
          ? err.message
          : "激活失败，请稍后重试";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
