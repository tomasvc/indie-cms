import { getClient } from "@/lib/actions/clients";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClientDetailFallback } from "./(components)/client-detail-fallback";
import { getProject } from "@/lib/actions/projects";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

async function Client({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClient(id);
    if (!client) {
        notFound();
    }

    return (
        <div>
            <h1>{client.name}</h1>
        </div>
    )
}

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<ClientDetailFallback />}>
            <Client params={params} />
        </Suspense>
    );
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
    const id = (await params).id

    const client = await getClient(id)
    if (!client) notFound();

    return {
        title: client.name,
        description: client.description,
    }
}  