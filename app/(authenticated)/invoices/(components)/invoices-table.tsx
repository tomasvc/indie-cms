"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

interface InvoicesTableProps {
    invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
    const router = useRouter();
    return (
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
                            <TableCell className="pl-4 font-mono">{invoice.number}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">{invoice.status}</Badge>
                            </TableCell>
                            <TableCell>
                                {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
                            </TableCell>
                            <TableCell>{invoice.due_date}</TableCell>
                            <TableCell>{invoice.issue_date}</TableCell>
                            <TableCell>{invoice.paid_date}</TableCell>
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
                                        <DropdownMenuItem>
                                            <PencilIcon className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem variant="destructive">
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
    )
}
