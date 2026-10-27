import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { formatLocalDate, formatMoney } from "@/lib/helpers/format";

export type InvoiceDocumentData = {
    code: string;
    currency: string;
    issue_date?: string | null;
    due_date?: string | null;
    paid_date?: string | null;
    subtotal: number;
    discount_type?: "percent" | "flat" | null;
    discount_value?: number | null;
    discount_amount?: number | null;
    total: number;
    notes?: string | null;
    items: Array<{ description?: string | null; quantity: number; unit?: string | null; unit_price: number; total: number }>;
    from: { full_name?: string | null; company_name?: string | null; address?: string | null; tax_id?: string | null; email?: string | null };
    to: { name?: string | null; company?: string | null; email?: string | null; address?: string | null; country?: string | null; vat_number?: string | null } | null;
    project?: string | null;
};

/**
 * The invoice as the client sees it. Used by the owner's invoice page and the public share link,
 * so what you print is exactly what they open.
 */
export function InvoiceDocument({ invoice, locale, status }: { invoice: InvoiceDocumentData; locale: string; status?: React.ReactNode }) {
    const money = (amount: number) => formatMoney(Number(amount), invoice.currency, locale);
    const discount = Number(invoice.discount_amount ?? 0);
    const { from, to } = invoice;

    return (
        <Card className="p-8 sm:p-10 gap-8 print:border-0 print:shadow-none print:p-0">
            <header className="flex flex-wrap items-start justify-between gap-6">
                <div>
                    <Typography variant="pageTitle" as="h1">Invoice</Typography>
                    <p className="font-mono text-[14px] text-muted-foreground mt-1">INV-{invoice.code}</p>
                </div>
                <div className="text-right text-[14px] leading-relaxed">
                    <p className="font-semibold text-foreground">{from.company_name || from.full_name}</p>
                    {from.company_name && from.full_name && <p>{from.full_name}</p>}
                    {from.address && <p className="whitespace-pre-line text-muted-foreground">{from.address}</p>}
                    {from.email && <p className="text-muted-foreground">{from.email}</p>}
                    {from.tax_id && <p className="text-muted-foreground">Tax ID: {from.tax_id}</p>}
                </div>
            </header>

            <section className="grid gap-6 sm:grid-cols-2 text-[14px] leading-relaxed">
                <div>
                    <Typography variant="labelUppercase" as="h2" className="mb-1">Bill to</Typography>
                    {to ? (
                        <>
                            <p className="font-semibold text-foreground">{to.company || to.name}</p>
                            {to.company && <p>{to.name}</p>}
                            {to.email && <p className="text-muted-foreground">{to.email}</p>}
                            {to.address && <p className="whitespace-pre-line text-muted-foreground">{[to.address, to.country].filter(Boolean).join(", ")}</p>}
                            {to.vat_number && <p className="text-muted-foreground">VAT: {to.vat_number}</p>}
                        </>
                    ) : (
                        <p className="text-muted-foreground">—</p>
                    )}
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:justify-self-end">
                    <dt className="text-muted-foreground">Issued</dt>
                    <dd>{formatLocalDate(invoice.issue_date, locale)}</dd>
                    <dt className="text-muted-foreground">Due</dt>
                    <dd>{formatLocalDate(invoice.due_date, locale)}</dd>
                    {invoice.paid_date && (<><dt className="text-muted-foreground">Paid</dt><dd>{formatLocalDate(invoice.paid_date, locale)}</dd></>)}
                    {invoice.project && (<><dt className="text-muted-foreground">Project</dt><dd>{invoice.project}</dd></>)}
                    {status && (<><dt className="text-muted-foreground print:hidden">Status</dt><dd className="print:hidden">{status}</dd></>)}
                </dl>
            </section>

            <table className="w-full text-[14px]">
                <thead>
                    <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 font-medium">Description</th>
                        <th className="py-2 font-medium text-right">Qty</th>
                        <th className="py-2 font-medium text-right">Rate</th>
                        <th className="py-2 font-medium text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b align-top">
                            <td className="py-3 pr-4 text-foreground">{item.description}</td>
                            <td className="py-3 text-right tabular-nums whitespace-nowrap">
                                {Number(item.quantity)}{item.unit && item.unit !== "flat" ? ` ${item.unit}` : ""}
                            </td>
                            <td className="py-3 text-right tabular-nums whitespace-nowrap">{money(item.unit_price)}</td>
                            <td className="py-3 text-right tabular-nums whitespace-nowrap text-foreground">{money(item.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <dl className="ml-auto grid w-full max-w-64 grid-cols-[1fr_auto] gap-y-1 text-[14px]">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-right tabular-nums">{money(invoice.subtotal)}</dd>
                {discount > 0 && (
                    <>
                        <dt className="text-muted-foreground">
                            Discount{invoice.discount_type === "percent" ? ` (${Number(invoice.discount_value)}%)` : ""}
                        </dt>
                        <dd className="text-right tabular-nums">−{money(discount)}</dd>
                    </>
                )}
                <dt className="border-t pt-2 mt-1 font-semibold text-foreground">{invoice.paid_date ? "Total paid" : "Total due"}</dt>
                <dd className="border-t pt-2 mt-1 text-right font-semibold tabular-nums text-foreground">{money(invoice.total)}</dd>
            </dl>

            {invoice.notes && (
                <section className="text-[14px]">
                    <Typography variant="labelUppercase" as="h2" className="mb-1">Notes</Typography>
                    <p className="whitespace-pre-line">{invoice.notes}</p>
                </section>
            )}
        </Card>
    );
}
