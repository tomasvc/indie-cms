"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FormProvider, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LucideIcon } from "lucide-react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Client } from "@/types";
import type { ActionState } from "@/lib/forms/action-state";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { projectFormSchema } from "@/lib/schemas/project";
import { FIELD_SECTIONS, SECTIONS } from "./constants";
import type { ProjectFormValues, SectionId } from "./types";
import { FormBasics } from "./form-basics";
import { FormStatusProgress } from "./form-status-progress";
import { FormFinancials } from "./form-financials";
import { FormTime } from "./form-time";
import { FormTimeline } from "./form-timeline";
import { FormClient } from "./form-client";

const FORM_ID = "project-form";

function sectionsWithErrors(errors: FieldErrors<ProjectFormValues>) {
    return new Set(
        Object.keys(errors)
            .map((name) => FIELD_SECTIONS[name as keyof ProjectFormValues])
            .filter(Boolean)
    );
}

type ProjectFormLayoutProps = {
    defaultValues: ProjectFormValues;
    clients: Client[];
    onSubmit: (values: ProjectFormValues) => Promise<ActionState>;
    cancelHref: string;
    eyebrow: string;
    fallbackTitle: string;
    heading: string;
    subheading: string;
    submitLabel: string;
    pendingLabel: string;
    submitIcon: LucideIcon;
    businessCurrency: string;
};

export function ProjectFormLayout({
    defaultValues,
    clients,
    onSubmit,
    cancelHref,
    eyebrow,
    fallbackTitle,
    heading,
    subheading,
    submitLabel,
    pendingLabel,
    submitIcon: SubmitIcon,
    businessCurrency,
}: ProjectFormLayoutProps) {
    const [activeSection, setActiveSection] = useState<SectionId>("basics");
    const [isPending, startTransition] = useTransition();

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues,
    });
    const title = useWatch({ control: form.control, name: "title" });
    const { errors } = form.formState;
    const errorSections = sectionsWithErrors(errors);

    function showFirstError(fieldErrors: FieldErrors<ProjectFormValues>) {
        const first = SECTIONS.find((section) => sectionsWithErrors(fieldErrors).has(section.id));
        if (first) setActiveSection(first.id);
    }

    const submit = form.handleSubmit(
        (values) =>
            startTransition(async () => {
                const result = await onSubmit(values);
                applyServerErrors(form.setError, result);
                showFirstError(form.formState.errors);
            }),
        showFirstError
    );

    const submitButtonContent = (
        <>
            <SubmitIcon className="size-3.5" />
            {isPending ? pendingLabel : submitLabel}
        </>
    );

    return (
        <Card className="animate-fadein">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={cancelHref} aria-label="Cancel">
                            <XIcon className="size-4" />
                        </Link>
                    </Button>
                    <span className="text-muted-foreground text-sm font-medium">
                        {eyebrow}
                    </span>
                    <Typography variant="body" as="span" className="font-medium">
                        {title || fallbackTitle}
                    </Typography>
                </div>
                <Button size="lg" type="submit" form={FORM_ID} disabled={isPending}>
                    {submitButtonContent}
                </Button>
            </div>

            <div className="border-b border-border px-6 py-5">
                <Typography variant="pageTitle" as="h1">
                    {heading}
                </Typography>
                <Typography variant="subtitle" className="text-muted-foreground mt-0.5">
                    {subheading}
                </Typography>
            </div>

            <FormProvider {...form}>
                <form id={FORM_ID} onSubmit={submit} noValidate className="flex flex-1 min-h-0">
                    <div className="flex flex-1 min-h-0">
                        <nav className="w-56 shrink-0 border-r border-border bg-muted/30 flex flex-col">
                            {SECTIONS.map((section) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;
                                const hasError = errorSections.has(section.id);
                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => setActiveSection(section.id)}
                                        aria-current={isActive ? "step" : undefined}
                                        className={cn(
                                            "flex items-start gap-3 px-4 py-2.5 text-left transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary border-r-2 border-primary"
                                                : "hover:bg-muted/50"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "relative flex size-8 shrink-0 items-center justify-center rounded-full",
                                                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            <Icon className="size-4" />
                                            {hasError && (
                                                <span
                                                    className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-background"
                                                    aria-label="Has errors"
                                                />
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <Typography variant="label" className={cn("font-medium", hasError && "text-destructive")}>
                                                {section.label}
                                            </Typography>
                                            <Typography variant="bodySmall" className="text-muted-foreground mt-0.5 line-clamp-2">
                                                {section.description}
                                            </Typography>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="flex-1 overflow-auto p-6">
                            {activeSection === "basics" && <FormBasics />}
                            {activeSection === "status" && <FormStatusProgress />}
                            {activeSection === "financials" && <FormFinancials businessCurrency={businessCurrency} />}
                            {activeSection === "time" && <FormTime />}
                            {activeSection === "timeline" && <FormTimeline />}
                            {activeSection === "client" && <FormClient clients={clients} />}
                        </div>
                    </div>
                </form>
            </FormProvider>

            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
                <FieldError className="mr-auto" errors={[errors.root?.server]} />
                <Button variant="outline" asChild>
                    <Link href={cancelHref}>Cancel</Link>
                </Button>
                <Button type="submit" form={FORM_ID} disabled={isPending}>
                    {submitButtonContent}
                </Button>
            </div>
        </Card>
    );
}
