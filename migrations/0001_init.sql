-- Skolval: tables live in the same Supabase project as gymkollen, prefixed
-- skolval_ so they never collide with gymkollen's tables.
create table if not exists skolval_schools (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists skolval_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Only the server (service-role key) may touch these tables. RLS on with no
-- policies blocks the public anon key that gymkollen exposes in its browser code.
alter table skolval_schools enable row level security;
alter table skolval_settings enable row level security;
revoke all on skolval_schools, skolval_settings from anon, authenticated;

-- Merge a partial update into one school's JSON document in a single statement.
create or replace function skolval_patch_school(p_id text, p_patch jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
  update skolval_schools
     set data = data || p_patch, updated_at = now()
   where id = p_id;
$$;

revoke all on function skolval_patch_school(text, jsonb) from public, anon, authenticated;
