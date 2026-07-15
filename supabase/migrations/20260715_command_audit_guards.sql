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
