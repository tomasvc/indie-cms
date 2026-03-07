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

export async function createInvoice(formData: FormData) {
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

    const { error } = await supabase.from('invoices').insert({
        id: crypto.randomUUID(),
        user_id: user?.user?.id,
        project_id,
        client_id,
        code,
        amount: amountNum,
        status,
        due_date,
        issue_date,
        paid_date: paid_date || null,
        pdf_url: pdf_url || null,
    });

    if (error) throw error;
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