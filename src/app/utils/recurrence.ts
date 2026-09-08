import { nextOccurrence, localDateToDate } from '@utils/dates';
import type { MomentoEvent } from '@types';

/**
 * Get the next N future occurrences of a recurring event from a reference date.
 * For non-recurring events, returns the event date if it's in the future.
 */
export function getNextOccurrences(
  event: MomentoEvent,
  count: number,
  from: Date = new Date()
): Date[] {
  const recurrenceType = event.recurrence.type;

  if (recurrenceType === 'none') {
    const date = localDateToDate(event.date, event.date.year ?? from.getFullYear());
    return date > from ? [date] : [];
  }

  const results: Date[] = [];
  let cursor = from;

  for (let i = 0; i < count; i++) {
    const next = nextOccurrence(event.date, recurrenceType, cursor);
    results.push(next);
    // Move cursor one day past this occurrence to get the next one
    cursor = new Date(next.getTime() + 24 * 60 * 60 * 1000);
  }

  return results;
}

/**
 * Get past occurrences of a recurring event up to `upTo`.
 * Yearly events are capped at the last 10 years to keep the timeline manageable.
 */
export function getPastOccurrences(
  event: MomentoEvent,
  upTo: Date = new Date(),
  maxYears = 10
): Date[] {
  if (!event.date.year) return [];

  const results: Date[] = [];
  const recurrenceType = event.recurrence.type;

  if (recurrenceType === 'none') {
    const date = localDateToDate(event.date, event.date.year);
    return date < upTo ? [date] : [];
  }

  if (recurrenceType === 'yearly') {
    const startYear = Math.max(event.date.year, upTo.getFullYear() - maxYears + 1);
    for (let year = startYear; year <= upTo.getFullYear(); year++) {
      const occurrence = localDateToDate({ ...event.date, year });
      if (occurrence <= upTo) results.push(occurrence);
    }
  }

  if (recurrenceType === 'monthly') {
    let cursor = localDateToDate(event.date, event.date.year);
    while (cursor < upTo) {
      results.push(new Date(cursor));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    }
  }

  return results;
}

/**
 * Get all timeline occurrences for an event — both past and upcoming.
 *
 * - One-time events: always included regardless of date
 * - Yearly events: last 10 years + next 1 year; works even when origin year is unknown
 * - Monthly events: last 12 months + next 3 months
 */
export function getAllTimelineOccurrences(
  event: MomentoEvent,
  today: Date = new Date(),
  maxPastYears = 10,
  maxFutureYears = 1
): Date[] {
  const recurrenceType = event.recurrence.type;

  if (recurrenceType === 'none') {
    const year = event.date.year ?? today.getFullYear();
    return [localDateToDate(event.date, year)];
  }

  if (recurrenceType === 'yearly') {
    const currentYear = today.getFullYear();
    const startYear = event.date.year
      ? Math.max(event.date.year, currentYear - maxPastYears + 1)
      : currentYear - maxPastYears + 1;
    const endYear = currentYear + maxFutureYears;

    const results: Date[] = [];
    for (let year = startYear; year <= endYear; year++) {
      results.push(localDateToDate({ ...event.date, year }));
    }
    return results;
  }

  if (recurrenceType === 'monthly') {
    const originYear = event.date.year ?? today.getFullYear();
    const windowStart = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const windowEnd   = new Date(today.getFullYear(), today.getMonth() + 3, 28);

    let cursor = localDateToDate(event.date, originYear);
    while (cursor < windowStart) {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    }

    const results: Date[] = [];
    while (cursor <= windowEnd) {
      results.push(new Date(cursor));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    }
    return results;
  }

  return [];
}
