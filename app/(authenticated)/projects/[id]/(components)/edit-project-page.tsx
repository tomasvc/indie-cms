"use client";

import { SaveIcon } from "lucide-react";
import { Client, Project } from "@/types";
import { handleUpdateProject } from "@/lib/actions/projects";
import { ProjectFormLayout, type ProjectFormValues } from "../../(components)/form";

const toDateInput = (value: string | null | undefined) => value?.slice(0, 10) ?? "";

function toFormValues(project: Project, businessCurrency: string): ProjectFormValues {
    return {
        title: project.title ?? "",
        description: project.description ?? "",
        category: project.category ?? "",
        color: project.color || "#22c55e",
        tags: project.tags?.map((t) => t.name).join(", ") ?? "",
        status: project.status ?? "active",
        priority: project.priority ?? "medium",
        progress: project.progress ?? 0,
        currency: project.currency || businessCurrency,
        value: project.value ?? 0,
        budget: project.budget ?? 0,
        estimatedHours: project.estimated_hours ?? 0,
        startDate: toDateInput(project.start_date),
        dueDate: toDateInput(project.due_date),
        completedDate: toDateInput(project.completed_date),
        clientId: project.client_id ?? "",
    };
}

export function EditProjectPage({
    project,
    clients,
    businessCurrency,
    loggedHours,
}: {
    project: Project;
    clients: Client[];
    businessCurrency: string;
    loggedHours: number;
}) {
    return (
        <ProjectFormLayout
            defaultValues={toFormValues(project, businessCurrency)}
            clients={clients}
            onSubmit={(values) => handleUpdateProject(project.id, values)}
            cancelHref={`/projects/${project.id}`}
            eyebrow="EDITING"
            fallbackTitle={project.title}
            heading="Edit Project"
            subheading="Changes are reflected immediately on the project overview."
            submitLabel="Save changes"
            pendingLabel="Saving..."
            submitIcon={SaveIcon}
            businessCurrency={businessCurrency}
            loggedHours={loggedHours}
        />
    );
}
