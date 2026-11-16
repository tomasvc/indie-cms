import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus } from "@/types";

export const projectTasksQuery = (projectId: string) =>
    queryOptions({
        queryKey: ["tasks", { projectId }],
        queryFn: async (): Promise<Task[]> => {
            const { data, error } = await createClient()
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
        },
    });
