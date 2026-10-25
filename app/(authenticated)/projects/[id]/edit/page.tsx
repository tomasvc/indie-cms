import { getProject } from "@/lib/data/projects";
import { getProfile } from "@/lib/data/settings";
import { getClients } from "@/lib/data/clients";
import { getTimeEntriesForProject } from "@/lib/data/time-entries";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Client, Project as ProjectType } from "@/types";
import { EditProjectPage } from "../(components)/edit-project-page";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

const getCachedProject = cache(getProject);

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let project: ProjectType | null = null;
    let clients: Client[] = [];

    try {
        project = await getCachedProject(id);
        if (!project) notFound();
    } catch {
        notFound();
    }

    const [loadedClients, timeEntries, profile] = await Promise.all([
        getClients(),
        getTimeEntriesForProject(id),
        getProfile(),
    ]);
    clients = loadedClients;
    if (!clients) notFound();

    const loggedHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    return (
        <EditProjectPage
            project={project}
            clients={clients}
            businessCurrency={profile?.currency || "USD"}
            loggedHours={loggedHours}
        />
    );
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
    const id = (await params).id

    const project = await getCachedProject(id)
    if (!project) notFound();

    return {
        title: `Edit Project - ${project.title}`,
        description: project.description,
    }
}  
