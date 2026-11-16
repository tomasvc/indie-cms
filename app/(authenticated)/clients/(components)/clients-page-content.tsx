"use client";

import { useQuery } from "@tanstack/react-query";
import { Typography } from "@/components/ui/typography";
import { getClientTotals, sortClients } from "@/lib/helpers/clients";
import { clientsQuery } from "@/lib/queries/clients";
import { invoicesQuery } from "@/lib/queries/invoices";
import { profileQuery } from "@/lib/queries/account";
import { ClientsView } from "./clients-view";
import { CreateClientDialog } from "./create-client-dialog";
import { ClientsPageFallback } from "./clients-fallback";

export function ClientsPageContent() {
    const { data: clients } = useQuery(clientsQuery);
    const { data: invoices } = useQuery(invoicesQuery);
    const { data: profile } = useQuery(profileQuery);

    if (!clients || !invoices || profile === undefined) return <ClientsPageFallback />;

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="pageTitle" as="h1">Clients</Typography>
                    <p className="mt-1 text-[15px] text-muted-foreground">
                        Who you work with, what they&apos;ve been billed and what they owe.
                    </p>
                </div>
                <div>
                    <CreateClientDialog />
                </div>
            </div>
            <ClientsView
                clients={sortClients(clients)}
                totals={getClientTotals(invoices)}
                currency={profile?.currency || "USD"}
                locale={profile?.language || "en"}
            />
        </div>
    );
}
