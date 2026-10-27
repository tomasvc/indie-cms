import Link from "next/link";
import { PlusIcon, ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatLocalDate, formatMoney } from "@/lib/helpers/format";
import { displayStatus, invoiceTotal, isBilled, isOutstanding } from "@/lib/helpers/invoices";
import { currencyOf, formatMoneyByCurrency, sumByCurrency } from "@/lib/money";
import type { Invoice } from "@/types";
import { InvoiceStatusBadge } from "../../../invoices/(components)/invoice-status-badge";

/** What has been billed on this project, and what's still owed. */
export function ProjectInvoices({ projectId, invoices, locale }: { projectId: string; invoices: Invoice[]; locale: string }) {
    const billed = sumByCurrency(invoices.filter(isBilled), invoiceTotal, currencyOf);
    const owed = sumByCurrency(invoices.filter(isOutstanding), invoiceTotal, currencyOf);

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <CardTitle><Typography variant="cardTitle" as="span">Invoices</Typography></CardTitle>
                        {invoices.length > 0 && (
                            <Typography variant="body" color="muted" as="p">
                                Billed {formatMoneyByCurrency(billed, locale)} · Owed {formatMoneyByCurrency(owed, locale)}
                            </Typography>
                        )}
                    </div>
                    <Button asChild>
                        <Link href={`/invoices/new?project=${projectId}`}>
                            <PlusIcon className="size-3.5" />
                            New invoice
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-6">
                        <ReceiptIcon className="size-10 text-muted-foreground/70 mb-3" aria-hidden />
                        <Typography variant="subtitle" className="mb-1">Nothing billed on this project yet</Typography>
                    </div>
                ) : (
                    <ul className="divide-y">
                        {invoices.map((invoice) => (
                            <li key={invoice.id}>
                                <Link href={`/invoices/${invoice.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none">
                                    <span className="min-w-0">
                                        <span className="block font-mono text-[14px] text-foreground">INV-{invoice.code}</span>
                                        <span className="block text-[13px] text-muted-foreground">
                                            {invoice.status === "paid" && invoice.paid_date
                                                ? `Paid ${formatLocalDate(invoice.paid_date, locale)}`
                                                : `Due ${formatLocalDate(invoice.due_date, locale)}`}
                                        </span>
                                    </span>
                                    <span className="flex shrink-0 items-center gap-3">
                                        <span className="text-[14px] tabular-nums text-foreground">{formatMoney(invoice.total, invoice.currency, locale)}</span>
                                        <InvoiceStatusBadge status={displayStatus(invoice)} />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
