"use-client";

import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function DeleteProjectButton({ id, deleteProject, iconOnly }: { id: string, deleteProject: (formData: FormData) => Promise<void>, iconOnly?: boolean }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size={iconOnly ? "icon-lg" : "lg"} variant="destructive" aria-label="Delete project">
                    <TrashIcon className={iconOnly ? "size-4" : "size-3 mb-0.5"} />
                    {!iconOnly && "Delete"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form action={deleteProject}>
                        <input type="hidden" name="id" value={id} />
                        <AlertDialogAction asChild>
                            <button type="submit">Delete</button>
                        </AlertDialogAction>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}