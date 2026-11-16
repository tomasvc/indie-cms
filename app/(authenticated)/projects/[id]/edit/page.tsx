import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/data/projects";
import { EditProjectPage } from "../(components)/edit-project-page";
import { FormPageFallback } from "@/components/form-page-fallback";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export default function EditProject({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<FormPageFallback />}>
            <EditProjectPage params={params} />
        </Suspense>
    );
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
    const project = await getProject((await params).id);
    if (!project) notFound();

    return {
        title: `Edit Project - ${project.title}`,
        description: project.description,
    }
}
