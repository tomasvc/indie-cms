"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PG_ERROR, databaseError, validationError, type ActionState } from "@/lib/forms/action-state";
import { id as idSchema, toNullable } from "@/lib/schemas/common";
import { projectFormSchema, projectStatusSchema, type ProjectFormValues } from "@/lib/schemas/project";

async function requireUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return { supabase, user };
}

function toProjectRow(values: ProjectFormValues) {
    return {
        title: values.title,
        description: values.description,
        category: toNullable(values.category),
        color: values.color,
        status: values.status,
        priority: values.priority,
        progress: values.progress,
        currency: values.currency,
        billing_type: values.billingType,
        hourly_rate: values.billingType === "hourly" ? values.hourlyRate : null,
        value: values.value,
        budget: values.budget,
        estimated_hours: values.estimatedHours,
        start_date: toNullable(values.startDate),
        due_date: toNullable(values.dueDate),
        completed_date: toNullable(values.completedDate),
        client_id: toNullable(values.clientId),
    };
}

export async function handleCreateProject(input: ProjectFormValues): Promise<ActionState> {
    const parsed = projectFormSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { supabase, user } = await requireUser();
    const id = crypto.randomUUID();

    const { error } = await supabase.from("projects").insert({
        id,
        user_id: user.id,
        ...toProjectRow(parsed.data),
    });

    if (error) return databaseError(error, "Couldn't create this project. Please try again.");
    revalidatePath("/projects");
    redirect(`/projects/${id}`);
}

export async function handleUpdateProject(id: string, input: ProjectFormValues): Promise<ActionState> {
    const parsedId = idSchema("Project").safeParse(id);
    if (!parsedId.success) return { error: "This project couldn't be found." };

    const parsed = projectFormSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { supabase, user } = await requireUser();

    // Once a project has tasks, progress is kept in step with them by a database trigger
    const { count: taskCount } = await supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("project_id", parsedId.data);
    const { progress, ...rest } = toProjectRow(parsed.data);
    const row = (taskCount ?? 0) > 0 ? rest : { ...rest, progress };

    const { error } = await supabase
        .from("projects")
        .update(row)
        .eq("id", parsedId.data)
        .eq("user_id", user.id);

    if (error) return databaseError(error, "Couldn't save your changes. Please try again.");
    revalidatePath("/projects");
    redirect(`/projects/${parsedId.data}`);
}

const projectIdFormSchema = z.object({ id: idSchema("Project") });

export async function handleDeleteProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = projectIdFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "This project couldn't be found." };

    const { supabase, user } = await requireUser();

    const { error } = await supabase.from("projects")
        .delete()
        .eq("id", parsed.data.id)
        .eq("user_id", user.id);

    if (error?.code === PG_ERROR.FOREIGN_KEY_VIOLATION) {
        return { error: "This project has invoices or time entries, so it can't be deleted. Archive it instead." };
    }
    if (error) return databaseError(error, "Couldn't delete this project. Please try again.");
    revalidatePath("/projects");
    redirect("/projects");
}

export async function handleArchiveProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = projectIdFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "This project couldn't be found." };

    const { supabase, user } = await requireUser();

    const { error } = await supabase.from("projects")
        .update({ status: "archived" })
        .eq("id", parsed.data.id)
        .eq("user_id", user.id);

    if (error) return databaseError(error, "Couldn't archive this project. Please try again.");
    revalidatePath("/projects");
    redirect("/projects");
}

export async function updateProjectStatus(projectId: string, status: string): Promise<ActionState> {
    const parsedId = idSchema("Project").safeParse(projectId);
    if (!parsedId.success) return { error: "This project couldn't be found." };
    const parsedStatus = projectStatusSchema.safeParse(status);
    if (!parsedStatus.success) return { error: "That status isn't available." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "You need to sign in again." };

    const { error } = await supabase.from("projects")
        .update({ status: parsedStatus.data })
        .eq("id", parsedId.data)
        .eq("user_id", user.id);

    if (error) return databaseError(error, "Couldn't move this project. Please try again.");
    revalidatePath("/projects");
    return { ok: true };
}
