import { getProject } from "@/lib/actions/projects";
import { getClient, getClients } from "@/lib/actions/clients";
import { notFound } from "next/navigation";
import { Client, Project as ProjectType } from "@/types";
import { EditProjectPage } from "../(components)/edit-project-page";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let project: ProjectType | null = null;
    let clients: Client[] = [];

    try {
        project = await getProject(id);
        if (!project) notFound();
    } catch {
        notFound();
    }

    clients = await getClients();
    if (!clients) notFound();

    return <EditProjectPage project={project} clients={clients} />;
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
    const id = (await params).id

    const project = await getProject(id)
    if (!project) notFound();

    return {
        title: `Edit Project - ${project.title}`,
        description: project.description,
    }
}  
