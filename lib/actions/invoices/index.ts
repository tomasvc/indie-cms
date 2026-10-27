"use server"
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PG_ERROR, databaseError, validationError, type ActionState } from "@/lib/forms/action-state";
import { id as idSchema } from "@/lib/schemas/common";
import {
    invoiceCreateSchema,
    invoiceIdSchema,
    markInvoicePaidSchema,
    type InvoiceFormValues,
} from "@/lib/schemas/invoice";

const DUPLICATE_CODE: ActionState = {
    error: "Please fix the highlighted fields.",
    fieldErrors: { code: ["You already have an invoice with this reference number."] },
};

const NOT_FOUND: ActionState = { error: "This invoice couldn't be found." };

async function requireUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return { supabase, user };
}

/** Totals are deliberately not sent; the database computes them from the line items. */
function toInvoicePayload(values: InvoiceFormValues) {
    return {
        p_invoice: {
            project_id: values.projectId,
            client_id: values.clientId,
            code: values.code,
            currency: values.currency,
            status: values.status,
            issue_date: values.issueDate,
            due_date: values.dueDate,
            notes: values.notes,
            discount_type: values.discountType,
            discount_value: values.discountValue,
        },
        p_line_items: values.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unitPrice,
        })),
    };
}

function invoiceWriteError(error: { code?: string; message?: string }, fallback: string): ActionState {
    if (error.code === PG_ERROR.UNIQUE_VIOLATION) return DUPLICATE_CODE;
    if (error.code === "P0002") return NOT_FOUND;
    if (error.code === "55000") return { error: "Paid invoices can't be edited. Mark it as unpaid first." };
    if (error.code === "P0003") return { error: "Some of this time has already been invoiced. Reload the page and try again." };
    return databaseError(error, fallback);
}

export async function createInvoice(input: InvoiceFormValues): Promise<ActionState> {
    const parsed = invoiceCreateSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);
    if (parsed.data.status === "void") return { error: "A new invoice can't be void." };

    const { supabase } = await requireUser();
    const { data: newId, error } = await supabase.rpc("create_invoice", {
        ...toInvoicePayload(parsed.data),
        p_time_entry_ids: parsed.data.timeEntryIds ?? [],
    });
    if (error) return invoiceWriteError(error, "Couldn't create this invoice. Please try again.");

    revalidatePath("/invoices");
    revalidatePath(`/projects/${parsed.data.projectId}`);
    revalidatePath("/dashboard");
    // Open the new invoice so it's clear it was created, with print and share one click away
    redirect(`/invoices/${newId}`);
}

export async function updateInvoice(id: string, input: InvoiceFormValues): Promise<ActionState> {
    const parsedId = idSchema("Invoice").safeParse(id);
    if (!parsedId.success) return NOT_FOUND;

    const parsed = invoiceCreateSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { supabase } = await requireUser();
    const { error } = await supabase.rpc("update_invoice", {
        p_id: parsedId.data,
        ...toInvoicePayload(parsed.data),
    });
    if (error) return invoiceWriteError(error, "Couldn't save this invoice. Please try again.");

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${parsedId.data}`);
    redirect(`/invoices/${parsedId.data}`);
}

export async function markInvoicePaid(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = markInvoicePaidSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);
    const { id, paid_date, payment_method } = parsed.data;

    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
        .from("invoices")
        .update({ status: "paid", paid_date, payment_method })
        .eq("id", id)
        .eq("user_id", user.id)
        .in("status", ["sent", "draft"])
        .select("id");

    if (error) return databaseError(error, "Couldn't record this payment. Please try again.");
    if (!data?.length) return { error: "Only draft or sent invoices can be marked as paid." };

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { ok: true };
}

export async function markInvoiceUnpaid(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = invoiceIdSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return NOT_FOUND;

    const { supabase, user } = await requireUser();
    const { error } = await supabase
        .from("invoices")
        .update({ status: "sent", paid_date: null, payment_method: null })
        .eq("id", parsed.data.id)
        .eq("user_id", user.id)
        .eq("status", "paid");

    if (error) return databaseError(error, "Couldn't update this invoice. Please try again.");

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { ok: true };
}

export async function deleteInvoice(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = invoiceIdSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return NOT_FOUND;

    const { supabase, user } = await requireUser();
    const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", parsed.data.id)
        .eq("user_id", user.id);

    // Time billed on this invoice goes back to "unbilled" (time_entries.invoice_id is ON DELETE SET NULL)
    if (error) return databaseError(error, "Couldn't delete this invoice. Please try again.");

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { ok: true };
}

export async function markInvoiceSent(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = invoiceIdSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return NOT_FOUND;

    const { supabase, user } = await requireUser();
    // sent_at is stamped by the invoices_stamp_sent_at trigger
    const { data, error } = await supabase
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", parsed.data.id)
        .eq("user_id", user.id)
        .eq("status", "draft")
        .select("id");

    if (error) return databaseError(error, "Couldn't mark this invoice as sent. Please try again.");
    if (!data?.length) return { error: "Only draft invoices can be marked as sent." };

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${parsed.data.id}`);
    revalidatePath("/dashboard");
    return { ok: true };
}

/** Returns the invoice's share token, creating one if it isn't shared yet. */
export async function enableInvoiceSharing(invoiceId: string): Promise<ActionState & { token?: string }> {
    const parsed = idSchema("Invoice").safeParse(invoiceId);
    if (!parsed.success) return NOT_FOUND;

    const { supabase, user } = await requireUser();
    const { data: existing, error: readError } = await supabase
        .from("invoices")
        .select("share_token, status")
        .eq("id", parsed.data)
        .eq("user_id", user.id)
        .maybeSingle();
    if (readError) return databaseError(readError, "Couldn't create a share link. Please try again.");
    if (!existing) return NOT_FOUND;
    if (existing.status === "void") return { error: "Void invoices can't be shared." };
    if (existing.share_token) return { ok: true, token: existing.share_token };

    const token = crypto.randomUUID();
    const { error } = await supabase
        .from("invoices")
        .update({ share_token: token })
        .eq("id", parsed.data)
        .eq("user_id", user.id);
    if (error) return databaseError(error, "Couldn't create a share link. Please try again.");

    revalidatePath(`/invoices/${parsed.data}`);
    return { ok: true, token };
}

/** Turns the link off; anyone holding the old link sees "not found". */
export async function disableInvoiceSharing(invoiceId: string): Promise<ActionState> {
    const parsed = idSchema("Invoice").safeParse(invoiceId);
    if (!parsed.success) return NOT_FOUND;

    const { supabase, user } = await requireUser();
    const { error } = await supabase
        .from("invoices")
        .update({ share_token: null })
        .eq("id", parsed.data)
        .eq("user_id", user.id);
    if (error) return databaseError(error, "Couldn't turn off the share link. Please try again.");

    revalidatePath(`/invoices/${parsed.data}`);
    return { ok: true };
}
