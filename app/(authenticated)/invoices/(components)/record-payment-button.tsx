"use client";

import { useState } from "react";
import { BanknoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/types";
import { MarkPaidDialog } from "./invoice-dialogs";

/** Opens the record-payment dialog for one invoice, for use outside the invoices table. */
export function RecordPaymentButton({ invoice }: { invoice: Invoice }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                <BanknoteIcon aria-hidden />
                Record payment
            </Button>
            {open && <MarkPaidDialog invoice={invoice} onOpenChange={setOpen} />}
        </>
    );
}
