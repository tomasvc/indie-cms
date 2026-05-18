import { createClient } from "@/lib/supabase/server";

export async function getProjects(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("projects").select("*").eq("user_id", userId);
    if (error) throw error;
    return data;
}

export async function getProject(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
}
