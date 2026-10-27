import { getClients } from "@/lib/data/clients";
import { getProfile } from "@/lib/data/settings";
import { notFound } from "next/navigation";
import { Client } from "@/types";
import { CreateProjectPage } from "../(components)/create-project-page";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Suspense } from "react";

type NewProjectSearchParams = Promise<{ client?: string }>;

async function NewProjectPageContent({ searchParams }: { searchParams: NewProjectSearchParams }) {
    let clients: Client[] = [];
    try {
        clients = await getClients();
        if (!clients) notFound();
    } catch {
        notFound();
    }
    const [{ client }, profile] = await Promise.all([searchParams, getProfile()]);
    // Arriving from a client page pre-selects that client
    const clientId = clients.some((c) => c.id === client) ? client : undefined;

    const rate = Number(profile?.hourly_rate);
    return (
        <CreateProjectPage
            clients={clients}
            currency={profile?.currency || "USD"}
            hourlyRate={Number.isFinite(rate) && rate > 0 ? rate : 0}
            clientId={clientId}
        />
    );
}

export default function NewProjectPage({ searchParams }: { searchParams: NewProjectSearchParams }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewProjectPageContent searchParams={searchParams} />
        </Suspense>
    )
}

export const metadata: Metadata = {
    title: "Create Project",
    description: "Create a new project",
}
