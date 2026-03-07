import { getClient, getClients } from "@/lib/actions/clients";
import { notFound } from "next/navigation";
import { Client } from "@/types";
import { CreateProjectPage } from "../(components)/create-project-page";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default async function NewProjectPage() {
    let clients: Client[] = [];
    try {
        clients = await getClients();
        if (!clients) notFound();
    } catch {
        notFound();
    }

    return <CreateProjectPage clients={clients} />;
}

export const metadata: Metadata = {
    title: "Create Project",
    description: "Create a new project",
}  