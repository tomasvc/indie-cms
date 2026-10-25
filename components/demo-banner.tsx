"use client";

import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoResetButton } from "@/components/demo-reset-button";
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
                "bg-primary/10 border border-primary/20 rounded-[var(--radius)] p-4 mb-4",
                "flex items-center justify-between gap-3"
            )}
        >
            <p className="text-sm text-primary">
                This demo is yours for 24 hours. Anything you change stays in this browser until then.
            </p>
            <div className="flex items-center gap-1 shrink-0">
                <DemoResetButton variant="ghost" size="sm" />
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={dismiss}
                    aria-label="Dismiss demo banner"
                    className="text-primary hover:bg-primary/10 hover:text-primary"
                >
                    <XIcon className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
