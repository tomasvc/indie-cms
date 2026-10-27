"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

/** Shows the most urgent rows and folds the rest, so the list never pushes the money figures off-screen. */
export function AttentionList({ rows, visible = 4 }: { rows: React.ReactNode[]; visible?: number }) {
    const [expanded, setExpanded] = useState(false);
    const hidden = rows.length - visible;
    const shown = expanded || hidden <= 0 ? rows : rows.slice(0, visible);

    return (
        <>
            <ul className="divide-y">{shown}</ul>
            {hidden > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-center gap-1.5 border-t px-4 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                    {expanded ? "Show less" : `Show ${hidden} more`}
                    <ChevronDownIcon className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
                </button>
            )}
        </>
    );
}
