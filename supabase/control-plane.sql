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
  control jsonb not null default '{}'::jsonb,
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
    'logs.refresh',
    'command.policy.update',
    'guard.mode.set',
    'games.settings.update'
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
  claim_attempts integer not null default 0,
  lease_expires_at timestamptz,
  result jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

alter table public.control_commands
  add column if not exists claim_attempts integer not null default 0;

alter table public.control_commands
  add column if not exists lease_expires_at timestamptz;

create index if not exists control_commands_queue_idx
  on public.control_commands (status, created_at)
  where status = 'pending';

create index if not exists control_commands_requested_idx
  on public.control_commands (requested_by, created_at desc);

create index if not exists control_commands_lease_idx
  on public.control_commands (lease_expires_at)
  where status = 'claimed';

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

create or replace function public.enforce_control_command_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_command_count integer;
  recent_dm_count integer;
begin
  perform pg_advisory_xact_lock(
    hashtextextended('control-command:' || new.requested_by, 0)
  );

  select count(*)
  into recent_command_count
  from public.control_commands
  where
    requested_by = new.requested_by
    and created_at >= now() - interval '1 minute';

  if recent_command_count >= 8 then
    raise exception using
      errcode = 'P0001',
      message = 'CONTROL_RATE_LIMITED';
  end if;

  if new.type = 'dm.send' then
    select count(*)
    into recent_dm_count
    from public.control_commands
    where
      requested_by = new.requested_by
      and type = 'dm.send'
      and created_at >= now() - interval '10 minutes';

    if recent_dm_count >= 5 then
      raise exception using
        errcode = 'P0001',
        message = 'CONTROL_DM_RATE_LIMITED';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists control_commands_rate_limit
  on public.control_commands;
create trigger control_commands_rate_limit
before insert on public.control_commands
for each row execute function public.enforce_control_command_insert();

create or replace function public.write_control_command_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.control_audit_log (
    actor_discord_id,
    actor_name,
    action,
    target,
    command_id,
    metadata
  )
  values (
    new.requested_by,
    new.requested_by_name,
    new.type,
    new.target,
    new.id,
    case
      when new.type = 'dm.send'
        then jsonb_build_object('encryptedPayload', true)
      else '{}'::jsonb
    end
  );

  return new;
end;
$$;

drop trigger if exists control_commands_write_audit
  on public.control_commands;
create trigger control_commands_write_audit
after insert on public.control_commands
for each row execute function public.write_control_command_audit();

create or replace function public.prevent_control_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception using
    errcode = 'P0001',
    message = 'CONTROL_AUDIT_LOG_IS_IMMUTABLE';
end;
$$;

drop trigger if exists control_audit_log_immutable
  on public.control_audit_log;
create trigger control_audit_log_immutable
before update or delete on public.control_audit_log
for each row execute function public.prevent_control_audit_mutation();

revoke all on function public.enforce_control_command_insert()
  from public, anon, authenticated;
revoke all on function public.write_control_command_audit()
  from public, anon, authenticated;
revoke all on function public.prevent_control_audit_mutation()
  from public, anon, authenticated;

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
  set
    status = 'expired',
    completed_at = now(),
    lease_expires_at = null,
    error_code = 'EXPIRED',
    error_message = 'The command expired before completion.'
  where status in ('pending', 'claimed') and expires_at <= now();

  update public.control_commands
  set
    status = 'failed',
    completed_at = now(),
    lease_expires_at = null,
    error_code = 'AGENT_LEASE_EXHAUSTED',
    error_message = 'The agent did not complete this command after three leases.'
  where
    status = 'claimed'
    and expires_at > now()
    and coalesce(
      lease_expires_at,
      claimed_at + interval '2 minutes',
      now() - interval '1 second'
    ) <= now()
    and claim_attempts >= 3;

  update public.control_commands
  set
    status = 'pending',
    completed_at = null,
    lease_expires_at = null,
    error_code = null,
    error_message = null
  where
    status = 'claimed'
    and expires_at > now()
    and coalesce(
      lease_expires_at,
      claimed_at + interval '2 minutes',
      now() - interval '1 second'
    ) <= now()
    and claim_attempts < 3;

  return query
  with picked as (
    select id
    from public.control_commands
    where
      status = 'pending'
      and expires_at > now()
      and claim_attempts < 3
    order by created_at asc
    for update skip locked
    limit least(greatest(coalesce(p_limit, 1), 1), 10)
  )
  update public.control_commands as command
  set
    status = 'claimed',
    claimed_by = p_agent_id,
    claimed_at = now(),
    lease_expires_at = now() + interval '2 minutes',
    claim_attempts = command.claim_attempts + 1,
    completed_at = null,
    error_code = null,
    error_message = null
  from picked
  where command.id = picked.id
  returning command.*;
end;
$$;

revoke all on function public.claim_control_commands(text, integer) from public, anon, authenticated;
grant execute on function public.claim_control_commands(text, integer) to service_role;

create or replace function public.complete_control_command(
  p_agent_id text,
  p_command_id uuid,
  p_status text,
  p_result jsonb,
  p_error_code text,
  p_error_message text,
  p_completed_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_id uuid;
begin
  if p_status not in ('succeeded', 'failed') then
    raise exception 'Invalid completion status';
  end if;

  update public.control_commands
  set
    status = p_status,
    result = p_result,
    error_code = p_error_code,
    error_message = p_error_message,
    completed_at = coalesce(p_completed_at, now()),
    lease_expires_at = null
  where
    id = p_command_id
    and claimed_by = p_agent_id
    and (
      status = 'claimed'
      or (status = 'pending' and claim_attempts > 0)
      or (status = 'expired' and claim_attempts > 0)
      or (status = 'failed' and error_code = 'AGENT_LEASE_EXHAUSTED')
    )
  returning id into updated_id;

  if updated_id is not null then
    return true;
  end if;

  return exists (
    select 1
    from public.control_commands
    where
      id = p_command_id
      and claimed_by = p_agent_id
      and status = p_status
  );
end;
$$;

revoke all on function public.complete_control_command(
  text,
  uuid,
  text,
  jsonb,
  text,
  text,
  timestamptz
) from public, anon, authenticated;

grant execute on function public.complete_control_command(
  text,
  uuid,
  text,
  jsonb,
  text,
  text,
  timestamptz
) to service_role;
