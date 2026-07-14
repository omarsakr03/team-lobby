-- Team Lobby Control Center V2 migration.
-- Run once in Supabase SQL Editor before deploying the V2 site and agent.

alter table public.control_agent_status
  add column if not exists control jsonb not null default '{}'::jsonb;

alter table public.control_commands
  drop constraint if exists control_commands_type_check;

alter table public.control_commands
  add constraint control_commands_type_check check (type in (
    'process.start',
    'process.stop',
    'process.restart',
    'dm.send',
    'status.refresh',
    'logs.refresh',
    'command.policy.update',
    'guard.mode.set',
    'games.settings.update'
  ));
