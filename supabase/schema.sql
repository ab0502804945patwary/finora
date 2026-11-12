-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
create table if not exists public.documents (
  id              text primary key,
  company_name    text not null,
  registration_no text,
  doc_type        text not null,
  audit_date      text,
  fy_end          text,
  issued_on       text not null,
  sha256          text not null unique,
  original_sha256 text,
  status          text not null default 'valid' check (status in ('valid', 'revoked')),
  revoked_reason  text,
  file_ref        text not null,
  file_name       text,
  created_at      bigint not null
);

create index if not exists documents_company_idx on public.documents (company_name);
create index if not exists documents_created_idx on public.documents (created_at desc);

-- Lock the table: with RLS on and no policies, the public anon / publishable keys can read and write nothing.
-- Only the server (service_role key) can access it.
alter table public.documents enable row level security;
