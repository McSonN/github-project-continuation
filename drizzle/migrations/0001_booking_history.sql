alter table public.bookings add column rejection_reason text;

create table public.booking_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  action text not null,
  actor_id uuid,
  actor_email text,
  owner_id uuid,
  changes jsonb,
  created_at timestamptz not null default now()
);
create index on public.booking_history(booking_id, created_at);
grant select on public.booking_history to authenticated;
grant all on public.booking_history to service_role;
alter table public.booking_history enable row level security;
create policy "admins read history" on public.booking_history for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.log_booking_change() returns trigger language plpgsql security definer set search_path=public as $$
declare diff jsonb := '{}'::jsonb; k text; act text;
begin
  if tg_op = 'INSERT' then
    act := 'created'; diff := to_jsonb(new) - 'id' - 'user_id' - 'created_at';
  elsif tg_op = 'DELETE' then
    act := 'deleted'; diff := to_jsonb(old) - 'id' - 'user_id' - 'created_at';
  else
    for k in select jsonb_object_keys(to_jsonb(new)) loop
      if to_jsonb(new)->k is distinct from to_jsonb(old)->k then
        diff := diff || jsonb_build_object(k, jsonb_build_object('old', to_jsonb(old)->k, 'new', to_jsonb(new)->k));
      end if;
    end loop;
    if diff = '{}'::jsonb then return new; end if;
    act := case when new.status is distinct from old.status then 'status:' || new.status else 'updated' end;
  end if;
  insert into public.booking_history(booking_id, action, actor_id, actor_email, owner_id, changes)
  values (coalesce(new.id, old.id), act, auth.uid(), auth.jwt()->>'email', coalesce(new.user_id, old.user_id), diff);
  return coalesce(new, old);
end $$;
create trigger bookings_history after insert or update or delete on public.bookings for each row execute function public.log_booking_change();