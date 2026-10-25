-- Per-visitor demo sandboxes.
-- An anonymous session calls seed_demo_workspace() once. reset_demo_workspace()
-- wipes that session's rows and seeds again. delete_expired_demo_users() removes
-- anonymous accounts older than 24 hours; schedule it with pg_cron (see bottom).

begin;

alter table public.profiles add column if not exists is_demo boolean not null default false;

-- ---------------------------------------------------------------------------
-- Seed one studio so every screen has something to show. Dates are relative
-- to current_date, so overdue and "paid this month" stay true over time.
-- ---------------------------------------------------------------------------
create or replace function public.seed_demo_workspace()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_uid uuid := auth.uid();
    v_helio uuid;
    v_lumen uuid;
    v_fieldnote uuid;
    v_marlowe uuid;
    v_sable uuid;
    v_kin uuid;
    v_brand uuid;
    v_site uuid;
    v_mobile uuid;
    v_store uuid;
    v_deck uuid;
    v_rebrand uuid;
    v_report uuid;
    v_conference uuid;
    v_packaging uuid;
    v_paid_invoice uuid;
    v_month_start date := date_trunc('month', current_date)::date;
begin
    if v_uid is null
        or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is not true
    then
        raise exception 'Only demo sessions can be seeded' using errcode = '42501';
    end if;

    if exists (select 1 from clients where user_id = v_uid) then
        return;
    end if;

    update profiles set
        full_name = 'Alex Rivera',
        company_name = 'Northwind Studio',
        bio = 'Independent brand and product studio. Identity, websites, and the occasional app.',
        address = '120 Mercer Street, New York, NY',
        hourly_rate = 85,
        currency = 'USD',
        tax_id = '12-3456789',
        timezone = 'America/New_York',
        language = 'en',
        is_demo = true,
        onboarding_completed_at = coalesce(onboarding_completed_at, now()),
        notification_preferences = '{"email": true, "invoice_reminders": true}'::jsonb,
        updated_at = now()
    where id = v_uid;

    insert into clients (user_id, name, status, company, industry, email, country, last_contact) values
        (v_uid, 'Maya Chen', 'active', 'Helio Coffee', 'Food & drink', 'maya@heliocoffee.example', 'United States', now() - interval '2 days')
        returning id into v_helio;
    insert into clients (user_id, name, status, company, industry, email, country, last_contact) values
        (v_uid, 'Jonah Adler', 'active', 'Lumen Health', 'Healthcare', 'jonah@lumenhealth.example', 'United Kingdom', now() - interval '6 days')
        returning id into v_lumen;
    insert into clients (user_id, name, status, company, industry, email, country, last_contact) values
        (v_uid, 'Priya Shah', 'active', 'Fieldnote', 'Software', 'priya@fieldnote.example', 'United States', now() - interval '1 day')
        returning id into v_fieldnote;
    insert into clients (user_id, name, status, company, industry, email, country, last_contact) values
        (v_uid, 'Elena Voss', 'lead', 'Marlowe & Co', 'Publishing', 'elena@marlowe.example', 'Germany', now() - interval '12 days')
        returning id into v_marlowe;
    insert into clients (user_id, name, status, company, industry, email, country, last_contact) values
        (v_uid, 'Sam Okonkwo', 'archived', 'Sable Archive', 'Culture', 'sam@sable.example', 'United States', now() - interval '120 days')
        returning id into v_sable;
    insert into clients (user_id, name, status, company, industry, email, country, last_contact) values
        (v_uid, 'Chris Dalton', 'active', 'Kin & Co', 'Consulting', 'chris@kinandco.example', 'Canada', now() - interval '4 days')
        returning id into v_kin;

    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date) values
        (v_uid, v_helio, 'Helio brand refresh', 'A new identity for the retail coffee line, from mark to packaging guidelines.', 'active', 62, 'high', 'Branding', '#0f766e', 8500, 6000, 'USD', 80, current_date - 40, current_date + 25)
        returning id into v_brand;
    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date) values
        (v_uid, v_lumen, 'Lumen marketing site', 'Marketing site and content model for the patient portal launch.', 'active', 45, 'medium', 'Web', '#0369a1', 12000, 9000, 'GBP', 120, current_date - 30, current_date + 40)
        returning id into v_site;
    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date) values
        (v_uid, v_fieldnote, 'Fieldnote mobile MVP', 'iOS prototype for the field-research notebook.', 'review', 88, 'high', 'Product', '#7c3aed', 15000, 14000, 'USD', 160, current_date - 70, current_date + 10)
        returning id into v_mobile;
    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date) values
        (v_uid, v_helio, 'Helio storefront', 'Shopify storefront for subscriptions and wholesale.', 'active', 30, 'medium', 'Web', '#0f766e', 9800, 8000, 'USD', 90, current_date - 15, current_date + 50)
        returning id into v_store;
    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date) values
        (v_uid, v_kin, 'Series A pitch deck', 'Narrative and slides for the fundraise.', 'proposal', 10, 'low', 'Presentation', '#b45309', 2500, 1800, 'USD', 20, current_date - 5, current_date + 30)
        returning id into v_deck;
    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date) values
        (v_uid, v_marlowe, 'Marlowe rebrand', 'Proposal for a publishing house rebrand.', 'proposal', 0, 'medium', 'Branding', '#be123c', 6000, 5000, 'EUR', 60, current_date, current_date + 60)
        returning id into v_rebrand;
    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date, completed_date) values
        (v_uid, v_sable, 'Sable annual report', 'Editorial design for the 2025 report.', 'completed', 100, 'medium', 'Print', '#44403c', 4200, 3800, 'USD', 40, v_month_start - 70, v_month_start - 20, v_month_start - 18)
        returning id into v_report;
    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date, completed_date) values
        (v_uid, v_fieldnote, 'Conference identity', 'Identity system for the annual field conference.', 'archived', 100, 'low', 'Branding', '#7c3aed', 3600, 3200, 'USD', 30, current_date - 200, current_date - 140, current_date - 140)
        returning id into v_conference;
    insert into projects (user_id, client_id, title, description, status, progress, priority, category, color, value, budget, currency, estimated_hours, start_date, due_date, completed_date) values
        (v_uid, v_lumen, 'Clinic packaging', 'Packaging for the at-home test kit.', 'completed', 100, 'high', 'Packaging', '#0369a1', 3100, 2800, 'GBP', 28, v_month_start - 80, v_month_start - 40, v_month_start - 35)
        returning id into v_packaging;

    insert into tasks (project_id, assignee_id, priority, title, description, status, due_date, completed_date, estimated_hours) values
        (v_brand, v_uid, 'high', 'Logo lockups', 'Primary, stacked, and one-colour versions.', 'done', current_date - 6, current_date - 6, 8),
        (v_brand, v_uid, 'medium', 'Guidelines PDF', 'Usage rules for print and screen.', 'in_progress', current_date + 5, null, 12),
        (v_site, v_uid, 'high', 'Homepage copy', 'Waiting on the client for the final headline.', 'todo', current_date - 1, null, 6),
        (v_site, v_uid, 'medium', 'CMS setup', 'Content types for stories and clinicians.', 'in_progress', current_date + 10, null, 10),
        (v_mobile, v_uid, 'high', 'Usability test', 'Five sessions with field researchers.', 'done', current_date - 3, current_date - 2, 8),
        (v_mobile, v_uid, 'medium', 'App store screenshots', 'Six frames for the review build.', 'todo', current_date + 3, null, 4),
        (v_store, v_uid, 'medium', 'Audit checkout', 'Subscription and wholesale paths.', 'todo', current_date + 8, null, 6);

    -- Paid this month.
    insert into invoices (user_id, project_id, client_id, code, currency, status, issue_date, due_date, paid_date, payment_method, notes, discount_type, discount_value, discount_amount, subtotal, total) values
        (v_uid, v_brand, v_helio, '2401', 'USD', 'paid', v_month_start - 12, v_month_start + 2, v_month_start + 2, 'bank_transfer', 'Thank you. Balance settled by transfer.', 'flat', 120, 120, 2820, 2700)
        returning id into v_paid_invoice;
    insert into line_items (invoice_id, position, description, quantity, unit, unit_price, total) values
        (v_paid_invoice, 0, 'Brand strategy', 12, 'hrs', 85, 1020),
        (v_paid_invoice, 1, 'Visual identity', 1, 'flat', 1800, 1800);

    -- Paid last month, in GBP.
    insert into invoices (user_id, project_id, client_id, code, currency, status, issue_date, due_date, paid_date, payment_method, discount_type, discount_value, subtotal, total) values
        (v_uid, v_site, v_lumen, '2402', 'GBP', 'paid', v_month_start - 40, v_month_start - 20, v_month_start - 12, 'stripe', 'flat', 0, 4200, 4200)
        returning id into v_paid_invoice;
    insert into line_items (invoice_id, position, description, quantity, unit, unit_price, total) values
        (v_paid_invoice, 0, 'Site design', 20, 'hrs', 90, 1800),
        (v_paid_invoice, 1, 'Front-end build', 1, 'flat', 2400, 2400);

    -- Sent and past its due date: this is what the dashboard shows as overdue.
    insert into invoices (user_id, project_id, client_id, code, currency, status, issue_date, due_date, notes, discount_type, discount_value, discount_amount, subtotal, total) values
        (v_uid, v_mobile, v_fieldnote, '2403', 'USD', 'sent', current_date - 32, current_date - 11, 'Prototype milestone. 10% courtesy discount applied.', 'percent', 10, 345, 3450, 3105)
        returning id into v_paid_invoice;
    insert into line_items (invoice_id, position, description, quantity, unit, unit_price, total) values
        (v_paid_invoice, 0, 'UX and prototyping', 30, 'hrs', 95, 2850),
        (v_paid_invoice, 1, 'Clickable prototype', 1, 'flat', 600, 600);

    -- Sent, due inside the next 30 days.
    insert into invoices (user_id, project_id, client_id, code, currency, status, issue_date, due_date, discount_type, discount_value, subtotal, total) values
        (v_uid, v_store, v_helio, '2404', 'USD', 'sent', current_date - 4, current_date + 16, 'flat', 0, 2800, 2800)
        returning id into v_paid_invoice;
    insert into line_items (invoice_id, position, description, quantity, unit, unit_price, total) values
        (v_paid_invoice, 0, 'Storefront design', 1, 'flat', 2200, 2200),
        (v_paid_invoice, 1, 'Checkout QA', 8, 'hrs', 75, 600);

    -- Draft, not yet sent.
    insert into invoices (user_id, project_id, client_id, code, currency, status, issue_date, due_date, discount_type, discount_value, subtotal, total) values
        (v_uid, v_deck, v_kin, '2405', 'USD', 'draft', current_date, current_date + 20, 'flat', 0, 950, 950)
        returning id into v_paid_invoice;
    insert into line_items (invoice_id, position, description, quantity, unit, unit_price, total) values
        (v_paid_invoice, 0, 'Pitch deck', 1, 'flat', 950, 950);

    -- Voided proposal.
    insert into invoices (user_id, project_id, client_id, code, currency, status, issue_date, due_date, notes, discount_type, discount_value, subtotal, total) values
        (v_uid, v_rebrand, v_marlowe, '2406', 'EUR', 'void', current_date - 14, current_date + 7, 'Replaced by a revised proposal. Do not send.', 'flat', 0, 400, 400)
        returning id into v_paid_invoice;
    insert into line_items (invoice_id, position, description, quantity, unit, unit_price, total) values
        (v_paid_invoice, 0, 'Discovery', 1, 'flat', 400, 400);

    -- Paid two months ago, so revenue history is not a single month.
    insert into invoices (user_id, project_id, client_id, code, currency, status, issue_date, due_date, paid_date, payment_method, discount_type, discount_value, subtotal, total) values
        (v_uid, v_report, v_sable, '2407', 'USD', 'paid', v_month_start - 50, v_month_start - 30, v_month_start - 28, 'bank_transfer', 'flat', 0, 4200, 4200)
        returning id into v_paid_invoice;
    insert into line_items (invoice_id, position, description, quantity, unit, unit_price, total) values
        (v_paid_invoice, 0, 'Annual report design', 1, 'flat', 4200, 4200);

    insert into time_entries (project_id, user_id, invoice_id, description, hours, rate, approved, billable, entry_date)
    select v_brand, v_uid, id, 'Identity exploration', 14, 85, true, true, current_date - 9
    from invoices where user_id = v_uid and code = '2401';

    insert into time_entries (project_id, user_id, description, hours, rate, approved, billable, entry_date) values
        (v_site, v_uid, 'Homepage layout, not yet invoiced', 6, 90, true, true, current_date - 2),
        (v_mobile, v_uid, 'Prototype revisions', 5, 95, true, true, current_date - 4),
        (v_store, v_uid, 'Wholesale flow sketches', 3, 85, false, true, current_date - 1);
end;
$$;

create or replace function public.reset_demo_workspace()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_uid uuid := auth.uid();
begin
    if v_uid is null
        or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is not true
    then
        raise exception 'Only demo sessions can be reset' using errcode = '42501';
    end if;

    -- Time entries and invoices block project and client deletion.
    delete from time_entries where user_id = v_uid;
    delete from invoices where user_id = v_uid;
    delete from projects where user_id = v_uid;
    delete from clients where user_id = v_uid;

    perform seed_demo_workspace();
end;
$$;

-- Runs from pg_cron, not from a visitor's session.
create or replace function public.delete_expired_demo_users()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    delete from auth.users
    where is_anonymous
      and created_at < now() - interval '24 hours';
end;
$$;

grant execute on function public.seed_demo_workspace() to authenticated;
grant execute on function public.reset_demo_workspace() to authenticated;
revoke all on function public.delete_expired_demo_users() from public, anon, authenticated;

do $$
begin
    if exists (select 1 from pg_extension where extname = 'pg_cron') then
        perform cron.unschedule(jobid)
        from cron.job
        where jobname = 'delete-expired-demos';
        perform cron.schedule(
            'delete-expired-demos',
            '15 * * * *',
            'select public.delete_expired_demo_users()'
        );
    end if;
end;
$$;

commit;
