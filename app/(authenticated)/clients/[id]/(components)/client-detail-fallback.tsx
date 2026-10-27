import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientDetailFallback() {
    return (
        <div className="flex flex-col gap-4 animate-fadein" aria-busy="true" aria-label="Loading client">
            {/* Back link + header */}
            <div>
                <Skeleton className="h-7 w-20 mb-2" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-8 w-56" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-28" />
                        <Skeleton className="h-8 w-28" />
                    </div>
                </div>
            </div>

            {/* Money stats */}
            <Card className="grid grid-cols-2 lg:grid-cols-4 gap-0 p-0">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-1 p-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ))}
            </Card>

            {/* Projects + invoices, contact */}
            <div className="grid gap-3 lg:grid-cols-3">
                <div className="flex flex-col gap-3 lg:col-span-2">
                    {[0, 1].map((card) => (
                        <Card key={card} className="gap-0">
                            <CardHeader className="border-b"><Skeleton className="h-4 w-24" /></CardHeader>
                            <CardContent className="flex flex-col gap-3 py-3">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="h-fit gap-0">
                    <CardHeader className="border-b"><Skeleton className="h-4 w-20" /></CardHeader>
                    <CardContent className="flex flex-col gap-3 py-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
