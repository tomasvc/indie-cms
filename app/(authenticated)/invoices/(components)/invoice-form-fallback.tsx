import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function FieldSkeleton() {
    return (
        <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
        </div>
    );
}

/** Placeholder for the new/edit invoice form while its data loads. */
export function InvoiceFormFallback() {
    return (
        <div className="flex flex-col gap-4" aria-busy="true">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-32 rounded-md" />
                </div>
            </div>

            <Card>
                <CardContent className="p-5 grid grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <FieldSkeleton key={i} />)}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-5 flex flex-col gap-2">
                    <Skeleton className="h-5 w-28 mb-2" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="grid grid-cols-[1fr_80px_110px_120px_100px_32px] gap-2">
                            <Skeleton className="h-9 rounded-md" />
                            <Skeleton className="h-9 rounded-md" />
                            <Skeleton className="h-9 rounded-md" />
                            <Skeleton className="h-9 rounded-md" />
                            <Skeleton className="h-9 rounded-md" />
                            <span />
                        </div>
                    ))}
                    <Skeleton className="h-10 w-full mt-1 rounded-md" />
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-5 flex flex-col gap-3">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-[120px] w-full rounded-md" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex flex-col gap-3">
                        <Skeleton className="h-5 w-20 mb-1" />
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-20" /></div>
                        ))}
                        <div className="flex justify-between border-t border-border pt-3"><Skeleton className="h-5 w-14" /><Skeleton className="h-5 w-24" /></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
