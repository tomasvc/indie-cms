"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BanknoteIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, Undo2Icon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { formatMoney, formatDate } from "@/lib/helpers/format";
import { displayStatus, type InvoiceDisplayStatus } from "@/lib/helpers/invoices";
import { DeleteInvoiceDialog, MarkPaidDialog, MarkUnpaidDialog } from "./invoice-dialogs";

const STATUS_BADGE: Record<InvoiceDisplayStatus, React.ComponentProps<typeof Badge>["variant"]> = {
    draft: "outline",
    sent: "secondary",
    overdue: "destructive",
    paid: "success",
    void: "ghost",
};

type PendingDialog = { kind: "paid" | "unpaid" | "delete"; invoice: Invoice } | null;

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
    const router = useRouter();
    const [dialog, setDialog] = useState<PendingDialog>(null);
    const closeDialog = (open: boolean) => !open && setDialog(null);

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
                        {invoices.map((invoice) => {
                            const status = displayStatus(invoice);
                            const isPaid = invoice.status === "paid";
                            const canMarkPaid = invoice.status === "draft" || invoice.status === "sent";
                            return (
                                <TableRow
                                    key={invoice.id}
                                    className="group cursor-pointer hover:bg-muted"
                                    onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                                >
                                    <TableCell className="pl-4 font-mono">INV-{invoice.code}</TableCell>
                                    <TableCell>
                                        <Badge variant={STATUS_BADGE[status]} className="capitalize">{status}</Badge>
                                    </TableCell>
                                    <TableCell>{formatMoney(invoice.total, invoice.currency)}</TableCell>
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
                                                {!isPaid && (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/invoices/${invoice.id}/edit`}>
                                                            <PencilIcon className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {canMarkPaid && (
                                                    <DropdownMenuItem onSelect={() => setDialog({ kind: "paid", invoice })}>
                                                        <BanknoteIcon className="w-4 h-4 mr-2" />
                                                        Mark as paid
                                                    </DropdownMenuItem>
                                                )}
                                                {isPaid && (
                                                    <DropdownMenuItem onSelect={() => setDialog({ kind: "unpaid", invoice })}>
                                                        <Undo2Icon className="w-4 h-4 mr-2" />
                                                        Mark as unpaid
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem variant="destructive" onSelect={() => setDialog({ kind: "delete", invoice })}>
                                                    <TrashIcon className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
            {dialog?.kind === "paid" && <MarkPaidDialog invoice={dialog.invoice} onOpenChange={closeDialog} />}
            {dialog?.kind === "unpaid" && <MarkUnpaidDialog invoice={dialog.invoice} onOpenChange={closeDialog} />}
            {dialog?.kind === "delete" && <DeleteInvoiceDialog invoice={dialog.invoice} onOpenChange={closeDialog} />}
        </>
    )
}
