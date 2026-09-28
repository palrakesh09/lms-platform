// Single source of truth for every rounding/zero-safety rule used across analytics.service.js, so no
// two endpoints can silently disagree about how a percentage is computed.

// Never NaN, Infinity, undefined, or negative. Rounds to one decimal, matching Phase 8/9's convention.
export const safePercent = (numerator, denominator) =>
  !denominator ? 0 : Math.max(0, Math.round((numerator / denominator) * 1000) / 10);

export const safeAverage = (values) => (values.length === 0 ? 0 : safePercent(values.reduce((a, b) => a + b, 0), values.length));

// Midnight UTC, `days` ago — timezone-safe because it never touches the server's local timezone.
export const rangeStart = (days) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - (days - 1));
  return date;
};

// "2026-09-22" in UTC — used as both the $dateToString format and the JS-side bucket key, so backend
// grouping and the days-of-range fill-in (see buildDailySeries) always agree on key format.
export const DAY_KEY_FORMAT = '%Y-%m-%d';
export const dayKeyOf = (date) => new Date(date).toISOString().slice(0, 10);

// Ensures the frontend chart always gets one point per day in the range, even for days with zero
// activity — the aggregation's $group only produces rows for days that HAD data.
export const buildDailySeries = (days, rowsByDay, fields) => {
  const start = rangeStart(days);
  const series = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + i);
    const key = dayKeyOf(date);
    const row = rowsByDay.get(key);
    series.push({ date: key, ...Object.fromEntries(fields.map((field) => [field, row?.[field] ?? 0])) });
  }
  return series;
};