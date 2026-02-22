import { Suspense } from "react";

async function Portfolio() {
    return (
        <div>
            <h1>Portfolio coming soon</h1>
        </div>
    )
}

export default function PortfolioPage() {
    return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
            <Portfolio />
        </Suspense>
    );
}