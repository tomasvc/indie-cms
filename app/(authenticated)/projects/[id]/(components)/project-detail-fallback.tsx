import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProjectDetailFallback() {
    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-8 w-52" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    <div className="flex gap-1">
                        <Skeleton className="h-10 w-20 rounded-lg" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>

            <Tabs defaultValue="overview" className="flex flex-col gap-4">
                <TabsList variant="line">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="time">Time</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>

                {/* Matches ProjectOverview: summary strip, then Next up + Time beside Details */}
                <div className="flex flex-col gap-4">
                    <Card className="grid grid-cols-2 gap-0 p-0 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-2 p-5">
                                <Skeleton className="h-3.5 w-20" />
                                <Skeleton className="h-7 w-24" />
                                <Skeleton className="h-3.5 w-28" />
                            </div>
                        ))}
                    </Card>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="flex flex-col gap-4 lg:col-span-2">
                            {[0, 1].map((card) => (
                                <Card key={card} className="gap-0">
                                    <CardHeader className="border-b"><Skeleton className="h-4 w-24" /></CardHeader>
                                    <CardContent className="flex flex-col gap-3 py-4">
                                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <Card className="h-fit gap-0">
                            <CardHeader className="border-b"><Skeleton className="h-4 w-20" /></CardHeader>
                            <CardContent className="flex flex-col gap-4 py-4">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
