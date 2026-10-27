"use client";

import { useState, useTransition } from "react";
import { CheckIcon, LinkIcon, Link2OffIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormAction } from "@/hooks/use-form-action";
import { disableInvoiceSharing, enableInvoiceSharing, markInvoiceSent } from "@/lib/actions/invoices";
import type { Invoice } from "@/types";
import { RecordPaymentButton } from "./record-payment-button";

const shareUrl = (token: string) => `${window.location.origin}/share/invoice/${token}`;

/** Getting an invoice to the client and paid: mark as sent, share a read-only link, record payment. */
export function InvoiceActions({ invoice }: { invoice: Invoice }) {
    const sent = useFormAction(markInvoiceSent);
    const [isSharing, startSharing] = useTransition();
    const [shareMessage, setShareMessage] = useState<string | null>(null);
    const [shareError, setShareError] = useState<string | null>(null);
    const isShared = !!invoice.share_token;

    function copyLink() {
        setShareError(null);
        startSharing(async () => {
            const result = await enableInvoiceSharing(invoice.id);
            if (!result.token) {
                setShareError(result.error ?? "Couldn't create a share link.");
                return;
            }
            try {
                await navigator.clipboard.writeText(shareUrl(result.token));
                setShareMessage("Link copied");
            } catch {
                // Clipboard can be blocked; show the link so it can be copied by hand
                setShareMessage(shareUrl(result.token));
            }
        });
    }

    function stopSharing() {
        setShareError(null);
        startSharing(async () => {
            const result = await disableInvoiceSharing(invoice.id);
            if (result.error) setShareError(result.error);
            else setShareMessage(null);
        });
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap items-center justify-end gap-2">
                {invoice.status === "draft" && (
                    <form onSubmit={sent.onSubmit}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <Button type="submit" variant="outline" disabled={sent.isPending}>
                            <SendIcon aria-hidden />
                            {sent.isPending ? "Saving…" : "Mark as sent"}
                        </Button>
                    </form>
                )}
                {invoice.status !== "void" && (
                    <Button type="button" variant="outline" onClick={copyLink} disabled={isSharing}>
                        {shareMessage === "Link copied" ? <CheckIcon aria-hidden /> : <LinkIcon aria-hidden />}
                        {shareMessage === "Link copied" ? "Link copied" : isShared ? "Copy share link" : "Create share link"}
                    </Button>
                )}
                {isShared && (
                    <Button type="button" variant="ghost" onClick={stopSharing} disabled={isSharing}>
                        <Link2OffIcon aria-hidden />
                        Stop sharing
                    </Button>
                )}
                {invoice.status === "sent" && <RecordPaymentButton invoice={invoice} />}
            </div>
            {(sent.state.error || shareError) && (
                <p className="text-[13px] text-destructive" role="alert">{sent.state.error ?? shareError}</p>
            )}
            {shareMessage && shareMessage !== "Link copied" && (
                <p className="max-w-full break-all text-[13px] text-muted-foreground">Copy this link: {shareMessage}</p>
            )}
            {isShared && !shareMessage && (
                <p className="text-[13px] text-muted-foreground">Anyone with the link can view this invoice.</p>
            )}
        </div>
    );
}
