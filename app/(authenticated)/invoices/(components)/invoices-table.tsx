"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface InvoicesTableProps {
    invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
    const router = useRouter();
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices?.map((invoice) => (
                    <TableRow key={invoice.id} onClick={() => router.push(`/invoices/${invoice.id}`)} className="cursor-pointer hover:bg-muted">
                        <TableCell>{invoice.number}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{invoice.status}</Badge></TableCell>
                        <TableCell>{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}</TableCell>
                        <TableCell>{invoice.due_date}</TableCell>
                        <TableCell>{invoice.issue_date}</TableCell>
                        <TableCell>{invoice.paid_date}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
