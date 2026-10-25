"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TaskStatus } from "@/types";
import { databaseError, validationError, type ActionState } from "@/lib/forms/action-state";
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

export async function deleteTask(formData: FormData) {
    const id = formData.get("id") as string;
    const project_id = formData.get("project_id") as string;
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    revalidatePath(`/projects/${project_id}`);
}

export async function updateTaskStatus(taskId: string, projectId: string, status: TaskStatus) {
    const parsedStatus = taskStatusSchema.parse(status);
    const supabase = await createClient();
    const { error } = await supabase
        .from("tasks")
        .update({ status: parsedStatus, completed_date: parsedStatus === "done" ? today() : null })
        .eq("id", taskId);
    if (error) throw error;
    revalidatePath(`/projects/${projectId}`);
}
