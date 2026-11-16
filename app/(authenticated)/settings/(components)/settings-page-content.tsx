"use client";

import { useQuery } from "@tanstack/react-query";
import { Typography } from "@/components/ui/typography";
import { profileQuery, userQuery } from "@/lib/queries/account";
import { SettingsForm } from "./settings-form";

export function SettingsPageContent({ fallback }: { fallback: React.ReactNode }) {
    const { data: profile } = useQuery(profileQuery);
    const { data: user } = useQuery(userQuery);

    if (profile === undefined || user === undefined) return fallback;

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-fadein">
            <div>
                <Typography variant="pageTitle" as="h1">Settings</Typography>
                <Typography variant="subtitle" as="p" className="mt-1">
                    Manage your account, billing preferences, and notifications.
                </Typography>
            </div>
            <SettingsForm profile={profile} isDemo={Boolean(user?.is_anonymous)} />
        </div>
    );
}
