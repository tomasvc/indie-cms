-- Legacy columns replaced by invoices.total and the line_items table.

alter table public.invoices drop column if exists amount;
alter table public.invoices drop column if exists line_items;
