"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { databaseError, type ActionState } from "@/lib/forms/action-state";

export async function resetDemo(): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");
    if (!user.is_anonymous) return { error: "Only a demo workspace can be reset." };

    const { error } = await supabase.rpc("reset_demo_workspace");
    if (error) return databaseError(error, "Couldn't reset the demo. Please try again.");

    revalidatePath("/", "layout");
    return { ok: true };
}
