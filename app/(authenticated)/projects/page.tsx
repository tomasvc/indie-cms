import { createClient } from "@/lib/supabase/server";
import { Typography } from "@/components/ui/typography";
import { Suspense } from "react";
import Link from "next/link";
import { ProjectsView } from "./(components)/projects-view";
import { ProjectsPageFallback } from "./(components)/projects-fallback";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { redirect } from "next/navigation";
import { getProjects } from "@/lib/data/projects";
import { getClients } from "@/lib/data/clients";
import { getProfile } from "@/lib/data/settings";
import { clientLabel } from "@/lib/helpers/clients";

async function Projects() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [projects, clients, profile] = await Promise.all([getProjects(user.id), getClients(), getProfile()]);
    const clientNames = Object.fromEntries((clients ?? []).map((client) => [client.id, clientLabel(client)]));

    return (
        <div className="flex min-w-0 flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="pageTitle" as="h1">Projects</Typography>
                    <p className="mt-1 text-[15px] text-muted-foreground">
                        Live work first, soonest deadline at the top.
                    </p>
                </div>
                <Button variant="default" asChild>
                    <Link href="/projects/new">
                        <PlusIcon aria-hidden />
                        New Project
                    </Link>
                </Button>
            </div>
            <ProjectsView projects={projects ?? []} clientNames={clientNames} locale={profile?.language || "en"} />
        </div>
    )
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<ProjectsPageFallback />}>
            <Projects />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "Projects",
    description: "View and manage your projects.",
}