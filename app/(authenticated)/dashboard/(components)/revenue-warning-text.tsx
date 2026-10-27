import type { RevenueWarning } from "@/lib/dashboard/financials";

/** One-sentence description of a revenue risk, shared by the attention strip and the revenue chart. */
export function RevenueWarningText({ warning }: { warning: RevenueWarning }) {
    switch (warning.type) {
        case "overdependence":
            return <><strong>{warning.clientName}</strong> makes up {warning.percent}% of your paid revenue</>;
        case "single_client":
            return <><strong>{warning.clientName}</strong> is your only paying client</>;
        case "top2_concentration":
            return <><strong>{warning.client1}</strong> and <strong>{warning.client2}</strong> together make up {warning.percent}% of your paid revenue</>;
        case "dormant_top_client":
            return <>Your highest earner, <strong>{warning.clientName}</strong>, is {warning.status === "archived" ? "archived" : "still a lead"}</>;
        case "overdue_concentration":
            return <><strong>{warning.clientName}</strong> holds {warning.percent}% of what you&apos;re owed</>;
    }
}
