"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { TaskStatus } from "@/types";
import { databaseError, validationError, type ActionState } from "@/lib/forms/action-state";
import { id } from "@/lib/schemas/common";
import { taskCreateSchema, taskStatusSchema, taskUpdateSchema } from "@/lib/schemas/task";

const today = () => new Date().toISOString().split("T")[0];

export async function createTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = taskCreateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("tasks").insert({
        ...parsed.data,
        assignee_id: user.id,
        status: "todo",
        estimated_hours: 0,
        actual_hours: 0,
    });

    if (error) return databaseError(error, "Couldn't add this task. Please try again.");
    revalidatePath(`/projects/${parsed.data.project_id}`);
    return { ok: true };
}

export async function updateTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = taskUpdateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);
    const { id, project_id, ...values } = parsed.data;

    const supabase = await createClient();
    const { error } = await supabase
        .from("tasks")
        .update(values.status === "done" ? values : { ...values, completed_date: null })
        .eq("id", id);
    if (error) return databaseError(error, "Couldn't save this task. Please try again.");

    if (values.status === "done") {
        await supabase.from("tasks").update({ completed_date: today() }).eq("id", id).is("completed_date", null);
    }

    revalidatePath(`/projects/${project_id}`);
    return { ok: true };
}

const taskDeleteSchema = z.object({
    id: id("Task"),
    project_id: id("Project"),
});

export async function deleteTask(formData: FormData): Promise<ActionState> {
    const parsed = taskDeleteSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "This task couldn't be found." };

    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", parsed.data.id);
    if (error) return databaseError(error, "Couldn't delete this task. Please try again.");
    revalidatePath(`/projects/${parsed.data.project_id}`);
    return { ok: true };
}

export async function updateTaskStatus(taskId: string, projectId: string, status: TaskStatus): Promise<ActionState> {
    const parsed = z.object({
        taskId: id("Task"),
        projectId: id("Project"),
        status: taskStatusSchema,
    }).safeParse({ taskId, projectId, status });
    if (!parsed.success) return validationError(parsed.error);

    const supabase = await createClient();
    const { error } = await supabase
        .from("tasks")
        .update({ status: parsed.data.status, completed_date: parsed.data.status === "done" ? today() : null })
        .eq("id", parsed.data.taskId);
    if (error) return databaseError(error, "Couldn't update this task. Please try again.");
    revalidatePath(`/projects/${parsed.data.projectId}`);
    return { ok: true };
}
