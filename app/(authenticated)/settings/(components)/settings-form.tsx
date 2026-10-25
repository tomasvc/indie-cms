"use client";

import { useRef, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { updateProfile, updateNotificationPreferences, updatePassword } from "@/lib/actions/settings";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { useFormAction } from "@/hooks/use-form-action";
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/constants/profile";
import { profileSchema, type ProfileFormValues } from "@/lib/schemas/settings";
import type { Profile } from "@/types";
import {
    UserIcon,
    BellIcon,
    ShieldIcon,
    CheckCircleIcon,
} from "lucide-react";
import { DemoResetButton } from "@/components/demo-reset-button";

type SettingsFormProps = {
    profile: Profile | null;
    isDemo?: boolean;
};

function useSavedFlash() {
    const [saved, setSaved] = useState(false);
    const flash = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    return [saved, flash] as const;
}

function SaveFeedback({ saved }: { saved: boolean }) {
    if (!saved) return null;
    return (
        <span className="flex items-center gap-1.5 text-[13px] text-primary font-medium animate-fadein">
            <CheckCircleIcon className="size-4" />
            Saved
        </span>
    );
}

function toProfileValues(profile: Profile | null): ProfileFormValues {
    return {
        full_name: profile?.full_name ?? "",
        username: profile?.username ?? "",
        company_name: profile?.company_name ?? "",
        bio: profile?.bio ?? "",
        address: profile?.address ?? "",
        avatar_url: profile?.avatar_url ?? "",
        hourly_rate: profile?.hourly_rate ?? 0,
        currency: (profile?.currency as ProfileFormValues["currency"]) ?? "USD",
        tax_id: profile?.tax_id ?? "",
        timezone: profile?.timezone ?? "",
        language: profile?.language ?? "",
    };
}

function ProfileTab({ profile }: { profile: Profile | null }) {
    const [isPending, startTransition] = useTransition();
    const [saved, flashSaved] = useSavedFlash();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: toProfileValues(profile),
    });
    const { register, control, formState: { errors } } = form;
    const currency = useWatch({ control, name: "currency" });

    const onSubmit = form.handleSubmit((values) =>
        startTransition(async () => {
            const result = await updateProfile(values);
            if (result.ok) {
                form.reset(values);
                flashSaved();
            } else {
                applyServerErrors(form.setError, result);
            }
        })
    );

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
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
                        <Field className="gap-1.5" data-invalid={!!errors.full_name}>
                            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
                            <Input
                                id="full_name"
                                {...register("full_name")}
                                aria-invalid={!!errors.full_name}
                                placeholder="Jane Smith"
                            />
                            <FieldError errors={[errors.full_name]} />
                        </Field>
                        <Field className="gap-1.5" data-invalid={!!errors.username}>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input
                                id="username"
                                {...register("username")}
                                aria-invalid={!!errors.username}
                                placeholder="janesmith"
                            />
                            <FieldError errors={[errors.username]} />
                        </Field>
                    </div>
                    <Field className="gap-1.5" data-invalid={!!errors.company_name}>
                        <FieldLabel htmlFor="company_name">Company name</FieldLabel>
                        <Input
                            id="company_name"
                            {...register("company_name")}
                            aria-invalid={!!errors.company_name}
                            placeholder="Smith Design Studio"
                        />
                        <FieldError errors={[errors.company_name]} />
                    </Field>
                    <Field className="gap-1.5" data-invalid={!!errors.bio}>
                        <FieldLabel htmlFor="bio">Bio</FieldLabel>
                        <Textarea
                            id="bio"
                            {...register("bio")}
                            aria-invalid={!!errors.bio}
                            placeholder="A short description about yourself or your work…"
                            rows={3}
                        />
                        <FieldError errors={[errors.bio]} />
                    </Field>
                    <Field className="gap-1.5" data-invalid={!!errors.address}>
                        <FieldLabel htmlFor="address">Address</FieldLabel>
                        <Input
                            id="address"
                            {...register("address")}
                            aria-invalid={!!errors.address}
                            placeholder="123 Main St, New York, NY 10001"
                        />
                        <FieldError errors={[errors.address]} />
                    </Field>
                    <Field className="gap-1.5" data-invalid={!!errors.avatar_url}>
                        <FieldLabel htmlFor="avatar_url">Avatar URL</FieldLabel>
                        <Input
                            id="avatar_url"
                            type="url"
                            {...register("avatar_url")}
                            aria-invalid={!!errors.avatar_url}
                            placeholder="https://example.com/avatar.jpg"
                        />
                        <FieldError errors={[errors.avatar_url]} />
                    </Field>
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
                        <Field className="gap-1.5" data-invalid={!!errors.hourly_rate}>
                            <FieldLabel htmlFor="hourly_rate">Default hourly rate</FieldLabel>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px]">
                                    {currency}
                                </span>
                                <Input
                                    id="hourly_rate"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    {...register("hourly_rate", { valueAsNumber: true })}
                                    aria-invalid={!!errors.hourly_rate}
                                    className="pl-12"
                                />
                            </div>
                            <FieldError errors={[errors.hourly_rate]} />
                        </Field>
                        <Controller
                            control={control}
                            name="currency"
                            render={({ field, fieldState }) => (
                                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="currency">Default currency</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="currency" className="w-full" aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCY_OPTIONS.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                    </div>
                    <Field className="gap-1.5" data-invalid={!!errors.tax_id}>
                        <FieldLabel htmlFor="tax_id">
                            Tax ID / VAT number
                        </FieldLabel>
                        <Input
                            id="tax_id"
                            {...register("tax_id")}
                            aria-invalid={!!errors.tax_id}
                            placeholder="e.g. GB123456789"
                        />
                        <FieldError errors={[errors.tax_id]} />
                        <p className="text-[12px] text-muted-foreground">
                            Displayed on invoices if provided.
                        </p>
                    </Field>
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
                        <Controller
                            control={control}
                            name="timezone"
                            render={({ field, fieldState }) => (
                                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="timezone" className="w-full" aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIMEZONE_OPTIONS.map((tz) => (
                                                <SelectItem key={tz.value} value={tz.value}>
                                                    {tz.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                        <Controller
                            control={control}
                            name="language"
                            render={({ field, fieldState }) => (
                                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="language">Language</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="language" className="w-full" aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANGUAGE_OPTIONS.map((l) => (
                                                <SelectItem key={l.value} value={l.value}>
                                                    {l.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
                <FieldError className="mr-auto" errors={[errors.root?.server]} />
                <SaveFeedback saved={saved} />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}

function NotificationsTab({ profile }: { profile: Profile | null }) {
    const [saved, flashSaved] = useSavedFlash();
    const { state, isPending, onSubmit } = useFormAction(updateNotificationPreferences, { onSuccess: flashSaved });

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
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
                            name="email_notifications"
                            defaultChecked={profile?.notification_preferences?.email ?? true}
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
                            name="invoice_reminders"
                            defaultChecked={profile?.notification_preferences?.invoice_reminders ?? true}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
                {state.error && <FieldError className="mr-auto">{state.error}</FieldError>}
                <SaveFeedback saved={saved} />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}

function SecurityTab({ isDemo }: { isDemo: boolean }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [saved, flashSaved] = useSavedFlash();
    const { state, isPending, onSubmit, errors } = useFormAction(updatePassword, {
        onSuccess: () => {
            formRef.current?.reset();
            flashSaved();
        },
    });

    if (isDemo) {
        return (
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>
                        <Typography variant="cardTitle" as="span">Demo workspace</Typography>
                    </CardTitle>
                    <CardDescription>
                        <Typography variant="body" color="muted" as="span">
                            This demo has no password, and it is deleted after 24 hours. Create an account to keep your work.
                        </Typography>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                    <DemoResetButton />
                </CardContent>
            </Card>
        );
    }

    return (
        <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
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
                    <Field className="gap-1.5 max-w-sm" data-invalid={!!errors("password")}>
                        <FieldLabel htmlFor="password">New password</FieldLabel>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            minLength={8}
                            required
                            aria-invalid={!!errors("password")}
                        />
                        <FieldError errors={errors("password")} />
                    </Field>
                    <Field className="gap-1.5 max-w-sm" data-invalid={!!errors("confirmPassword")}>
                        <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            minLength={8}
                            required
                            aria-invalid={!!errors("confirmPassword")}
                        />
                        <FieldError errors={errors("confirmPassword")} />
                    </Field>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
                {state.error && !state.fieldErrors && <FieldError className="mr-auto">{state.error}</FieldError>}
                <SaveFeedback saved={saved} />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Updating…" : "Update password"}
                </Button>
            </div>
        </form>
    );
}

export function SettingsForm({ profile, isDemo = false }: SettingsFormProps) {
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
                <SecurityTab isDemo={isDemo} />
            </TabsContent>
        </Tabs>
    );
}
