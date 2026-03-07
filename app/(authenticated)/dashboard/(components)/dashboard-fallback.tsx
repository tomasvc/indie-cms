import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardFallback() {
    return (
        <div className="flex-1 w-full flex flex-col gap-3 animate-fadein">
            {/* Top stats bar skeleton - matches TopStats Card layout */}
            <Card className="grid grid-cols-6 gap-0 rounded-lg divide-x p-0">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-1 p-4">
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

            {/* Main grid - matches Financials, Workload (col-span-2), QuickActions */}
            <div className="grid grid-cols-4 gap-3">
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-20" /></CardTitle>
                        <CardDescription><Skeleton className="h-3 w-full mt-1" /></CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Skeleton className="h-14 w-full rounded-lg" />
                        <Skeleton className="h-14 w-full rounded-lg" />
                        <Skeleton className="h-14 w-full rounded-lg" />
                        <div className="pt-2">
                            <Skeleton className="h-3 w-24 mb-2" />
                            <Skeleton className="h-20 w-full rounded" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-2">
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-24" /></CardTitle>
                        <CardDescription><Skeleton className="h-3 w-full mt-1" /></CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <div className="pb-3">
                            <Skeleton className="h-3 w-28 mb-2" />
                            <Skeleton className="h-16 w-full rounded" />
                        </div>
                        <div className="py-3">
                            <Skeleton className="h-3 w-24 mb-2" />
                            <Skeleton className="h-12 w-full rounded" />
                        </div>
                        <div className="pt-3">
                            <Skeleton className="h-3 w-32 mb-2" />
                            <Skeleton className="h-12 w-full rounded" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-24" /></CardTitle>
                        <CardDescription><Skeleton className="h-3 w-full mt-1" /></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-12 w-full rounded" />
                            <Skeleton className="h-12 w-full rounded" />
                            <Skeleton className="h-12 w-full rounded" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity + Overdue Invoices - matches grid-cols-2 */}
            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-28" /></CardTitle>
                        <CardDescription><Skeleton className="h-3 w-full mt-1" /></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-6 w-20 mb-3" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle><Skeleton className="h-4 w-40" /></CardTitle>
                        <CardDescription><Skeleton className="h-3 w-full mt-1" /></CardDescription>
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
