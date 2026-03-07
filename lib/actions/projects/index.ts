"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const toDateOrNull = (s: string) => (s?.trim() ? s : null)

export async function handleCreateProject(formData: FormData) {
    const id = crypto.randomUUID();
    const title = (formData.get("title") as string) || "Untitled Project";
    const description = (formData.get("description") as string) || "";
    const client_id = (formData.get("client_id") as string) || null;
    const start_date = toDateOrNull(formData.get("start_date") as string);
    const due_date = toDateOrNull(formData.get("due_date") as string);
    const completed_date = toDateOrNull(formData.get("completed_date") as string);
    const status = (formData.get("status") as string) || "proposal";
    const progress = formData.get("progress") != null ? Number(formData.get("progress")) : 0;
    const priority = (formData.get("priority") as string) || "medium";
    const category = (formData.get("category") as string) || undefined;
    const color = (formData.get("color") as string) || undefined;
    const currency = (formData.get("currency") as string) || "GBP";
    const profit_margin = formData.get("profit_margin") != null ? Number(formData.get("profit_margin")) : 57;
    const value = formData.get("value") != null ? Number(formData.get("value")) : 0;
    const budget = formData.get("budget") != null ? Number(formData.get("budget")) : 0;
    const estimated_hours = formData.get("estimated_hours") != null ? Number(formData.get("estimated_hours")) : 0;
    const actual_hours = formData.get("actual_hours") != null ? Number(formData.get("actual_hours")) : 0;

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from("projects").insert({
        id,
        user_id: user?.user?.id,
        title,
        description,
        client_id,
        start_date,
        due_date,
        completed_date,
        status,
        progress,
        priority,
        category,
        color,
        currency,
        profit_margin,
        value,
        budget,
        estimated_hours,
        actual_hours,
    });

    if (error) throw error;
    revalidatePath("/projects");
    redirect(`/projects/${id}`);
}

export async function handleDeleteProject(formData: FormData) {
    const id = formData.get('id') as string;
    const supabase = await createClient();
    const { data, error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/projects');
    redirect('/projects');
}

export async function updateProjectStatus(projectId: string, status: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('projects').update({ status }).eq('id', projectId);

    if (error) throw error;
    revalidatePath(`/projects`);
}

export async function handleUpdateProject(formData: FormData) {
    const id = formData.get('id') as string;
    const client_id = (formData.get('client_id') as string) || null;
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const status = formData.get('status') as string;
    const value = formData.get('value') != null ? Number(formData.get('value')) : undefined;
    const budget = formData.get('budget') != null ? Number(formData.get('budget')) : undefined;
    const currency = (formData.get('currency') as string) || undefined;
    const profit_margin = formData.get('profit_margin') != null ? Number(formData.get('profit_margin')) : undefined;
    const estimated_hours = formData.get('estimated_hours') != null ? Number(formData.get('estimated_hours')) : undefined;
    const actual_hours = formData.get('actual_hours') != null ? Number(formData.get('actual_hours')) : undefined;
    const priority = (formData.get('priority') as string) || undefined;
    const category = (formData.get('category') as string) || undefined;
    const color = (formData.get('color') as string) || undefined;
    const start_date = toDateOrNull(formData.get('start_date') as string);
    const due_date = toDateOrNull(formData.get('due_date') as string);
    const completed_date = toDateOrNull(formData.get('completed_date') as string);
    const progress = formData.get('progress') != null ? Number(formData.get('progress')) : undefined;

    const supabase = await createClient();
    const update: Record<string, unknown> = {
        title,
        description,
        client_id,
        status,
        start_date,
        due_date,
        completed_date,
    };
    if (value !== undefined) update.value = value;
    if (budget !== undefined) update.budget = budget;
    if (currency !== undefined) update.currency = currency;
    if (profit_margin !== undefined) update.profit_margin = profit_margin;
    if (estimated_hours !== undefined) update.estimated_hours = estimated_hours;
    if (actual_hours !== undefined) update.actual_hours = actual_hours;
    if (priority !== undefined) update.priority = priority;
    if (category !== undefined) update.category = category;
    if (color !== undefined) update.color = color;
    if (progress !== undefined) update.progress = progress;

    const { error } = await supabase.from('projects').update(update).eq('id', id);
    if (error) throw error;
    revalidatePath(`/projects`);
    redirect(`/projects/${id}`);
}

export async function getProjects(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
}

export async function getProject(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}