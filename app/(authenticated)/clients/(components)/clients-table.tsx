"use client";

import { Card } from "@/components/ui/card";
import { ClientStatusBadge } from "@/components/client-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/helpers/format";
import { totalsFor, type ClientTotals } from "@/lib/helpers/clients";
import { formatMoneyByCurrency } from "@/lib/money";

interface ClientsTableProps {
    clients: Client[];
    totals: Record<string, ClientTotals>;
    currency: string;
    locale: string;
}

export function ClientsTable({ clients, totals, currency, locale }: ClientsTableProps) {
    const router = useRouter();
    return (
        <Card className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-4">Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Billed</TableHead>
                        <TableHead>Owed</TableHead>
                        <TableHead className="pr-4">Last contact</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id} onClick={() => router.push(`/clients/${client.id}`)} className="cursor-pointer hover:bg-muted">
                            <TableCell className="pl-4">
                                <Link href={`/clients/${client.id}`} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={(event) => event.stopPropagation()}>
                                    {client.company || client.name}
                                </Link>
                            </TableCell>
                            <TableCell>{client.company ? client.name : "—"}</TableCell>
                            <TableCell>{client.email || "—"}</TableCell>
                            <TableCell><ClientStatusBadge status={client.status} /></TableCell>
                            <TableCell className="tabular-nums">{formatMoneyByCurrency(totalsFor(totals, client.id).billed, locale, currency)}</TableCell>
                            <TableCell className="tabular-nums">{formatMoneyByCurrency(totalsFor(totals, client.id).owed, locale, currency)}</TableCell>
                            <TableCell className="pr-4">{formatDate(client.last_contact ?? "", "d MMM yyyy")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}