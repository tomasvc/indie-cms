-- Follow-ups from the UX review (27 Oct 2026):
--   1. Time entries can be billed on an invoice, and voiding or deleting the invoice releases them.
--   2. Invoices record when they were sent and can be shared through a private read-only link.
--   3. The dashboard can say what changed since the last visit.
--   4. Projects know whether they're fixed-fee or hourly, and their own hourly rate.
--   5. Progress follows the task list once a project has tasks.
--   6. Profile photos are uploaded to storage instead of pasted as a URL.

begin;

-- ---------------------------------------------------------------------------
-- 1. Billing time
-- ---------------------------------------------------------------------------
-- Deleting an invoice now returns its time to "unbilled" instead of being blocked.
alter table public.time_entries drop constraint if exists time_entries_invoice_id_fkey;
alter table public.time_entries
    add constraint time_entries_invoice_id_fkey
    foreign key (invoice_id) references public.invoices(id) on delete set null;

create index if not exists time_entries_invoice_id_idx on public.time_entries (invoice_id);

-- ---------------------------------------------------------------------------
-- 2. Sent date and share links
-- ---------------------------------------------------------------------------
alter table public.invoices add column if not exists sent_at timestamptz;
alter table public.invoices add column if not exists share_token uuid;
alter table public.invoices drop constraint if exists invoices_share_token_key;
alter table public.invoices add constraint invoices_share_token_key unique (share_token);

update public.invoices
set sent_at = coalesce(issue_date::timestamptz, created_at, now())
where status in ('sent', 'paid') and sent_at is null;

-- Stamp the first time an invoice becomes sent (or is created as sent/paid).
create or replace function public.invoices_stamp_sent_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if new.status in ('sent', 'paid') and new.sent_at is null then
        new.sent_at := case when tg_op = 'INSERT' then coalesce(new.issue_date::timestamptz, now()) else now() end;
    end if;
    return new;
end;
$$;

drop trigger if exists invoices_stamp_sent_at_trigger on public.invoices;
create trigger invoices_stamp_sent_at_trigger
    before insert or update of status on public.invoices
    for each row execute function public.invoices_stamp_sent_at();

-- A voided invoice no longer bills its time.
create or replace function public.invoices_release_time_on_void()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if new.status = 'void' and old.status <> 'void' then
        update time_entries set invoice_id = null where invoice_id = new.id;
    end if;
    return null;
end;
$$;

drop trigger if exists invoices_release_time_on_void_trigger on public.invoices;
create trigger invoices_release_time_on_void_trigger
    after update of status on public.invoices
    for each row execute function public.invoices_release_time_on_void();

-- create_invoice can bill unbilled time entries in the same transaction.
drop function if exists public.create_invoice(jsonb, jsonb);
create or replace function public.create_invoice(
    p_invoice jsonb,
    p_line_items jsonb,
    p_time_entry_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_id uuid := gen_random_uuid();
    v_project uuid := (p_invoice->>'project_id')::uuid;
    v_discount_type text := coalesce(p_invoice->>'discount_type', 'flat');
    v_discount_value numeric := coalesce((p_invoice->>'discount_value')::numeric, 0);
    v_totals record;
    v_linked integer;
begin
    if jsonb_typeof(p_line_items) <> 'array' or jsonb_array_length(p_line_items) = 0 then
        raise exception 'An invoice needs at least one line item' using errcode = '22023';
    end if;
    if coalesce(p_invoice->>'status', 'draft') not in ('draft', 'sent') then
        raise exception 'New invoices must be draft or sent' using errcode = '22023';
    end if;

    select * into v_totals from invoice_totals(p_line_items, v_discount_type, v_discount_value);

    insert into invoices (
        id, user_id, project_id, client_id, code, currency, status,
        issue_date, due_date, notes,
        discount_type, discount_value, discount_amount, subtotal, total
    ) values (
        v_id,
        auth.uid(),
        v_project,
        (p_invoice->>'client_id')::uuid,
        p_invoice->>'code',
        p_invoice->>'currency',
        coalesce(p_invoice->>'status', 'draft'),
        (p_invoice->>'issue_date')::date,
        (p_invoice->>'due_date')::date,
        nullif(p_invoice->>'notes', ''),
        v_discount_type,
        v_discount_value,
        nullif(v_totals.discount_amount, 0),
        v_totals.subtotal,
        v_totals.total
    );

    perform replace_invoice_line_items(v_id, p_line_items);

    if coalesce(cardinality(p_time_entry_ids), 0) > 0 then
        update time_entries
        set invoice_id = v_id
        where id = any(p_time_entry_ids)
          and user_id = auth.uid()
          and project_id = v_project
          and invoice_id is null
          and coalesce(billable, true);
        get diagnostics v_linked = row_count;
        if v_linked <> cardinality(p_time_entry_ids) then
            raise exception 'Some of this time has already been invoiced' using errcode = 'P0003';
        end if;
    end if;

    return v_id;
end;
$$;

grant execute on function public.create_invoice(jsonb, jsonb, uuid[]) to authenticated;

-- Read-only view of one invoice for whoever holds its link. Void invoices are never shown.
create or replace function public.get_shared_invoice(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
    select jsonb_build_object(
        'invoice', jsonb_build_object(
            'code', i.code, 'status', i.status, 'currency', i.currency,
            'issue_date', i.issue_date, 'due_date', i.due_date, 'paid_date', i.paid_date,
            'subtotal', i.subtotal, 'discount_type', i.discount_type, 'discount_value', i.discount_value,
            'discount_amount', i.discount_amount, 'total', i.total, 'notes', i.notes
        ),
        'items', coalesce((
            select jsonb_agg(jsonb_build_object(
                'description', li.description, 'quantity', li.quantity, 'unit', li.unit,
                'unit_price', li.unit_price, 'total', li.total
            ) order by li.position)
            from line_items li where li.invoice_id = i.id
        ), '[]'::jsonb),
        'from', jsonb_build_object(
            'full_name', p.full_name, 'company_name', p.company_name, 'address', p.address,
            'tax_id', p.tax_id, 'language', p.language,
            'email', (select u.email from auth.users u where u.id = i.user_id)
        ),
        'to', jsonb_build_object(
            'name', c.name, 'company', c.company, 'email', c.email,
            'address', c.address, 'country', c.country, 'vat_number', c.vat_number
        ),
        'project', pr.title
    )
    from invoices i
    left join profiles p on p.id = i.user_id
    left join clients c on c.id = i.client_id
    left join projects pr on pr.id = i.project_id
    where i.share_token = p_token and i.status <> 'void';
$$;

revoke execute on function public.get_shared_invoice(uuid) from public;
grant execute on function public.get_shared_invoice(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. "Since you were last here"
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.profiles add column if not exists previous_seen_at timestamptz;

-- Called when the dashboard loads. A visit more than an hour after the last one starts a new
-- "session", so refreshing the page doesn't wipe the summary. Returns the start of the gap.
create or replace function public.record_dashboard_visit()
returns timestamptz
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_previous timestamptz;
begin
    update profiles set
        previous_seen_at = case
            when last_seen_at is null or last_seen_at < now() - interval '1 hour' then last_seen_at
            else previous_seen_at end,
        last_seen_at = now()
    where id = auth.uid()
    returning previous_seen_at into v_previous;
    return v_previous;
end;
$$;

grant execute on function public.record_dashboard_visit() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Billing type and project rate
-- ---------------------------------------------------------------------------
alter table public.projects add column if not exists billing_type text not null default 'fixed';
alter table public.projects drop constraint if exists projects_billing_type_check;
alter table public.projects
    add constraint projects_billing_type_check check (billing_type in ('fixed', 'hourly'));
alter table public.projects add column if not exists hourly_rate numeric(12,2);
alter table public.projects drop constraint if exists projects_hourly_rate_check;
alter table public.projects
    add constraint projects_hourly_rate_check check (hourly_rate is null or hourly_rate >= 0);

-- ---------------------------------------------------------------------------
-- 5. Progress from tasks
-- ---------------------------------------------------------------------------
create or replace function public.project_progress_from_tasks(p_project uuid)
returns void
language sql
set search_path = public
as $$
    update projects
    set progress = sub.pct
    from (
        select round(100.0 * count(*) filter (where status = 'done') / count(*)) as pct
        from tasks where project_id = p_project
        having count(*) > 0
    ) sub
    where projects.id = p_project;
$$;

create or replace function public.tasks_sync_project_progress()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if tg_op in ('UPDATE', 'DELETE') then
        perform project_progress_from_tasks(old.project_id);
    end if;
    if tg_op in ('INSERT', 'UPDATE') and (tg_op = 'INSERT' or new.project_id is distinct from old.project_id or new.status is distinct from old.status) then
        perform project_progress_from_tasks(new.project_id);
    end if;
    return null;
end;
$$;

drop trigger if exists tasks_sync_project_progress_trigger on public.tasks;
create trigger tasks_sync_project_progress_trigger
    after insert or update of status, project_id or delete on public.tasks
    for each row execute function public.tasks_sync_project_progress();

-- Bring existing projects that have tasks in line.
select public.project_progress_from_tasks(id) from public.projects p
where exists (select 1 from public.tasks t where t.project_id = p.id);

-- ---------------------------------------------------------------------------
-- 6. Avatar uploads: public bucket, each user writes only inside their own folder
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "Avatar owners can upload" on storage.objects;
create policy "Avatar owners can upload" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Avatar owners can replace" on storage.objects;
create policy "Avatar owners can replace" on storage.objects
    for update to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Avatar owners can delete" on storage.objects;
create policy "Avatar owners can delete" on storage.objects
    for delete to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
