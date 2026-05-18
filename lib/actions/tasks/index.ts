"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TaskStatus } from "@/types";

function toDateOrNull(s: string | null | undefined): string | null {
    if (s == null || String(s).trim() === "") return null;
    return String(s).trim();
}

export async function createTask(formData: FormData) {
    const project_id = formData.get("project_id") as string;
    const title = (formData.get("title") as string)?.trim() || "Untitled task";
    const description = (formData.get("description") as string)?.trim() || "";
    const status = ((formData.get("status") as string) || "todo") as TaskStatus;
    const due_date = (formData.get("due_date") as string)?.trim();
    const priority = ((formData.get("priority") as string) || "medium") as "low" | "medium" | "high";
    const estimated_hours = formData.get("estimated_hours") != null ? Number(formData.get("estimated_hours")) : 0;
    const actual_hours = formData.get("actual_hours") != null ? Number(formData.get("actual_hours")) : 0;

    if (!due_date) throw new Error("Due date is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("tasks").insert({
        project_id,
        assignee_id: user?.id ?? null,
        title,
        description,
        status,
        due_date,
        priority,
        estimated_hours,
        actual_hours,
    });

    if (error) throw error;
    revalidatePath(`/projects/${project_id}`);
}

export async function updateTask(formData: FormData) {
    const id = formData.get("id") as string;
    const project_id = formData.get("project_id") as string;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const status = formData.get("status") as string | null;
    const due_date = toDateOrNull(formData.get("due_date") as string);
    const completed_date = toDateOrNull(formData.get("completed_date") as string);
    const priority = (formData.get("priority") as string) || undefined;
    const estimated_hours = formData.get("estimated_hours") != null ? Number(formData.get("estimated_hours")) : undefined;
    const actual_hours = formData.get("actual_hours") != null ? Number(formData.get("actual_hours")) : undefined;

    const supabase = await createClient();
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (due_date !== undefined) update.due_date = due_date;
    if (completed_date !== undefined) update.completed_date = completed_date;
    if (priority !== undefined) update.priority = priority;
    if (estimated_hours !== undefined) update.estimated_hours = estimated_hours;
    if (actual_hours !== undefined) update.actual_hours = actual_hours;

    const { error } = await supabase.from("tasks").update(update).eq("id", id);
    if (error) throw error;
    revalidatePath(`/projects/${project_id}`);
}

export async function deleteTask(formData: FormData) {
    const id = formData.get("id") as string;
    const project_id = formData.get("project_id") as string;
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    revalidatePath(`/projects/${project_id}`);
}

export async function updateTaskStatus(taskId: string, projectId: string, status: TaskStatus) {
    const supabase = await createClient();
    const update: Record<string, unknown> = { status };
    if (status === "done") {
        update.completed_date = new Date().toISOString().split("T")[0];
    } else {
        update.completed_date = null;
    }
    const { error } = await supabase.from("tasks").update(update).eq("id", taskId);
    if (error) throw error;
    revalidatePath(`/projects/${projectId}`);
}
