"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** The browser's print dialog doubles as "Save as PDF", so no PDF library is needed. */
export function PrintButton() {
    return (
        <Button type="button" onClick={() => window.print()}>
            <PrinterIcon aria-hidden />
            Print or save as PDF
        </Button>
    );
}
