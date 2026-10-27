"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormAction } from "@/hooks/use-form-action";
import { handleUpdateClient } from "@/lib/actions/clients";
import type { Client } from "@/types";

const TEXT_FIELDS = [
    { name: "name", label: "Contact name", type: "text" },
    { name: "company", label: "Company (optional)", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "website", label: "Website", type: "url", placeholder: "https://" },
    { name: "country", label: "Country", type: "text" },
    { name: "vat_number", label: "VAT number", type: "text" },
    { name: "last_contact", label: "Last contact", type: "date" },
] as const;

export function EditClientDialog({ client }: { client: Client }) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PencilIcon aria-hidden />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                {open && <EditClientForm client={client} onSaved={() => setOpen(false)} />}
            </DialogContent>
        </Dialog>
    );
}

function EditClientForm({ client, onSaved }: { client: Client; onSaved: () => void }) {
    const { state, isPending, onSubmit, errors } = useFormAction(handleUpdateClient, { onSuccess: onSaved });
    const value = (name: (typeof TEXT_FIELDS)[number]["name"]) => {
        const raw = client[name as keyof Client];
        if (!raw) return "";
        return name === "last_contact" ? String(raw).slice(0, 10) : String(raw);
    };

    return (
        <form onSubmit={onSubmit} noValidate>
            <input type="hidden" name="id" value={client.id} />
            <DialogHeader>
                <DialogTitle>Edit client</DialogTitle>
                <DialogDescription>Contact details here appear on your invoices to this client.</DialogDescription>
            </DialogHeader>
            <FieldGroup className="my-4 grid gap-4 sm:grid-cols-2">
                {TEXT_FIELDS.map((field) => (
                    <Field key={field.name} data-invalid={!!errors(field.name)}>
                        <FieldLabel htmlFor={`client-${field.name}`}>{field.label}</FieldLabel>
                        <Input
                            id={`client-${field.name}`}
                            name={field.name}
                            type={field.type}
                            defaultValue={value(field.name)}
                            placeholder={"placeholder" in field ? field.placeholder : undefined}
                            aria-invalid={!!errors(field.name)}
                        />
                        <FieldError errors={errors(field.name)} />
                    </Field>
                ))}
                <Field className="sm:col-span-2" data-invalid={!!errors("address")}>
                    <FieldLabel htmlFor="client-address">Billing address</FieldLabel>
                    <Textarea id="client-address" name="address" rows={3} defaultValue={client.address ?? ""} aria-invalid={!!errors("address")} />
                    <FieldError errors={errors("address")} />
                </Field>
                <Field className="sm:col-span-2" data-invalid={!!errors("status")}>
                    <FieldLabel htmlFor="client-status">Status</FieldLabel>
                    <Select name="status" defaultValue={client.status}>
                        <SelectTrigger id="client-status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError errors={errors("status")} />
                </Field>
                {state.error && !state.fieldErrors && <FieldError className="sm:col-span-2">{state.error}</FieldError>}
            </FieldGroup>
            <DialogFooter>
                <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save client"}</Button>
            </DialogFooter>
        </form>
    );
}
