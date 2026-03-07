-- Fix: tasks trigger must not set updated_at (table may not have that column).
CREATE OR REPLACE FUNCTION public.tasks_set_is_overdue()
RETURNS trigger AS $$
BEGIN
    NEW.is_overdue := (NEW.due_date < current_date AND (NEW.completed_date IS NULL AND NEW.status != 'done'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
