"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { DialogDescription } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { handleCreateClient } from "@/lib/actions/clients";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { ClientStatus } from "@/types";

export function CreateClientDialog() {
    const [status, setStatus] = useState<ClientStatus>('lead');
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="lg" variant="default" >
                    <PlusIcon className="size-3 mb-0.5" />
                    New Client
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form action={handleCreateClient}>
                    <DialogHeader>
                        <DialogTitle>New Client</DialogTitle>
                        <DialogDescription>Create a new client to get started.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="my-4">
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input id="name" name="name" placeholder="Enter the client name" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="company">Company</FieldLabel>
                            <Input id="company" name="company" placeholder="Enter the client company" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input type="email" id="email" name="email" placeholder="Enter the client email" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="status">Status</FieldLabel>
                            <Select name="status" value="lead" onValueChange={(value: string) => setStatus(value as ClientStatus)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the client status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
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
                            Create Client
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}