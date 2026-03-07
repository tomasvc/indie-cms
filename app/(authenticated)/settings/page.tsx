import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Suspense } from "react";
import { getProfile } from "@/lib/actions/settings";
import { SettingsForm } from "./(components)/settings-form";
import { Typography } from "@/components/ui/typography";

async function Settings() {
    const profile = await getProfile();

    return (
        <div className="flex flex-col gap-6 max-w-2xl animate-fadein">
            <div>
                <Typography variant="pageTitle" as="h1">Settings</Typography>
                <Typography variant="subtitle" as="p" className="mt-1">
                    Manage your account, billing preferences, and notifications.
                </Typography>
            </div>
            <SettingsForm profile={profile} />
        </div>
    );
}

function SettingsFallback() {
    return (
        <div className="flex flex-col gap-6 max-w-2xl animate-fadein">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-80" />
            </div>
            <Tabs defaultValue="profile" className="flex flex-col gap-6">
                <TabsList variant="line" className="w-full justify-start">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <div className="flex flex-col gap-6">
                    {/* Personal Info card */}
                    <Card>
                        <CardHeader className="border-b">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-4 w-64 mt-1" />
                        </CardHeader>
                        <CardContent className="pt-5 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-8" />
                                <Skeleton className="h-20 w-full rounded-md" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                    {/* Business Settings card */}
                    <Card>
                        <CardHeader className="border-b">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-4 w-72 mt-1" />
                        </CardHeader>
                        <CardContent className="pt-5 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                    {/* Preferences card */}
                    <Card>
                        <CardHeader className="border-b">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-56 mt-1" />
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-28 rounded-md" />
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<SettingsFallback />}>
            <Settings />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your account, billing preferences, and notifications.",
};
