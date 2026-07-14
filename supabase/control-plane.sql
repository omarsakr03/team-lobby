create extension if not exists pgcrypto;

create table if not exists public.control_agent_status (
  agent_id text primary key,
  version text not null,
  last_seen_at timestamptz not null default now(),
  observed_at timestamptz,
  system jsonb not null default '{}'::jsonb,
  processes jsonb not null default '[]'::jsonb,
  discord jsonb not null default '{}'::jsonb,
  logs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.control_commands (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'process.start',
    'process.stop',
    'process.restart',
    'dm.send',
    'status.refresh',
    'logs.refresh'
  )),
  target text,
  payload_ciphertext text not null,
  payload_iv text not null,
  payload_tag text not null,
  status text not null default 'pending' check (status in (
    'pending',
    'claimed',
    'succeeded',
    'failed',
    'expired'
  )),
  requested_by text not null,
  requested_by_name text,
  claimed_by text,
  result jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

create index if not exists control_commands_queue_idx
  on public.control_commands (status, created_at)
  where status = 'pending';

create index if not exists control_commands_requested_idx
  on public.control_commands (requested_by, created_at desc);

create table if not exists public.control_audit_log (
  id bigint generated always as identity primary key,
  actor_discord_id text not null,
  actor_name text,
  action text not null,
  target text,
  command_id uuid references public.control_commands(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists control_audit_log_created_idx
  on public.control_audit_log (created_at desc);

alter table public.control_agent_status enable row level security;
alter table public.control_commands enable row level security;
alter table public.control_audit_log enable row level security;

revoke all on public.control_agent_status from anon, authenticated;
revoke all on public.control_commands from anon, authenticated;
revoke all on public.control_audit_log from anon, authenticated;

create or replace function public.claim_control_commands(
  p_agent_id text,
  p_limit integer default 5
)
returns setof public.control_commands
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.control_commands
  set status = 'expired', completed_at = now(), error_code = 'EXPIRED'
  where status = 'pending' and expires_at <= now();

  return query
  with picked as (
    select id
    from public.control_commands
    where status = 'pending' and expires_at > now()
    order by created_at asc
    for update skip locked
    limit least(greatest(coalesce(p_limit, 1), 1), 10)
  )
  update public.control_commands as command
  set
    status = 'claimed',
    claimed_by = p_agent_id,
    claimed_at = now()
  from picked
  where command.id = picked.id
  returning command.*;
end;
$$;

revoke all on function public.claim_control_commands(text, integer) from public, anon, authenticated;
grant execute on function public.claim_control_commands(text, integer) to service_role;
