-- Invoices and line_items tables matching Invoice and LineItem types in types/index.ts.
-- Invoice: id, user_id, project_id, client_id, transaction_id?, code, currency, discount_amount?, subtotal, total,
--          status, issue_date?, due_date?, paid_date?, pdf_url?, payment_method?, reminder_count?, created_at, updated_at.
-- LineItem: id, invoice_id, description?, quantity, unit_price, total, tax_rate?, created_at, updated_at.

CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    transaction_id text,
    code text NOT NULL,
    currency text NOT NULL,
    discount_amount numeric(10,2) CHECK (discount_amount IS NULL OR discount_amount >= 0),
    subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
    total numeric(10,2) NOT NULL CHECK (total >= 0),
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')),
    issue_date date,
    due_date date,
    paid_date date,
    pdf_url text,
    payment_method text CHECK (payment_method IS NULL OR payment_method IN ('bank_transfer', 'stripe', 'paypal', 'cash', 'other')),
    reminder_count integer DEFAULT 0 CHECK (reminder_count IS NULL OR reminder_count >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_project_id_idx ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);
CREATE INDEX IF NOT EXISTS invoices_issue_date_idx ON public.invoices(issue_date);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON public.invoices(due_date);

-- Line items belong to an invoice (stored in separate table; Invoice.line_items is joined in app).
CREATE TABLE IF NOT EXISTS public.line_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description text,
    quantity numeric(10,2) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
    total numeric(10,2) NOT NULL CHECK (total >= 0),
    tax_rate numeric(5,2) CHECK (tax_rate IS NULL OR (tax_rate >= 0 AND tax_rate <= 100)),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS line_items_invoice_id_idx ON public.line_items(invoice_id);

-- RLS: users can only access invoices they own.
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoices_select_policy ON public.invoices;
CREATE POLICY invoices_select_policy ON public.invoices
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS invoices_insert_policy ON public.invoices;
CREATE POLICY invoices_insert_policy ON public.invoices
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS invoices_update_policy ON public.invoices;
CREATE POLICY invoices_update_policy ON public.invoices
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS invoices_delete_policy ON public.invoices;
CREATE POLICY invoices_delete_policy ON public.invoices
    FOR DELETE
    USING (user_id = auth.uid());

-- RLS: line_items visible/editable when the owning invoice belongs to the user.
ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS line_items_select_policy ON public.line_items;
CREATE POLICY line_items_select_policy ON public.line_items
    FOR SELECT
    USING (
        invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS line_items_insert_policy ON public.line_items;
CREATE POLICY line_items_insert_policy ON public.line_items
    FOR INSERT
    WITH CHECK (
        invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS line_items_update_policy ON public.line_items;
CREATE POLICY line_items_update_policy ON public.line_items
    FOR UPDATE
    USING (
        invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid())
    )
    WITH CHECK (
        invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS line_items_delete_policy ON public.line_items;
CREATE POLICY line_items_delete_policy ON public.line_items
    FOR DELETE
    USING (
        invoice_id IN (SELECT id FROM public.invoices WHERE user_id = auth.uid())
    );

-- Keep updated_at in sync for invoices and line_items.
CREATE OR REPLACE FUNCTION public.invoices_set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoices_updated_at_trigger ON public.invoices;
CREATE TRIGGER invoices_updated_at_trigger
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE PROCEDURE public.invoices_set_updated_at();

CREATE OR REPLACE FUNCTION public.line_items_set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS line_items_updated_at_trigger ON public.line_items;
CREATE TRIGGER line_items_updated_at_trigger
    BEFORE UPDATE ON public.line_items
    FOR EACH ROW
    EXECUTE PROCEDURE public.line_items_set_updated_at();
