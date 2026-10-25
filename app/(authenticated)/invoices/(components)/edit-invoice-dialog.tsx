"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Client, Invoice, Project } from "@/types";
import { updateInvoice } from "@/lib/actions/invoices";
import { useFormAction } from "@/hooks/use-form-action";
import { PencilIcon, XIcon } from "lucide-react";

export function EditInvoiceDialog({
    invoice,
    projects,
    clients,
    open,
    onOpenChange,
}: {
    invoice: Invoice;
    projects: Project[];
    clients: Client[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { state, isPending, onSubmit, errors } = useFormAction(updateInvoice, {
        onSuccess: () => onOpenChange(false),
    });

    const code = invoice.code ?? "";
    const amount = invoice.total ?? "";
    const dueDate = invoice.due_date?.slice(0, 10) ?? "";
    const issueDate = invoice.issue_date?.slice(0, 10) ?? "";
    const paidDate = invoice.paid_date?.slice(0, 10) ?? "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit} noValidate>
                    <input type="hidden" name="id" value={invoice.id} />
                    <DialogHeader>
                        <DialogTitle>Edit Invoice</DialogTitle>
                        <DialogDescription>
                            Update invoice INV-{code || "—"}.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="my-4">
                        <Field data-invalid={!!errors("project_id")}>
                            <FieldLabel htmlFor="edit-project">Project</FieldLabel>
                            <Select name="project_id" defaultValue={invoice.project_id}>
                                <SelectTrigger id="edit-project" aria-invalid={!!errors("project_id")}>
                                    <SelectValue placeholder="Select the project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError errors={errors("project_id")} />
                        </Field>
                        <Field data-invalid={!!errors("client_id")}>
                            <FieldLabel htmlFor="edit-client">Client</FieldLabel>
                            <Select name="client_id" defaultValue={invoice.client_id}>
                                <SelectTrigger id="edit-client" aria-invalid={!!errors("client_id")}>
                                    <SelectValue placeholder="Select the client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError errors={errors("client_id")} />
                        </Field>
                        <Field data-invalid={!!errors("status")}>
                            <FieldLabel htmlFor="edit-status">Status</FieldLabel>
                            <Select name="status" defaultValue={invoice.status}>
                                <SelectTrigger id="edit-status" aria-invalid={!!errors("status")}>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="void">Void</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError errors={errors("status")} />
                        </Field>
                        <div className="grid grid-cols-2 gap-2">
                            <Field data-invalid={!!errors("code")}>
                                <FieldLabel htmlFor="edit-code">Reference Number</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="edit-code"
                                        name="code"
                                        placeholder="Ref. number"
                                        type="text"
                                        maxLength={10}
                                        required
                                        defaultValue={code}
                                        aria-invalid={!!errors("code")}
                                    />
                                    <InputGroupAddon>
                                        <span>INV-</span>
                                    </InputGroupAddon>
                                </InputGroup>
                                <FieldError errors={errors("code")} />
                            </Field>
                            <Field data-invalid={!!errors("amount")}>
                                <FieldLabel htmlFor="edit-amount">Amount</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="edit-amount"
                                        name="amount"
                                        placeholder="Amount"
                                        type="number"
                                        required
                                        min={0}
                                        step="any"
                                        defaultValue={amount}
                                        aria-invalid={!!errors("amount")}
                                    />
                                    <InputGroupAddon>
                                        <span>$</span>
                                    </InputGroupAddon>
                                </InputGroup>
                                <FieldError errors={errors("amount")} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Field data-invalid={!!errors("due_date")}>
                                <FieldLabel htmlFor="edit-due_date">Due Date</FieldLabel>
                                <Input
                                    id="edit-due_date"
                                    name="due_date"
                                    type="date"
                                    required
                                    defaultValue={dueDate}
                                    aria-invalid={!!errors("due_date")}
                                />
                                <FieldError errors={errors("due_date")} />
                            </Field>
                            <Field data-invalid={!!errors("issue_date")}>
                                <FieldLabel htmlFor="edit-issue_date">Issue Date</FieldLabel>
                                <Input
                                    id="edit-issue_date"
                                    name="issue_date"
                                    type="date"
                                    required
                                    defaultValue={issueDate}
                                    aria-invalid={!!errors("issue_date")}
                                />
                                <FieldError errors={errors("issue_date")} />
                            </Field>
                        </div>
                        <Field data-invalid={!!errors("paid_date")}>
                            <FieldLabel htmlFor="edit-paid_date">Paid Date</FieldLabel>
                            <Input
                                id="edit-paid_date"
                                name="paid_date"
                                type="date"
                                defaultValue={paidDate}
                                aria-invalid={!!errors("paid_date")}
                            />
                            <FieldError errors={errors("paid_date")} />
                        </Field>
                        <Field data-invalid={!!errors("pdf_url")}>
                            <FieldLabel htmlFor="edit-pdf_url">PDF URL</FieldLabel>
                            <Input
                                id="edit-pdf_url"
                                name="pdf_url"
                                type="url"
                                placeholder="https://..."
                                defaultValue={invoice.pdf_url ?? ""}
                                aria-invalid={!!errors("pdf_url")}
                            />
                            <FieldError errors={errors("pdf_url")} />
                        </Field>
                        {state.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
                    </FieldGroup>
                    <DialogFooter>
                        <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            <XIcon className="size-3 mb-0.5" />
                            Cancel
                        </Button>
                        <Button type="submit" size="lg" variant="default" disabled={isPending}>
                            <PencilIcon className="size-3 mb-0.5" />
                            {isPending ? "Saving…" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
