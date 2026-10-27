import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABEL } from "@/lib/helpers/projects";
import type { ProjectStatus } from "@/types";

// Same hue, same meaning everywhere: green = going, blue = waiting on someone, amber = needs a look
const VARIANT: Record<ProjectStatus, React.ComponentProps<typeof Badge>["variant"]> = {
    active: "success",
    review: "warning",
    on_hold: "secondary",
    proposal: "info",
    draft: "outline",
    completed: "secondary",
    archived: "ghost",
};

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
    return <Badge variant={VARIANT[status] ?? "outline"} className={className}>{PROJECT_STATUS_LABEL[status] ?? status}</Badge>;
}
