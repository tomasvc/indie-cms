import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/types";

const VARIANT: Record<ClientStatus, React.ComponentProps<typeof Badge>["variant"]> = {
    active: "success",
    lead: "info",
    archived: "ghost",
};

const LABEL: Record<ClientStatus, string> = { active: "Active", lead: "Lead", archived: "Archived" };

export function ClientStatusBadge({ status, className }: { status: ClientStatus; className?: string }) {
    return <Badge variant={VARIANT[status] ?? "outline"} className={className}>{LABEL[status] ?? status}</Badge>;
}
