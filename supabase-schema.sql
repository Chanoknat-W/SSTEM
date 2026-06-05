-- SST-EM: สร้าง table ใน Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste นี้ → Run

create table evaluations (
  id uuid default gen_random_uuid() primary key,
  teacher_name text not null,
  school text not null,
  semester text not null,
  domain1_answers jsonb,
  domain2_answers jsonb,
  domain3_answers jsonb,
  domain1_total int,
  domain2_total int,
  domain3_total int,
  total_score int,
  level text,
  reflection jsonb,
  created_at timestamptz default now()
);

-- เปิด Row Level Security (แนะนำ)
alter table evaluations enable row level security;

-- อนุญาตให้ insert ได้โดยไม่ต้อง login
create policy "Allow public insert"
  on evaluations for insert
  with check (true);

-- อนุญาตให้ select ได้ (สำหรับ Dashboard)
create policy "Allow public select"
  on evaluations for select
  using (true);
