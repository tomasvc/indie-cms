"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { EditInvoiceDialog } from "@/app/(authenticated)/invoices/(components)/edit-invoice-dialog";
import { Client, Project } from "@/types";
import { useState } from "react";
import { formatMoney, formatDate } from "@/lib/helpers/format";
import { deleteInvoice } from "@/lib/actions/invoices";

interface InvoicesTableProps {
    invoices: Invoice[];
    projects: Project[];
    clients: Client[];
}

export function InvoicesTable({ invoices, projects, clients }: InvoicesTableProps) {
    const router = useRouter();
    const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
    const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);

    async function handleDeleteInvoice(id: string) {
        if (!deleteInvoiceId) return;
        await deleteInvoice(id);
        setDeleteInvoiceId(null);
        router.refresh();
    }

    return (
        <>
            <Card className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Paid Date</TableHead>
                            <TableHead className="pr-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices?.map((invoice) => (
                            <TableRow key={invoice.id} className="group cursor-pointer hover:bg-muted" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                                <TableCell className="pl-4 font-mono">INV-{invoice.code}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">{invoice.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    {formatMoney(invoice.total, "USD")}
                                </TableCell>
                                <TableCell>{formatDate(invoice.due_date, "MMM d, yyyy")}</TableCell>
                                <TableCell>{formatDate(invoice.issue_date, "MMM d, yyyy")}</TableCell>
                                <TableCell>{formatDate(invoice.paid_date, "MMM d, yyyy")}</TableCell>
                                <TableCell className="text-right px-1 pr-4" style={{ width: "1%" }} onClick={e => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                tabIndex={-1}
                                                className="flex items-center p-1 mr-2 hover:bg-accent rounded focus:outline-none"
                                                aria-label="Actions"
                                            >
                                                <EllipsisVerticalIcon className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="z-50">
                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditInvoice(invoice); }}>
                                                <PencilIcon className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem variant="destructive" onClick={() => handleDeleteInvoice(invoice.id)}>
                                                <TrashIcon className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
            {editInvoice && (
                <EditInvoiceDialog
                    invoice={editInvoice}
                    projects={projects}
                    clients={clients}
                    open={!!editInvoice}
                    onOpenChange={(open) => !open && setEditInvoice(null)}
                />
            )}
        </>
    )
}
