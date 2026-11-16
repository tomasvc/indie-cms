import { createClient } from "@/lib/supabase/server";

/** Server-side lookup for page metadata; row level security limits it to the signed-in user's clients. */
export async function getClient(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("clients")
        .select("name, company")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return data;
}
