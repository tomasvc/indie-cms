import type { DashboardCoreData } from "@/lib/data/dashboard";
import { invoiceTotal, isOutstanding, isRevenue } from "@/lib/helpers/invoices";
import { currencyOf, sumByCurrency, todayISO, type MoneyByCurrency } from "@/lib/money";

export type SinceLastVisit = {
    /** yyyy-MM-dd of the previous visit. */
    since: string;
    paid: { count: number; totals: MoneyByCurrency };
    becameOverdue: { count: number; totals: MoneyByCurrency };
    tasksDone: number;
    deadlinesMissed: number;
    isEmpty: boolean;
};

/** What changed between the previous dashboard visit and today. */
export function getSinceLastVisit(data: DashboardCoreData, previousVisit: string, today = todayISO()): SinceLastVisit {
    const since = previousVisit.slice(0, 10);
    const inGap = (date?: string | null) => !!date && date.slice(0, 10) >= since && date.slice(0, 10) <= today;

    const paid = data.invoices.filter((invoice) => isRevenue(invoice) && inGap(invoice.paid_date));
    // Overdue starts the day after the due date
    const becameOverdue = data.invoices.filter(
        (invoice) => isOutstanding(invoice) && !!invoice.due_date && invoice.due_date.slice(0, 10) >= since && invoice.due_date.slice(0, 10) < today
    );
    const tasksDone = data.tasks.filter((task) => task.status === "done" && inGap(task.completed_date)).length;
    const deadlinesMissed = data.tasks.filter(
        (task) => task.status !== "done" && !!task.due_date && task.due_date.slice(0, 10) >= since && task.due_date.slice(0, 10) < today
    ).length;

    return {
        since,
        paid: { count: paid.length, totals: sumByCurrency(paid, invoiceTotal, currencyOf) },
        becameOverdue: { count: becameOverdue.length, totals: sumByCurrency(becameOverdue, invoiceTotal, currencyOf) },
        tasksDone,
        deadlinesMissed,
        isEmpty: paid.length + becameOverdue.length + tasksDone + deadlinesMissed === 0,
    };
}
