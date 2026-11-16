"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { Client, Project } from "@/types";
import { handleUpdateProject } from "@/lib/actions/projects";
import { useServerAction } from "@/hooks/use-server-action";
import { projectsQuery } from "@/lib/queries/projects";
import { clientsQuery } from "@/lib/queries/clients";
import { projectTasksQuery } from "@/lib/queries/tasks";
import { projectTimeEntriesQuery } from "@/lib/queries/time-entries";
import { profileQuery } from "@/lib/queries/account";
import { ProjectFormLayout, type ProjectFormValues } from "../../(components)/form";
import { FormPageFallback } from "@/components/form-page-fallback";

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
        billingType: project.billing_type ?? "fixed",
        hourlyRate: Number(project.hourly_rate ?? 0),
        value: project.value ?? 0,
        budget: project.budget ?? 0,
        estimatedHours: project.estimated_hours ?? 0,
        startDate: toDateInput(project.start_date),
        dueDate: toDateInput(project.due_date),
        completedDate: toDateInput(project.completed_date),
        clientId: project.client_id ?? "",
    };
}

export function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: project } = useQuery({ ...projectsQuery, select: (projects) => projects.find((p) => p.id === id) ?? null });
    const { data: clients } = useQuery(clientsQuery);
    const { data: loggedHours } = useQuery({
        ...projectTimeEntriesQuery(id),
        select: (entries) => entries.reduce((sum, entry) => sum + entry.hours, 0),
    });
    const { data: tasks } = useQuery(projectTasksQuery(id));
    const { data: profile } = useQuery(profileQuery);

    if (project === undefined || !clients || loggedHours === undefined || !tasks || profile === undefined) return <FormPageFallback />;
    if (!project) notFound();

    return (
        <EditProjectForm
            project={project}
            clients={clients}
            businessCurrency={profile?.currency || "USD"}
            loggedHours={loggedHours}
            taskProgress={tasks.length > 0 ? { done: tasks.filter((task) => task.status === "done").length, total: tasks.length } : null}
        />
    );
}

function EditProjectForm({
    project,
    clients,
    businessCurrency,
    loggedHours,
    taskProgress,
}: {
    project: Project;
    clients: Client[];
    businessCurrency: string;
    loggedHours: number;
    /** Set when the project has tasks: progress then comes from them. */
    taskProgress: { done: number; total: number } | null;
}) {
    const [updateProject] = useServerAction(handleUpdateProject);
    const router = useRouter();

    async function save(values: ProjectFormValues) {
        const result = await updateProject(project.id, values);
        // Navigating after the mutation settles means the project page opens on the saved data
        if (result.ok) router.push(`/projects/${project.id}`);
        return result;
    }

    return (
        <ProjectFormLayout
            defaultValues={toFormValues(project, businessCurrency)}
            clients={clients}
            onSubmit={save}
            cancelHref={`/projects/${project.id}`}
            eyebrow="Editing"
            fallbackTitle={project.title}
            heading="Edit Project"
            subheading="Changes are reflected immediately on the project overview."
            submitLabel="Save changes"
            pendingLabel="Saving..."
            submitIcon={SaveIcon}
            businessCurrency={businessCurrency}
            loggedHours={loggedHours}
            taskProgress={taskProgress}
        />
    );
}
