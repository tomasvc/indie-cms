import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { ProjectsPageContent } from "./(components)/projects-page-content";

export default function ProjectsPage() {
    return <ProjectsPageContent />;
}

export const metadata: Metadata = {
    title: "Projects",
    description: "View and manage your projects.",
}
