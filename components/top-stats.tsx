import type { DashboardCoreData } from "@/lib/queries/dashboard";
import { DollarSign, Eye, FileCheck, FolderKanban, TrendingUp, Users } from "lucide-react";
import { Card } from "./ui/card";

type TopStatsProps = {
    data: DashboardCoreData;
};

export function TopStats({ data }: TopStatsProps) {
    const projects = data.projects;
    if (!projects || projects.length === 0) {
        return <div>No projects found</div>;
    }

    const sections = [
        {
            id: crypto.randomUUID(),
            name: "Revenue (MTD)",
            icon: DollarSign,
            value: 0,
            subvalue: "0%",
        },
        {
            id: crypto.randomUUID(),
            name: "Active Projects",
            icon: FolderKanban,
            value: projects.length,
            subvalue: 0
        },
        {
            id: crypto.randomUUID(),
            name: "Pipeline Value",
            icon: TrendingUp,
            value: 0,
            subvalue: "0%"
        },
        {
            id: crypto.randomUUID(),
            name: "Total Clients",
            icon: Users,
            value: data.clients.length,
            subvalue: 0
        },
        {
            id: crypto.randomUUID(),
            name: "Invoices Sent",
            icon: FileCheck,
            value: data.invoices.length,
            subvalue: 0
        },
        {
            id: crypto.randomUUID(),
            name: "Portfolio Views",
            icon: Eye,
            value: 0,
            subvalue: 0
        }
    ]

    return (
        <Card className="grid grid-cols-6 gap-0 rounded-lg divide-x p-0">
            {sections.map((s) => {
                const Icon = s.icon;

                return <div key={s.id} className="p-4 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <p className="uppercase text-muted-foreground text-xs font-semibold tracking-wider">{s.name}</p>
                        <Icon className="text-muted-foreground w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-bold text-2xl">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.subvalue}</p>
                    </div>
                </div>
            })}
        </Card>
    )
}