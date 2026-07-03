-- CoverOps AI Supabase/PostgreSQL schema
-- This is not required for the mock demo, but it shows the production-ready data model.

create table if not exists insurance_cases (
  id text primary key,
  business_name text not null,
  industry text not null,
  state text not null,
  employees integer not null,
  annual_revenue numeric not null,
  prior_claims integer not null,
  coverage text not null,
  urgency text not null,
  status text not null check (status in ('new', 'review', 'approved', 'rejected')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  confidence integer not null,
  missing_fields jsonb not null default '[]'::jsonb,
  extracted jsonb not null default '{}'::jsonb,
  underwriter_summary text not null,
  follow_up_questions jsonb not null default '[]'::jsonb,
  notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id text not null references insurance_cases(id) on delete cascade,
  file_name text not null,
  extracted_text text,
  extraction_status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id text primary key,
  case_id text not null references insurance_cases(id) on delete cascade,
  actor text not null check (actor in ('ai', 'human', 'system')),
  action text not null,
  detail text not null,
  confidence integer,
  created_at timestamptz not null default now()
);

create index if not exists insurance_cases_status_idx on insurance_cases(status);
create index if not exists insurance_cases_risk_idx on insurance_cases(risk_level);
create index if not exists audit_events_case_idx on audit_events(case_id);
