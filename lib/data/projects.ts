import { createClient } from "@/lib/supabase/server";

/** Server-side lookup for page metadata; row level security limits it to the signed-in user's projects. */
export async function getProject(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("projects")
        .select("title, description")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return data;
}
