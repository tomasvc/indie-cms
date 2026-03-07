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
                        <Skeleton className="h-10 w-10 rounded-lg" />
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
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="flex items-center gap-4 px-4 py-5">
                                    <Skeleton className="size-12 rounded-full shrink-0" />
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-6 w-14" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_1fr] xl:grid-cols-[3fr_2fr]">
                        <div className="flex flex-col gap-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="size-14 rounded-full shrink-0" />
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-16 rounded" />
                                        <Skeleton className="h-8 w-16 rounded" />
                                        <Skeleton className="h-8 w-24 rounded" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-6 w-14 rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="flex-1">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-36" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-6 w-full rounded-md" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-12" />
                                        <Skeleton className="h-3 w-10" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                    <Skeleton className="h-3 w-40 mx-auto" />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-36" />
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={[
                                                i === 0 && "border-r border-b border-border pb-4 pr-4",
                                                i === 1 && "border-b border-border pb-4 pl-4",
                                                i === 2 && "border-r border-border pt-4 pr-4",
                                                i === 3 && "pt-4 pl-4",
                                            ].filter(Boolean).join(" ")}
                                        >
                                            <Skeleton className="h-3 w-16 mb-1.5" />
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="flex-1">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-20" />
                                        <div className="flex items-end gap-1 h-8">
                                            {[22, 28, 20, 30, 24, 26, 20].map((h, i) => (
                                                <Skeleton
                                                    key={i}
                                                    className="flex-1 rounded-sm"
                                                    style={{ height: `${h}px` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-10 w-full rounded-lg" />
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Skeleton className="h-9 w-24 rounded" />
                                <Skeleton className="h-9 w-24 rounded" />
                                <Skeleton className="h-9 w-28 rounded" />
                                <Skeleton className="h-9 w-32 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
}
