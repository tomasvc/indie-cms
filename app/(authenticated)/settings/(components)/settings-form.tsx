"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { updateProfile, updateNotificationPreferences, updatePassword } from "@/lib/actions/settings";
import type { Profile } from "@/types";
import {
    UserIcon,
    BellIcon,
    ShieldIcon,
    CheckCircleIcon,
} from "lucide-react";

const CURRENCIES = [
    { value: "USD", label: "USD — US Dollar" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "GBP", label: "GBP — British Pound" },
    { value: "CAD", label: "CAD — Canadian Dollar" },
    { value: "AUD", label: "AUD — Australian Dollar" },
    { value: "CHF", label: "CHF — Swiss Franc" },
    { value: "JPY", label: "JPY — Japanese Yen" },
    { value: "NOK", label: "NOK — Norwegian Krone" },
    { value: "SEK", label: "SEK — Swedish Krona" },
    { value: "DKK", label: "DKK — Danish Krone" },
    { value: "NZD", label: "NZD — New Zealand Dollar" },
    { value: "SGD", label: "SGD — Singapore Dollar" },
    { value: "HKD", label: "HKD — Hong Kong Dollar" },
    { value: "PLN", label: "PLN — Polish Złoty" },
    { value: "CZK", label: "CZK — Czech Koruna" },
    { value: "BRL", label: "BRL — Brazilian Real" },
    { value: "INR", label: "INR — Indian Rupee" },
    { value: "MXN", label: "MXN — Mexican Peso" },
];

const TIMEZONES = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
    { value: "America/Toronto", label: "Toronto (ET)" },
    { value: "America/Vancouver", label: "Vancouver (PT)" },
    { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
    { value: "America/Buenos_Aires", label: "Buenos Aires (ART)" },
    { value: "America/Mexico_City", label: "Mexico City (CST)" },
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Paris", label: "Paris (CET/CEST)" },
    { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
    { value: "Europe/Madrid", label: "Madrid (CET/CEST)" },
    { value: "Europe/Rome", label: "Rome (CET/CEST)" },
    { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)" },
    { value: "Europe/Stockholm", label: "Stockholm (CET/CEST)" },
    { value: "Europe/Oslo", label: "Oslo (CET/CEST)" },
    { value: "Europe/Zurich", label: "Zurich (CET/CEST)" },
    { value: "Europe/Warsaw", label: "Warsaw (CET/CEST)" },
    { value: "Europe/Prague", label: "Prague (CET/CEST)" },
    { value: "Europe/Lisbon", label: "Lisbon (WET/WEST)" },
    { value: "Europe/Athens", label: "Athens (EET/EEST)" },
    { value: "Europe/Helsinki", label: "Helsinki (EET/EEST)" },
    { value: "Europe/Istanbul", label: "Istanbul (TRT)" },
    { value: "Europe/Moscow", label: "Moscow (MSK)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Asia/Dhaka", label: "Dhaka (BST)" },
    { value: "Asia/Bangkok", label: "Bangkok (ICT)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
    { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
    { value: "Asia/Shanghai", label: "China (CST)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Seoul", label: "Seoul (KST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
    { value: "Australia/Melbourne", label: "Melbourne (AEST/AEDT)" },
    { value: "Australia/Brisbane", label: "Brisbane (AEST)" },
    { value: "Australia/Perth", label: "Perth (AWST)" },
    { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" },
];

const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "pt", label: "Portuguese" },
    { value: "it", label: "Italian" },
    { value: "nl", label: "Dutch" },
    { value: "pl", label: "Polish" },
    { value: "sv", label: "Swedish" },
    { value: "no", label: "Norwegian" },
    { value: "da", label: "Danish" },
    { value: "fi", label: "Finnish" },
    { value: "ja", label: "Japanese" },
    { value: "zh", label: "Chinese" },
    { value: "ko", label: "Korean" },
];

type SettingsFormProps = {
    profile: Profile | null;
};

function SaveFeedback({ saved }: { saved: boolean }) {
    if (!saved) return null;
    return (
        <span className="flex items-center gap-1.5 text-[13px] text-primary font-medium animate-fadein">
            <CheckCircleIcon className="size-4" />
            Saved
        </span>
    );
}

function ProfileTab({ profile }: { profile: Profile | null }) {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currency, setCurrency] = useState(profile?.currency ?? "USD");
    const [timezone, setTimezone] = useState(profile?.timezone ?? "");
    const [language, setLanguage] = useState(profile?.language ?? "");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        const fd = new FormData(e.currentTarget);
        fd.set("currency", currency);
        if (timezone) fd.set("timezone", timezone);
        if (language) fd.set("language", language);

        startTransition(async () => {
            try {
                await updateProfile(fd);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to save settings.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>
                        <Typography variant="cardTitle" as="span">Personal Info</Typography>
                    </CardTitle>
                    <CardDescription>
                        <Typography variant="body" color="muted" as="span">
                            Your name, username, and public-facing details.
                        </Typography>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="full_name">Full name</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                defaultValue={profile?.full_name ?? ""}
                                placeholder="Jane Smith"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                defaultValue={profile?.username ?? ""}
                                placeholder="janesmith"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="company_name">Company name</Label>
                        <Input
                            id="company_name"
                            name="company_name"
                            defaultValue={profile?.company_name ?? ""}
                            placeholder="Smith Design Studio"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={profile?.bio ?? ""}
                            placeholder="A short description about yourself or your work…"
                            rows={3}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            defaultValue={profile?.address ?? ""}
                            placeholder="123 Main St, New York, NY 10001"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                            id="avatar_url"
                            name="avatar_url"
                            type="url"
                            defaultValue={profile?.avatar_url ?? ""}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="border-b">
                    <CardTitle>
                        <Typography variant="cardTitle" as="span">Business Settings</Typography>
                    </CardTitle>
                    <CardDescription>
                        <Typography variant="body" color="muted" as="span">
                            Default billing rate, currency, and tax info used on invoices and reports.
                        </Typography>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="hourly_rate">Default hourly rate</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px]">
                                    {currency}
                                </span>
                                <Input
                                    id="hourly_rate"
                                    name="hourly_rate"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    defaultValue={profile?.hourly_rate ?? 0}
                                    className="pl-12"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="currency">Default currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger id="currency" className="w-full">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tax_id">
                            Tax ID / VAT number
                        </Label>
                        <Input
                            id="tax_id"
                            name="tax_id"
                            defaultValue={profile?.tax_id ?? ""}
                            placeholder="e.g. GB123456789"
                        />
                        <p className="text-[12px] text-muted-foreground">
                            Displayed on invoices if provided.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="border-b">
                    <CardTitle>
                        <Typography variant="cardTitle" as="span">Preferences</Typography>
                    </CardTitle>
                    <CardDescription>
                        <Typography variant="body" color="muted" as="span">
                            Timezone and language for your workspace.
                        </Typography>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                                <SelectTrigger id="timezone" className="w-full">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIMEZONES.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="language">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger id="language" className="w-full">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((l) => (
                                        <SelectItem key={l.value} value={l.value}>
                                            {l.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <p className="text-[13px] text-destructive" role="alert">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3">
                <SaveFeedback saved={saved} />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}

function NotificationsTab({ profile }: { profile: Profile | null }) {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [emailEnabled, setEmailEnabled] = useState(
        profile?.notification_preferences?.email ?? true
    );
    const [invoiceReminders, setInvoiceReminders] = useState(
        profile?.notification_preferences?.invoice_reminders ?? true
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        const fd = new FormData();
        fd.set("email_notifications", String(emailEnabled));
        fd.set("invoice_reminders", String(invoiceReminders));

        startTransition(async () => {
            try {
                await updateNotificationPreferences(fd);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to save settings.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>
                        <Typography variant="cardTitle" as="span">Notifications</Typography>
                    </CardTitle>
                    <CardDescription>
                        <Typography variant="body" color="muted" as="span">
                            Control when and how you receive notifications.
                        </Typography>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 flex flex-col divide-y">
                    <div className="flex items-start justify-between gap-4 pb-4">
                        <div className="flex flex-col gap-0.5">
                            <Label htmlFor="email_notifications" className="text-[13px] font-medium cursor-pointer">
                                Email notifications
                            </Label>
                            <p className="text-[12px] text-muted-foreground">
                                Receive important updates and alerts via email.
                            </p>
                        </div>
                        <Checkbox
                            id="email_notifications"
                            checked={emailEnabled}
                            onCheckedChange={(v) => setEmailEnabled(Boolean(v))}
                        />
                    </div>
                    <div className="flex items-start justify-between gap-4 pt-4">
                        <div className="flex flex-col gap-0.5">
                            <Label htmlFor="invoice_reminders" className="text-[13px] font-medium cursor-pointer">
                                Invoice reminders
                            </Label>
                            <p className="text-[12px] text-muted-foreground">
                                Send automatic reminders for overdue and upcoming invoices.
                            </p>
                        </div>
                        <Checkbox
                            id="invoice_reminders"
                            checked={invoiceReminders}
                            onCheckedChange={(v) => setInvoiceReminders(Boolean(v))}
                        />
                    </div>
                </CardContent>
            </Card>

            {error && (
                <p className="text-[13px] text-destructive" role="alert">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3">
                <SaveFeedback saved={saved} />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}

function SecurityTab() {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        const fd = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const result = await updatePassword(fd);
                if (result.error) {
                    setError(result.error);
                } else {
                    setSaved(true);
                    (e.target as HTMLFormElement).reset();
                    setTimeout(() => setSaved(false), 3000);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to update password.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>
                        <Typography variant="cardTitle" as="span">Change Password</Typography>
                    </CardTitle>
                    <CardDescription>
                        <Typography variant="body" color="muted" as="span">
                            Update your account password. Must be at least 8 characters.
                        </Typography>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 max-w-sm">
                        <Label htmlFor="password">New password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            minLength={8}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 max-w-sm">
                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            minLength={8}
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            {error && (
                <p className="text-[13px] text-destructive" role="alert">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3">
                <SaveFeedback saved={saved} />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Updating…" : "Update password"}
                </Button>
            </div>
        </form>
    );
}

export function SettingsForm({ profile }: SettingsFormProps) {
    return (
        <Tabs defaultValue="profile" className="flex flex-col gap-6">
            <TabsList variant="line" className="w-full justify-start">
                <TabsTrigger value="profile" className="flex items-center gap-1.5">
                    <UserIcon className="size-3.5" />
                    Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-1.5">
                    <BellIcon className="size-3.5" />
                    Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1.5">
                    <ShieldIcon className="size-3.5" />
                    Security
                </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
                <ProfileTab profile={profile} />
            </TabsContent>

            <TabsContent value="notifications">
                <NotificationsTab profile={profile} />
            </TabsContent>

            <TabsContent value="security">
                <SecurityTab />
            </TabsContent>
        </Tabs>
    );
}
