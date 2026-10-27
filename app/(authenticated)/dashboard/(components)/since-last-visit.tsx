import { HistoryIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardCoreData } from "@/lib/data/dashboard";
import { getSinceLastVisit } from "@/lib/dashboard/since-last-visit";
import { daysBetween, formatMoneyByCurrency, todayISO } from "@/lib/money";

/** A one-line catch-up after time away. Hidden when nothing happened. */
export function SinceLastVisit({ data, previousVisit, locale, currency }: {
    data: DashboardCoreData;
    previousVisit: string | null;
    locale: string;
    currency: string;
}) {
    if (!previousVisit) return null;
    const today = todayISO();
    const days = daysBetween(today, previousVisit);
    if (days < 1) return null;

    const summary = getSinceLastVisit(data, previousVisit, today);
    if (summary.isEmpty) return null;

    const parts = [
        summary.paid.count > 0 && `${formatMoneyByCurrency(summary.paid.totals, locale, currency)} paid (${summary.paid.count} ${summary.paid.count === 1 ? "invoice" : "invoices"})`,
        summary.becameOverdue.count > 0 && `${summary.becameOverdue.count} ${summary.becameOverdue.count === 1 ? "invoice" : "invoices"} went overdue`,
        summary.deadlinesMissed > 0 && `${summary.deadlinesMissed} task ${summary.deadlinesMissed === 1 ? "deadline" : "deadlines"} passed`,
        summary.tasksDone > 0 && `${summary.tasksDone} ${summary.tasksDone === 1 ? "task" : "tasks"} finished`,
    ].filter(Boolean);

    return (
        <Card className="flex flex-row items-center gap-3 px-4 py-3">
            <HistoryIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-[14px] text-foreground">
                <span className="font-medium">Since your last visit {days === 1 ? "yesterday" : `${days} days ago`}:</span>{" "}
                {parts.join(" · ")}
            </p>
        </Card>
    );
}
