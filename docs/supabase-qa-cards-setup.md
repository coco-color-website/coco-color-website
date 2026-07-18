# Supabase 向量库设置（QA 卡片 RAG）

本说明用于在 Supabase 中创建 QA 卡片向量表，供 COCO 主理人 AI 分身做相似召回。

## 前置条件

- 已有 Supabase 项目（可参考 `docs/supabase-setup.md` 创建）。
- 已在 `.env.local` 中配置：
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`（用于前端/Edge Runtime 写入时，需配合下方 RLS 策略）
  - `OPENAI_API_KEY`（用于生成 embedding）

## 1. 创建向量表与匹配函数

进入 Supabase 项目 **SQL Editor**，新建一个 query，粘贴并运行以下 SQL：

```sql
-- 启用 pgvector 扩展
create extension if not exists vector;

-- QA 卡片表
-- 注意：向量维度需与 embedding 模型一致。
-- OpenAI text-embedding-3-small 为 1536 维。
create table if not exists public.qa_cards (
  id text primary key,
  category text not null,
  question text not null,
  answer_points text[] not null,
  test_target text,
  embedding vector(1536),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 允许匿名插入/更新/查询（适合服务端在 Edge Runtime 用 anon key 操作）
alter table public.qa_cards enable row level security;

create policy "Allow anonymous selects on qa_cards"
  on public.qa_cards
  for select
  to anon
  using (true);

create policy "Allow anonymous inserts on qa_cards"
  on public.qa_cards
  for insert
  to anon
  with check (true);

create policy "Allow anonymous updates on qa_cards"
  on public.qa_cards
  for update
  to anon
  using (true)
  with check (true);

-- 相似度搜索函数
-- match_threshold：余弦相似度阈值，越大越严格（范围 0~1）
-- match_count：返回条数上限
create or replace function public.match_qa_cards(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 3
)
returns table(
  id text,
  category text,
  question text,
  answer_points text[],
  test_target text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    qa_cards.id,
    qa_cards.category,
    qa_cards.question,
    qa_cards.answer_points,
    qa_cards.test_target,
    1 - (qa_cards.embedding <=> query_embedding) as similarity
  from public.qa_cards
  where 1 - (qa_cards.embedding <=> query_embedding) > match_threshold
  order by qa_cards.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

## 2. 写入 QA 卡片

项目启动后，调用一次管理接口把卡片写入向量库：

```bash
curl -X POST http://localhost:3000/api/admin/seed-qa-cards \
  -H "Content-Type: application/json" \
  -d '{"password":"coco2026"}'
```

如果卡片内容有更新，重新调用一次即可（接口使用 upsert，会覆盖同 id 的卡片）。

## 3. 验证

在 Supabase **Table Editor > qa_cards** 中应能看到 5 条记录，且 `embedding` 字段不为 null。

## 4. 切换 embedding 模型时的注意事项

如果后续从 OpenAI 切换到其他 embedding 服务：

1. 确保新模型输出维度仍为 1536；
2. 若维度不同，需要修改 `embedding vector(1536)` 的维度，并重新生成所有卡片 embedding；
3. 同时修改 `lib/rag.ts` 中的 `EMBEDDING_MODEL` 和 API 调用逻辑。

## 安全提示

- `qa_cards` 表目前允许匿名插入/更新/查询。它只存放公开 QA 卡片，不含敏感信息。
- 如果后续需要更严格的权限，可把写入操作改为仅 service role key 可执行，并把管理接口放到受保护的后端。
- 不要把 `OPENAI_API_KEY` 或 Supabase service role key 暴露给前端。
