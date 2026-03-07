-- Time entries table for project time tracking.
-- Matches TimeEntry type: id, project_id, user_id, invoice_id?, task_id?, description?, hours, rate, approved, billable, entry_date, created_at.

CREATE TABLE IF NOT EXISTS public.time_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_id uuid,
    task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
    description text,
    hours numeric(10,2) NOT NULL CHECK (hours >= 0),
    rate numeric(10,2) NOT NULL DEFAULT 0 CHECK (rate >= 0),
    approved boolean NOT NULL DEFAULT false,
    billable boolean NOT NULL DEFAULT true,
    entry_date date NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS time_entries_project_id_idx ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS time_entries_entry_date_idx ON public.time_entries(entry_date);

-- RLS: users can only access time entries for projects they own.
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS time_entries_select_policy ON public.time_entries;
CREATE POLICY time_entries_select_policy ON public.time_entries
    FOR SELECT
    USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS time_entries_insert_policy ON public.time_entries;
CREATE POLICY time_entries_insert_policy ON public.time_entries
    FOR INSERT
    WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
        AND user_id = auth.uid()
    );

DROP POLICY IF EXISTS time_entries_update_policy ON public.time_entries;
CREATE POLICY time_entries_update_policy ON public.time_entries
    FOR UPDATE
    USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    )
    WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS time_entries_delete_policy ON public.time_entries;
CREATE POLICY time_entries_delete_policy ON public.time_entries
    FOR DELETE
    USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

-- Keep projects.actual_hours in sync with sum of time_entries.hours for that project.
CREATE OR REPLACE FUNCTION public.time_entries_sync_project_actual_hours()
RETURNS trigger AS $$
DECLARE
    target_id uuid;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_id := OLD.project_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        -- Update both old and new project
        UPDATE public.projects
        SET actual_hours = COALESCE((
            SELECT SUM(hours)::numeric(10,2) FROM public.time_entries WHERE project_id = OLD.project_id
        ), 0)
        WHERE id = OLD.project_id;
        target_id := NEW.project_id;
    ELSE
        target_id := NEW.project_id;
    END IF;

    UPDATE public.projects
    SET actual_hours = COALESCE((
        SELECT SUM(hours)::numeric(10,2) FROM public.time_entries WHERE project_id = target_id
    ), 0)
    WHERE id = target_id;

    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS time_entries_sync_trigger ON public.time_entries;
CREATE TRIGGER time_entries_sync_trigger
    AFTER INSERT OR UPDATE OF hours, project_id OR DELETE ON public.time_entries
    FOR EACH ROW
    EXECUTE PROCEDURE public.time_entries_sync_project_actual_hours();
