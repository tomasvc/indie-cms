"use client";

import { useState, useTransition } from "react";
import { RotateCcwIcon } from "lucide-react";
import { useServerAction } from "@/hooks/use-server-action";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { resetDemo } from "@/lib/actions/demo";

export function DemoResetButton({
    variant = "outline",
    size = "sm",
    label = "Reset demo",
}: {
    variant?: React.ComponentProps<typeof Button>["variant"];
    size?: React.ComponentProps<typeof Button>["size"];
    label?: string;
}) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [runResetDemo] = useServerAction(resetDemo);

    function reset() {
        setError(null);
        startTransition(async () => {
            const result = await runResetDemo();
            if (result.error) {
                setError(result.error);
                return;
            }
            setOpen(false);
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button type="button" variant={variant} size={size}>
                    <RotateCcwIcon className="size-3.5" />
                    {label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reset this demo?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your clients, projects, and invoices are replaced with the original sample studio. This only affects your demo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <Button type="button" onClick={reset} disabled={isPending}>
                        {isPending ? "Resetting…" : "Reset demo"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
