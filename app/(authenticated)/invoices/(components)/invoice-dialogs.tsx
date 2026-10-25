"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormAction } from "@/hooks/use-form-action";
import { deleteInvoice, markInvoicePaid, markInvoiceUnpaid } from "@/lib/actions/invoices";
import type { ActionState } from "@/lib/forms/action-state";
import { formatMoney } from "@/lib/helpers/format";
import { PAYMENT_METHODS } from "@/lib/schemas/invoice";
import type { Invoice } from "@/types";

const PAYMENT_METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
    bank_transfer: "Bank transfer",
    stripe: "Stripe",
    paypal: "PayPal",
    cash: "Cash",
    other: "Other",
};

type DialogProps = {
    invoice: Invoice;
    onOpenChange: (open: boolean) => void;
};

export function MarkPaidDialog({ invoice, onOpenChange }: DialogProps) {
    const { state, isPending, onSubmit, errors } = useFormAction(markInvoicePaid, {
        onSuccess: () => onOpenChange(false),
    });

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit} noValidate>
                    <input type="hidden" name="id" value={invoice.id} />
                    <DialogHeader>
                        <DialogTitle>Record payment</DialogTitle>
                        <DialogDescription>
                            Mark INV-{invoice.code} ({formatMoney(invoice.total, invoice.currency)}) as paid.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="my-4">
                        <Field data-invalid={!!errors("paid_date")}>
                            <FieldLabel htmlFor="paid-date">Paid date</FieldLabel>
                            <Input
                                id="paid-date"
                                name="paid_date"
                                type="date"
                                defaultValue={format(new Date(), "yyyy-MM-dd")}
                                aria-invalid={!!errors("paid_date")}
                            />
                            <FieldError errors={errors("paid_date")} />
                        </Field>
                        <Field data-invalid={!!errors("payment_method")}>
                            <FieldLabel htmlFor="payment-method">Payment method</FieldLabel>
                            <Select name="payment_method" defaultValue="bank_transfer">
                                <SelectTrigger id="payment-method" aria-invalid={!!errors("payment_method")}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((method) => (
                                        <SelectItem key={method} value={method}>
                                            {PAYMENT_METHOD_LABELS[method]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError errors={errors("payment_method")} />
                        </Field>
                        {state.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
                    </FieldGroup>
                    <DialogFooter>
                        <Button type="button" size="lg" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" size="lg" disabled={isPending}>
                            {isPending ? "Saving…" : "Mark as paid"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ConfirmInvoiceDialog({
    invoice,
    onOpenChange,
    action,
    title,
    description,
    confirmLabel,
    pendingLabel,
    destructive,
}: DialogProps & {
    action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
    title: string;
    description: string;
    confirmLabel: string;
    pendingLabel: string;
    destructive?: boolean;
}) {
    const { state, isPending, onSubmit } = useFormAction(action, { onSuccess: () => onOpenChange(false) });

    return (
        <AlertDialog open onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <form onSubmit={onSubmit}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={isPending}>
                            {isPending ? pendingLabel : confirmLabel}
                        </Button>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function MarkUnpaidDialog(props: DialogProps) {
    return (
        <ConfirmInvoiceDialog
            {...props}
            action={markInvoiceUnpaid}
            title={`Mark INV-${props.invoice.code} as unpaid?`}
            description="The payment date and method will be cleared and the invoice will go back to Sent."
            confirmLabel="Mark as unpaid"
            pendingLabel="Saving…"
        />
    );
}

export function DeleteInvoiceDialog(props: DialogProps) {
    return (
        <ConfirmInvoiceDialog
            {...props}
            action={deleteInvoice}
            title={`Delete INV-${props.invoice.code}?`}
            description="This invoice and its line items will be permanently deleted. This action cannot be undone."
            confirmLabel="Delete"
            pendingLabel="Deleting…"
            destructive
        />
    );
}
