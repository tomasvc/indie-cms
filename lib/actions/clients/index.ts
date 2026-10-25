"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PG_ERROR, databaseError, validationError, type ActionState } from "@/lib/forms/action-state";
import { id as idSchema, toNullable } from "@/lib/schemas/common";
import { clientFormSchema, clientUpdateSchema } from "@/lib/schemas/client";

async function requireUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return { supabase, user };
}

export async function handleCreateClient(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = clientFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);

    const { supabase, user } = await requireUser();
    const { name, company, email, status } = parsed.data;

    const { error } = await supabase.from('clients').insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        name,
        company: toNullable(company),
        email: toNullable(email),
        status,
    });

    if (error) return databaseError(error, "Couldn't create this client. Please try again.");
    revalidatePath('/clients');
    return { ok: true };
}

export async function handleUpdateClient(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = clientUpdateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);

    const { supabase, user } = await requireUser();
    const { id, name, company, email, status } = parsed.data;

    const { error } = await supabase
        .from('clients')
        .update({ name, company: toNullable(company), email: toNullable(email), status })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return databaseError(error, "Couldn't save this client. Please try again.");
    revalidatePath(`/clients/${id}`);
    redirect(`/clients/${id}`);
}

const clientIdFormSchema = z.object({ id: idSchema("Client") });

export async function handleDeleteClient(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = clientIdFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "This client couldn't be found." };

    const { supabase, user } = await requireUser();

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', parsed.data.id)
        .eq('user_id', user.id);

    if (error?.code === PG_ERROR.FOREIGN_KEY_VIOLATION) {
        return { error: "This client has invoices or projects, so it can't be deleted. Archive it instead." };
    }
    if (error) return databaseError(error, "Couldn't delete this client. Please try again.");
    revalidatePath('/clients');
    redirect('/clients');
}

export async function handleArchiveClient(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = clientIdFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: "This client couldn't be found." };

    const { supabase, user } = await requireUser();

    const { error } = await supabase
        .from('clients')
        .update({ status: 'archived' })
        .eq('id', parsed.data.id)
        .eq('user_id', user.id);

    if (error) return databaseError(error, "Couldn't archive this client. Please try again.");
    revalidatePath('/clients');
    redirect('/clients');
}
