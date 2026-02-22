"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function handleCreateProject(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    // const client = formData.get('client') as string;
    const start_date = formData.get('start_date') as string;
    const due_date = formData.get('due_date') as string;

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('projects').insert({
        id: crypto.randomUUID(),
        user_id: user?.user?.id,
        title,
        description,
        // client,
        start_date,
        due_date,
        status: 'proposal',
        progress: 0,
        value: 0,
    });

    if (error) throw error;
    revalidatePath('/projects');
    redirect('/projects');
}

export async function handleDeleteProject(formData: FormData) {
    const id = formData.get('id') as string;
    const supabase = await createClient();
    const { data, error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/projects');
    redirect('/projects');
}