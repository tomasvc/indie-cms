"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Client, Project } from "@/types";
import { createInvoice, updateInvoice } from "@/lib/actions/invoices";
import type { InvoiceWithLineItems } from "@/lib/data/invoices";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import {
    INVOICE_CURRENCIES,
    LINE_ITEM_UNITS,
    calculateInvoiceTotals,
    invoiceCreateSchema,
    type InvoiceFormValues,
    type LineItemValues,
} from "@/lib/schemas/invoice";
import { PlusIcon, XIcon, InfoIcon, CheckIcon } from "lucide-react";
import { formatMoney } from "@/lib/helpers/format";
import { cn } from "@/lib/utils";

const FORM_ID = "invoice-form";

const STATUS_OPTIONS: { value: InvoiceFormValues["status"]; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "void", label: "Void" },
];

const CURRENCY_SYMBOLS: Record<InvoiceFormValues["currency"], string> = { USD: "$", GBP: "£", EUR: "€" };

const newLineItem = (): LineItemValues => ({ description: "", quantity: 1, unit: "hrs", unitPrice: 0 });

const oneOf = <T extends string>(options: readonly T[], value: string | undefined, fallback: T): T =>
    options.includes(value as T) ? (value as T) : fallback;

function toFormValues(invoice: InvoiceWithLineItems): InvoiceFormValues {
    return {
        projectId: invoice.project_id,
        clientId: invoice.client_id,
        status: invoice.status === "paid" ? "sent" : invoice.status,
        code: invoice.code,
        issueDate: invoice.issue_date?.slice(0, 10) ?? "",
        dueDate: invoice.due_date?.slice(0, 10) ?? "",
        currency: oneOf(INVOICE_CURRENCIES, invoice.currency, "USD"),
        notes: invoice.notes ?? "",
        discountValue: Number(invoice.discount_value ?? 0),
        discountType: invoice.discount_type ?? "flat",
        lineItems: invoice.items.length
            ? invoice.items.map((item) => ({
                description: item.description ?? "",
                quantity: Number(item.quantity),
                unit: oneOf(LINE_ITEM_UNITS, item.unit, "flat"),
                unitPrice: Number(item.unit_price),
            }))
            : [newLineItem()],
    };
}

const DEFAULT_VALUES: InvoiceFormValues = {
    projectId: "",
    clientId: "",
    status: "draft",
    code: "",
    issueDate: "",
    dueDate: "",
    currency: "USD",
    notes: "",
    discountValue: 0,
    discountType: "percent",
    lineItems: [newLineItem()],
};

export function InvoiceFormPage({
    projects,
    clients,
    invoice,
    defaultCode = "",
}: {
    projects: Project[];
    clients: Client[];
    invoice?: InvoiceWithLineItems;
    defaultCode?: string;
}) {
    const isEdit = !!invoice;
    const [isPending, startTransition] = useTransition();
    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceCreateSchema),
        defaultValues: invoice ? toFormValues(invoice) : { ...DEFAULT_VALUES, code: defaultCode },
    });
    const { register, control, formState: { errors } } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });

    const [status, currency, dueDate, lineItems, discountValue, discountType] = useWatch({
        control,
        name: ["status", "currency", "dueDate", "lineItems", "discountValue", "discountType"],
    });
    const { lineTotals, subtotal, total } = calculateInvoiceTotals(lineItems, discountValue, discountType);

    const onSubmit = form.handleSubmit((values) =>
        startTransition(async () => {
            const result = invoice ? await updateInvoice(invoice.id, values) : await createInvoice(values);
            applyServerErrors(form.setError, result);
        })
    );

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Typography variant="pageTitle" as="h1">
                                {isEdit ? `Edit INV-${invoice.code}` : "New Invoice"}
                            </Typography>
                            <Badge variant="outline" className="capitalize text-xs">
                                {status}
                            </Badge>
                        </div>
                        <Typography variant="subtitle" className="text-muted-foreground mt-0.5">
                            {isEdit
                                ? "Update line items and payment terms. Totals are recalculated when you save."
                                : "Add line items, set payment terms, and send to your client."}
                        </Typography>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/invoices">
                            <XIcon className="size-3.5" />
                            Cancel
                        </Link>
                    </Button>
                    <Button size="lg" type="submit" form={FORM_ID} disabled={isPending}>
                        {isEdit ? <CheckIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
                        {isEdit
                            ? isPending ? "Saving…" : "Save Changes"
                            : isPending ? "Creating…" : "Create Invoice"}
                    </Button>
                </div>
            </div>

            <form id={FORM_ID} onSubmit={onSubmit} noValidate>
                {/* Header fields card */}
                <Card className="mb-4">
                    <CardContent className="p-5">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <Controller
                                control={control}
                                name="projectId"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="invoice-project">PROJECT</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="invoice-project" aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="clientId"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="invoice-client">CLIENT</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="invoice-client" aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="status"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="invoice-status">STATUS</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="invoice-status" aria-invalid={fieldState.invalid}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.filter((opt) => isEdit || opt.value !== "void").map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Field data-invalid={!!errors.code}>
                                <FieldLabel htmlFor="invoice-code">REFERENCE NUMBER</FieldLabel>
                                <div
                                    className={cn(
                                        "flex items-center border border-input rounded-md bg-input/20 overflow-hidden",
                                        errors.code && "border-destructive"
                                    )}
                                >
                                    <span className="text-muted-foreground pl-3 text-sm shrink-0">INV-</span>
                                    <Input
                                        id="invoice-code"
                                        {...register("code")}
                                        aria-invalid={!!errors.code}
                                        placeholder="0042"
                                        className="border-0 rounded-none flex-1 pl-1"
                                    />
                                </div>
                                <FieldError errors={[errors.code]} />
                            </Field>
                            <Field data-invalid={!!errors.issueDate}>
                                <FieldLabel htmlFor="invoice-issue-date">ISSUE DATE</FieldLabel>
                                <Input
                                    id="invoice-issue-date"
                                    type="date"
                                    {...register("issueDate", { deps: ["dueDate"] })}
                                    aria-invalid={!!errors.issueDate}
                                />
                                <FieldError errors={[errors.issueDate]} />
                            </Field>
                            <Field data-invalid={!!errors.dueDate}>
                                <FieldLabel htmlFor="invoice-due-date">DUE DATE</FieldLabel>
                                <Input
                                    id="invoice-due-date"
                                    type="date"
                                    {...register("dueDate")}
                                    aria-invalid={!!errors.dueDate}
                                />
                                <FieldError errors={[errors.dueDate]} />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Line items card */}
                <Card className="mb-4">
                    <CardContent className="p-5">
                        <div className="mb-3">
                            <Typography variant="label" className="font-semibold text-sm">
                                Line Items
                            </Typography>
                            <p className="text-muted-foreground text-xs mt-0.5">
                                Break down your work into billable components
                            </p>
                        </div>

                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_80px_110px_120px_100px_32px] gap-2 mb-2 px-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">QTY</span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit</span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rate</span>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">Total</span>
                            <span />
                        </div>

                        {/* Line item rows */}
                        <div className="flex flex-col gap-2">
                            {fields.map((item, index) => {
                                const itemErrors = errors.lineItems?.[index];
                                return (
                                    <div key={item.id} className="flex flex-col gap-1">
                                        <div className="grid grid-cols-[1fr_80px_110px_120px_100px_32px] gap-2 items-center">
                                            <Input
                                                {...register(`lineItems.${index}.description`)}
                                                aria-label={`Line item ${index + 1} description`}
                                                aria-invalid={!!itemErrors?.description}
                                                placeholder="e.g. Brand strategy & positioning"
                                            />
                                            <Input
                                                type="number"
                                                min={0}
                                                step="any"
                                                {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                                                aria-label={`Line item ${index + 1} quantity`}
                                                aria-invalid={!!itemErrors?.quantity}
                                                className="text-center"
                                            />
                                            <Controller
                                                control={control}
                                                name={`lineItems.${index}.unit`}
                                                render={({ field }) => (
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger aria-label={`Line item ${index + 1} unit`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {LINE_ITEM_UNITS.map((u) => (
                                                                <SelectItem key={u} value={u}>
                                                                    {u}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            <div
                                                className={cn(
                                                    "flex items-center border border-input rounded-md bg-input/20 overflow-hidden",
                                                    itemErrors?.unitPrice && "border-destructive"
                                                )}
                                            >
                                                <span className="text-muted-foreground pl-2.5 text-sm shrink-0">
                                                    {CURRENCY_SYMBOLS[currency]}
                                                </span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="any"
                                                    {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                                                    aria-label={`Line item ${index + 1} rate`}
                                                    aria-invalid={!!itemErrors?.unitPrice}
                                                    className="border-0 rounded-none flex-1 pl-1"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="text-right font-medium text-sm pr-1">
                                                {formatMoney(lineTotals[index] ?? 0, currency)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="flex items-center justify-center size-8 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                aria-label="Remove line item"
                                            >
                                                <XIcon className="size-3.5" />
                                            </button>
                                        </div>
                                        <FieldError
                                            className="px-1"
                                            errors={[itemErrors?.description, itemErrors?.quantity, itemErrors?.unit, itemErrors?.unitPrice].filter(Boolean)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <FieldError className="mt-2 px-1" errors={[{ message: errors.lineItems?.root?.message ?? errors.lineItems?.message }]} />

                        {/* Add line item */}
                        <button
                            type="button"
                            onClick={() => append(newLineItem())}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/30 transition-colors"
                        >
                            <PlusIcon className="size-3.5" />
                            Add line item
                        </button>
                    </CardContent>
                </Card>

                {/* Notes + Summary */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Notes */}
                    <Card>
                        <CardContent className="p-5">
                            <FieldGroup>
                                <Field data-invalid={!!errors.notes}>
                                    <FieldLabel htmlFor="invoice-notes">NOTES TO CLIENT</FieldLabel>
                                    <Textarea
                                        id="invoice-notes"
                                        {...register("notes")}
                                        aria-invalid={!!errors.notes}
                                        placeholder="e.g. Payment due within 30 days. Bank transfer preferred."
                                        className="min-h-[120px] resize-none"
                                    />
                                    <FieldError errors={[errors.notes]} />
                                </Field>
                                <Controller
                                    control={control}
                                    name="currency"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="invoice-currency">CURRENCY</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id="invoice-currency">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {INVOICE_CURRENCIES.map((c) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card>
                        <CardContent className="p-5">
                            <Typography variant="label" className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4 block">
                                Summary
                            </Typography>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatMoney(subtotal, currency)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Discount</span>
                                        <div className="flex items-center gap-1.5">
                                            <Input
                                                type="number"
                                                min={0}
                                                step="any"
                                                {...register("discountValue", { valueAsNumber: true })}
                                                aria-label="Discount"
                                                aria-invalid={!!errors.discountValue}
                                                className="h-7 w-16 text-right text-sm"
                                                placeholder="0"
                                            />
                                            <Controller
                                                control={control}
                                                name="discountType"
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            if (form.formState.isSubmitted) form.trigger("discountValue");
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-7 w-16 text-sm" aria-label="Discount type">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="percent">%</SelectItem>
                                                            <SelectItem value="flat">flat</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <FieldError className="text-right" errors={[errors.discountValue]} />
                                </div>
                                <div className="border-t border-border pt-3 flex items-center justify-between">
                                    <span className="font-semibold text-base">Total</span>
                                    <span className="font-bold text-xl text-primary font-serif">
                                        {formatMoney(total, currency)}
                                    </span>
                                </div>
                                {dueDate && (
                                    <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                                        <InfoIcon className="size-3.5 shrink-0" />
                                        <span>
                                            Due{" "}
                                            {new Date(dueDate + "T00:00:00").toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                )}
                                <FieldError errors={[errors.root?.server]} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
