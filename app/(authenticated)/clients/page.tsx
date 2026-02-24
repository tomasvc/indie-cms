import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ClientsView } from "./(components)/clients-view";
import { CreateClientDialog } from "./(components)/create-client-dialog";

async function Clients() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('clients').select('*');

    if (error) throw error;
    const clients = data ?? [];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Clients</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage your clients.
                    </p>
                </div>
                <div>
                    <CreateClientDialog />
                </div>
            </div>
            <ClientsView clients={clients} />
        </div>
    )
}

export default function ClientsPage() {
    return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
            <Clients />
        </Suspense>
    );
}