import { createClient } from "@/lib/supabase/server";

export async function getProjects(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("projects").select("*").eq("user_id", userId);
    if (error) throw error;
    return data;
}

export async function getProject(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
    if (error) throw error;
    return data;
}
