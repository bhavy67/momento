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
 * Get all past occurrences of a recurring event, from the event's origin year
 * up to (but not including) the current year. Used for the Timeline view.
 */
export function getPastOccurrences(
  event: MomentoEvent,
  upTo: Date = new Date()
): Date[] {
  if (!event.date.year) return [];

  const results: Date[] = [];
  const recurrenceType = event.recurrence.type;

  if (recurrenceType === 'none') {
    const date = localDateToDate(event.date, event.date.year);
    return date < upTo ? [date] : [];
  }

  if (recurrenceType === 'yearly') {
    for (let year = event.date.year; year < upTo.getFullYear(); year++) {
      const occurrence = localDateToDate(event.date, year);
      if (occurrence < upTo) results.push(occurrence);
    }
  }

  // Monthly recurrence: generate from origin up to upTo
  if (recurrenceType === 'monthly') {
    let cursor = localDateToDate(event.date, event.date.year);
    while (cursor < upTo) {
      results.push(new Date(cursor));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    }
  }

  return results;
}
