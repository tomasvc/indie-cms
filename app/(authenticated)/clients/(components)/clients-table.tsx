"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatMoney, formatDate } from "@/lib/helpers/format";

interface ClientsTableProps {
    clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
    const router = useRouter();
    return (
        <Card className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-4">Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Billed</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="pr-4">Updated At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id} onClick={() => router.push(`/clients/${client.id}`)} className="cursor-pointer hover:bg-muted">
                            <TableCell className="pl-4">{client.name}</TableCell>
                            <TableCell>{client.company}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{client.status}</Badge></TableCell>
                            <TableCell>{formatMoney(client.total_billed ?? 0, "USD")}</TableCell>
                            <TableCell>{formatDate(client.last_contact ?? "", "MMM d, yyyy")}</TableCell>
                            <TableCell>{formatDate(client.created_at, "MMM d, yyyy")}</TableCell>
                            <TableCell className="pr-4">{formatDate(client.updated_at, "MMM d, yyyy")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}