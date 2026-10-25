import { z } from "zod";
import { amount, formNumber, id, isOnOrAfter, optionalDate, optionalText, optionalUrl, requiredDate, requiredId } from "./common";

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "void"] as const;
export const INVOICE_CURRENCIES = ["USD", "GBP", "EUR"] as const;
export const LINE_ITEM_UNITS = ["hrs", "days", "flat", "items", "words", "pages"] as const;
export const DISCOUNT_TYPES = ["percent", "flat"] as const;

const invoiceStatus = z.enum(INVOICE_STATUSES, { error: "Choose a status" });

const invoiceCode = z
    .string({ error: "Reference number is required" })
    .trim()
    .min(1, { error: "Reference number is required", abort: true })
    .max(10, "Reference number must be 10 characters or fewer")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only");

export const lineItemSchema = z.object({
    description: z
        .string()
        .trim()
        .min(1, "Describe this item")
        .max(500, "Description must be 500 characters or fewer"),
    quantity: z.number({ error: "Quantity must be a number" }).positive("Quantity must be more than 0"),
    unit: z.enum(LINE_ITEM_UNITS, { error: "Choose a unit" }),
    unitPrice: amount("Rate"),
});

export const invoiceCreateSchema = z
    .object({
        projectId: requiredId("project"),
        clientId: requiredId("client"),
        status: invoiceStatus,
        code: invoiceCode,
        issueDate: requiredDate("Issue date"),
        dueDate: requiredDate("Due date"),
        currency: z.enum(INVOICE_CURRENCIES, { error: "Choose a currency" }),
        notes: optionalText("Notes", 2000),
        discountValue: amount("Discount"),
        discountType: z.enum(DISCOUNT_TYPES),
        lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
    })
    .refine((v) => isOnOrAfter(v.dueDate, v.issueDate), {
        error: "Due date must be on or after the issue date",
        path: ["dueDate"],
    })
    .refine((v) => v.discountType !== "percent" || v.discountValue <= 100, {
        error: "A percentage discount can't exceed 100%",
        path: ["discountValue"],
    });

export type InvoiceFormValues = z.infer<typeof invoiceCreateSchema>;
export type LineItemValues = z.infer<typeof lineItemSchema>;

export const invoiceUpdateSchema = z
    .object({
        id: id("Invoice"),
        project_id: requiredId("project"),
        client_id: requiredId("client"),
        status: invoiceStatus,
        code: invoiceCode,
        amount: formNumber(z.number({ error: "Amount is required" }).min(0, "Amount can't be negative")),
        issue_date: requiredDate("Issue date"),
        due_date: requiredDate("Due date"),
        paid_date: optionalDate("Paid date"),
        pdf_url: optionalUrl("PDF URL"),
    })
    .refine((v) => isOnOrAfter(v.due_date, v.issue_date), {
        error: "Due date must be on or after the issue date",
        path: ["due_date"],
    });

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export function calculateInvoiceTotals(
    lineItems: Pick<LineItemValues, "quantity" | "unitPrice">[],
    discountValue: number,
    discountType: (typeof DISCOUNT_TYPES)[number]
) {
    const finite = (n: number) => (Number.isFinite(n) ? n : 0);
    const lineTotals = lineItems.map((item) => roundMoney(finite(item.quantity) * finite(item.unitPrice)));
    const subtotal = roundMoney(lineTotals.reduce((sum, total) => sum + total, 0));
    const discount = finite(discountValue);
    const discountAmount = roundMoney(
        Math.min(subtotal, discountType === "percent" ? subtotal * (discount / 100) : discount)
    );
    return { lineTotals, subtotal, discountAmount, total: roundMoney(subtotal - discountAmount) };
}
