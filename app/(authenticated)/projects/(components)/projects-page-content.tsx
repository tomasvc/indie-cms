"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { clientLabel } from "@/lib/helpers/clients";
import { projectsQuery } from "@/lib/queries/projects";
import { clientsQuery } from "@/lib/queries/clients";
import { profileQuery } from "@/lib/queries/account";
import { ProjectsView } from "./projects-view";
import { ProjectsPageFallback } from "./projects-fallback";
import { CreateProjectDialog } from "./create-project-dialog";

export function ProjectsPageContent() {
    const { data: projects } = useQuery(projectsQuery);
    const { data: clientNames } = useQuery({
        ...clientsQuery,
        select: (clients) => Object.fromEntries(clients.map((client) => [client.id, clientLabel(client)])),
    });
    const { data: profile } = useQuery(profileQuery);

    if (!projects || !clientNames || profile === undefined) return <ProjectsPageFallback />;

    return (
        <div className="flex min-w-0 flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="pageTitle" as="h1">Projects</Typography>
                    <p className="mt-1 text-[15px] text-muted-foreground">
                        Live work first, soonest deadline at the top.
                    </p>
                </div>
                <CreateProjectDialog
                    trigger={
                        <Button variant="default">
                            <PlusIcon aria-hidden />
                            New Project
                        </Button>
                    }
                />
            </div>
            <ProjectsView projects={projects} clientNames={clientNames} locale={profile?.language || "en"} />
        </div>
    );
}
