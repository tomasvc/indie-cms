"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import type { TimeEntry, Task } from "@/types";
import {
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
} from "@/lib/actions/time-entries";
import { format } from "date-fns";
import { ClockIcon, PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { formatMoney, formatDate } from "@/lib/helpers/format";
import { useActionWithRefresh } from "@/hooks/use-action-with-refresh";
import { useEntityDialog } from "@/hooks/use-entity-dialog";

const NO_TASK_VALUE = "__none__";

export function ProjectTime({
    projectId,
    timeEntries,
    tasks = [],
    currency = "USD",
    defaultHourlyRate = 0,
}: {
    projectId: string;
    timeEntries: TimeEntry[];
    tasks?: Task[];
    currency?: string;
    defaultHourlyRate?: number;
}) {
    const router = useRouter();
    const [addOpen, setAddOpen] = useState(false);
    const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
    const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
    // const [isSubmitting, setIsSubmitting] = useState(false);
    const [addBillable, setAddBillable] = useState(true);
    const [editBillable, setEditBillable] = useState(true);
    const [editApproved, setEditApproved] = useState(false);
    const [addTaskId, setAddTaskId] = useState<string>(NO_TASK_VALUE);
    const [editTaskId, setEditTaskId] = useState<string>(NO_TASK_VALUE);

    const {
        isAddOpen,
        openAdd,
        closeAdd,
        editEntity: editingEntry,
        openEdit,
        closeEdit,
        deleteId,
        openDelete,
        closeDelete
    } = useEntityDialog<TimeEntry>();

    const { run, isSubmitting } = useActionWithRefresh();

    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const unbilledAmount = timeEntries
        .filter((e) => e.billable && !e.invoice_id)
        .reduce((sum, e) => sum + e.hours * e.rate, 0);

    async function handleCreate(formData: FormData) {
        await run(async () => {
            formData.set("project_id", projectId);
            formData.set("billable", addBillable ? "true" : "false");
            if (addTaskId && addTaskId !== NO_TASK_VALUE) formData.set("task_id", addTaskId);
            await createTimeEntry(formData);
            closeAdd();
        });
    }

    async function handleUpdate(formData: FormData) {
        if (!editEntry) return;
        await run(async () => {
            formData.set("id", editEntry.id);
            formData.set("project_id", projectId);
            formData.set("billable", editBillable ? "true" : "false");
            formData.set("approved", editApproved ? "true" : "false");
            if (editTaskId && editTaskId !== NO_TASK_VALUE) formData.set("task_id", editTaskId);
            await updateTimeEntry(formData);
            closeEdit();
        })
    }

    async function handleDelete(id: string) {
        await run(async () => {
            const formData = new FormData();
            formData.set("id", id);
            formData.set("project_id", projectId);
            await deleteTimeEntry(formData);
            closeDelete();
        })
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <CardTitle>
                            <Typography variant="cardTitle" as="span">
                                Time entries
                            </Typography>
                        </CardTitle>
                        <CardDescription>
                            <Typography variant="body" color="muted" as="span">
                                Log and manage time for this project. Total: {totalHours.toFixed(1)}h
                                {unbilledAmount > 0 && (
                                    <> · Unbilled: {formatMoney(unbilledAmount, currency)}</>
                                )}
                            </Typography>
                        </CardDescription>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={(open) => (open ? openAdd() : closeAdd())}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <ClockIcon className="size-3.5" />
                                Log time
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={handleCreate}>
                                <input type="hidden" name="project_id" value={projectId} />
                                <DialogHeader>
                                    <DialogTitle>Log time</DialogTitle>
                                    <DialogDescription>
                                        Add a time entry. Entry date and hours are required.
                                    </DialogDescription>
                                </DialogHeader>
                                <FieldGroup className="gap-4 py-4">
                                    <Field>
                                        <FieldLabel>Entry date</FieldLabel>
                                        <Input
                                            name="entry_date"
                                            type="date"
                                            required
                                            defaultValue={format(new Date(), "yyyy-MM-dd")}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea
                                            name="description"
                                            placeholder="What did you work on?"
                                            className="min-h-[80px]"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Task (optional)</FieldLabel>
                                        <Select
                                            value={addTaskId}
                                            onValueChange={setAddTaskId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={NO_TASK_VALUE}>None</SelectItem>
                                                {tasks.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="task_id" value={addTaskId === NO_TASK_VALUE ? "" : addTaskId} />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Hours</FieldLabel>
                                            <Input
                                                name="hours"
                                                type="number"
                                                min={0}
                                                step={0.25}
                                                required
                                                placeholder="0"
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel>Rate ({currency})</FieldLabel>
                                            <Input
                                                name="rate"
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                defaultValue={defaultHourlyRate}
                                                placeholder="0"
                                            />
                                        </Field>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="add-billable"
                                            checked={addBillable}
                                            onCheckedChange={(c) => setAddBillable(c === true)}
                                        />
                                        <label htmlFor="add-billable" className="text-sm font-medium">
                                            Billable
                                        </label>
                                    </div>
                                    <input type="hidden" name="billable" value={addBillable ? "true" : "false"} />
                                </FieldGroup>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeAdd}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving…" : "Log time"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {timeEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] border border-dashed border-muted rounded-lg bg-muted/40 text-center p-6">
                        <ClockIcon className="size-10 text-muted-foreground/70 mb-3" />
                        <Typography variant="subtitle" className="mb-1">
                            No time entries yet
                        </Typography>
                        <Typography variant="bodySmall" color="muted">
                            Log time to track hours and billable work for this project.
                        </Typography>
                        <Button className="mt-3" onClick={openAdd}>
                            <PlusIcon className="size-3.5" />
                            Log time
                        </Button>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-4.5">Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Hours</TableHead>
                                    <TableHead className="text-right">Rate</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Billable</TableHead>
                                    <TableHead>Approved</TableHead>
                                    <TableHead className="w-[80px] pr-4.5" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timeEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="pl-4.5">{formatDate(entry.entry_date, "MMM d, yyyy")}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {entry.description || "—"}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {entry.hours.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatMoney(entry.rate, currency)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatMoney(entry.hours * entry.rate, currency)}
                                        </TableCell>
                                        <TableCell>
                                            {entry.billable ? (
                                                <Badge variant="secondary">Yes</Badge>
                                            ) : (
                                                <Badge variant="secondary">No</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {entry.approved ? (
                                                <Badge variant="success">Yes</Badge>
                                            ) : (
                                                <Badge variant="secondary">No</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-4.5">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditEntry(entry);
                                                        setEditBillable(entry.billable);
                                                        setEditApproved(entry.approved);
                                                        setEditTaskId(entry.task_id ?? NO_TASK_VALUE);
                                                    }}
                                                    aria-label="Edit entry"
                                                >
                                                    <PencilIcon className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteEntryId(entry.id)}
                                                    aria-label="Delete entry"
                                                >
                                                    <TrashIcon className="size-3.5 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Edit entry dialog */}
                        <Dialog open={!!editingEntry} onOpenChange={(open) => !open && closeEdit()}>
                            <DialogContent>
                                {editEntry && (
                                    <form action={handleUpdate}>
                                        <input type="hidden" name="id" value={editEntry.id} />
                                        <input type="hidden" name="project_id" value={projectId} />
                                        <input type="hidden" name="billable" value={editBillable ? "true" : "false"} />
                                        <input type="hidden" name="approved" value={editApproved ? "true" : "false"} />
                                        <DialogHeader>
                                            <DialogTitle>Edit time entry</DialogTitle>
                                            <DialogDescription>
                                                Update description, hours, rate or flags.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <FieldGroup className="gap-4 py-4">
                                            <Field>
                                                <FieldLabel>Entry date</FieldLabel>
                                                <Input
                                                    name="entry_date"
                                                    type="date"
                                                    required
                                                    defaultValue={
                                                        editEntry.entry_date
                                                            ? editEntry.entry_date.split("T")[0]
                                                            : format(new Date(), "yyyy-MM-dd")
                                                    }
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel>Description</FieldLabel>
                                                <Textarea
                                                    name="description"
                                                    defaultValue={editEntry.description ?? ""}
                                                    placeholder="What did you work on?"
                                                    className="min-h-[80px]"
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel>Task (optional)</FieldLabel>
                                                <Select
                                                    value={editTaskId}
                                                    onValueChange={setEditTaskId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="None" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={NO_TASK_VALUE}>None</SelectItem>
                                                        {tasks.map((t) => (
                                                            <SelectItem key={t.id} value={t.id}>
                                                                {t.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <input type="hidden" name="task_id" value={editTaskId === NO_TASK_VALUE ? "" : editTaskId} />
                                            </Field>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field>
                                                    <FieldLabel>Hours</FieldLabel>
                                                    <Input
                                                        name="hours"
                                                        type="number"
                                                        min={0}
                                                        step={0.25}
                                                        required
                                                        defaultValue={editEntry.hours}
                                                    />
                                                </Field>
                                                <Field>
                                                    <FieldLabel>Rate ({currency})</FieldLabel>
                                                    <Input
                                                        name="rate"
                                                        type="number"
                                                        min={0}
                                                        step={0.01}
                                                        defaultValue={editEntry.rate}
                                                    />
                                                </Field>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="edit-billable"
                                                        checked={editBillable}
                                                        onCheckedChange={(c) => setEditBillable(c === true)}
                                                    />
                                                    <label htmlFor="edit-billable" className="text-sm font-medium">
                                                        Billable
                                                    </label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="edit-approved"
                                                        checked={editApproved}
                                                        onCheckedChange={(c) => setEditApproved(c === true)}
                                                    />
                                                    <label htmlFor="edit-approved" className="text-sm font-medium">
                                                        Approved
                                                    </label>
                                                </div>
                                            </div>
                                        </FieldGroup>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={closeEdit}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? "Saving…" : "Save changes"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Delete confirmation */}
                        <AlertDialog
                            open={!!deleteId}
                            onOpenChange={(open) => !open && closeDelete()}
                        >
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete time entry</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. The time entry will be permanently removed
                                        and project actual hours will be updated.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={closeDelete}>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (deleteEntryId) handleDelete(deleteEntryId);
                                        }}
                                        disabled={isSubmitting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isSubmitting ? "Deleting…" : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
