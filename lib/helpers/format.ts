import { format, isValid, parseISO, differenceInDays } from "date-fns";
import { formatMoney as formatMoneyAmount } from "@/lib/money";

export function formatMoney(value: number, currency: string, locale?: string) {
    return formatMoneyAmount(value, currency, locale);
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

export function formatLocalDate(
    dateStr: string | undefined | null,
    locale = "en",
    options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
) {
    if (!dateStr) return "—";
    const d = parseISO(dateStr);
    return isValid(d) ? new Intl.DateTimeFormat(locale, options).format(d) : "—";
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