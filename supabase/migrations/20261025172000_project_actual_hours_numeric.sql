-- Production stored projects.actual_hours as an integer, so 1.5 logged hours
-- became 2. The column is maintained by time_entries_sync_project_actual_hours
-- and is not edited from the app.

alter table public.projects
    alter column actual_hours type numeric(10,2)
    using coalesce(actual_hours, 0)::numeric(10,2);

alter table public.projects
    alter column actual_hours set default 0;

alter table public.projects
    alter column actual_hours set not null;

update public.projects as project
set actual_hours = coalesce((
    select round(sum(entry.hours), 2)
    from public.time_entries as entry
    where entry.project_id = project.id
), 0);
