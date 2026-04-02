"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import { Client, InvoiceStatus, Project } from "@/types";
import { createInvoice } from "@/lib/actions/invoices";
import { PlusIcon, XIcon, InfoIcon } from "lucide-react";
import { formatMoney } from "@/lib/helpers/format";

interface LineItemDraft {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total: number;
}

const UNIT_OPTIONS = ["hrs", "days", "flat", "items", "words", "pages"];

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "void", label: "Void" },
];

const CURRENCIES = ["USD", "GBP", "EUR"];

function newLineItem(): LineItemDraft {
    return {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit: "hrs",
        unit_price: 0,
        total: 0,
    };
}

export function CreateInvoicePage({
    projects,
    clients,
}: {
    projects: Project[];
    clients: Client[];
}) {
    const [status, setStatus] = useState<InvoiceStatus>("draft");
    const [projectId, setProjectId] = useState("");
    const [clientId, setClientId] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [lineItems, setLineItems] = useState<LineItemDraft[]>([newLineItem()]);
    const [discountValue, setDiscountValue] = useState(0);
    const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
    const [notes, setNotes] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount =
        discountType === "percent"
            ? subtotal * (discountValue / 100)
            : discountValue;
    const total = Math.max(0, subtotal - discountAmount);

    function updateLineItem(id: string, field: keyof LineItemDraft, value: string | number) {
        setLineItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const updated = { ...item, [field]: value };
                updated.total = updated.quantity * updated.unit_price;
                return updated;
            })
        );
    }

    function removeLineItem(id: string) {
        setLineItems((prev) => prev.filter((item) => item.id !== id));
    }

    async function onSubmit(formData: FormData) {
        setIsSubmitting(true);
        formData.set("project_id", projectId);
        formData.set("client_id", clientId);
        formData.set("status", status);
        formData.set("currency", currency);
        formData.set("notes", notes);
        formData.set("discount_amount", String(discountValue));
        formData.set("discount_type", discountType);
        formData.set(
            "line_items",
            JSON.stringify(
                lineItems.map(({ description, quantity, unit, unit_price, total }) => ({
                    description,
                    quantity,
                    unit,
                    unit_price,
                    total,
                }))
            )
        );
        try {
            await createInvoice(formData);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Typography variant="pageTitle" as="h1">
                                New Invoice
                            </Typography>
                            <Badge variant="outline" className="capitalize text-xs">
                                {status}
                            </Badge>
                        </div>
                        <Typography variant="subtitle" className="text-muted-foreground mt-0.5">
                            Add line items, set payment terms, and send to your client.
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
                    <Button
                        size="lg"
                        disabled={isSubmitting}
                        onClick={() => {
                            const form = document.getElementById("create-invoice-form") as HTMLFormElement;
                            if (form) form.requestSubmit();
                        }}
                    >
                        <PlusIcon className="size-3.5" />
                        Create Invoice
                    </Button>
                </div>
            </div>

            <form id="create-invoice-form" action={onSubmit}>
                {/* Header fields card */}
                <Card className="mb-4">
                    <CardContent className="p-5">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <Field>
                                <FieldLabel>PROJECT</FieldLabel>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger>
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
                            </Field>
                            <Field>
                                <FieldLabel>CLIENT</FieldLabel>
                                <Select value={clientId} onValueChange={setClientId}>
                                    <SelectTrigger>
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
                            </Field>
                            <Field>
                                <FieldLabel>STATUS</FieldLabel>
                                <Select
                                    value={status}
                                    onValueChange={(v) => setStatus(v as InvoiceStatus)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Field>
                                <FieldLabel>REFERENCE NUMBER</FieldLabel>
                                <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                                    <span className="text-muted-foreground pl-3 text-sm shrink-0">INV-</span>
                                    <Input
                                        name="code"
                                        placeholder="0042"
                                        className="border-0 rounded-none flex-1 pl-1"
                                        required
                                    />
                                </div>
                            </Field>
                            <Field>
                                <FieldLabel>ISSUE DATE</FieldLabel>
                                <Input name="issue_date" type="date" required />
                            </Field>
                            <Field>
                                <FieldLabel>DUE DATE</FieldLabel>
                                <Input
                                    name="due_date"
                                    type="date"
                                    required
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
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
                            {lineItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[1fr_80px_110px_120px_100px_32px] gap-2 items-center"
                                >
                                    <Input
                                        value={item.description}
                                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                                        placeholder="e.g. Brand strategy & positioning"
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={item.quantity}
                                        onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                                        className="text-center"
                                    />
                                    <Select
                                        value={item.unit}
                                        onValueChange={(v) => updateLineItem(item.id, "unit", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {UNIT_OPTIONS.map((u) => (
                                                <SelectItem key={u} value={u}>
                                                    {u}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                                        <span className="text-muted-foreground pl-2.5 text-sm shrink-0">
                                            {currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$"}
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={item.unit_price || ""}
                                            onChange={(e) => updateLineItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                                            className="border-0 rounded-none flex-1 pl-1"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="text-right font-medium text-sm pr-1">
                                        {formatMoney(item.total, currency)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeLineItem(item.id)}
                                        className="flex items-center justify-center size-8 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label="Remove line item"
                                    >
                                        <XIcon className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add line item */}
                        <button
                            type="button"
                            onClick={() => setLineItems((prev) => [...prev, newLineItem()])}
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
                                <Field>
                                    <FieldLabel>NOTES TO CLIENT</FieldLabel>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g. Payment due within 30 days. Bank transfer preferred."
                                        className="min-h-[120px] resize-none"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>CURRENCY</FieldLabel>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
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
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <div className="flex items-center gap-1.5">
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={discountValue || ""}
                                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                            className="h-7 w-16 text-right text-sm"
                                            placeholder="0"
                                        />
                                        <Select
                                            value={discountType}
                                            onValueChange={(v) => setDiscountType(v as "percent" | "flat")}
                                        >
                                            <SelectTrigger className="h-7 w-16 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percent">%</SelectItem>
                                                <SelectItem value="flat">flat</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
