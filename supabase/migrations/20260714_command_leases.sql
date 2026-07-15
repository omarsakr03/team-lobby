alter table public.control_commands
  add column if not exists claim_attempts integer not null default 0;

alter table public.control_commands
  add column if not exists lease_expires_at timestamptz;

create index if not exists control_commands_lease_idx
  on public.control_commands (lease_expires_at)
  where status = 'claimed';

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

revoke all on function public.claim_control_commands(text, integer)
  from public, anon, authenticated;
grant execute on function public.claim_control_commands(text, integer)
  to service_role;

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
