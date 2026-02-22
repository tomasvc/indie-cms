import { Suspense } from "react";

async function Invoices() {
    return (
        <div>
            <h1>Invoices coming soon</h1>
        </div>
    )
}

export default function InvoicesPage() {
    return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
            <Invoices />
        </Suspense>
    );
}