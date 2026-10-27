import { Badge } from "@/components/ui/badge";
import type { InvoiceDisplayStatus } from "@/lib/helpers/invoices";

const STATUS_BADGE: Record<InvoiceDisplayStatus, React.ComponentProps<typeof Badge>["variant"]> = {
    draft: "outline",
    sent: "info",
    overdue: "destructive",
    paid: "success",
    void: "ghost",
};

export function InvoiceStatusBadge({ status, className }: { status: InvoiceDisplayStatus; className?: string }) {
    return <Badge variant={STATUS_BADGE[status]} className={`capitalize ${className ?? ""}`}>{status}</Badge>;
}
