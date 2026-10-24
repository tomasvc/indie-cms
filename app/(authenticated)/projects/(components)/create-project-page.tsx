"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Client } from "@/types";
import { handleCreateProject } from "@/lib/actions/projects";
import { PlusIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    SECTIONS,
    FORM_TO_PAYLOAD,
    SECTION_COMPONENTS,
    type ProjectForm,
    type SectionId,
  } from "./form";

export function CreateProjectPage({ clients }: { clients: Client[] }) {
    const [activeSection, setActiveSection] = useState<SectionId>("basics");
    const [isPending, startTransition] = useTransition()

    const [form, setForm] = useState<ProjectForm>({
        title: "",
        description: "",
        category: "Web Design",
        color: "#22c55e",
        tags: "",
        status: "proposal",
        priority: "medium",
        progress: 0,
        currency: "GBP",
        profitMargin: 57,
        value: 0,
        budget: 0,
        estimatedHours: 0,
        actualHours: 0,
        startDate: "",
        dueDate: "",
        completedDate: "",
        clientId: "",
    });

    const Section = SECTION_COMPONENTS[activeSection];

    async function onSubmit(formData: FormData) {
        const payload = new FormData();

        for (const [key, name] of Object.entries(FORM_TO_PAYLOAD)) {
            const value = form[key as keyof ProjectForm];
            payload.set(name, String(value ?? ""));
        }

        if (!payload.get("title")) payload.set("title", "Untitled Project");

        startTransition(async () => {
            await handleCreateProject(payload)
        })
    }

    return (
        <Card className="animate-fadein">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/projects" aria-label="Cancel">
                            <XIcon className="size-4" />
                        </Link>
                    </Button>
                    <span className="text-muted-foreground text-sm font-medium">
                        NEW PROJECT
                    </span>
                    <Typography variant="body" as="span" className="font-medium">
                        {form.title || "New Project"}
                    </Typography>
                </div>
                <Button
                    size="lg"
                    onClick={() => {
                        const form = document.getElementById("create-project-form") as HTMLFormElement;
                        if (form) form.requestSubmit();
                    }}
                    disabled={isPending}
                >
                    <PlusIcon className="size-3.5" />
                    {isPending ? "Creating..." : "Create project"}
                </Button>
            </div>

            <div className="border-b border-border px-6 py-5">
                <Typography variant="pageTitle" as="h1">
                    New Project
                </Typography>
                <Typography variant="subtitle" className="text-muted-foreground mt-0.5">
                    Set up a new project with details, timeline and client.
                </Typography>
            </div>

            <form id="create-project-form" action={onSubmit} className="flex flex-1 min-h-0">
                <div className="flex flex-1 min-h-0">
                    <nav className="w-56 shrink-0 border-r border-border bg-muted/30 flex flex-col">
                        {SECTIONS.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section.id as SectionId)}
                                    className={cn(
                                        "flex items-start gap-3 px-4 py-2.5 text-left transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary border-r-2 border-primary"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-full",
                                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <Typography variant="label" className="font-medium">
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
                        <Section form={form} setForm={setForm} clients={clients} />
                    </div>
                </div>
            </form>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                <Button variant="outline" asChild>
                    <Link href="/projects">Cancel</Link>
                </Button>
                <Button type="submit" form="create-project-form" disabled={isPending}>
                    <PlusIcon className="size-3.5" />
                    {isPending ? "Creating..." : "Create project"}
                </Button>
            </div>
        </Card>
    );
}
