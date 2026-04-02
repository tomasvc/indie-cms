"use server"
import { createClient } from "@/lib/supabase/server";
import { InvoiceStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getInvoices(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('invoices').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
}

export async function getInvoice(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
}

interface LineItemInput {
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total: number;
}

export async function createInvoice(formData: FormData) {
    const project_id = (formData.get('project_id') as string)?.trim() || null;
    const client_id = (formData.get('client_id') as string)?.trim() || null;
    const code = (formData.get('code') as string)?.trim() || null;
    const currency = (formData.get('currency') as string)?.trim() || 'USD';
    const status = ((formData.get('status') as string)?.trim() as InvoiceStatus) || 'draft';
    const due_date = (formData.get('due_date') as string)?.trim() || null;
    const issue_date = (formData.get('issue_date') as string)?.trim() || null;
    const paid_date = (formData.get('paid_date') as string)?.trim() || null;
    const pdf_url = (formData.get('pdf_url') as string)?.trim() || null;
    const notes = (formData.get('notes') as string)?.trim() || null;
    const discountRaw = (formData.get('discount_amount') as string)?.trim() || '0';
    const discountType = (formData.get('discount_type') as string)?.trim() || 'percent';
    const lineItemsRaw = (formData.get('line_items') as string)?.trim() || '[]';

    if (!project_id) throw new Error('Please select a project.');
    if (!client_id) throw new Error('Please select a client.');
    if (!code) throw new Error('Please enter an invoice code.');
    if (!due_date) throw new Error('Please enter a due date.');
    if (!issue_date) throw new Error('Please enter an issue date.');

    let lineItems: LineItemInput[] = [];
    try {
        lineItems = JSON.parse(lineItemsRaw);
    } catch {
        throw new Error('Invalid line items data.');
    }

    if (lineItems.length === 0) throw new Error('Please add at least one line item.');

    const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const discountNum = parseFloat(discountRaw) || 0;
    let discountAmount = 0;
    if (discountType === 'percent') {
        discountAmount = subtotal * (discountNum / 100);
    } else {
        discountAmount = discountNum;
    }
    const total = Math.max(0, subtotal - discountAmount);

    const supabase = await createClient();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user?.id) throw new Error('Unauthorized.');

    const invoiceId = crypto.randomUUID();

    const { error: invoiceError } = await supabase.from('invoices').insert({
        id: invoiceId,
        user_id: user.id,
        project_id,
        client_id,
        code,
        currency,
        status,
        amount: total,
        subtotal,
        total,
        discount_amount: discountAmount > 0 ? discountAmount : null,
        due_date,
        issue_date,
        paid_date: paid_date || null,
        pdf_url: pdf_url || null,
        notes: notes || null,
    });

    if (invoiceError) throw invoiceError;

    if (lineItems.length > 0) {
        const lineItemRows = lineItems.map((item) => ({
            id: crypto.randomUUID(),
            invoice_id: invoiceId,
            description: item.description || null,
            quantity: item.quantity,
            unit: item.unit || null,
            unit_price: item.unit_price,
            total: item.total,
        }));

        const { error: lineItemsError } = await supabase.from('line_items').insert(lineItemRows);
        if (lineItemsError) throw lineItemsError;
    }

    revalidatePath('/invoices');
    redirect('/invoices');
}

export async function updateInvoice(formData: FormData) {
    const id = (formData.get('id') as string)?.trim();
    if (!id) throw new Error('Invoice ID is required.');

    const project_id = (formData.get('project_id') as string)?.trim() || null;
    const client_id = (formData.get('client_id') as string)?.trim() || null;
    const code = (formData.get('code') as string)?.trim() || null;
    const amountRaw = (formData.get('amount') as string)?.trim() || null;
    const status = ((formData.get('status') as string)?.trim() as InvoiceStatus) || 'draft';
    const due_date = (formData.get('due_date') as string)?.trim() || null;
    const issue_date = (formData.get('issue_date') as string)?.trim() || null;
    const paid_date = (formData.get('paid_date') as string)?.trim() || null;
    const pdf_url = (formData.get('pdf_url') as string)?.trim() || null;

    const amountNum = amountRaw != null && amountRaw !== '' ? parseFloat(amountRaw) : NaN;
    if (isNaN(amountNum) || amountNum < 0) {
        throw new Error('Please enter a valid amount.');
    }

    if (!project_id) throw new Error('Please select a project.');
    if (!client_id) throw new Error('Please select a client.');
    if (!code) throw new Error('Please enter an invoice code.');
    if (!due_date) throw new Error('Please enter a due date.');
    if (!issue_date) throw new Error('Please enter an issue date.');

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('Unauthorized.');

    const { error } = await supabase
        .from('invoices')
        .update({
            project_id,
            client_id,
            code,
            amount: amountNum,
            status,
            due_date,
            issue_date,
            paid_date: paid_date || null,
            pdf_url: pdf_url || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.user.id);

    if (error) throw error;
    revalidatePath('/invoices');
    redirect('/invoices');
}

export async function deleteInvoice(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/invoices');
    redirect('/invoices');
}
