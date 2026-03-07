import { format, isValid, parseISO, differenceInDays } from "date-fns";

export function formatMoney(value: number, currency: string) {
    return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
    }).format(value);
}

export function formatDate(dateStr: string | undefined | null, fmt: string) {
    if (!dateStr) return "—";
    try {
        const d = parseISO(dateStr);
        return isValid(d) ? format(d, fmt) : "—";
    } catch {
        return "—";
    }
}

export function relativeDays(dateStr: string | undefined | null): string {
    if (!dateStr) return "—";
    try {
        const d = parseISO(dateStr);
        if (!isValid(d)) return "—";
        const days = differenceInDays(new Date(), d);
        if (days === 0) return "Today";
        if (days === 1) return "1d ago";
        return `${days}d ago`;
    } catch {
        return "—";
    }
}