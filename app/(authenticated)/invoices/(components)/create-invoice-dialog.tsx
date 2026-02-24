"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { DialogDescription } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Client, InvoiceStatus, Project } from "@/types";
import { createInvoice } from "@/lib/actions/invoices";

export function CreateInvoiceDialog({ projects, clients }: { projects: Project[], clients: Client[] }) {
    const [status, setStatus] = useState<InvoiceStatus>('draft');
    const [project_id, setProjectId] = useState<string>('');
    const [client_id, setClientId] = useState<string>('');
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="lg" variant="default" >
                    <PlusIcon className="size-3 mb-0.5" />
                    New Invoice
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form action={createInvoice}>
                    <input type="hidden" name="project_id" value={project_id} />
                    <input type="hidden" name="client_id" value={client_id} />
                    <input type="hidden" name="status" value={status} />
                    <DialogHeader>
                        <DialogTitle>New Invoice</DialogTitle>
                        <DialogDescription>Create a new invoice to get started.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="my-4">
                        <Field>
                            <FieldLabel htmlFor="project_id">Project</FieldLabel>
                            <Select name="project_id" value={project_id} onValueChange={(value: string) => setProjectId(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project: Project) => (
                                        <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="client_id">Client</FieldLabel>
                            <Select name="client_id" value={client_id} onValueChange={(value: string) => setClientId(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client: Client) => (
                                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="number">Number</FieldLabel>
                            <Input id="number" name="number" placeholder="Enter the invoice number" type="text" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="amount">Amount</FieldLabel>
                            <Input id="amount" name="amount" placeholder="Enter the invoice amount" type="number" required min={0} step="any" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                            <Input id="due_date" name="due_date" placeholder="Enter the invoice due date" type="date" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="issue_date">Issue Date</FieldLabel>
                            <Input id="issue_date" name="issue_date" placeholder="Enter the invoice issue date" type="date" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="paid_date">Paid Date</FieldLabel>
                            <Input id="paid_date" name="paid_date" placeholder="Enter the invoice paid date" type="date" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="pdf_url">PDF URL</FieldLabel>
                            <Input id="pdf_url" name="pdf_url" placeholder="Enter the invoice PDF URL" type="url" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="status">Status</FieldLabel>
                            <Select name="status" value={status} onValueChange={(value: string) => setStatus(value as InvoiceStatus)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the invoice status" />
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
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button size="lg" variant="outline" >
                                <XIcon className="size-3 mb-0.5" />
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" size="lg" variant="default" >
                            <PlusIcon className="size-3 mb-0.5" />
                            Create Invoice
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}