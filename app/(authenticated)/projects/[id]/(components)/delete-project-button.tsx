"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ArchiveIcon, TrashIcon } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { ProjectActionState } from "@/lib/actions/projects";

type ProjectAction = (state: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;

export function DeleteProjectButton({
    id,
    canDelete,
    isArchived,
    deleteProject,
    archiveProject,
    iconOnly,
}: {
    id: string;
    canDelete: boolean;
    isArchived: boolean;
    deleteProject: ProjectAction;
    archiveProject: ProjectAction;
    iconOnly?: boolean;
}) {
    const [deleteState, deleteAction, isDeleting] = useActionState(deleteProject, {});
    const [archiveState, archiveAction, isArchiving] = useActionState(archiveProject, {});

    if (!canDelete && isArchived) return null;

    const mode = canDelete ? "delete" : "archive";
    const error = archiveState.error ?? deleteState.error;
    const isPending = isDeleting || isArchiving;
    const Icon = mode === "delete" ? TrashIcon : ArchiveIcon;
    const label = mode === "delete" ? "Delete" : "Archive";

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    size={iconOnly ? "icon-lg" : "lg"}
                    variant={mode === "delete" ? "destructive" : "secondary"}
                    aria-label={`${label} project`}
                >
                    <Icon className={iconOnly ? "size-4" : "size-3 mb-0.5"} />
                    {!iconOnly && label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {mode === "delete" ? "Are you sure you want to delete this project?" : "Archive this project?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {mode === "delete"
                            ? "This action cannot be undone."
                            : "This project has invoices or time entries, so it can't be deleted. Archiving keeps its history and moves it to the Archived column."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    {mode === "delete" && deleteState.error && (
                        <form action={archiveAction}>
                            <input type="hidden" name="id" value={id} />
                            <Button type="submit" variant="secondary" disabled={isPending}>
                                {isArchiving ? "Archiving…" : "Archive instead"}
                            </Button>
                        </form>
                    )}
                    <form action={mode === "delete" ? deleteAction : archiveAction}>
                        <input type="hidden" name="id" value={id} />
                        <Button
                            type="submit"
                            variant={mode === "delete" ? "destructive" : "default"}
                            disabled={isPending || (mode === "delete" && Boolean(deleteState.error))}
                        >
                            {mode === "delete"
                                ? isDeleting ? "Deleting…" : "Delete"
                                : isArchiving ? "Archiving…" : "Archive"}
                        </Button>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
