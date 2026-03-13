"use client";

import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "indie-cms-demo-banner-dismissed";

export function DismissableDemoBanner() {
    const [isVisible, setIsVisible] = useState<boolean | null>(null);

    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
        setIsVisible(!dismissed);
    }, []);

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsVisible(false);
    };

    if (isVisible !== true) return null;

    return (
        <div
            className={cn(
                "bg-destructive/10 border border-destructive/20 rounded-[var(--radius)] p-4 mb-4",
                "flex items-start justify-between gap-3"
            )}
        >
            <p className="text-sm text-destructive">
                This is a demo account. Some features may be limited.
            </p>
            <Button
                variant="ghost"
                size="icon-xs"
                onClick={dismiss}
                aria-label="Dismiss demo banner"
                className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
                <XIcon />
            </Button>
        </div>
    );
}
