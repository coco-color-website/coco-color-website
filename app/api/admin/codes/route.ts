import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const MAX_RETRIES_PER_CODE = 5;

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

function generateCode(): string {
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    part2 += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return `${part1}-${part2}`;
}

interface CodeRecord {
  id: string;
  code: string;
  service_days: number;
  term: string | null;
  note: string | null;
  is_active: boolean;
  created_at: string;
  activated_at: string | null;
}

export async function GET(request: Request) {
  const auth = checkAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("activation_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const codes: CodeRecord[] = (data || []).map((row) => ({
    id: row.id,
    code: row.code,
    service_days: row.service_days,
    term: row.term,
    note: row.note,
    is_active: row.is_active,
    created_at: row.created_at,
    activated_at: row.activated_at,
  }));

  return NextResponse.json({ codes });
}

export async function POST(request: Request) {
  const auth = checkAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  let body: {
    count?: number;
    serviceDays?: number;
    term?: string;
    note?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const count = Math.min(Math.max(Number(body.count) || 1, 1), 100);
  const serviceDays = Math.max(Number(body.serviceDays) || 365, 1);
  const term = (body.term || "").trim() || null;
  const note = (body.note || "").trim() || null;

  const generated: CodeRecord[] = [];

  for (let i = 0; i < count; i++) {
    let inserted = false;
    let attempts = 0;
    let record: CodeRecord | null = null;

    while (!inserted && attempts < MAX_RETRIES_PER_CODE) {
      attempts++;
      const code = generateCode();
      const { data, error } = await supabase
        .from("activation_codes")
        .insert({
          code,
          service_days: serviceDays,
          term,
          note,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        // 23505 = unique_violation, retry with a new code
        if (error.code === "23505") {
          continue;
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      record = {
        id: data.id,
        code: data.code,
        service_days: data.service_days,
        term: data.term,
        note: data.note,
        is_active: data.is_active,
        created_at: data.created_at,
        activated_at: data.activated_at,
      };
      inserted = true;
    }

    if (!record) {
      return NextResponse.json(
        { error: `生成第 ${i + 1} 个授权码失败，请重试` },
        { status: 500 }
      );
    }

    generated.push(record);
  }

  return NextResponse.json({ codes: generated });
}
