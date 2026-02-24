"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatDate } from "date-fns";

interface ClientsTableProps {
    clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
    const router = useRouter();
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Billed</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.map((client) => (
                    <TableRow key={client.id} onClick={() => router.push(`/clients/${client.id}`)} className="cursor-pointer hover:bg-muted">
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.company}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{client.status}</Badge></TableCell>
                        <TableCell>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(client.total_billed)}</TableCell>
                        <TableCell>{formatDate(client.last_contact, 'MM/dd/yyyy HH:mm')}</TableCell>
                        <TableCell>{formatDate(client.created_at, 'MM/dd/yyyy HH:mm')}</TableCell>
                        <TableCell>{formatDate(client.updated_at, 'MM/dd/yyyy HH:mm')}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}