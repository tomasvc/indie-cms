import { z } from "zod";
import { CURRENCY_CODES } from "@/lib/constants/profile";
import { amount, id, isOnOrAfter, optionalText, requiredDate, requiredId } from "./common";

/** Stored statuses. "Overdue" is derived from a sent invoice's due date; see lib/helpers/invoices.ts. */
export const INVOICE_STATUSES = ["draft", "sent", "paid", "void"] as const;
/** Statuses the invoice form can set. "paid" is only set by the payment actions. */
export const EDITABLE_INVOICE_STATUSES = ["draft", "sent", "void"] as const;
export const INVOICE_CURRENCIES = CURRENCY_CODES;
export const LINE_ITEM_UNITS = ["hrs", "days", "flat", "items", "words", "pages"] as const;
export const DISCOUNT_TYPES = ["percent", "flat"] as const;
export const PAYMENT_METHODS = ["bank_transfer", "stripe", "paypal", "cash", "other"] as const;

const invoiceStatus = z.enum(EDITABLE_INVOICE_STATUSES, { error: "Choose a status" });

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
        /** Time entries this new invoice bills; ignored when editing. */
        timeEntryIds: z.array(id("Time entry")).optional(),
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

export const markInvoicePaidSchema = z.object({
    id: id("Invoice"),
    paid_date: requiredDate("Paid date"),
    payment_method: z.enum(PAYMENT_METHODS, { error: "Choose a payment method" }),
});

export const invoiceIdSchema = z.object({ id: id("Invoice") });

const roundMoney = (value: number) => Math.round(value * 100) / 100;

/** Live preview for the form. Stored totals are computed by `public.invoice_totals` in the database. */
export function calculateInvoiceTotals(
    lineItems: Pick<LineItemValues, "quantity" | "unitPrice">[],
    discountValue: number,
    discountType: (typeof DISCOUNT_TYPES)[number]
) {
    const finite = (n: number) => (Number.isFinite(n) ? n : 0);
    const lineTotals = lineItems.map((item) =>
        roundMoney(roundMoney(finite(item.quantity)) * roundMoney(finite(item.unitPrice)))
    );
    const subtotal = roundMoney(lineTotals.reduce((sum, total) => sum + total, 0));
    const discount = finite(discountValue);
    const discountAmount = roundMoney(
        Math.min(subtotal, discountType === "percent" ? subtotal * (discount / 100) : discount)
    );
    return { lineTotals, subtotal, discountAmount, total: roundMoney(subtotal - discountAmount) };
}
