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
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { Sparkles } from "lucide-react";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

const STEPS = 3;

function OnboardingFlow() {
    const [step, setStep] = useState(1);
    const [companyName, setCompanyName] = useState("");
    const [timezone, setTimezone] = useState("");
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleComplete = async () => {
        setIsCompleting(true);
        setError(null);
        try {
            await completeOnboarding();
            // Full page load so the proxy runs and sees the updated profile
            window.location.href = "/dashboard";
        } catch (e) {
            setIsCompleting(false);
            setError(e instanceof Error ? e.message : "Something went wrong");
        }
    };

    const handleSkip = async () => {
        setIsCompleting(true);
        setError(null);
        try {
            await completeOnboarding();
            window.location.href = "/dashboard";
        } catch (e) {
            setIsCompleting(false);
            setError(e instanceof Error ? e.message : "Something went wrong");
        }
    };

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
                            <div className="grid gap-2">
                                <Label htmlFor="company">Company name</Label>
                                <Input
                                    id="company"
                                    placeholder="Acme Inc."
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Input
                                    id="timezone"
                                    placeholder="e.g. America/New_York"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2">
                            <Button variant="ghost" onClick={handleSkip} disabled={isCompleting}>
                                Skip for now
                            </Button>
                            <Button onClick={() => setStep(3)} size="lg">
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
                                onClick={handleComplete}
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

export default function OnboardingPage() {
    return (
        <div className="flex min-h-[60vh] w-full">
            <OnboardingFlow />
        </div>
    );
}

export const metadata: Metadata = {
    title: "Onboarding",
    description: "Welcome to Freelance OS. Your workspace for projects, clients, and invoices. Get set up in a few quick steps and start managing your work with ease.",
}