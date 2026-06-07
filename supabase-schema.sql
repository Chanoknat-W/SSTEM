-- ============================================================
-- SST-EM Supabase Schema v2
-- Run in: Supabase Dashboard → SQL Editor
-- ⚠️ ก่อนรัน: Authentication → Settings → ปิด "Enable email confirmations"
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
create table if not exists profiles (
  id           uuid references auth.users on delete cascade primary key,
  display_name text not null,
  role         text not null check (role in ('self', 'eval')),
  created_at   timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Evaluators can read all profiles"
  on profiles for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'eval')
  );

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- 2. EVALUATIONS TABLE
-- ============================================================
drop table if exists evaluations;

create table evaluations (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users,
  teacher_name     text,
  school           text,
  semester         text,
  grade            text,
  district         text,
  domain1_answers  jsonb,
  domain2_answers  jsonb,
  domain3_answers  jsonb,
  domain1_total    int,
  domain2_total    int,
  domain3_total    int,
  total_score      int,
  level            text,
  files            jsonb default '{}',
  eval_status      text default 'draft',
  eval_scores      jsonb,
  eval_suggestions jsonb,
  eval_by          uuid references profiles(id),
  eval_by_name     text,
  created_at       timestamptz default now()
);

alter table evaluations enable row level security;

-- Teachers: insert own
create policy "Teachers can insert own evaluation"
  on evaluations for insert with check (auth.uid() = user_id);

-- Teachers: read own
create policy "Teachers can read own evaluation"
  on evaluations for select using (auth.uid() = user_id);

-- Teachers: update own (draft → pending)
create policy "Teachers can update own evaluation"
  on evaluations for update using (auth.uid() = user_id);

-- Evaluators: read pending/evaluated
create policy "Evaluators can read submitted evaluations"
  on evaluations for select using (
    eval_status in ('pending', 'evaluated')
    and exists (select 1 from profiles where id = auth.uid() and role = 'eval')
  );

-- Evaluators: update eval fields
create policy "Evaluators can update eval fields"
  on evaluations for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'eval')
  );

-- ============================================================
-- 3. STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('evaluation-docs', 'evaluation-docs', true)
  on conflict do nothing;

create policy "Auth users can upload files"
  on storage.objects for insert
  with check (bucket_id = 'evaluation-docs' and auth.uid() is not null);

create policy "Anyone can read evaluation files"
  on storage.objects for select
  using (bucket_id = 'evaluation-docs');
