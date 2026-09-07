import {
  addYears,
  addMonths,
  differenceInCalendarDays,
  differenceInYears,
  setYear,
  isLeapYear,
  startOfDay,
} from 'date-fns';
import type { LocalDate, MomentoEvent, RecurrenceType } from '@types';

// ─── LocalDate helpers ────────────────────────────────────────────────────────

/** Convert a LocalDate to a JS Date. Defaults year to the given base year if absent. */
export function localDateToDate(ld: LocalDate, baseYear = new Date().getFullYear()): Date {
  const year = ld.year ?? baseYear;
  // Guard against Feb 29 in non-leap years
  const day = (ld.month === 2 && ld.day === 29 && !isLeapYear(new Date(year, 0))) ? 28 : ld.day;
  return new Date(year, ld.month - 1, day);
}

// ─── Recurrence / next occurrence ────────────────────────────────────────────

/**
 * Given a recurring event date and a reference point, return the next occurrence
 * on or after `from`. Returns null for non-recurring events (use the date as-is).
 */
export function nextOccurrence(
  date: LocalDate,
  recurrenceType: RecurrenceType,
  from: Date = new Date()
): Date {
  const fromDay = startOfDay(from);

  if (recurrenceType === 'yearly') {
    // Try this calendar year first
    let candidate = localDateToDate(date, fromDay.getFullYear());
    if (startOfDay(candidate) < fromDay) {
      candidate = localDateToDate(date, fromDay.getFullYear() + 1);
    }
    return candidate;
  }

  if (recurrenceType === 'monthly') {
    let candidate = new Date(fromDay.getFullYear(), fromDay.getMonth(), date.day);
    if (startOfDay(candidate) < fromDay) {
      candidate = addMonths(candidate, 1);
    }
    return candidate;
  }

  // 'none' — one-time event; next occurrence is the event date itself
  return localDateToDate(date, date.year ?? fromDay.getFullYear());
}

/**
 * Days until a target date from a reference point.
 * Returns 0 for today, 1 for tomorrow. Always non-negative.
 */
export function daysUntil(target: Date, from: Date = new Date()): number {
  return Math.max(0, differenceInCalendarDays(startOfDay(target), startOfDay(from)));
}

// ─── Age / duration calculations ─────────────────────────────────────────────

/**
 * Age (in complete years) on a given date. Returns null if birthday year is unknown.
 */
export function ageOnDate(birthday: LocalDate, on: Date = new Date()): number | null {
  if (birthday.year === undefined) return null;
  const bDay = localDateToDate(birthday, birthday.year);
  return differenceInYears(on, bDay);
}

/**
 * Age they will be turning on their next birthday from `from`.
 * Returns null if birthday year is unknown.
 */
export function turningAge(birthday: LocalDate, from: Date = new Date()): number | null {
  if (birthday.year === undefined) return null;
  const next = nextOccurrence(birthday, 'yearly', from);
  return differenceInYears(next, localDateToDate(birthday, birthday.year));
}

/**
 * Full years elapsed since an event date. Used for anniversaries.
 * Returns null if date year is unknown.
 */
export function yearsSince(date: LocalDate, on: Date = new Date()): number | null {
  if (date.year === undefined) return null;
  return differenceInYears(on, localDateToDate(date, date.year));
}

/**
 * Years that will have elapsed on the next occurrence.
 * Used for anniversary cards: "5 years together".
 */
export function yearsOnNextOccurrence(date: LocalDate, from: Date = new Date()): number | null {
  if (date.year === undefined) return null;
  const next = nextOccurrence(date, 'yearly', from);
  return differenceInYears(next, localDateToDate(date, date.year));
}

// ─── Milestone detection ──────────────────────────────────────────────────────

const MILESTONE_YEARS = new Set([1, 2, 5, 10, 15, 18, 20, 21, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100]);
const MILESTONE_DAYS = new Set([50, 100, 200, 365, 500, 1000]);

export function isMilestoneYear(years: number): boolean {
  return MILESTONE_YEARS.has(years);
}

export function isMilestoneDay(days: number): boolean {
  return MILESTONE_DAYS.has(days);
}

export function milestoneLabel(years: number): string | null {
  const labels: Record<number, string> = {
    1:   '1 year',
    2:   '2 years',
    5:   '5 years',
    10:  '10 years',
    15:  '15 years',
    18:  '18 years',
    20:  '20 years',
    21:  '21 years',
    25:  'Silver — 25 years',
    30:  '30 years',
    40:  'Ruby — 40 years',
    50:  'Golden — 50 years',
    60:  'Diamond — 60 years',
    70:  '70 years',
    75:  '75 years',
    80:  '80 years',
    90:  '90 years',
    100: 'Centenary — 100 years',
  };
  return labels[years] ?? null;
}

// ─── On This Day ──────────────────────────────────────────────────────────────

/**
 * Return events whose month/day matches today (or `on`), from any past year.
 * Only returns events that have a known year in the past.
 */
export function onThisDayFilter(events: MomentoEvent[], on: Date = new Date()): MomentoEvent[] {
  const month = on.getMonth() + 1;
  const day = on.getDate();
  const thisYear = on.getFullYear();

  return events.filter(e => {
    if (!e.date.year || e.date.year >= thisYear) return false;
    return e.date.month === month && e.date.day === day;
  });
}

// ─── Display formatting ──────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function formatLocalDate(ld: LocalDate, style: 'short' | 'long' = 'long'): string {
  const months = style === 'long' ? MONTHS_LONG : MONTHS_SHORT;
  const month = months[ld.month - 1];
  return ld.year ? `${month} ${ld.day}, ${ld.year}` : `${month} ${ld.day}`;
}

export function formatDate(date: Date, style: 'short' | 'long' = 'long'): string {
  const months = style === 'long' ? MONTHS_LONG : MONTHS_SHORT;
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ─── Countdown formatting ────────────────────────────────────────────────────

export function formatCountdown(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 7)  return `in ${days} days`;
  if (days < 14) return 'in 1 week';
  const weeks = Math.round(days / 7);
  if (days < 60) return `in ${weeks} weeks`;
  const months = Math.round(days / 30);
  return `in ${months} months`;
}
