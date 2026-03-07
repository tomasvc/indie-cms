"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getOnboardingStatus(userId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", userId)
        .maybeSingle();

    if (error) return false;
    return Boolean(data?.onboarding_completed_at);
}

export async function completeOnboarding(): Promise<void> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        redirect("/auth/login");
    }

    const { error } = await supabase
        .from("profiles")
        .upsert(
            {
                id: user.id,
                full_name:
                    (user.user_metadata?.full_name as string | undefined) ??
                    user.email ??
                    "",
                onboarding_completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        );

    if (error) throw error;

    // Redirect is done by the client after success so we avoid the redirect-throw
    // being caught. The client will do a full page load to /dashboard.
}
