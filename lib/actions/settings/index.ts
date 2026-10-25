"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PG_ERROR, databaseError, validationError, type ActionState } from "@/lib/forms/action-state";
import { toNullable } from "@/lib/schemas/common";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { notificationPreferencesSchema, profileSchema, type ProfileFormValues } from "@/lib/schemas/settings";

export async function updateProfile(input: ProfileFormValues): Promise<ActionState> {
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);
    const values = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { error } = await supabase
        .from("profiles")
        .upsert(
            {
                id: user.id,
                full_name: values.full_name,
                username: toNullable(values.username),
                company_name: toNullable(values.company_name),
                bio: toNullable(values.bio),
                address: toNullable(values.address),
                avatar_url: toNullable(values.avatar_url),
                hourly_rate: values.hourly_rate,
                currency: values.currency,
                tax_id: toNullable(values.tax_id),
                timezone: toNullable(values.timezone),
                language: toNullable(values.language),
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        );

    if (error?.code === PG_ERROR.UNIQUE_VIOLATION) {
        return {
            error: "Please fix the highlighted fields.",
            fieldErrors: { username: ["That username is already taken."] },
        };
    }
    if (error) return databaseError(error, "Couldn't save your settings. Please try again.");
    revalidatePath("/settings");
    return { ok: true };
}

export async function updateNotificationPreferences(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = notificationPreferencesSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { error } = await supabase
        .from("profiles")
        .update({
            notification_preferences: {
                email: parsed.data.email_notifications,
                invoice_reminders: parsed.data.invoice_reminders,
            },
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (error) return databaseError(error, "Couldn't save your preferences. Please try again.");
    revalidatePath("/settings");
    return { ok: true };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");
    if (user.is_anonymous) {
        return { error: "Demo workspaces don't have a password. Create an account to keep your work." };
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return { error: error.message };
    return { ok: true };
}
