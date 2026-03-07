-- Tasks table for project task tracking.
-- Safe to run if table already exists (use IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    due_date date NOT NULL,
    completed_date date,
    is_overdue boolean NOT NULL DEFAULT false,
    estimated_hours numeric(10,2) NOT NULL DEFAULT 0,
    actual_hours numeric(10,2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date);

-- Keep is_overdue in sync: true when due_date is past and not done.
CREATE OR REPLACE FUNCTION public.tasks_set_is_overdue()
RETURNS trigger AS $$
BEGIN
    NEW.is_overdue := (NEW.due_date < current_date AND (NEW.completed_date IS NULL AND NEW.status != 'done'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_is_overdue_trigger ON public.tasks;
CREATE TRIGGER tasks_is_overdue_trigger
    BEFORE INSERT OR UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE PROCEDURE public.tasks_set_is_overdue();

-- RLS: users can only access tasks for projects they own.
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_select_policy ON public.tasks;
CREATE POLICY tasks_select_policy ON public.tasks
    FOR SELECT
    USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tasks_insert_policy ON public.tasks;
CREATE POLICY tasks_insert_policy ON public.tasks
    FOR INSERT
    WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tasks_update_policy ON public.tasks;
CREATE POLICY tasks_update_policy ON public.tasks
    FOR UPDATE
    USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    )
    WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS tasks_delete_policy ON public.tasks;
CREATE POLICY tasks_delete_policy ON public.tasks
    FOR DELETE
    USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );
