import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

/** The signed-in user from the local session; the proxy has already verified it on the server. */
export const userQuery = queryOptions({
    queryKey: ["user"],
    queryFn: async () => {
        const { data, error } = await createClient().auth.getSession();
        if (error) throw error;
        return data.session?.user ?? null;
    },
    staleTime: Infinity,
});

export const profileQuery = queryOptions({
    queryKey: ["profile"],
    queryFn: async () => {
        const { data, error } = await createClient().from("profiles").select("*").maybeSingle();
        if (error) return null;
        return data as Profile | null;
    },
});
