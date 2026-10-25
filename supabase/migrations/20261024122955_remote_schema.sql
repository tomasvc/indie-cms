create extension if not exists "hypopg" with schema "extensions";

create extension if not exists "index_advisor" with schema "extensions";

drop extension if exists "pg_net";

create type "public"."client_status" as enum ('lead', 'active', 'archived');

create type "public"."invoice_status" as enum ('draft', 'sent', 'paid', 'overdue', 'void');

create type "public"."portfolio_project_status" as enum ('draft', 'published', 'archived');

create type "public"."project_status" as enum ('proposal', 'active', 'on_hold', 'review', 'completed', 'archived', 'draft');

create type "public"."task_status" as enum ('todo', 'in_progress', 'done');

drop policy "Users can delete own clients" on "public"."clients";

drop policy "Users can insert own clients" on "public"."clients";

drop policy "Users can update own clients" on "public"."clients";

drop policy "Users can view own clients" on "public"."clients";

drop policy "Users can view own projects" on "public"."projects";

drop policy "Users can delete own projects" on "public"."projects";

drop policy "Users can insert own projects" on "public"."projects";

drop policy "Users can update own projects" on "public"."projects";

alter table "public"."invoices" drop constraint "invoices_discount_amount_check";

alter table "public"."invoices" drop constraint "invoices_payment_method_check";

alter table "public"."invoices" drop constraint "invoices_reminder_count_check";

alter table "public"."invoices" drop constraint "invoices_subtotal_check";

alter table "public"."invoices" drop constraint "invoices_total_check";

alter table "public"."profiles" drop constraint "profiles_user_id_fkey";

alter table "public"."profiles" drop constraint "profiles_user_id_key";

alter table "public"."projects" drop constraint "projects_priority_check";

alter table "public"."tasks" drop constraint "tasks_assignee_id_fkey";

alter table "public"."tasks" drop constraint "tasks_parent_task_id_fkey";

alter table "public"."tasks" drop constraint "tasks_priority_check";

alter table "public"."time_entries" drop constraint "time_entries_hours_check";

alter table "public"."time_entries" drop constraint "time_entries_rate_check";

alter table "public"."time_entries" drop constraint "time_entries_task_id_fkey";

alter table "public"."clients" drop constraint "clients_user_id_fkey";

alter table "public"."invoices" drop constraint "invoices_client_id_fkey";

alter table "public"."invoices" drop constraint "invoices_project_id_fkey";

alter table "public"."invoices" drop constraint "invoices_user_id_fkey";

alter table "public"."projects" drop constraint "projects_status_check";

alter table "public"."projects" drop constraint "projects_user_id_fkey";

alter table "public"."time_entries" drop constraint "time_entries_user_id_fkey";

drop index if exists "public"."profiles_user_id_key";


  create table "public"."portfolio_projects" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "slug" text,
    "description" text,
    "thumbnail_url" text,
    "live_url" text,
    "view_count" bigint default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."portfolio_projects" enable row level security;

alter table "public"."clients" alter column "created_at" drop not null;

alter table "public"."clients" alter column "status" drop not null;

alter table "public"."clients" alter column "total_billed" drop not null;

alter table "public"."clients" alter column "updated_at" drop not null;

alter table "public"."invoices" add column "amount" numeric(12,2) not null;

alter table "public"."invoices" add column "line_items" jsonb default '[]'::jsonb;

alter table "public"."invoices" alter column "client_id" drop not null;

alter table "public"."invoices" alter column "code" drop not null;

alter table "public"."invoices" alter column "created_at" drop not null;

alter table "public"."invoices" alter column "currency" drop not null;

alter table "public"."invoices" alter column "discount_amount" set data type numeric using "discount_amount"::numeric;

alter table "public"."invoices" alter column "due_date" set not null;

alter table "public"."invoices" alter column "issue_date" set default CURRENT_DATE;

alter table "public"."invoices" alter column "project_id" drop not null;

alter table "public"."invoices" alter column "reminder_count" drop default;

alter table "public"."invoices" alter column "status" drop default;

alter table "public"."invoices" alter column "subtotal" drop not null;

alter table "public"."invoices" alter column "subtotal" set data type numeric using "subtotal"::numeric;

alter table "public"."invoices" alter column "total" drop not null;

alter table "public"."invoices" alter column "total" set data type numeric using "total"::numeric;

alter table "public"."invoices" alter column "transaction_id" set data type uuid using "transaction_id"::uuid;

alter table "public"."invoices" alter column "updated_at" drop not null;

alter table "public"."profiles" drop column "user_id";

alter table "public"."profiles" add column "address" text;

alter table "public"."profiles" add column "avatar_url" text;

alter table "public"."profiles" add column "bio" text;

alter table "public"."profiles" add column "company_name" text;

alter table "public"."profiles" add column "currency" text default 'USD'::text;

alter table "public"."profiles" add column "full_name" text not null;

alter table "public"."profiles" add column "hourly_rate" numeric default 0;

alter table "public"."profiles" add column "language" text;

alter table "public"."profiles" add column "notification_preferences" jsonb default '[]'::jsonb;

alter table "public"."profiles" add column "tax_id" text;

alter table "public"."profiles" add column "timezone" text;

alter table "public"."profiles" add column "username" text;

alter table "public"."profiles" alter column "created_at" drop not null;

alter table "public"."profiles" alter column "id" drop default;

alter table "public"."profiles" alter column "updated_at" drop not null;

alter table "public"."projects" add column "featured" boolean;

alter table "public"."projects" add column "live_url" text;

alter table "public"."projects" add column "published_at" timestamp with time zone default now();

alter table "public"."projects" add column "seo_description" text;

alter table "public"."projects" add column "seo_title" text;

alter table "public"."projects" add column "slug" text;

alter table "public"."projects" add column "tags" jsonb default '[]'::jsonb;

alter table "public"."projects" add column "technologies" text[];

alter table "public"."projects" add column "thumbnail_url" text;

alter table "public"."projects" add column "view_count" integer;

alter table "public"."projects" alter column "actual_hours" drop default;

alter table "public"."projects" alter column "actual_hours" drop not null;

alter table "public"."projects" alter column "actual_hours" set data type integer using "actual_hours"::integer;

alter table "public"."projects" alter column "budget" drop default;

alter table "public"."projects" alter column "budget" drop not null;

alter table "public"."projects" alter column "budget" set data type numeric using "budget"::numeric;

alter table "public"."projects" alter column "created_at" drop not null;

alter table "public"."projects" alter column "currency" drop default;

alter table "public"."projects" alter column "currency" drop not null;

alter table "public"."projects" alter column "description" drop default;

alter table "public"."projects" alter column "description" drop not null;

alter table "public"."projects" alter column "estimated_hours" drop default;

alter table "public"."projects" alter column "estimated_hours" drop not null;

alter table "public"."projects" alter column "estimated_hours" set data type integer using "estimated_hours"::integer;

alter table "public"."projects" alter column "priority" drop default;

alter table "public"."projects" alter column "priority" drop not null;

alter table "public"."projects" alter column "profit_margin" drop default;

alter table "public"."projects" alter column "profit_margin" drop not null;

alter table "public"."projects" alter column "profit_margin" set data type numeric using "profit_margin"::numeric;

alter table "public"."projects" alter column "progress" drop not null;

alter table "public"."projects" alter column "status" drop default;

alter table "public"."projects" alter column "updated_at" drop not null;

alter table "public"."projects" alter column "value" drop default;

alter table "public"."projects" alter column "value" drop not null;

alter table "public"."tasks" drop column "updated_at";

alter table "public"."tasks" alter column "actual_hours" drop default;

alter table "public"."tasks" alter column "actual_hours" drop not null;

alter table "public"."tasks" alter column "actual_hours" set data type numeric using "actual_hours"::numeric;

alter table "public"."tasks" alter column "created_at" drop not null;

alter table "public"."tasks" alter column "description" drop default;

alter table "public"."tasks" alter column "description" drop not null;

alter table "public"."tasks" alter column "due_date" drop not null;

alter table "public"."tasks" alter column "estimated_hours" drop default;

alter table "public"."tasks" alter column "estimated_hours" drop not null;

alter table "public"."tasks" alter column "estimated_hours" set data type numeric using "estimated_hours"::numeric;

alter table "public"."tasks" alter column "is_overdue" drop default;

alter table "public"."tasks" alter column "is_overdue" drop not null;

alter table "public"."tasks" alter column "priority" drop default;

alter table "public"."tasks" alter column "priority" drop not null;

alter table "public"."tasks" alter column "status" drop default;

alter table "public"."tasks" alter column "status" drop not null;

alter table "public"."time_entries" alter column "approved" drop default;

alter table "public"."time_entries" alter column "approved" drop not null;

alter table "public"."time_entries" alter column "billable" drop default;

alter table "public"."time_entries" alter column "billable" drop not null;

alter table "public"."time_entries" alter column "created_at" drop not null;

alter table "public"."time_entries" alter column "entry_date" set default CURRENT_DATE;

alter table "public"."time_entries" alter column "entry_date" drop not null;

alter table "public"."time_entries" alter column "hours" set data type numeric(6,2) using "hours"::numeric(6,2);

alter table "public"."time_entries" alter column "project_id" drop not null;

alter table "public"."time_entries" alter column "rate" drop default;

alter table "public"."time_entries" alter column "rate" drop not null;

CREATE UNIQUE INDEX invoices_number_key ON public.invoices USING btree (code);

CREATE UNIQUE INDEX portfolio_projects_pkey ON public.portfolio_projects USING btree (id);

CREATE UNIQUE INDEX portfolio_projects_slug_key ON public.portfolio_projects USING btree (slug);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

alter table "public"."portfolio_projects" add constraint "portfolio_projects_pkey" PRIMARY KEY using index "portfolio_projects_pkey";

alter table "public"."invoices" add constraint "invoices_number_key" UNIQUE using index "invoices_number_key";

alter table "public"."portfolio_projects" add constraint "portfolio_projects_slug_key" UNIQUE using index "portfolio_projects_slug_key";

alter table "public"."portfolio_projects" add constraint "portfolio_projects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."portfolio_projects" validate constraint "portfolio_projects_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."clients" add constraint "clients_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_user_id_fkey";

alter table "public"."invoices" add constraint "invoices_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."invoices" validate constraint "invoices_client_id_fkey";

alter table "public"."invoices" add constraint "invoices_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL not valid;

alter table "public"."invoices" validate constraint "invoices_project_id_fkey";

alter table "public"."invoices" add constraint "invoices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_user_id_fkey";

alter table "public"."projects" add constraint "projects_status_check" CHECK ((status = ANY (ARRAY['proposal'::text, 'active'::text, 'review'::text, 'completed'::text, 'archived'::text]))) not valid;

alter table "public"."projects" validate constraint "projects_status_check";

alter table "public"."projects" add constraint "projects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_user_id_fkey";

alter table "public"."time_entries" add constraint "time_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."time_entries" validate constraint "time_entries_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$    
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'username'   -- ← you control this via signUp options.data
  )
  on conflict (id) do nothing;             -- safe if race / retry happens

  -- Optional: set defaults or log something
  -- update public.profiles set ... where id = new.id;

  return new;
end;
    $function$
;

grant delete on table "public"."portfolio_projects" to "anon";

grant insert on table "public"."portfolio_projects" to "anon";

grant references on table "public"."portfolio_projects" to "anon";

grant select on table "public"."portfolio_projects" to "anon";

grant trigger on table "public"."portfolio_projects" to "anon";

grant truncate on table "public"."portfolio_projects" to "anon";

grant update on table "public"."portfolio_projects" to "anon";

grant delete on table "public"."portfolio_projects" to "authenticated";

grant insert on table "public"."portfolio_projects" to "authenticated";

grant references on table "public"."portfolio_projects" to "authenticated";

grant select on table "public"."portfolio_projects" to "authenticated";

grant trigger on table "public"."portfolio_projects" to "authenticated";

grant truncate on table "public"."portfolio_projects" to "authenticated";

grant update on table "public"."portfolio_projects" to "authenticated";

grant delete on table "public"."portfolio_projects" to "service_role";

grant insert on table "public"."portfolio_projects" to "service_role";

grant references on table "public"."portfolio_projects" to "service_role";

grant select on table "public"."portfolio_projects" to "service_role";

grant trigger on table "public"."portfolio_projects" to "service_role";

grant truncate on table "public"."portfolio_projects" to "service_role";

grant update on table "public"."portfolio_projects" to "service_role";


  create policy "clients_delete"
  on "public"."clients"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "clients_insert"
  on "public"."clients"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "clients_select"
  on "public"."clients"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "clients_update"
  on "public"."clients"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "invoices_delete"
  on "public"."invoices"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "invoices_insert"
  on "public"."invoices"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "invoices_select"
  on "public"."invoices"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "invoices_update"
  on "public"."invoices"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can read own projects"
  on "public"."projects"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can select own projects"
  on "public"."projects"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can delete own projects"
  on "public"."projects"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can insert own projects"
  on "public"."projects"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "Users can update own projects"
  on "public"."projects"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


CREATE TRIGGER tasks_before_insert_update BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.tasks_set_is_overdue();

CREATE TRIGGER protect_bucket_control_insert BEFORE INSERT ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns('service_role');

CREATE TRIGGER protect_bucket_control_update BEFORE UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns();

CREATE TRIGGER protect_bucket_control_update_role AFTER UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_lifecycle_service_role('service_role');


