-- Run this only after the app code that reads `invoices.total` is deployed.
-- To apply: move it into supabase/migrations/ with a new timestamp, e.g.
--   mv supabase/pending/drop_legacy_invoice_columns.sql \
--      supabase/migrations/$(date -u +%Y%m%d%H%M%S)_drop_legacy_invoice_columns.sql
-- then `supabase db push`.

alter table public.invoices drop column if exists amount;
alter table public.invoices drop column if exists line_items;
