import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ClientDetailFallback() {
    return (
        <div className="flex flex-col gap-4 animate-fadein">
            {/* Page header */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-start gap-4">
                        <Skeleton className="size-16 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Skeleton className="h-10 w-20 rounded-lg" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                </div>
                <div className="flex gap-3 items-center flex-wrap mt-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>

            {/* KPI stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="px-4 py-4">
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-3 w-14 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="flex flex-col gap-4">
                <TabsList variant="line">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="contacts">Contacts</TabsTrigger>
                </TabsList>

                {/* Overview tab content skeleton */}
                <div className="grid gap-3 lg:grid-cols-2">
                    {/* Contact info card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Notes card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-14" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-24 w-full rounded" />
                        </CardContent>
                    </Card>

                    {/* Recent projects card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 py-1.5">
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <Skeleton className="h-4 w-36" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent invoices card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 py-1.5">
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
}
