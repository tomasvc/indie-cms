"use server"
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PG_ERROR, databaseError, validationError, type ActionState } from "@/lib/forms/action-state";
import { toNullable } from "@/lib/schemas/common";
import {
    calculateInvoiceTotals,
    invoiceCreateSchema,
    invoiceUpdateSchema,
    type InvoiceFormValues,
} from "@/lib/schemas/invoice";

const DUPLICATE_CODE: ActionState = {
    error: "Please fix the highlighted fields.",
    fieldErrors: { code: ["An invoice with this reference number already exists."] },
};

export async function createInvoice(input: InvoiceFormValues): Promise<ActionState> {
    const parsed = invoiceCreateSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);
    const values = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { lineTotals, subtotal, discountAmount, total } = calculateInvoiceTotals(
        values.lineItems,
        values.discountValue,
        values.discountType
    );
    const invoiceId = crypto.randomUUID();

    const { error: invoiceError } = await supabase.from('invoices').insert({
        id: invoiceId,
        user_id: user.id,
        project_id: values.projectId,
        client_id: values.clientId,
        code: values.code,
        currency: values.currency,
        status: values.status,
        amount: total,
        subtotal,
        total,
        discount_amount: discountAmount > 0 ? discountAmount : null,
        due_date: values.dueDate,
        issue_date: values.issueDate,
        notes: toNullable(values.notes),
    });

    if (invoiceError?.code === PG_ERROR.UNIQUE_VIOLATION) return DUPLICATE_CODE;
    if (invoiceError) return databaseError(invoiceError, "Couldn't create this invoice. Please try again.");

    const { error: lineItemsError } = await supabase.from('line_items').insert(
        values.lineItems.map((item, index) => ({
            id: crypto.randomUUID(),
            invoice_id: invoiceId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unitPrice,
            total: lineTotals[index],
        }))
    );

    if (lineItemsError) {
        await supabase.from('invoices').delete().eq('id', invoiceId).eq('user_id', user.id);
        return databaseError(lineItemsError, "Couldn't save the line items. Please try again.");
    }

    revalidatePath('/invoices');
    redirect('/invoices');
}

export async function updateInvoice(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = invoiceUpdateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return validationError(parsed.error);
    const { id, paid_date, pdf_url, ...values } = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('invoices')
        .update({
            ...values,
            paid_date: toNullable(paid_date),
            pdf_url: toNullable(pdf_url),
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error?.code === PG_ERROR.UNIQUE_VIOLATION) return DUPLICATE_CODE;
    if (error) return databaseError(error, "Couldn't save this invoice. Please try again.");
    revalidatePath('/invoices');
    return { ok: true };
}

export async function deleteInvoice(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) throw error;
    revalidatePath('/invoices');
    redirect('/invoices');
}
