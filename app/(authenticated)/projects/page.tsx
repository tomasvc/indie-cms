import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Link from "next/link";
import { ProjectsView } from "./(components)/projects-view";
import { ProjectsPageFallback } from "./(components)/projects-fallback";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata, ResolvingMetadata } from "next/dist/lib/metadata/types/metadata-interface";
import { getProject } from "@/lib/actions/projects";
import { notFound } from "next/navigation";

async function Projects() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', user.user?.id);

    if (error) throw error;
    const projects = data ?? [];

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage your projects.
                    </p>
                </div>
                <Button size="lg" variant="default" asChild>
                    <Link href="/projects/new">
                        <PlusIcon className="size-3 mb-0.5" />
                        New Project
                    </Link>
                </Button>
            </div>
            <ProjectsView projects={projects} />
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