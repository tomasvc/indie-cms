"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";
import { Client } from "@/types";
import { handleCreateProject } from "@/lib/actions/projects";
import { useServerAction } from "@/hooks/use-server-action";
import { clientsQuery } from "@/lib/queries/clients";
import { profileQuery } from "@/lib/queries/account";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { projectFormSchema } from "@/lib/schemas/project";
import { clientLabel, sortClients } from "@/lib/helpers/clients";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCIES, type ProjectFormValues } from "./form";

const DEFAULT_VALUES: ProjectFormValues = {
    title: "",
    description: "",
    category: "",
    color: "#22c55e",
    tags: "",
    status: "active",
    priority: "medium",
    progress: 0,
    currency: "USD",
    billingType: "fixed",
    hourlyRate: 0,
    value: 0,
    budget: 0,
    estimatedHours: 0,
    startDate: "",
    dueDate: "",
    completedDate: "",
    clientId: "",
};

/**
 * Starting a project asks only what you know on day one. Description, budget, estimates, tags
 * and colour can be added from the project's Edit page later.
 */
export function CreateProjectDialog({ trigger, clientId }: {
    /** The button that opens the dialog. */
    trigger: ReactNode;
    /** Pre-selects this client, e.g. when opened from a client page. */
    clientId?: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New project</DialogTitle>
                    <DialogDescription>The essentials only. Everything else can be added later.</DialogDescription>
                </DialogHeader>
                <CreateProjectLoader clientId={clientId} />
            </DialogContent>
        </Dialog>
    );
}

function CreateProjectLoader({ clientId }: { clientId?: string }) {
    const { data: clients } = useQuery(clientsQuery);
    const { data: profile } = useQuery(profileQuery);

    if (!clients || profile === undefined) return <CreateProjectFormFallback />;

    const rate = Number(profile?.hourly_rate);
    return (
        <CreateProjectForm
            clients={clients}
            currency={profile?.currency || "USD"}
            hourlyRate={Number.isFinite(rate) && rate > 0 ? rate : 0}
            clientId={clients.some((c) => c.id === clientId) ? clientId : undefined}
        />
    );
}

function CreateProjectFormFallback() {
    return (
        <div className="flex flex-col gap-5 py-2" aria-busy="true">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full rounded-md" />
                </div>
            ))}
        </div>
    );
}

function CreateProjectForm({ clients, currency, hourlyRate = 0, clientId = "" }: {
    clients: Client[];
    currency: string;
    /** Profile rate, used as the starting point for hourly projects. */
    hourlyRate?: number;
    clientId?: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [createProject] = useServerAction(handleCreateProject);
    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: { ...DEFAULT_VALUES, currency, clientId, hourlyRate, startDate: new Date().toISOString().slice(0, 10) },
    });
    const { register, control, formState: { errors } } = form;
    const [billingType, selectedCurrency] = useWatch({ control, name: ["billingType", "currency"] });

    const submit = form.handleSubmit((values) =>
        startTransition(async () => {
            const result = await createProject(values);
            applyServerErrors(form.setError, result);
        })
    );

    return (
        <form onSubmit={submit} noValidate>
            <FieldGroup className="py-2">
                <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="quick-title">Title</FieldLabel>
                    <Input id="quick-title" placeholder="e.g. Brand refresh" autoFocus aria-invalid={!!errors.title} {...register("title")} />
                    <FieldError errors={[errors.title]} />
                </Field>

                <Controller
                    control={control}
                    name="clientId"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="quick-client">Client</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="quick-client" className="w-full" aria-invalid={fieldState.invalid}>
                                    <SelectValue placeholder="Who is this for?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortClients(clients).map((client) => (
                                        <SelectItem key={client.id} value={client.id}>{clientLabel(client)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldDescription>
                                Not listed? <Link href="/clients" className="underline underline-offset-4">Add the client</Link> first.
                            </FieldDescription>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Controller
                    control={control}
                    name="billingType"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>How you&apos;ll bill it</FieldLabel>
                            <div className="flex gap-2" role="radiogroup" aria-label="Billing type">
                                {([["fixed", "Fixed fee"], ["hourly", "Hourly"]] as const).map(([value, label]) => (
                                    <Button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={field.value === value}
                                        variant={field.value === value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => field.onChange(value)}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </Field>
                    )}
                />

                <div className="grid grid-cols-[110px_1fr] gap-3">
                    <Controller
                        control={control}
                        name="currency"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel htmlFor="quick-currency">Currency</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="quick-currency" className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((code) => <SelectItem key={code} value={code}>{code}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />
                    {billingType === "hourly" ? (
                        <Field data-invalid={!!errors.hourlyRate}>
                            <FieldLabel htmlFor="quick-rate">Hourly rate ({selectedCurrency})</FieldLabel>
                            <Input id="quick-rate" type="number" min={0} step="any" aria-invalid={!!errors.hourlyRate} {...register("hourlyRate", { valueAsNumber: true })} />
                            <FieldError errors={[errors.hourlyRate]} />
                        </Field>
                    ) : (
                        <Field data-invalid={!!errors.value}>
                            <FieldLabel htmlFor="quick-fee">Fee ({selectedCurrency})</FieldLabel>
                            <Input id="quick-fee" type="number" min={0} step="any" aria-invalid={!!errors.value} {...register("value", { valueAsNumber: true })} />
                            <FieldError errors={[errors.value]} />
                        </Field>
                    )}
                </div>

                <Field data-invalid={!!errors.dueDate}>
                    <FieldLabel htmlFor="quick-due">Due date (optional)</FieldLabel>
                    <Input id="quick-due" type="date" className="max-w-48" aria-invalid={!!errors.dueDate} {...register("dueDate")} />
                    <FieldError errors={[errors.dueDate]} />
                </Field>

                <FieldError errors={[errors.root?.server]} />
            </FieldGroup>

            <DialogFooter className="mt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        <XIcon aria-hidden />
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                    <PlusIcon aria-hidden />
                    {isPending ? "Creating…" : "Create project"}
                </Button>
            </DialogFooter>
        </form>
    );
}
