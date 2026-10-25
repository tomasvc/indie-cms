alter table public.invoices drop constraint invoices_project_id_fkey;
alter table public.invoices
  add constraint invoices_project_id_fkey
  foreign key (project_id) references public.projects(id) on delete restrict;

alter table public.invoices drop constraint invoices_client_id_fkey;
alter table public.invoices
  add constraint invoices_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete restrict;

alter table public.time_entries drop constraint time_entries_project_id_fkey;
alter table public.time_entries
  add constraint time_entries_project_id_fkey
  foreign key (project_id) references public.projects(id) on delete restrict;

alter table public.time_entries
  add constraint time_entries_invoice_id_fkey
  foreign key (invoice_id) references public.invoices(id) on delete restrict;