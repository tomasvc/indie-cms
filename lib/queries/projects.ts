import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";

export const projectsQuery = queryOptions({
    queryKey: ["projects"],
    queryFn: async () => {
        const { data, error } = await createClient().from("projects").select("*");
        if (error) throw error;
        return (data ?? []) as Project[];
    },
});
