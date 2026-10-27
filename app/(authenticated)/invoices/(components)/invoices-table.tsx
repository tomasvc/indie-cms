"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { markInvoiceSent } from "@/lib/actions/invoices";
import { BanknoteIcon, EllipsisIcon, FileTextIcon, SendIcon, PencilIcon, SearchIcon, TrashIcon, Undo2Icon, XIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney, formatDate } from "@/lib/helpers/format";
import { displayStatus } from "@/lib/helpers/invoices";
import { clientLabel } from "@/lib/helpers/clients";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { DeleteInvoiceDialog, MarkPaidDialog, MarkUnpaidDialog } from "./invoice-dialogs";
import type { Client, Project } from "@/types";

const STATUS_FILTERS = ["all", "draft", "sent", "overdue", "paid", "void"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_LABEL: Record<StatusFilter, string> = {
    all: "All statuses",
    draft: "Draft",
    sent: "Sent",
    overdue: "Overdue",
    paid: "Paid",
    void: "Void",
};

function isStatusFilter(value: string): value is StatusFilter {
    return (STATUS_FILTERS as readonly string[]).includes(value);
}

type PendingDialog = { kind: "paid" | "unpaid" | "delete"; invoice: Invoice } | null;

function openRow(event: KeyboardEvent<HTMLTableRowElement>, open: () => void) {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open();
}

export function InvoicesTable({ invoices, clients, projects }: { invoices: Invoice[], clients: Client[], projects: Project[] }) {
    const router = useRouter();
    const [dialog, setDialog] = useState<PendingDialog>(null);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [clientId, setClientId] = useState("all");
    const [projectId, setProjectId] = useState("all");
    const closeDialog = (open: boolean) => !open && setDialog(null);
    const [, startSending] = useTransition();
    const [sendError, setSendError] = useState<string | null>(null);

    function markSent(invoice: Invoice) {
        setSendError(null);
        const formData = new FormData();
        formData.set("id", invoice.id);
        startSending(async () => {
            const result = await markInvoiceSent({}, formData);
            if (result.error) setSendError(result.error);
        });
    }

    const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
    const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

    const clientOptions = useMemo(() => {
        const ids = new Set(invoices.map((invoice) => invoice.client_id));
        return clients
            .filter((client) => ids.has(client.id))
            .sort((a, b) => clientLabel(a).localeCompare(clientLabel(b)));
    }, [clients, invoices]);

    const projectOptions = useMemo(() => {
        const ids = new Set(
            invoices
                .filter((invoice) => clientId === "all" || invoice.client_id === clientId)
                .map((invoice) => invoice.project_id),
        );
        return projects
            .filter((project) => ids.has(project.id))
            .sort((a, b) => a.title.localeCompare(b.title));
    }, [clientId, invoices, projects]);

    const filteredInvoices = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return invoices.filter((invoice) => {
            if (status !== "all" && displayStatus(invoice) !== status) return false;
            if (clientId !== "all" && invoice.client_id !== clientId) return false;
            if (projectId !== "all" && invoice.project_id !== projectId) return false;
            if (!needle) return true;
            const client = clientById.get(invoice.client_id);
            const project = projectById.get(invoice.project_id);
            const haystack = [
                invoice.code,
                `inv-${invoice.code}`,
                client?.name,
                client?.company,
                project?.title,
                displayStatus(invoice),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [clientById, clientId, invoices, projectById, projectId, query, status]);

    const hasFilters = query.trim() !== "" || status !== "all" || clientId !== "all" || projectId !== "all";

    function clearFilters() {
        setQuery("");
        setStatus("all");
        setClientId("all");
        setProjectId("all");
    }

    function handleClientChange(value: string) {
        setClientId(value);
        if (value === "all" || projectId === "all") return;
        const stillValid = invoices.some(
            (invoice) => invoice.project_id === projectId && invoice.client_id === value,
        );
        if (!stillValid) setProjectId("all");
    }

    const countLabel = hasFilters
        ? `${filteredInvoices.length} of ${invoices.length}`
        : invoices.length === 1
            ? "1 invoice"
            : `${invoices.length} invoices`;

    return (
        <>
            {sendError && <p className="text-sm text-destructive" role="alert">{sendError}</p>}
            <Card className="min-w-0 p-0">
                <div className="flex min-w-0 flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="relative w-full sm:w-56">
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search invoices"
                            aria-label="Search invoices"
                            className="pr-8 pl-8"
                        />
                        {query && (
                            <button
                                type="button"
                                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Clear search"
                                onClick={() => setQuery("")}
                            >
                                <XIcon className="size-3.5" />
                            </button>
                        )}
                    </div>
                    <Select value={status} onValueChange={(value) => isStatusFilter(value) && setStatus(value)}>
                        <SelectTrigger aria-label="Filter by status" className="w-full sm:w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                            {STATUS_FILTERS.map((value) => (
                                <SelectItem key={value} value={value}>{STATUS_LABEL[value]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={clientId} onValueChange={handleClientChange}>
                        <SelectTrigger aria-label="Filter by client" className="w-full sm:w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                            <SelectItem value="all">All clients</SelectItem>
                            {clientOptions.map((client) => (
                                <SelectItem key={client.id} value={client.id}>{clientLabel(client)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger aria-label="Filter by project" className="w-full sm:w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                            <SelectItem value="all">All projects</SelectItem>
                            {projectOptions.map((project) => (
                                <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 sm:ml-auto">
                        <p className="text-[13px] text-muted-foreground tabular-nums" aria-live="polite">
                            {countLabel}
                        </p>
                        {hasFilters && (
                            <Button type="button" variant="ghost" onClick={clearFilters}>
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
                {/* Phones get stacked rows; the full table would hide status and actions off-screen */}
                <ul className="divide-y sm:hidden">
                    {filteredInvoices.length === 0 && (
                        <li className="px-4 py-8 text-center text-[14px] text-muted-foreground">
                            {invoices.length === 0 ? "No invoices yet." : "No invoices match these filters."}
                        </li>
                    )}
                    {filteredInvoices.map((invoice) => (
                        <li key={invoice.id}>
                            <Link
                                href={`/invoices/${invoice.id}`}
                                className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                            >
                                <span className="flex min-w-0 flex-col">
                                    <span className="truncate text-[14px] font-medium text-foreground">{clientLabel(clientById.get(invoice.client_id))}</span>
                                    <span className="truncate text-[13px] text-muted-foreground">
                                        INV-{invoice.code}{projectById.get(invoice.project_id) ? ` · ${projectById.get(invoice.project_id)?.title}` : ""}
                                    </span>
                                </span>
                                <span className="flex shrink-0 flex-col items-end gap-1">
                                    <span className="text-[14px] font-medium tabular-nums text-foreground">{formatMoney(invoice.total, invoice.currency)}</span>
                                    <span className="flex items-center gap-2">
                                        <span className="text-[13px] text-muted-foreground">Due {formatDate(invoice.due_date, "MMM d")}</span>
                                        <InvoiceStatusBadge status={displayStatus(invoice)} />
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Due date</TableHead>
                            <TableHead>Issue date</TableHead>
                            <TableHead>Paid date</TableHead>
                            <TableHead className="pr-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={9} className="h-28 text-center whitespace-normal text-muted-foreground">
                                    <p>{invoices.length === 0 ? "No invoices yet." : "No invoices match these filters."}</p>
                                    {hasFilters && (
                                        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredInvoices.map((invoice) => {
                            const status = displayStatus(invoice);
                            const isPaid = invoice.status === "paid";
                            const canMarkPaid = invoice.status === "draft" || invoice.status === "sent";
                            const href = `/invoices/${invoice.id}`;
                            return (
                                <TableRow
                                    key={invoice.id}
                                    tabIndex={0}
                                    className="group cursor-pointer hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                    onClick={() => router.push(href)}
                                    onKeyDown={(event) => openRow(event, () => router.push(href))}
                                >
                                    <TableCell className="pl-4 font-mono">
                                        <Link href={href} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={(event) => event.stopPropagation()}>
                                            INV-{invoice.code}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <InvoiceStatusBadge status={status} />
                                    </TableCell>
                                    <TableCell>{clientLabel(clientById.get(invoice.client_id))}</TableCell>
                                    <TableCell>{projectById.get(invoice.project_id)?.title ?? "—"}</TableCell>
                                    <TableCell className="text-right font-medium tabular-nums">{formatMoney(invoice.total, invoice.currency)}</TableCell>
                                    <TableCell>{formatDate(invoice.due_date, "MMM d, yyyy")}</TableCell>
                                    <TableCell>{formatDate(invoice.issue_date, "MMM d, yyyy")}</TableCell>
                                    <TableCell>{formatDate(invoice.paid_date, "MMM d, yyyy")}</TableCell>
                                    <TableCell className="text-right px-1 pr-4" style={{ width: "1%" }} onClick={(event) => event.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="flex items-center p-1 mr-2 hover:bg-accent rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    aria-label="Actions"
                                                >
                                                    <EllipsisIcon className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="z-50">
                                                <DropdownMenuItem asChild>
                                                    <Link href={href}>
                                                        <FileTextIcon className="w-4 h-4 mr-2" />
                                                        <span className="whitespace-nowrap">View and print</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                {!isPaid && (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/invoices/${invoice.id}/edit`}>
                                                            <PencilIcon className="w-4 h-4 mr-2" />
                                                            <span className="whitespace-nowrap">Edit</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {invoice.status === "draft" && (
                                                    <DropdownMenuItem onSelect={() => markSent(invoice)}>
                                                        <SendIcon className="w-4 h-4 mr-2" />
                                                        <span className="whitespace-nowrap">Mark as sent</span>
                                                    </DropdownMenuItem>
                                                )}
                                                {canMarkPaid && (
                                                    <DropdownMenuItem onSelect={() => setDialog({ kind: "paid", invoice })}>
                                                        <BanknoteIcon className="w-4 h-4 mr-2" />
                                                        <span className="whitespace-nowrap">Mark as paid</span>
                                                    </DropdownMenuItem>
                                                )}
                                                {isPaid && (
                                                    <DropdownMenuItem onSelect={() => setDialog({ kind: "unpaid", invoice })}>
                                                        <Undo2Icon className="w-4 h-4 mr-2" />
                                                        <span className="whitespace-nowrap">Mark as unpaid</span>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem variant="destructive" onSelect={() => setDialog({ kind: "delete", invoice })}>
                                                    <TrashIcon className="w-4 h-4 mr-2" />
                                                    <span className="whitespace-nowrap">Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                </div>
            </Card>
            {dialog?.kind === "paid" && <MarkPaidDialog invoice={dialog.invoice} onOpenChange={closeDialog} />}
            {dialog?.kind === "unpaid" && <MarkUnpaidDialog invoice={dialog.invoice} onOpenChange={closeDialog} />}
            {dialog?.kind === "delete" && <DeleteInvoiceDialog invoice={dialog.invoice} onOpenChange={closeDialog} />}
        </>
    )
}
