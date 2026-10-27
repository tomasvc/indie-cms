"use client";

import Link from "next/link";
import { ClientStatusBadge } from "@/components/client-status-badge";
import { Card } from "@/components/ui/card";
import { Client } from "@/types";
import { formatDate } from "@/lib/helpers/format";
import { totalsFor, type ClientTotals } from "@/lib/helpers/clients";
import { formatMoneyByCurrency } from "@/lib/money";

interface ClientsListProps {
    clients: Client[];
    totals: Record<string, ClientTotals>;
    currency: string;
    locale: string;
}

export function ClientsList({ clients, totals, currency, locale }: ClientsListProps) {
    if (clients.length === 0) {
        return (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm">
                No clients yet. Add the people you work with to link projects and invoices to them.
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {clients.map((client) => {
                const { billed, owed } = totalsFor(totals, client.id);
                const hasOwed = Object.values(owed).some((amount) => amount > 0);
                return (
                    <li key={client.id}>
                        <Link href={`/clients/${client.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <Card className="flex flex-col gap-3 px-5 py-4 transition-shadow hover:ring-foreground/15 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate text-base font-semibold leading-tight text-foreground">
                                            {client.company || client.name}
                                        </span>
                                        <ClientStatusBadge status={client.status} className="shrink-0" />
                                    </div>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {client.company ? client.name : client.email || "No company"}
                                        {client.last_contact ? ` · Last contact ${formatDate(client.last_contact, "d MMM yyyy")}` : ""}
                                    </p>
                                </div>
                                <dl className="flex shrink-0 gap-6 text-sm sm:text-right">
                                    <div>
                                        <dt className="text-[13px] text-muted-foreground">Billed</dt>
                                        <dd className="tabular-nums text-foreground">{formatMoneyByCurrency(billed, locale, currency)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[13px] text-muted-foreground">Owed</dt>
                                        <dd className={hasOwed ? "tabular-nums font-medium text-foreground" : "tabular-nums text-muted-foreground"}>
                                            {formatMoneyByCurrency(owed, locale, currency)}
                                        </dd>
                                    </div>
                                </dl>
                            </Card>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
