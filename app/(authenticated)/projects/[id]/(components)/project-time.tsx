"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import type { TimeEntry, Task } from "@/types";
import { deleteTimeEntry } from "@/lib/actions/time-entries";
import { ClockIcon, PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { formatMoney, formatDate } from "@/lib/helpers/format";
import { useActionWithRefresh } from "@/hooks/use-action-with-refresh";
import { useEntityDialog } from "@/hooks/use-entity-dialog";
import { TimeEntryForm } from "./time-entry-form";

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

    const formProps = { projectId, tasks, currency, defaultHourlyRate };

    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const unbilledAmount = timeEntries
        .filter((e) => e.billable && !e.invoice_id)
        .reduce((sum, e) => sum + e.hours * e.rate, 0);

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
                            <TimeEntryForm {...formProps} onDone={closeAdd} />
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
                                                    onClick={() => openEdit(entry)}
                                                    aria-label="Edit entry"
                                                >
                                                    <PencilIcon className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDelete(entry.id)}
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
                                {editingEntry && (
                                    <TimeEntryForm {...formProps} entry={editingEntry} onDone={closeEdit} />
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
                                            if (deleteId) handleDelete(deleteId);
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
