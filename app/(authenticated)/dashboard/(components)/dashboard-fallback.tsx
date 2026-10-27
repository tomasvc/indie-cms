import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardFallback() {
    return (
        <div className="flex-1 w-full flex flex-col gap-3 animate-fadein" aria-busy="true" aria-label="Loading dashboard">
            {/* Page header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
                <div>
                    <Skeleton className="h-8 w-36 mb-2" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </div>

            {/* Needs attention */}
            <Card className="gap-0">
                <CardHeader className="border-b">
                    <CardTitle><Skeleton className="h-4 w-32" /></CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 py-3">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                </CardContent>
            </Card>

            {/* Top stats bar skeleton - matches TopStats Card layout */}
            <Card className="grid grid-cols-2 lg:grid-cols-4 gap-0 rounded-lg p-0">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex flex-col gap-1 p-4",
                            i % 2 === 1 && "border-l",
                            i < 2 && "border-b lg:border-b-0",
                            i === 2 && "lg:border-l"
                        )}
                    >
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <div>
                            <Skeleton className="h-7 w-20 mb-1" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    </div>
                ))}
            </Card>

            {/* Coming up (2 columns) + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-24" /></CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <div className="pb-3">
                            <Skeleton className="h-3 w-28 mb-2" />
                            <Skeleton className="h-16 w-full rounded" />
                        </div>
                        <div className="pt-3">
                            <Skeleton className="h-3 w-32 mb-2" />
                            <Skeleton className="h-12 w-full rounded" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-20" /></CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Skeleton className="h-14 w-full rounded-lg" />
                        <Skeleton className="h-14 w-full rounded-lg" />
                        <div className="pt-2">
                            <Skeleton className="h-3 w-24 mb-2" />
                            <Skeleton className="h-20 w-full rounded" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Unpaid invoices + Recent activity - matches grid-cols-2 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-28" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-6 w-20 mb-3" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-40" /></CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="px-4 py-2 flex gap-4 border-b">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-10 w-full rounded" />
                            <Skeleton className="h-10 w-full rounded" />
                            <Skeleton className="h-10 w-full rounded" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
