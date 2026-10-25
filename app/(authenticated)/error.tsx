"use client";

import { useEffect } from "react";
import { CircleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] w-full items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                    <CircleAlertIcon className="size-4 text-destructive" />
                </div>
                <Typography variant="pageTitle" as="h1" className="text-[22px]">
                    Something went wrong
                </Typography>
                <Typography variant="body" color="muted" as="p">
                    This page couldn&apos;t be loaded. Try again, and if it keeps happening, come back to it in a moment.
                </Typography>
                <Button type="button" className="mt-1" onClick={() => reset()}>
                    Try again
                </Button>
            </div>
        </div>
    );
}
