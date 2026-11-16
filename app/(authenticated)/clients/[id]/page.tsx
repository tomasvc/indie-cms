import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClient } from "@/lib/data/clients";
import { ClientDetail } from "./(components)/client-detail";
import { ClientDetailFallback } from "./(components)/client-detail-fallback";

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<ClientDetailFallback />}>
            <ClientDetail params={params} />
        </Suspense>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const client = await getClient((await params).id);
    if (!client) notFound();
    return {
        title: client.company || client.name,
        description: `Projects, invoices and contact details for ${client.company || client.name}.`,
    };
}
