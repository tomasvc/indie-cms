import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ClientsView } from "./(components)/clients-view";
import { CreateClientDialog } from "./(components)/create-client-dialog";
import { ClientsPageFallback } from "./(components)/clients-fallback";

async function Clients() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.user?.id);

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
        <Suspense fallback={<ClientsPageFallback />}>
            <Clients />
        </Suspense>
    );
}