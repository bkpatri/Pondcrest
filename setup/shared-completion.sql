-- Prepared only: run against the selected Supabase project after access is verified.
-- This deliberately allows anyone to read and change completion, as requested.
-- Only item identifiers and completion are stored; no photos or personal details.
begin;
create table public.punch_completion (
 item_id text primary key check (item_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$'),
 complete boolean not null default false,
 revision integer not null default 0 check(revision >= 0),
 updated_at timestamptz not null default now()
);
alter table public.punch_completion enable row level security;
revoke all on table public.punch_completion from public,anon,authenticated;
grant select on table public.punch_completion to anon,authenticated;
grant insert(item_id,complete) on public.punch_completion to anon,authenticated;
grant update(complete) on public.punch_completion to anon,authenticated;
create policy "Shared completion is readable" on public.punch_completion for select to anon,authenticated using(true);
create policy "Visitors can initialize an item" on public.punch_completion for insert to anon,authenticated with check(true);
create policy "Visitors can change completion" on public.punch_completion for update to anon,authenticated using(true) with check(true);
create function public.punch_completion_stamp() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then NEW.revision:=OLD.revision+1; else NEW.revision:=0; end if;
 NEW.updated_at:=now();
 return NEW;
end;
$$;
revoke all on function public.punch_completion_stamp() from public,anon,authenticated;
create trigger punch_completion_stamp before insert or update on public.punch_completion for each row execute function public.punch_completion_stamp();
commit;
