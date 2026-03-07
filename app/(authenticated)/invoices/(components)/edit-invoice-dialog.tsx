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
import { Client, Invoice, InvoiceStatus, Project } from "@/types";
import { updateInvoice } from "@/lib/actions/invoices";
import { PencilIcon, XIcon } from "lucide-react";
import { useState } from "react";

type InvoiceWithCode = Invoice & { code?: string; number?: string };
type InvoiceWithTotal = Invoice & { total?: number; amount?: number };

function getInvoiceNumber(inv: InvoiceWithCode): string {
    if (inv.code != null && inv.code !== "") return String(inv.code);
    if ((inv as Record<string, unknown>).number != null) return String((inv as Record<string, unknown>).number);
    return "";
}

function getInvoiceAmount(inv: InvoiceWithTotal): number | "" {
    if (typeof inv.total === "number") return inv.total;
    if (typeof (inv as Record<string, unknown>).amount === "number") return (inv as Record<string, unknown>).amount as number;
    return "";
}

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
    const [projectId, setProjectId] = useState(invoice.project_id);
    const [clientId, setClientId] = useState(invoice.client_id);
    const [status, setStatus] = useState<InvoiceStatus>(invoice.status);

    const number = getInvoiceNumber(invoice as InvoiceWithCode);
    const amount = getInvoiceAmount(invoice as InvoiceWithTotal);
    const dueDate = invoice.due_date?.slice(0, 10) ?? "";
    const issueDate = invoice.issue_date?.slice(0, 10) ?? "";
    const paidDate = invoice.paid_date?.slice(0, 10) ?? "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form
                    action={updateInvoice}
                    onSubmit={() => {
                        onOpenChange(false);
                    }}
                >
                    <input type="hidden" name="id" value={invoice.id} />
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="client_id" value={clientId} />
                    <input type="hidden" name="status" value={status} />
                    <DialogHeader>
                        <DialogTitle>Edit Invoice</DialogTitle>
                        <DialogDescription>
                            Update invoice INV-{number || "—"}.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="my-4">
                        <Field>
                            <FieldLabel>Project</FieldLabel>
                            <Select
                                name="project_id"
                                value={projectId}
                                onValueChange={setProjectId}
                            >
                                <SelectTrigger>
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
                        </Field>
                        <Field>
                            <FieldLabel>Client</FieldLabel>
                            <Select
                                name="client_id"
                                value={clientId}
                                onValueChange={setClientId}
                            >
                                <SelectTrigger>
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
                        </Field>
                        <Field>
                            <FieldLabel>Status</FieldLabel>
                            <Select
                                name="status"
                                value={status}
                                onValueChange={(v) => setStatus(v as InvoiceStatus)}
                            >
                                <SelectTrigger>
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
                        </Field>
                        <div className="grid grid-cols-2 gap-2">
                            <Field>
                                <FieldLabel htmlFor="edit-number">Reference Number</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="edit-number"
                                        name="number"
                                        placeholder="Ref. number"
                                        type="text"
                                        maxLength={10}
                                        required
                                        defaultValue={number}
                                    />
                                    <InputGroupAddon>
                                        <span>INV-</span>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Field>
                            <Field>
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
                                    />
                                    <InputGroupAddon>
                                        <span>$</span>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Field>
                                <FieldLabel htmlFor="edit-due_date">Due Date</FieldLabel>
                                <Input
                                    id="edit-due_date"
                                    name="due_date"
                                    type="date"
                                    required
                                    defaultValue={dueDate}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="edit-issue_date">Issue Date</FieldLabel>
                                <Input
                                    id="edit-issue_date"
                                    name="issue_date"
                                    type="date"
                                    required
                                    defaultValue={issueDate}
                                />
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="edit-paid_date">Paid Date</FieldLabel>
                            <Input
                                id="edit-paid_date"
                                name="paid_date"
                                type="date"
                                defaultValue={paidDate}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-pdf_url">PDF URL</FieldLabel>
                            <Input
                                id="edit-pdf_url"
                                name="pdf_url"
                                type="url"
                                placeholder="https://..."
                                defaultValue={invoice.pdf_url ?? ""}
                            />
                        </Field>
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
                        <Button type="submit" size="lg" variant="default">
                            <PencilIcon className="size-3 mb-0.5" />
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
