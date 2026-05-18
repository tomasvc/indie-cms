"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export async function createTimeEntry(formData: FormData) {
    const project_id = formData.get("project_id") as string;
    const description = (formData.get("description") as string)?.trim() || undefined;
    const hours = formData.get("hours") != null ? Number(formData.get("hours")) : 0;
    const rate = formData.get("rate") != null ? Number(formData.get("rate")) : 0;
    const entry_date = (formData.get("entry_date") as string)?.trim();
    const task_id = (formData.get("task_id") as string)?.trim() || null;
    const billable = formData.get("billable") === "true" || formData.get("billable") === "on";

    if (!entry_date) throw new Error("Entry date is required");
    if (hours < 0) throw new Error("Hours must be 0 or greater");

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("time_entries").insert({
        project_id,
        user_id: user.id,
        description: description || null,
        hours,
        rate,
        entry_date,
        task_id: task_id || null,
        billable,
        approved: false,
    });

    if (error) throw error;
    revalidatePath(`/projects/${project_id}`);
}

export async function updateTimeEntry(formData: FormData) {
    const id = formData.get("id") as string;
    const project_id = formData.get("project_id") as string;
    const description = (formData.get("description") as string)?.trim();
    const hours = formData.get("hours") != null ? Number(formData.get("hours")) : undefined;
    const rate = formData.get("rate") != null ? Number(formData.get("rate")) : undefined;
    const entry_date = (formData.get("entry_date") as string)?.trim();
    const task_id = (formData.get("task_id") as string)?.trim();
    const billable = formData.get("billable");
    const approved = formData.get("approved");

    const supabase = await createClient();
    const update: Record<string, unknown> = {};
    if (description !== undefined) update.description = description || null;
    if (hours !== undefined) update.hours = hours;
    if (rate !== undefined) update.rate = rate;
    if (entry_date !== undefined) update.entry_date = entry_date;
    if (task_id !== undefined) update.task_id = task_id || null;
    if (billable === "true" || billable === "on") update.billable = true;
    else if (billable === "false" || billable === "off") update.billable = false;
    if (approved === "true" || approved === "on") update.approved = true;
    else if (approved === "false" || approved === "off") update.approved = false;

    const { error } = await supabase.from("time_entries").update(update).eq("id", id);
    if (error) throw error;
    revalidatePath(`/projects/${project_id}`);
}

export async function deleteTimeEntry(formData: FormData) {
    const id = formData.get("id") as string;
    const project_id = formData.get("project_id") as string;
    const supabase = await createClient();
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) throw error;
    revalidatePath(`/projects/${project_id}`);
}
