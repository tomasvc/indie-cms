"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { databaseError, validationError, type ActionState } from "@/lib/forms/action-state";
import { toNullable } from "@/lib/schemas/common";
import { timeEntryCreateSchema, timeEntryUpdateSchema } from "@/lib/schemas/time-entry";

export async function createTimeEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = timeEntryCreateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);
    const { description, ...values } = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("time_entries").insert({
        ...values,
        user_id: user.id,
        description: toNullable(description),
        approved: false,
    });

    if (error) return databaseError(error, "Couldn't log this time. Please try again.");
    revalidatePath(`/projects/${values.project_id}`);
    return { ok: true };
}

export async function updateTimeEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = timeEntryUpdateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);
    const { id, project_id, description, ...values } = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("time_entries")
        .update({ ...values, description: toNullable(description) })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return databaseError(error, "Couldn't save this entry. Please try again.");
    revalidatePath(`/projects/${project_id}`);
    return { ok: true };
}

export async function deleteTimeEntry(formData: FormData) {
    const id = formData.get("id") as string;
    const project_id = formData.get("project_id") as string;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("time_entries")
        .delete().eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) throw error;
    revalidatePath(`/projects/${project_id}`);
}
