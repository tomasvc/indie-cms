import { getClient } from "@/lib/actions/clients";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
            <Client params={params} />
        </Suspense>
    );
}