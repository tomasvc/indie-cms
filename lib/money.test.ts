import assert from "node:assert/strict";
import {
    addDaysISO,
    comparableChange,
    formatMoney,
    formatMoneyByCurrency,
    isOnOrBetween,
    monthRange,
    sumByCurrency,
    todayISO,
} from "./money.ts";

const january = monthRange("2026-01-15");
assert.deepEqual(january, {
    start: "2026-01-01",
    end: "2026-01-31",
    previousStart: "2025-12-01",
    previousEnd: "2025-12-31",
});

const march = monthRange("2026-03-31");
assert.equal(march.start, "2026-03-01");
assert.equal(march.end, "2026-03-31");
assert.equal(march.previousEnd, "2026-02-28");

assert.equal(addDaysISO("2026-02-28", 1), "2026-03-01");
assert.equal(monthRange("2024-03-01").previousEnd, "2024-02-29");
assert.equal(isOnOrBetween("2026-10-01T00:00:00.000Z", "2026-10-01", "2026-10-31"), true);
assert.equal(isOnOrBetween("2026-09-30", "2026-10-01", "2026-10-31"), false);

const totals = sumByCurrency(
    [
        { currency: "USD", total: 10 },
        { currency: "GBP", total: 5 },
        { currency: "USD", total: 2.5 },
    ],
    (item) => item.total,
    (item) => item.currency
);
assert.deepEqual(totals, { USD: 12.5, GBP: 5 });
assert.equal(formatMoneyByCurrency(totals, "en-US").includes("£"), true);
assert.equal(formatMoneyByCurrency(totals, "en-US").includes("$"), true);
assert.equal(comparableChange({ USD: 10 }, { USD: 5 }), "+100%");
assert.equal(comparableChange({ USD: 10, GBP: 5 }, { USD: 5 }), null);
assert.equal(formatMoney(0, "USD", "en-US"), "$0.00");

assert.match(todayISO(new Date(2026, 0, 2)), /^2026-01-02$/);

console.log("money tests passed");
