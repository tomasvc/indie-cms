drop policy if exists "Users can read own projects" on public.projects;

drop policy if exists invoices_select on public.invoices;
drop policy if exists invoices_insert on public.invoices;
drop policy if exists invoices_update on public.invoices;
drop policy if exists invoices_delete on public.invoices;

drop trigger if exists tasks_before_insert_update on public.tasks;