import { createClient } from "@/lib/supabase/server";

async function getProject(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

async function getClient(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export { getProject, getClient }