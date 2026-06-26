-- ============================================================
-- SST-EM Supabase Setup
-- รันใน Supabase SQL Editor ทีละ section หรือทั้งหมดพร้อมกัน
-- ============================================================


-- ============================================================
-- 1. TABLE: profiles
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  position text,
  grade text,
  school text,
  district text,
  semester text
);

alter table profiles enable row level security;

create policy "users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ============================================================
-- 2. TABLE: evaluations
-- ============================================================
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  teacher_name text,
  school text,
  semester text,
  grade text,
  district text,
  files jsonb default '{}',
  eval_status text default 'draft',
  submitted_at timestamptz,
  evaluated_at timestamptz,
  eval_by uuid,
  eval_by_name text,
  eval_scores jsonb,
  eval_suggestions text,
  domain1_answers jsonb,
  domain2_answers jsonb,
  domain3_answers jsonb,
  domain1_total int,
  domain2_total int,
  domain3_total int,
  total_score int,
  level text,
  created_at timestamptz default now()
);

alter table evaluations enable row level security;

create policy "authenticated can read"
  on evaluations for select
  using (auth.uid() is not null);

create policy "authenticated can insert"
  on evaluations for insert
  with check (auth.uid() is not null);

create policy "authenticated can update"
  on evaluations for update
  using (auth.uid() is not null);


-- ============================================================
-- 3. STORAGE: evaluation-docs bucket
-- (ทำใน Supabase Dashboard: Storage → New bucket → ชื่อ "evaluation-docs" → Public)
-- แล้วรัน policy ด้านล่างนี้
-- ============================================================
create policy "authenticated can upload"
  on storage.objects for insert
  with check (bucket_id = 'evaluation-docs' and auth.uid() is not null);

create policy "public can read"
  on storage.objects for select
  using (bucket_id = 'evaluation-docs');
