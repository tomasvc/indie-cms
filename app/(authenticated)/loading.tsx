import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col gap-4 animate-fadein">
            {/* Page header */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Summary stats row */}
            <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="px-4 py-4">
                            <div className="flex justify-between items-start mb-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-3 w-14 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 border-b pb-0">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-16 rounded-t-md" />
                ))}
            </div>

            {/* Main content card */}
            <Card className="p-0">
                <CardHeader className="border-b px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-28 rounded" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Table-style rows */}
                    <div className="px-4 py-2 flex gap-6 border-b">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-3 w-20" />
                        ))}
                    </div>
                    <div className="divide-y">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="px-4 py-3 flex items-center gap-4">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-4 w-20 ml-auto" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
