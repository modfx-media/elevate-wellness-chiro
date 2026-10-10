const CLINIC_TIME_ZONE = "America/Denver";

/**
 * Payload stores the date picker value with `Date.toISOString()`.
 * A UTC+8 browser selecting local midnight (the start of the chosen day)
 * is saved as 16:00Z on the previous UTC day. The weekly posts are Mondays;
 * those two saved instants are the Sunday before.
 */
const UTC_PLUS_8_MIDNIGHT = /^(\d{4}-\d{2}-\d{2})T16:00:00(?:\.\d+)?(?:Z|\+00:00)$/;
const UTC_DATE_ONLY = /^(\d{4}-\d{2}-\d{2})(?:T00:00:00(?:\.\d+)?(?:Z|\+00:00))?$/;

function formatDayInTimeZone(time: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(time));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

function addUtcDays(day: string, days: number): string {
  const [year, month, date] = day.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, date));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

/** Clinic calendar day for "today", used to hold back future-dated posts. */
export function clinicCalendarDay(now: number = Date.now()): string {
  return formatDayInTimeZone(now, CLINIC_TIME_ZONE);
}

/**
 * Calendar day to show for a publish timestamp.
 * Date-only UTC midnight keeps that date (a US timezone must not move it back a day).
 * Timed values use America/Denver, except UTC+8 local midnight, which is the next UTC day.
 */
export function publishCalendarDay(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const shifted = trimmed.match(UTC_PLUS_8_MIDNIGHT);
  if (shifted) return addUtcDays(shifted[1], 1);

  const dateOnly = trimmed.match(UTC_DATE_ONLY);
  if (dateOnly) return dateOnly[1];

  const time = Date.parse(trimmed);
  if (Number.isNaN(time)) return undefined;
  return formatDayInTimeZone(time, CLINIC_TIME_ZONE);
}

/** Hidden until the shown calendar day, in the clinic's timezone. */
export function isScheduledInFuture(value: string | null | undefined, now: number = Date.now()): boolean {
  const day = publishCalendarDay(value);
  if (!day) return false;
  return day > clinicCalendarDay(now);
}

export function publishSortTime(value: string | null | undefined): number {
  const day = publishCalendarDay(value);
  if (!day) return 0;
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date);
}

export function formatPublishDate(value: string, style: "long" | "short"): string {
  const day = publishCalendarDay(value);
  if (!day) return "";
  const [year, month, date] = day.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(year, month - 1, date, 12, 0, 0));
  return noonUtc.toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
