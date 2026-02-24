import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

async function Portfolio() {
    return (
        <div>
            <h1>Portfolio coming soon</h1>
        </div>
    )
}

function PortfolioFallback() {
    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-64" />
        </div>
    );
}

export default function PortfolioPage() {
    return (
        <Suspense fallback={<PortfolioFallback />}>
            <Portfolio />
        </Suspense>
    );
}