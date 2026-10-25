-- Invoice integrity: one server-computed total, consistent payment state,
-- per-user invoice numbers, and transactional create/update.
--
-- `invoices.amount` and `invoices.line_items` (jsonb) are kept but no longer written;
-- drop them with supabase/pending/drop_legacy_invoice_columns.sql once the new app code is deployed.

begin;

-- ---------------------------------------------------------------------------
-- 1. Discount is stored as entered (type + value) so invoices can be re-edited.
-- ---------------------------------------------------------------------------
alter table public.invoices add column if not exists discount_type text not null default 'flat';
alter table public.invoices add column if not exists discount_value numeric(12,2) not null default 0;

-- Line items are written in one statement, so created_at can't order them.
alter table public.line_items add column if not exists position integer not null default 0;

-- Match invoices.amount (numeric(12,2)) so every legacy value fits in a line item.
alter table public.line_items alter column unit_price type numeric(12,2);
alter table public.line_items alter column total type numeric(12,2);

update public.invoices
set discount_value = coalesce(discount_amount, 0)
where discount_value = 0 and coalesce(discount_amount, 0) > 0;

-- ---------------------------------------------------------------------------
-- 2. Backfill totals and currency for legacy rows that only have `amount`.
-- ---------------------------------------------------------------------------
alter table public.invoices alter column amount drop not null;

update public.invoices set total = amount where total is null;
update public.invoices set subtotal = total + coalesce(discount_amount, 0) where subtotal is null;
update public.invoices set currency = 'USD' where currency is null or currency = '';

-- Legacy invoices without line items get a single line carrying their value,
-- so every invoice's total is derived from its lines.
insert into public.line_items (invoice_id, description, quantity, unit, unit_price, total)
select i.id, 'Invoice total', 1, 'flat', i.subtotal, i.subtotal
from public.invoices i
where not exists (select 1 from public.line_items li where li.invoice_id = i.id);

-- ---------------------------------------------------------------------------
-- 3. Payment state. "overdue" is derived (sent + past due), not stored.
-- ---------------------------------------------------------------------------
update public.invoices set status = 'sent' where status = 'overdue';

update public.invoices
set paid_date = coalesce(updated_at::date, due_date, issue_date, current_date)
where status = 'paid' and paid_date is null;

update public.invoices set paid_date = null where status = 'void' and paid_date is not null;
update public.invoices set status = 'paid' where status in ('draft', 'sent') and paid_date is not null;

update public.invoices set payment_method = null where status <> 'paid';
update public.invoices
set payment_method = 'other'
where payment_method is not null
  and payment_method not in ('bank_transfer', 'stripe', 'paypal', 'cash', 'other');

-- ---------------------------------------------------------------------------
-- 4. Invoice numbers are unique per user, not globally.
-- ---------------------------------------------------------------------------
update public.invoices set code = upper(left(replace(id::text, '-', ''), 8)) where code is null or code = '';

alter table public.invoices drop constraint if exists invoices_number_key;
alter table public.invoices
    add constraint invoices_user_code_key unique (user_id, code);

-- ---------------------------------------------------------------------------
-- 5. Constraints.
-- ---------------------------------------------------------------------------
alter table public.invoices alter column total set not null;
alter table public.invoices alter column subtotal set not null;
alter table public.invoices alter column currency set not null;
alter table public.invoices alter column code set not null;

alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices
    add constraint invoices_status_check check (status in ('draft', 'sent', 'paid', 'void'));

alter table public.invoices drop constraint if exists invoices_paid_consistency;
alter table public.invoices
    add constraint invoices_paid_consistency check ((status = 'paid') = (paid_date is not null));

alter table public.invoices drop constraint if exists invoices_payment_method_check;
alter table public.invoices
    add constraint invoices_payment_method_check check (
        payment_method is null
        or (status = 'paid' and payment_method in ('bank_transfer', 'stripe', 'paypal', 'cash', 'other'))
    );

alter table public.invoices drop constraint if exists invoices_totals_check;
alter table public.invoices
    add constraint invoices_totals_check check (subtotal >= 0 and total >= 0 and total <= subtotal);

alter table public.invoices drop constraint if exists invoices_discount_check;
alter table public.invoices
    add constraint invoices_discount_check check (
        discount_type in ('percent', 'flat')
        and discount_value >= 0
        and (discount_type <> 'percent' or discount_value <= 100)
    );

-- ---------------------------------------------------------------------------
-- 6. Totals are computed in one place.
-- ---------------------------------------------------------------------------
create or replace function public.invoice_totals(
    p_line_items jsonb,
    p_discount_type text,
    p_discount_value numeric
)
returns table (subtotal numeric, discount_amount numeric, total numeric)
language sql
immutable
set search_path = public
as $$
    with s as (
        select coalesce(sum(round(round((li->>'quantity')::numeric, 2) * round((li->>'unit_price')::numeric, 2), 2)), 0) as subtotal
        from jsonb_array_elements(p_line_items) li
    ), d as (
        select
            s.subtotal,
            round(least(
                s.subtotal,
                case when p_discount_type = 'percent'
                     then s.subtotal * p_discount_value / 100
                     else p_discount_value end
            ), 2) as discount_amount
        from s
    )
    select d.subtotal, d.discount_amount, d.subtotal - d.discount_amount from d;
$$;

create or replace function public.replace_invoice_line_items(p_invoice_id uuid, p_line_items jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
    delete from line_items where invoice_id = p_invoice_id;
    insert into line_items (invoice_id, position, description, quantity, unit, unit_price, total)
    select
        p_invoice_id,
        li.ord - 1,
        li.value->>'description',
        round((li.value->>'quantity')::numeric, 2),
        li.value->>'unit',
        round((li.value->>'unit_price')::numeric, 2),
        round(round((li.value->>'quantity')::numeric, 2) * round((li.value->>'unit_price')::numeric, 2), 2)
    from jsonb_array_elements(p_line_items) with ordinality as li(value, ord);
$$;

-- ---------------------------------------------------------------------------
-- 7. Create and update an invoice with its line items in one transaction.
--    Payment fields are not accepted here; use the payment actions instead.
-- ---------------------------------------------------------------------------
create or replace function public.create_invoice(p_invoice jsonb, p_line_items jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_id uuid := gen_random_uuid();
    v_discount_type text := coalesce(p_invoice->>'discount_type', 'flat');
    v_discount_value numeric := coalesce((p_invoice->>'discount_value')::numeric, 0);
    v_totals record;
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
        (p_invoice->>'project_id')::uuid,
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
    return v_id;
end;
$$;

create or replace function public.update_invoice(p_id uuid, p_invoice jsonb, p_line_items jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_discount_type text := coalesce(p_invoice->>'discount_type', 'flat');
    v_discount_value numeric := coalesce((p_invoice->>'discount_value')::numeric, 0);
    v_status text := p_invoice->>'status';
    v_totals record;
begin
    if jsonb_typeof(p_line_items) <> 'array' or jsonb_array_length(p_line_items) = 0 then
        raise exception 'An invoice needs at least one line item' using errcode = '22023';
    end if;
    if v_status is not null and v_status not in ('draft', 'sent', 'void') then
        raise exception 'Use the payment actions to mark an invoice paid' using errcode = '22023';
    end if;

    select * into v_totals from invoice_totals(p_line_items, v_discount_type, v_discount_value);

    update invoices set
        project_id = (p_invoice->>'project_id')::uuid,
        client_id = (p_invoice->>'client_id')::uuid,
        code = p_invoice->>'code',
        currency = p_invoice->>'currency',
        status = coalesce(v_status, status),
        issue_date = (p_invoice->>'issue_date')::date,
        due_date = (p_invoice->>'due_date')::date,
        notes = nullif(p_invoice->>'notes', ''),
        discount_type = v_discount_type,
        discount_value = v_discount_value,
        discount_amount = nullif(v_totals.discount_amount, 0),
        subtotal = v_totals.subtotal,
        total = v_totals.total,
        updated_at = now()
    where id = p_id and status <> 'paid';

    if not found then
        if exists (select 1 from invoices where id = p_id) then
            raise exception 'Paid invoices can''t be edited; mark it unpaid first' using errcode = '55000';
        end if;
        raise exception 'Invoice not found' using errcode = 'P0002';
    end if;

    perform replace_invoice_line_items(p_id, p_line_items);
end;
$$;

grant execute on function public.invoice_totals(jsonb, text, numeric) to authenticated;
grant execute on function public.create_invoice(jsonb, jsonb) to authenticated;
grant execute on function public.update_invoice(uuid, jsonb, jsonb) to authenticated;
revoke execute on function public.replace_invoice_line_items(uuid, jsonb) from public, anon;
grant execute on function public.replace_invoice_line_items(uuid, jsonb) to authenticated;

commit;
