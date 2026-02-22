import { Project, Task } from "@/types";

export function getActiveProjects(projects: Array<Project> | null): Array<Project> {
    return projects?.filter(project => project.status === "active" || project.status === "review") ?? [];
}

export function getOverdueTasks(tasks: Array<Task> | null): Array<Task> {
    return tasks?.filter(task => task.is_overdue) ?? [];
}

export function getUpcomingDeadlines(tasks: Array<Task> | null): Array<Task> {
    return tasks?.filter(task => task.due_date && new Date(task.due_date) < new Date()) ?? [];
}