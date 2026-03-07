"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Profile } from "@/types";

export async function getProfile(): Promise<Profile | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) return null;
    return data as Profile | null;
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const full_name = (formData.get("full_name") as string) || "";
    const username = (formData.get("username") as string) || "";
    const company_name = (formData.get("company_name") as string) || null;
    const bio = (formData.get("bio") as string) || null;
    const address = (formData.get("address") as string) || null;
    const avatar_url = (formData.get("avatar_url") as string) || null;
    const hourly_rate = formData.get("hourly_rate") ? Number(formData.get("hourly_rate")) : 0;
    const currency = (formData.get("currency") as string) || "USD";
    const tax_id = (formData.get("tax_id") as string) || null;
    const timezone = (formData.get("timezone") as string) || null;
    const language = (formData.get("language") as string) || null;

    const { error } = await supabase
        .from("profiles")
        .upsert(
            {
                id: user.id,
                full_name,
                username,
                company_name,
                bio,
                address,
                avatar_url,
                hourly_rate,
                currency,
                tax_id,
                timezone,
                language,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        );

    if (error) throw new Error(error.message);
    revalidatePath("/settings");
}

export async function updateNotificationPreferences(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const notification_preferences = {
        email: formData.get("email_notifications") === "true",
        invoice_reminders: formData.get("invoice_reminders") === "true",
    };

    const { error } = await supabase
        .from("profiles")
        .update({
            notification_preferences,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/settings");
}

export async function updatePassword(formData: FormData): Promise<{ error?: string }> {
    const supabase = await createClient();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 8) {
        return { error: "Password must be at least 8 characters." };
    }
    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return {};
}
