import { getClient } from "@/lib/actions/clients";
import { notFound } from "next/navigation";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
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