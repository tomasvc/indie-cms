import { createClient } from "@/lib/supabase/server";
import type { Task, TaskStatus } from "@/types";

export async function getTasks(userId: string): Promise<Task[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tasks")
        .select(
            "id, project_id, assignee_id, title, description, status, due_date, completed_date, is_overdue, estimated_hours, actual_hours, created_at, priority"
        )
        .order("created_at", { ascending: true })
        .eq("assignee_id", userId);
    if (error) throw error;
    return (data ?? []).map((row) => ({
        id: row.id,
        project_id: row.project_id,
        assignee_id: row.assignee_id ?? undefined,
        title: row.title ?? "",
        description: row.description ?? "",
        status: (row.status as TaskStatus) ?? "todo",
        due_date: row.due_date ?? "",
        completed_date: row.completed_date ?? null,
        is_overdue: Boolean(row.is_overdue),
        estimated_hours: Number(row.estimated_hours) ?? 0,
        actual_hours: Number(row.actual_hours) ?? 0,
        created_at: row.created_at ?? "",
        priority: (row.priority as "low" | "medium" | "high") || "medium",
    }));
}

export async function getTasksForProject(projectId: string): Promise<Task[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tasks")
        .select(
            "id, project_id, assignee_id, parent_task_id, priority, title, description, status, due_date, completed_date, is_overdue, estimated_hours, actual_hours, created_at"
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
        id: row.id,
        project_id: row.project_id,
        assignee_id: row.assignee_id ?? undefined,
        parent_task_id: row.parent_task_id ?? undefined,
        priority: (row.priority as "low" | "medium" | "high") || "medium",
        title: row.title ?? "",
        description: row.description ?? "",
        status: (row.status as TaskStatus) ?? "todo",
        due_date: row.due_date ?? "",
        completed_date: row.completed_date ?? null,
        is_overdue: Boolean(row.is_overdue),
        estimated_hours: Number(row.estimated_hours) ?? 0,
        actual_hours: Number(row.actual_hours) ?? 0,
        created_at: row.created_at ?? "",
    }));
}
