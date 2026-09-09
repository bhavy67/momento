// ─── Date types ───────────────────────────────────────────────────────────────

/**
 * A calendar date without time, stored as three numeric fields.
 * Month is 1-indexed (1 = January). Year is optional for birthdays
 * where only month and day are known.
 */
export interface LocalDate {
  year?: number;
  month: number;
  day: number;
}

// ─── Enums / unions ───────────────────────────────────────────────────────────

export type Relationship = 'family' | 'friend' | 'partner' | 'colleague' | 'other';

export type EventType = 'birthday' | 'anniversary' | 'milestone' | 'custom';

export type RecurrenceType = 'none' | 'yearly' | 'monthly';

export type GiftStatus = 'idea' | 'planned' | 'purchased' | 'given';

export type Theme = 'light' | 'dark' | 'system';

// ─── Recurrence ───────────────────────────────────────────────────────────────

export interface RecurrenceRule {
  type: RecurrenceType;
}

// ─── Entities (stored in IndexedDB) ──────────────────────────────────────────

export interface Person {
  id: string;
  name: string;
  relationship: Relationship;
  birthday?: LocalDate;
  notes?: string;
  tags: string[];
  createdAt: number; // Unix ms
  updatedAt: number; // Unix ms
}

/** Using MomentoEvent to avoid collision with the browser built-in Event type */
export interface MomentoEvent {
  id: string;
  title: string;
  type: EventType;
  date: LocalDate; // year required on events (unlike Person.birthday)
  personIds: string[];
  description?: string;
  recurrence: RecurrenceRule;
  tags: string[];
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Memory {
  id: string;
  title?: string;
  note: string;
  date: number;        // Unix ms — represents a specific past moment
  personIds: string[];
  eventId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Gift {
  id: string;
  personId: string;
  year: number;
  description: string;
  status: GiftStatus;
  eventId?: string;
  price?: number;
  notes?: string;
  givenAt?: number;    // Unix ms
  createdAt: number;
  updatedAt: number;
}

// ─── Settings (stored in localStorage) ───────────────────────────────────────

export interface Settings {
  theme: Theme;
  dateFormat: 'dmy' | 'mdy';
  upcomingWindowDays: number;
  notificationsEnabled: boolean;
  reminderDays: number[]; // days before the event to show a browser notification
}

// ─── Derived / computed types (never stored) ─────────────────────────────────

export interface UpcomingEvent {
  event: MomentoEvent;
  person?: Person;
  daysUntil: number;
  nextOccurrence: Date;
  age?: number;          // for birthdays: age they will be turning (null if year unknown)
  yearsCount?: number;   // for anniversaries: number of years
  isMilestone: boolean;
  milestoneLabel?: string;
}

export interface OnThisDayEntry {
  event: MomentoEvent;
  person?: Person;
  yearsAgo: number;
  occurrenceDate: Date;
}

export interface SearchResults {
  people: Person[];
  events: MomentoEvent[];
  memories: Memory[];
  gifts: Gift[];
}

// ─── Backup / restore ────────────────────────────────────────────────────────

export interface BackupData {
  version: number;
  exportedAt: number;
  data: {
    people: Person[];
    events: MomentoEvent[];
    memories: Memory[];
    gifts: Gift[];
  };
}

// ─── Notification toast ───────────────────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}
