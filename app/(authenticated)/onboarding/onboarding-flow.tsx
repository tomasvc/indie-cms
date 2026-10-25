"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { errorsFor as fieldErrorsFor, toFieldErrors, type FieldErrors } from "@/lib/forms/action-state";
import { TIMEZONE_OPTIONS } from "@/lib/constants/profile";
import { onboardingSchema, type OnboardingValues } from "@/lib/schemas/settings";
import { Sparkles } from "lucide-react";

const STEPS = 3;

export function OnboardingFlow() {
    const [step, setStep] = useState(1);
    const [details, setDetails] = useState<OnboardingValues>({ company_name: "", timezone: "" });
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const finish = async (input: OnboardingValues | null) => {
        setIsCompleting(true);
        setError(null);
        try {
            const result = await completeOnboarding(input);
            if (!result.ok) {
                setIsCompleting(false);
                setError(result.error ?? "Something went wrong");
                if (result.fieldErrors) {
                    setFieldErrors(result.fieldErrors);
                    setStep(2);
                }
                return;
            }
            window.location.href = "/dashboard";
        } catch (e) {
            setIsCompleting(false);
            setError(e instanceof Error ? e.message : "Something went wrong");
        }
    };

    const handleNext = () => {
        const parsed = onboardingSchema.safeParse(details);
        if (!parsed.success) {
            setFieldErrors(toFieldErrors(parsed.error));
            return;
        }
        setFieldErrors({});
        setError(null);
        setStep(3);
    };

    const errorsFor = (name: keyof OnboardingValues) => fieldErrorsFor(fieldErrors, name);

    const progressValue = (step / STEPS) * 100;

    return (
        <div className="flex flex-1 w-full flex-col items-center justify-center gap-8 px-4 py-8 animate-fadein">
            <div className="w-full max-w-lg flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <Typography variant="labelSmall" color="muted" as="span">
                        Step {step} of {STEPS}
                    </Typography>
                    <Progress value={progressValue} className="h-1.5" />
                </div>
                {error && (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}

                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                                <Sparkles className="size-6" />
                            </div>
                            <CardTitle>
                                <Typography variant="pageTitle" as="span">
                                    Welcome to Freelance OS
                                </Typography>
                            </CardTitle>
                            <CardDescription>
                                <Typography variant="body" color="muted" as="span">
                                    Your workspace for projects, clients, and invoices. Get set up
                                    in a few quick steps and start managing your work with ease.
                                </Typography>
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                            <Button onClick={() => setStep(2)} size="lg">
                                Get started
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Typography variant="cardSectionTitle" as="span">
                                    Tell us a bit about you
                                </Typography>
                            </CardTitle>
                            <CardDescription>
                                <Typography variant="bodySmall" color="muted" as="span">
                                    Optional — you can change this later in settings.
                                </Typography>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Field className="gap-2" data-invalid={!!errorsFor("company_name")}>
                                <FieldLabel htmlFor="company">Company name</FieldLabel>
                                <Input
                                    id="company"
                                    placeholder="Acme Inc."
                                    value={details.company_name}
                                    onChange={(e) => setDetails((d) => ({ ...d, company_name: e.target.value }))}
                                    aria-invalid={!!errorsFor("company_name")}
                                />
                                <FieldError errors={errorsFor("company_name")} />
                            </Field>
                            <Field className="gap-2" data-invalid={!!errorsFor("timezone")}>
                                <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                                <Select
                                    value={details.timezone}
                                    onValueChange={(timezone) => setDetails((d) => ({ ...d, timezone }))}
                                >
                                    <SelectTrigger id="timezone" className="w-full" aria-invalid={!!errorsFor("timezone")}>
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
                                <FieldError errors={errorsFor("timezone")} />
                            </Field>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2">
                            <Button variant="ghost" onClick={() => finish(null)} disabled={isCompleting}>
                                Skip for now
                            </Button>
                            <Button onClick={handleNext} size="lg">
                                Next
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Typography variant="pageTitle" as="span">
                                    You&apos;re all set
                                </Typography>
                            </CardTitle>
                            <CardDescription>
                                <Typography variant="body" color="muted" as="span">
                                    Your workspace is ready. Head to the dashboard to create
                                    projects, add clients, and send your first invoice.
                                </Typography>
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                            <Button
                                onClick={() => finish(details)}
                                size="lg"
                                disabled={isCompleting}
                            >
                                {isCompleting ? "Taking you there…" : "Go to dashboard"}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
