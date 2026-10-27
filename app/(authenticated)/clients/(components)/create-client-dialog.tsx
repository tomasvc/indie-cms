"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { DialogDescription } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { handleCreateClient } from "@/lib/actions/clients";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { useFormAction } from "@/hooks/use-form-action";

export function CreateClientDialog() {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" >
                    <PlusIcon aria-hidden />
                    New Client
                </Button>
            </DialogTrigger>
            <DialogContent>
                <CreateClientForm onCreated={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

function CreateClientForm({ onCreated }: { onCreated: () => void }) {
    const { state, isPending, onSubmit, errors } = useFormAction(handleCreateClient, { onSuccess: onCreated });

    return (
        <form onSubmit={onSubmit} noValidate>
            <DialogHeader>
                <DialogTitle>New Client</DialogTitle>
                <DialogDescription>Add who you work with. You can link projects and invoices to them afterwards.</DialogDescription>
            </DialogHeader>
            <FieldGroup className="my-4">
                <Field data-invalid={!!errors("name")}>
                    <FieldLabel htmlFor="name">Contact name</FieldLabel>
                    <Input id="name" name="name" placeholder="The person you work with, e.g. Maya Chen" required aria-invalid={!!errors("name")} />
                    <FieldError errors={errors("name")} />
                </Field>
                <Field data-invalid={!!errors("company")}>
                    <FieldLabel htmlFor="company">Company (optional)</FieldLabel>
                    <Input id="company" name="company" placeholder="Their business, e.g. Helio Labs" aria-invalid={!!errors("company")} />
                    <FieldError errors={errors("company")} />
                </Field>
                <Field data-invalid={!!errors("email")}>
                    <FieldLabel htmlFor="email">Email (optional)</FieldLabel>
                    <Input type="email" id="email" name="email" placeholder="maya@example.com" aria-invalid={!!errors("email")} />
                    <FieldError errors={errors("email")} />
                </Field>
                <Field data-invalid={!!errors("status")}>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select name="status" defaultValue="lead">
                        <SelectTrigger id="status" aria-invalid={!!errors("status")}>
                            <SelectValue placeholder="Select the client status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError errors={errors("status")} />
                </Field>
                {state.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
            </FieldGroup>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" >
                        <XIcon aria-hidden />
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" variant="default" disabled={isPending}>
                    <PlusIcon aria-hidden />
                    {isPending ? "Creating…" : "Create Client"}
                </Button>
            </DialogFooter>
        </form>
    )
}
