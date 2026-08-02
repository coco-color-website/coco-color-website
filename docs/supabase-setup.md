# Supabase 设置说明（AICOCO 日志）

## 1. 创建 Supabase 项目

1. 打开 https://supabase.com/dashboard
2. 注册/登录后点击 **New project**
3. 选择或创建一个 organization
4. 输入项目名称，例如 `coco-color-logs`
5. 设置数据库密码（请妥善保存）
6. 选择 Region（建议选离你用户最近的，如 `Singapore` 或 `Northeast Asia`）
7. 点击 **Create new project**，等待创建完成

## 2. 创建数据表

项目创建完成后，进入 **SQL Editor**，新建一个 query，粘贴并运行以下 SQL：

```sql
create table if not exists public.aicoco_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  question text not null,
  answer text not null,
  model text not null,
  error text,
  messages jsonb
);

-- 允许匿名插入（适合服务端使用 anon key 写入日志）
alter table public.aicoco_logs enable row level security;

create policy "Allow anonymous inserts on aicoco_logs"
  on public.aicoco_logs
  for insert
  to anon
  with check (true);
```

## 3. 获取连接信息

进入项目 **Settings > API**，复制以下两项：

- **Project URL**：形如 `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
- **anon public**：形如 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 4. 配置环境变量

### 本地开发

把下面的值填进项目根目录的 `.env.local`：

```env
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Netlify 线上

登录 Netlify 后台，进入对应站点：

1. 点击 **Site configuration > Environment variables**
2. 添加两个变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. 保存后会自动重新部署

## 5. 验证

部署完成后，在 `/aicoco` 页面发送一条消息，然后回到 Supabase **Table Editor > aicoco_logs**，应该能看到新记录。

## 安全提示

- `aicoco_logs` 表目前允许任何人插入记录（通过 anon key）。它只用于记录聊天日志，不包含敏感用户信息。
- 如果以后需要查询/删除日志，请使用 Supabase service role key 或添加更严格的 RLS 策略。
- 不要把 service role key 暴露给前端或写入 `.env.local`。
