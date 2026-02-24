"use server"

import { createClient } from "@/lib/supabase/server";
import { ClientStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getClient(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
}

export async function getClients() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.user?.id);
    if (error) throw error;
    return data;
}

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
    const { data, error } = await supabase.from('clients').update({ name, company, email, status }).eq('id', id);

    if (error) throw error;
    revalidatePath(`/clients/${id}`);
    redirect(`/clients/${id}`);
}

export async function handleDeleteClient(formData: FormData) {
    const id = formData.get('id') as string;
    const supabase = await createClient();
    const { data, error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/clients');
    redirect('/clients');
}