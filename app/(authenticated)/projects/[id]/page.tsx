import type { Metadata } from "next";
import { Suspense } from "react";
import { getProject } from "@/lib/data/projects";
import { ProjectDetail } from "./(components)/project-detail";
import { ProjectDetailFallback } from "./(components)/project-detail-fallback";

export default function ProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
    return (
        <Suspense fallback={<ProjectDetailFallback />}>
            <ProjectDetail params={params} searchParams={searchParams} />
        </Suspense>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const project = await getProject((await params).id).catch(() => null);
    return { title: project?.title ?? "Project", description: project?.description ?? undefined };
}
