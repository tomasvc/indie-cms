import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types";

export const clientsQuery = queryOptions({
    queryKey: ["clients"],
    queryFn: async () => {
        const { data, error } = await createClient().from("clients").select("*");
        if (error) throw error;
        return (data ?? []) as Client[];
    },
});
