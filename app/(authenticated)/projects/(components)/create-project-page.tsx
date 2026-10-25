"use client";
import { PlusIcon } from "lucide-react";
import { Client } from "@/types";
import { handleCreateProject } from "@/lib/actions/projects";
import { ProjectFormLayout, type ProjectFormValues } from "./form";

const DEFAULT_VALUES: ProjectFormValues = {
    title: "",
    description: "",
    category: "Web Design",
    color: "#22c55e",
    tags: "",
    status: "proposal",
    priority: "medium",
    progress: 0,
    currency: "USD",
    value: 0,
    budget: 0,
    estimatedHours: 0,
    startDate: "",
    dueDate: "",
    completedDate: "",
    clientId: "",
};

export function CreateProjectPage({ clients, currency }: { clients: Client[]; currency: string }) {
    return (
        <ProjectFormLayout
            defaultValues={{ ...DEFAULT_VALUES, currency }}
            businessCurrency={currency}
            clients={clients}
            onSubmit={handleCreateProject}
            cancelHref="/projects"
            eyebrow="NEW PROJECT"
            fallbackTitle="New Project"
            heading="New Project"
            subheading="Set up a new project with details, timeline and client."
            submitLabel="Create project"
            pendingLabel="Creating..."
            submitIcon={PlusIcon}
        />
    );
}
