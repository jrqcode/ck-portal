-- Caiden-Keller Homes portal — v1 schema.
--
-- Single tenant: one builder, many projects. Two roles. Access control lives in
-- RLS, not in the UI: a homeowner reaches a row only by being in project_members.

create type user_role as enum ('staff', 'homeowner');
create type project_status as enum ('pre_construction', 'in_progress', 'on_hold', 'complete');
create type stage_status as enum ('not_started', 'in_progress', 'complete');
create type document_category as enum (
  'contract', 'permit', 'plan', 'warranty', 'pdi', 'selection', 'other'
);

-- ---------------------------------------------------------------- profiles --

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text not null default '',
  phone       text,
  role        user_role not null default 'homeowner',
  created_at  timestamptz not null default now()
);

comment on table profiles is 'One row per auth user. Role is global: staff see every project.';

-- New auth users get a profile automatically. Role comes from the invite
-- metadata so an invited homeowner never lands without a profile row.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'homeowner')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper used by nearly every policy below. SECURITY DEFINER so that reading a
-- caller's own role does not itself recurse through profiles' RLS.
create function is_staff()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'staff'
  );
$$;

-- ---------------------------------------------------------------- projects --

create table projects (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  address           text,
  community         text,
  lot               text,
  status            project_status not null default 'pre_construction',
  cover_photo_path  text,
  start_date        date,
  target_occupancy  date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table project_members (
  project_id  uuid not null references projects on delete cascade,
  user_id     uuid not null references profiles on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (project_id, user_id)
);

comment on table project_members is
  'Links homeowners to their build. Two rows for a couple — both see the same project.';

create index project_members_user_id_idx on project_members (user_id);

-- Does the caller have access to this project at all?
create function can_see_project(p_project_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select public.is_staff() or exists (
    select 1 from public.project_members
    where project_id = p_project_id and user_id = (select auth.uid())
  );
$$;

-- ------------------------------------------------------------------ stages --

create table project_stages (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects on delete cascade,
  name          text not null,
  description   text,
  sort_order    integer not null,
  status        stage_status not null default 'not_started',
  started_on    date,
  completed_on  date,
  unique (project_id, sort_order)
);

create index project_stages_project_id_idx on project_stages (project_id, sort_order);

-- ----------------------------------------------------------------- updates --

create table updates (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects on delete cascade,
  author_id     uuid references profiles on delete set null,
  stage_id      uuid references project_stages on delete set null,
  title         text not null,
  body          text not null default '',
  -- null means draft. Staff can post from site and finish the note later.
  published_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index updates_project_published_idx
  on updates (project_id, published_at desc nulls last);

create table update_photos (
  id             uuid primary key default gen_random_uuid(),
  update_id      uuid not null references updates on delete cascade,
  storage_path   text not null,
  caption        text,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

create index update_photos_update_id_idx on update_photos (update_id, sort_order);

-- --------------------------------------------------------------- documents --

create table documents (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references projects on delete cascade,
  title                 text not null,
  category              document_category not null default 'other',
  storage_path          text not null,
  size_bytes            bigint,
  uploaded_by           uuid references profiles on delete set null,
  -- Staff can stage a document before the homeowner is meant to see it.
  visible_to_homeowner  boolean not null default true,
  created_at            timestamptz not null default now()
);

create index documents_project_id_idx on documents (project_id, created_at desc);

-- --------------------------------------------------------------------- RLS --

alter table profiles        enable row level security;
alter table projects        enable row level security;
alter table project_members enable row level security;
alter table project_stages  enable row level security;
alter table updates         enable row level security;
alter table update_photos   enable row level security;
alter table documents       enable row level security;

-- profiles: everyone reads their own; staff read all; nobody changes their own role.
create policy profiles_select_self on profiles
  for select to authenticated using (id = (select auth.uid()) or is_staff());

create policy profiles_update_self on profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select role from profiles where id = (select auth.uid())));

create policy profiles_staff_write on profiles
  for all to authenticated using (is_staff()) with check (is_staff());

-- projects and everything hanging off them: staff write, members read.
create policy projects_select on projects
  for select to authenticated using (can_see_project(id));
create policy projects_staff_write on projects
  for all to authenticated using (is_staff()) with check (is_staff());

create policy project_members_select on project_members
  for select to authenticated using (user_id = (select auth.uid()) or is_staff());
create policy project_members_staff_write on project_members
  for all to authenticated using (is_staff()) with check (is_staff());

create policy project_stages_select on project_stages
  for select to authenticated using (can_see_project(project_id));
create policy project_stages_staff_write on project_stages
  for all to authenticated using (is_staff()) with check (is_staff());

-- Homeowners see published updates only; staff see drafts too.
create policy updates_select on updates
  for select to authenticated
  using (can_see_project(project_id) and (published_at is not null or is_staff()));
create policy updates_staff_write on updates
  for all to authenticated using (is_staff()) with check (is_staff());

create policy update_photos_select on update_photos
  for select to authenticated
  using (exists (
    select 1 from updates u
    where u.id = update_id
      and can_see_project(u.project_id)
      and (u.published_at is not null or is_staff())
  ));
create policy update_photos_staff_write on update_photos
  for all to authenticated using (is_staff()) with check (is_staff());

create policy documents_select on documents
  for select to authenticated
  using (can_see_project(project_id) and (visible_to_homeowner or is_staff()));
create policy documents_staff_write on documents
  for all to authenticated using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------- storage --

insert into storage.buckets (id, name, public) values
  ('project-photos', 'project-photos', false),
  ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

-- Objects are keyed <project_id>/<filename>, so the first path segment decides
-- who may read them. Served to the browser as signed URLs, never public.
create policy storage_photos_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-photos'
    and can_see_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_photos_staff_write on storage.objects
  for all to authenticated
  using (bucket_id = 'project-photos' and is_staff())
  with check (bucket_id = 'project-photos' and is_staff());

create policy storage_documents_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-documents'
    and can_see_project(((storage.foldername(name))[1])::uuid)
  );

create policy storage_documents_staff_write on storage.objects
  for all to authenticated
  using (bucket_id = 'project-documents' and is_staff())
  with check (bucket_id = 'project-documents' and is_staff());
