-- Supabase 授权码系统表结构
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 授权码表
CREATE TABLE IF NOT EXISTS activation_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  service_days integer NOT NULL DEFAULT 365,
  term text,
  note text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  activated_at timestamp with time zone
);

-- 学员表
CREATE TABLE IF NOT EXISTS students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  code_id uuid REFERENCES activation_codes(id) UNIQUE,
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 为了开发方便，先允许匿名读写（后续可加强 RLS）
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_activation_codes" ON activation_codes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_students" ON students
  FOR ALL USING (true) WITH CHECK (true);
