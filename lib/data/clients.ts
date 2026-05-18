import { createClient } from "@/lib/supabase/server";

export async function getClient(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
}

export async function getClients() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("clients").select("*").eq("user_id", user.user?.id);
    if (error) throw error;
    return data;
}
