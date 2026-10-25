-- Expired demo cleanup deletes the auth user, and the profile cascades to
-- projects and clients. Invoices and time entries restrict that delete, and
-- time_entries.user_id does not cascade. Remove those rows first.
-- Project and invoice foreign keys stay ON DELETE RESTRICT so a normal
-- project delete still cannot wipe invoices or time entries.

create or replace function public.delete_expired_demo_users()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    expired uuid[];
begin
    select array_agg(id)
    into expired
    from auth.users
    where is_anonymous
      and created_at < now() - interval '24 hours';

    if expired is null then
        return;
    end if;

    delete from public.time_entries where user_id = any (expired);
    delete from public.invoices where user_id = any (expired);
    delete from auth.users where id = any (expired);
end;
$$;
