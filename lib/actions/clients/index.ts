"use server"

import { createClient } from "@/lib/supabase/server";
import { ClientStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function handleCreateClient(formData: FormData) {
    const name = formData.get('name') as string;
    const company = formData.get('company') as string;
    const email = formData.get('email') as string;
    const status = (formData.get('status') as ClientStatus) || 'lead';

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('clients').insert({
        id: crypto.randomUUID(),
        user_id: user?.user?.id,
        name,
        company,
        email,
        status,
    });

    if (error) throw error;
    revalidatePath('/clients');
    redirect('/clients');
}

export async function handleUpdateClient(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const company = formData.get('company') as string;
    const email = formData.get('email') as string;
    const status = (formData.get('status') as ClientStatus) || 'lead';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from('clients')
        .update({ name, company, email, status })
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) throw error;
    revalidatePath(`/clients/${id}`);
    redirect(`/clients/${id}`);
}

export type ClientActionState = { error?: string };

const FOREIGN_KEY_VIOLATION = "23503";

export async function handleDeleteClient(_prev: ClientActionState, formData: FormData): Promise<ClientActionState> {
    const id = formData.get('id') as string;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error?.code === FOREIGN_KEY_VIOLATION) {
        return { error: "This client has invoices or projects, so it can't be deleted. Archive it instead." };
    }
    if (error) throw error;
    revalidatePath('/clients');
    redirect('/clients');
}

export async function handleArchiveClient(_prev: ClientActionState, formData: FormData): Promise<ClientActionState> {
    const id = formData.get('id') as string;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('clients')
        .update({ status: 'archived' })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: "Couldn't archive this client. Please try again." };
    revalidatePath('/clients');
    redirect('/clients');
}