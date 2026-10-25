/** Amounts grouped by ISO currency. Never collapse this into one number. */
export type MoneyByCurrency = Record<string, number>;

export function roundMoney(value: number) {
    return Math.round(value * 100) / 100;
}

export function todayISO(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function addDaysISO(iso: string, days: number) {
    const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return date.toISOString().slice(0, 10);
}

export function daysBetween(later: string, earlier: string) {
    const ms = Date.parse(later.slice(0, 10)) - Date.parse(earlier.slice(0, 10));
    return Math.round(ms / 86_400_000);
}

/** Inclusive month containing `today`, plus the previous month. Compared as yyyy-MM-dd. */
export function monthRange(today: string) {
    const start = `${today.slice(0, 7)}-01`;
    const end = addDaysISO(addDaysISO(start, 32).slice(0, 7) + "-01", -1);
    const previousEnd = addDaysISO(start, -1);
    const previousStart = `${previousEnd.slice(0, 7)}-01`;
    return { start, end, previousStart, previousEnd: previousEnd };
}

export function isOnOrBetween(value: string | null | undefined, start: string, end: string) {
    if (!value) return false;
    const day = value.slice(0, 10);
    return day >= start && day <= end;
}

export function currencyOf(record: { currency?: string | null }, fallback = "USD") {
    return record.currency || fallback;
}

export function sumByCurrency<T>(
    items: T[],
    amount: (item: T) => number,
    currency: (item: T) => string
): MoneyByCurrency {
    const totals: MoneyByCurrency = {};
    for (const item of items) {
        const value = amount(item);
        if (!Number.isFinite(value)) continue;
        const code = currency(item) || "USD";
        totals[code] = roundMoney((totals[code] ?? 0) + value);
    }
    return totals;
}

export function dominantCurrency(totals: MoneyByCurrency) {
    const entries = Object.entries(totals).filter(([, amount]) => amount > 0);
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return entries[0]?.[0] ?? null;
}

export function exceptCurrency(totals: MoneyByCurrency, currency: string | null) {
    if (!currency) return { ...totals };
    return Object.fromEntries(Object.entries(totals).filter(([code]) => code !== currency));
}

export function formatMoney(amount: number, currency: string, locale = "en") {
    return Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency || "USD",
    }).format(Number.isFinite(amount) ? amount : 0);
}

export function currencySymbol(currency: string, locale = "en") {
    return Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency || "USD",
        currencyDisplay: "narrowSymbol",
    }).formatToParts(0).find((part) => part.type === "currency")?.value ?? currency;
}

/** Joins one figure per currency. An empty total is zero in `fallbackCurrency`. */
export function formatMoneyByCurrency(totals: MoneyByCurrency, locale = "en", fallbackCurrency = "USD") {
    const entries = Object.entries(totals).filter(([, amount]) => amount !== 0);
    if (entries.length === 0) return formatMoney(0, fallbackCurrency, locale);
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    return entries.map(([currency, amount]) => formatMoney(amount, currency, locale)).join(" · ");
}

export function percentChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? "+∞" : "0%";
    const pct = ((current - previous) / previous) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(0)}%`;
}

/** A combined percentage only exists when both sides are a single shared currency. */
export function comparableChange(current: MoneyByCurrency, previous: MoneyByCurrency) {
    const currencies = new Set([...Object.keys(current), ...Object.keys(previous)]);
    if (currencies.size !== 1) return null;
    const currency = [...currencies][0];
    return percentChange(current[currency] ?? 0, previous[currency] ?? 0);
}
