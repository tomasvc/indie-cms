import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, Project } from "@/types";
import { ChartColumnIncreasingIcon, UserIcon } from "lucide-react";

export function ProjectOverview({ project, client }: { project: Project; client: Client | null }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>View and manage your project.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 divide-y">
                <div className="flex flex-col gap-1 pb-2">
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">Client Details</span>
                    </div>
                    {client ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No client associated with this project.</p>
                    )}
                </div>
                <div className="flex flex-col gap-1 pb-2">
                    <div className="flex items-center gap-2">
                        <ChartColumnIncreasingIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">Summary stats</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">Total value: {Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(project.value)}</p>
                        <p className="text-sm font-medium">Progress: {project.progress}%</p>
                        <p className="text-sm font-medium capitalize">Status: {project.status.replace("_", " ")}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}