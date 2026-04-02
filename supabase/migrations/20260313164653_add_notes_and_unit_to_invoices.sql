ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.line_items ADD COLUMN IF NOT EXISTS unit text;