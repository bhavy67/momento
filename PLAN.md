# Momento — Implementation Plan

This is the living development plan. Phases are sequential. Each phase has a clear goal, deliverables, technical decisions, and done criteria. Update this document as decisions change.

**Theme and brand identity is deferred intentionally.** The design token system is built for easy swapping from day one. Colors, logo, and typography are decided after seeing real components in context.

---

## Phase Overview

| Phase | Name | Goal |
|---|---|---|
| 0 | Foundation | Scaffold, config, DB layer, app shell |
| 1 | People & Events | Core data — CRUD for the two primary entities |
| 2 | Home Screen | The first useful screen — upcoming, today, on this day |
| 3 | Person Detail | Rich person profile with all context |
| 4 | Gifts & Memories | What makes Momento different from a birthday app |
| 5 | Timeline | Chronological view of all moments |
| 6 | Search | Find anything instantly |
| 7 | Settings & Backup | Export, import, clear, preferences |
| 8 | Theme & Brand | Try palettes, pick identity, apply logo/typography |
| 9 | PWA & Offline Polish | Installable, offline-ready, production-grade |

---

## Cross-Cutting Concerns

These apply across every phase. Decide them now, apply them from day one.

### Theming system

**Critical decision: CSS custom properties for everything.**

Since brand identity is undecided, every color token in the app must go through a CSS variable. No hardcoded color values in components or Tailwind classes — only semantic tokens.

```css
/* styles.css — the only place raw colors appear */
:root {
  --color-bg:           #F9F8F5;
  --color-surface:      #FFFFFF;
  --color-surface-2:    #F4F3EF;
  --color-text-primary: #1C1C1A;
  --color-text-muted:   #6B6B67;
  --color-text-faint:   #A8A8A3;
  --color-border:       #E8E8E3;
  --color-accent:       #C96A2E;      /* placeholder — will change */
  --color-accent-bg:    #F5EDE4;      /* placeholder */
  --color-success:      #3D9E6A;
  --color-warning:      #D4A017;
  --color-danger:       #C0392B;
}

[data-theme="dark"] {
  --color-bg:           #141412;
  --color-surface:      #1E1E1B;
  /* ... */
}
```

In Tailwind v4 — map these via `@theme` so you get `bg-surface`, `text-primary`, `border-border` utility classes:

```css
@theme {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-accent: var(--color-accent);
  /* ... */
}
```

When we pick the final brand palette in Phase 8, we change only `styles.css`. Every component inherits the change automatically.

**Dark mode:** Applied via `[data-theme="dark"]` on `<html>`. Controlled by `SettingsService`. Also respects `prefers-color-scheme` on first load.

### Change detection

Every component uses `ChangeDetectionStrategy.OnPush`. No exceptions. With signals, Angular's signal-based change detection handles updates automatically. OnPush prevents unnecessary re-renders.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

### Dependency injection

Always use `inject()` — never constructor parameter injection.

```typescript
// Correct
export class MyComponent {
  private people = inject(PeopleService);
}

// Never
export class MyComponent {
  constructor(private people: PeopleService) {}
}
```

### Control flow

Always use new Angular control flow. Never `*ngIf`, `*ngFor`, `*ngSwitch`.

```html
@if (people().length) {
  <ul>
    @for (person of people(); track person.id) {
      <li>{{ person.name }}</li>
    }
  </ul>
} @else {
  <app-empty-state />
}
```

### Mobile-first layout

Every component starts with the mobile layout. Desktop enhancements are added via `md:` / `lg:` Tailwind prefixes. Never design desktop first and shrink down.

Touch targets: minimum `44px × 44px` for all interactive elements on mobile.

### Accessibility baseline

- Semantic HTML: correct element types, heading hierarchy (`h1` → `h2` → `h3` — never skip)
- ARIA only where semantic HTML is insufficient
- Every form field has a visible label (no placeholder-only labels)
- Focus is managed when modals and sheets open/close (Angular CDK `FocusTrap`)
- Icons used alone always have `aria-label` or accompanying visually hidden text
- Keyboard navigation works for all interactive elements

### Forms

Reactive Forms everywhere. Template-driven forms are not used. Reactive gives:
- Full TypeScript typing
- Composable validation
- Easy unit testing
- Consistent state management

Use `FormBuilder` via `inject(FormBuilder)`.

### Error handling

No error is silently swallowed. Every Dexie operation is wrapped in try/catch. Errors surface in the UI via a `NotificationService` (toast/snackbar). Never `console.error` and move on.

---

## Phase 0 — Foundation

**Goal:** A running Angular app with the full project scaffold, working DB layer, typed schema, and the app shell rendering. No feature screens yet.

**Time estimate:** ~1 focused session.

---

### 0.1 — Angular project scaffold

```bash
ng new momento \
  --standalone \
  --routing \
  --style=css \
  --strict \
  --skip-tests=false
```

Flags explained:
- `--standalone` — no NgModules, all components standalone
- `--routing` — generate router config
- `--style=css` — we use Tailwind, so CSS (not SCSS)
- `--strict` — strictPropertyInitialization, strictNullChecks, strictTemplates, noImplicitAny
- `--skip-tests=false` — generate spec files

Immediately after:
- Delete boilerplate: `app.component.html` content, `app.component.spec.ts` boilerplate test
- Set up TypeScript path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*":     ["src/app/*"],
      "@core/*":    ["src/app/core/*"],
      "@features/*": ["src/app/features/*"],
      "@shared/*":  ["src/app/shared/*"],
      "@utils/*":   ["src/app/utils/*"],
      "@types/*":   ["src/app/types/*"]
    }
  }
}
```

- Configure `angular.json` to allow path aliases (add `moduleResolution: "bundler"` if needed)

---

### 0.2 — Tailwind CSS v4

Install and configure Tailwind v4:

```bash
npm install tailwindcss @tailwindcss/vite
```

Configure in `angular.json` (add Vite plugin) or use the PostCSS approach depending on Angular version's Vite integration.

`styles.css`:
```css
@import "tailwindcss";

@theme {
  /* Map CSS custom properties into Tailwind's design system */
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-surface-2: var(--color-surface-2);
  --color-text-primary: var(--color-text-primary);
  --color-text-muted: var(--color-text-muted);
  --color-text-faint: var(--color-text-faint);
  --color-border: var(--color-border);
  --color-accent: var(--color-accent);
  --color-accent-bg: var(--color-accent-bg);
  --color-success: var(--color-success);
  --color-warning: var(--color-warning);
  --color-danger: var(--color-danger);

  /* Typography */
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'DM Serif Display', Georgia, serif;  /* placeholder — will be decided in Phase 8 */

  /* Spacing / border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

/* Placeholder theme tokens — will be finalised in Phase 8 */
:root {
  --color-bg:           #F9F8F5;
  --color-surface:      #FFFFFF;
  --color-surface-2:    #F4F3EF;
  --color-text-primary: #1C1C1A;
  --color-text-muted:   #6B6B67;
  --color-text-faint:   #A8A8A3;
  --color-border:       #E8E8E3;
  --color-accent:       #C96A2E;
  --color-accent-bg:    #F5EDE4;
  --color-success:      #3D9E6A;
  --color-warning:      #D4A017;
  --color-danger:       #C0392B;
}

[data-theme="dark"] {
  --color-bg:           #141412;
  --color-surface:      #1E1E1B;
  --color-surface-2:    #252522;
  --color-text-primary: #F0EFE9;
  --color-text-muted:   #9A9A95;
  --color-text-faint:   #636360;
  --color-border:       #2C2C28;
  --color-accent:       #D4763A;
  --color-accent-bg:    #2A1E15;
}

/* Global base styles */
html {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }
```

Things to verify:
- Tailwind utility classes work in component templates
- Custom color tokens resolve correctly (`bg-accent`, `text-text-primary`, etc.)
- Dark mode tokens apply when `data-theme="dark"` is on `<html>`

---

### 0.3 — Core types

`src/app/types/index.ts` — all shared interfaces and types.

```typescript
// Represents a calendar date without time. Month is 1-indexed.
export interface LocalDate {
  year?: number;   // Optional — for birthdays where year is unknown
  month: number;
  day: number;
}

export type Relationship = 'family' | 'friend' | 'partner' | 'colleague' | 'other';
export type EventType = 'birthday' | 'anniversary' | 'milestone' | 'custom';
export type RecurrenceType = 'none' | 'yearly' | 'monthly';
export type GiftStatus = 'idea' | 'planned' | 'purchased' | 'given';
export type Theme = 'light' | 'dark' | 'system';

export interface RecurrenceRule {
  type: RecurrenceType;
}

export interface Person {
  id: string;
  name: string;
  relationship: Relationship;
  birthday?: LocalDate;
  notes?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MomentoEvent {
  id: string;
  title: string;
  type: EventType;
  date: LocalDate;
  personId?: string;
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
  date: number;           // Unix ms — specific moment in time
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
  givenAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  theme: Theme;
  dateFormat: 'dmy' | 'mdy';
  upcomingWindowDays: number;
}

// Derived values — computed, never stored
export interface UpcomingEvent {
  event: MomentoEvent;
  person?: Person;
  daysUntil: number;
  nextOccurrence: Date;
  age?: number;           // for birthdays — age they will turn
  yearsCount?: number;    // for anniversaries — years it will be
  isMilestone: boolean;
  milestoneLabel?: string;
}
```

Note: `Event` is a built-in browser global. Use `MomentoEvent` to avoid the conflict.

---

### 0.4 — Database layer

**Install:**
```bash
npm install dexie
npm install --save-dev fake-indexeddb  # for testing
```

`src/app/core/db/database.service.ts`:

```typescript
import Dexie, { Table } from 'dexie';
import { Person, MomentoEvent, Memory, Gift } from '@types';

export class MomentoDB extends Dexie {
  people!: Table<Person, string>;
  events!: Table<MomentoEvent, string>;
  memories!: Table<Memory, string>;
  gifts!: Table<Gift, string>;

  constructor() {
    super('momento-db');

    this.version(1).stores({
      people:   'id, name, relationship, createdAt',
      events:   'id, type, personId, isArchived, createdAt',
      memories: 'id, eventId, date, createdAt',
      gifts:    'id, personId, year, status, createdAt',
    });
  }
}

// Singleton instance — import this directly in services
export const db = new MomentoDB();
```

**Index strategy explained:**
- Index only fields you query/sort by — Dexie indexes all listed fields
- `id` is the primary key (Dexie uses it automatically with string keys)
- `personId` on events and gifts enables efficient per-person queries
- `isArchived` on events lets us filter archived events quickly
- `year` on gifts enables per-year gift queries

**Migration pattern (for future versions):**
```typescript
this.version(2).stores({ /* new schema */ }).upgrade(tx => { /* transform data */ });
```

Never modify an existing version. Always add a new version. Dexie handles the migration automatically on open.

---

### 0.5 — Domain services

Create all six services now, even if not fully implemented. This establishes the DI graph and prevents circular dependencies later.

`src/app/core/services/people.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class PeopleService {
  private readonly db = db;

  readonly all = toSignal(
    from(liveQuery(() => this.db.people.orderBy('name').toArray())),
    { initialValue: [] as Person[] }
  );

  async add(data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = nanoid();
    await this.db.people.add({ ...data, id, createdAt: Date.now(), updatedAt: Date.now() });
    return id;
  }

  async update(id: string, data: Partial<Person>): Promise<void> {
    await this.db.people.update(id, { ...data, updatedAt: Date.now() });
  }

  async delete(id: string): Promise<void> {
    // Cascade: delete linked events, gifts, memories
    await this.db.transaction('rw', [this.db.people, this.db.events, this.db.gifts, this.db.memories], async () => {
      await Promise.all([
        this.db.events.where('personId').equals(id).delete(),
        this.db.gifts.where('personId').equals(id).delete(),
        this.db.memories.where('personIds').equals(id).delete(), // Note: array field — check Dexie multi-entry index
        this.db.people.delete(id),
      ]);
    });
  }

  getById(id: string) {
    return toSignal(
      from(liveQuery(() => this.db.people.get(id))),
      { initialValue: undefined }
    );
  }
}
```

Similarly for `EventsService`, `GiftsService`, `MemoriesService`.

`src/app/core/services/ui-state.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly quickAddOpen = signal(false);
  readonly activePersonId = signal<string | null>(null);
  readonly notification = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  openQuickAdd(): void { this.quickAddOpen.set(true); }
  closeQuickAdd(): void { this.quickAddOpen.set(false); }

  notify(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 3500);
  }
}
```

`src/app/core/services/settings.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'momento-settings';

  readonly settings = signal<Settings>(this.load());

  private load(): Settings {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? { ...this.defaults, ...JSON.parse(raw) } : this.defaults;
    } catch {
      return this.defaults;
    }
  }

  private readonly defaults: Settings = {
    theme: 'system',
    dateFormat: 'dmy',
    upcomingWindowDays: 60,
  };

  update(partial: Partial<Settings>): void {
    const next = { ...this.settings(), ...partial };
    this.settings.set(next);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(next));
    this.applyTheme(next.theme);
  }

  applyTheme(theme: Theme): void {
    const el = document.documentElement;
    if (theme === 'system') {
      el.removeAttribute('data-theme');
    } else {
      el.setAttribute('data-theme', theme);
    }
  }
}
```

---

### 0.6 — Utility functions

`src/app/utils/dates.ts` — the most important file in the codebase. All date business logic lives here.

Functions to implement:

```typescript
// Core calculations
nextOccurrence(date: LocalDate, from?: Date): Date
daysUntil(target: Date, from?: Date): number
ageOnDate(birthday: LocalDate, on?: Date): number | null  // null if year unknown
yearsSince(date: LocalDate, on?: Date): number | null
isTodayMonthDay(date: LocalDate, on?: Date): boolean

// Milestone detection
isMilestone(years: number): boolean
isMilestoneDays(days: number): boolean
milestoneLabel(years: number): string | null

// Formatting helpers (date-fns wrappers)
formatLocalDate(date: LocalDate, format?: string): string
formatCountdown(daysUntil: number): string  // "today", "tomorrow", "in 12 days"

// On This Day
onThisDayEvents(events: MomentoEvent[], on?: Date): MomentoEvent[]
```

`src/app/utils/id.ts`:
```typescript
import { nanoid } from 'nanoid';
export const generateId = () => nanoid();
```

Install nanoid: `npm install nanoid`

`src/app/utils/recurrence.ts`:
```typescript
// Given a recurring event, return next N occurrences from a given date
getNextOccurrences(event: MomentoEvent, count: number, from?: Date): Date[]
```

---

### 0.7 — App shell

The root layout handles navigation and the router outlet. On mobile: bottom nav bar. On desktop (md+): left sidebar.

`src/app/app.component.html`:
```html
<div class="app-shell">
  <!-- Desktop sidebar (hidden on mobile) -->
  <nav class="sidebar hidden md:flex">
    ...
  </nav>

  <!-- Main content -->
  <main class="content">
    <router-outlet />
  </main>

  <!-- Mobile bottom nav (hidden on md+) -->
  <nav class="bottom-nav md:hidden">
    <a routerLink="/home">Home</a>
    <a routerLink="/people">People</a>
    <a routerLink="/timeline">Timeline</a>
    <a routerLink="/settings">Settings</a>
  </nav>

  <!-- Floating action button — always visible -->
  <button class="fab" (click)="uiState.openQuickAdd()">+</button>

  <!-- Quick Add sheet -->
  @if (uiState.quickAddOpen()) {
    <app-quick-add-sheet (close)="uiState.closeQuickAdd()" />
  }

  <!-- Global notification toast -->
  @if (uiState.notification(); as notif) {
    <app-toast [message]="notif.message" [type]="notif.type" />
  }
</div>
```

Routes (`src/app/app.routes.ts`):
```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('@features/home/home.component').then(m => m.HomeComponent) },
  { path: 'people', loadComponent: () => import('@features/people/people-list/people-list.component').then(m => m.PeopleListComponent) },
  { path: 'people/:id', loadComponent: () => import('@features/people/person-detail/person-detail.component').then(m => m.PersonDetailComponent) },
  { path: 'timeline', loadComponent: () => import('@features/timeline/timeline.component').then(m => m.TimelineComponent) },
  { path: 'settings', loadComponent: () => import('@features/settings/settings.component').then(m => m.SettingsComponent) },
  { path: '**', redirectTo: 'home' },
];
```

**All routes are lazy-loaded.** This keeps the initial bundle small.

---

### 0.8 — PWA foundation

```bash
ng add @angular/pwa
```

This generates:
- `ngsw-config.json` — service worker config
- `manifest.webmanifest` — PWA manifest
- Icons in `src/assets/icons/`
- Registers the service worker in `app.config.ts`

Initial `ngsw-config.json` cache strategy:
- App shell (HTML/JS/CSS): `CacheFirst` — serve from cache, background update
- Assets (icons, fonts): `CacheFirst` with long TTL
- API calls: not applicable (local-first)

**Note:** Service worker only activates in production builds. Use `ng build && npx http-server dist/momento/browser` to test PWA locally. Never test service worker with `ng serve`.

Manifest placeholder (updated in Phase 8 with real brand):
```json
{
  "name": "Momento",
  "short_name": "Momento",
  "description": "Your memory layer for the people and moments that matter.",
  "theme_color": "#C96A2E",
  "background_color": "#F9F8F5",
  "display": "standalone",
  "start_url": "/",
  "scope": "/"
}
```

---

### Phase 0 Done Criteria

- [ ] `ng serve` runs without errors
- [ ] App shell renders with placeholder nav (no active links yet)
- [ ] Dexie DB opens in browser (verify in DevTools → Application → IndexedDB)
- [ ] All TypeScript path aliases resolve
- [ ] Tailwind classes work in a test component
- [ ] CSS custom property tokens apply correctly in light and dark mode
- [ ] `SettingsService` persists theme to localStorage and applies `data-theme` to `<html>`
- [ ] All routes are wired and lazy-load without error (even if they render nothing)

---

## Phase 1 — People & Events

**Goal:** Users can create, edit, and delete people and events. The core data model is fully functional in the DB. UI does not need to be polished — it needs to work correctly.

**Why before Home Screen:** Home screen needs data to display. Build the data layer and CRUD first so Phase 2 has something real to work with.

---

### 1.1 — Shared form components

Before building feature forms, create the shared UI primitives that all forms will use:

- `InputComponent` — text input with label, error state, hint text
- `TextareaComponent` — multiline input
- `SelectComponent` — custom select (accessible)
- `DatePickerComponent` — date input. For LocalDate, this is three fields (day, month, year) OR a native `<input type="date">` with parsing. **Decision: use three separate number inputs (day/month/year) for LocalDate, since year is optional.** Native date input does not support optional year.
- `ButtonComponent` — primary, secondary, ghost, danger variants
- `BadgeComponent` — relationship type, event type labels

These are all in `src/app/shared/components/`. They accept typed inputs, emit typed outputs, have no service dependencies.

---

### 1.2 — People CRUD

**People list** (`/people`):
- List all people sorted by name
- Each card shows: name, relationship badge, birthday countdown if available
- Search/filter inline (local filter, not full search)
- Empty state: warm, inviting message — "Add the people who matter to you"
- FAB → Quick Add sheet (or direct to new person form)

**Add/Edit person form** (sheet or dedicated route — decision: dedicated route `/people/new` and `/people/:id/edit`):
- Name (required)
- Relationship (select: Family / Friend / Partner / Colleague / Other)
- Birthday (LocalDate — day + month required; year optional)
- Notes (textarea, optional)
- Save / Cancel

**Things to consider:**
- Name validation: trim whitespace, minimum 1 character, maximum 100
- Birthday: validate day/month combination (Feb 30 should fail). Year optional — if provided, must be > 1900 and ≤ current year
- Relationship: default to 'friend' if not selected
- On delete: confirm dialog. Show what will be deleted (events, memories, gifts). Soft warning before hard delete.
- After save → navigate to person detail (Phase 3). For now, navigate back to people list.

---

### 1.3 — Events CRUD

**Event types:**
- Birthday — linked to a person, auto-recurs yearly
- Anniversary — linked to a person (or standalone), auto-recurs yearly
- Milestone — one-time or recurring
- Custom — one-time or recurring

**Add/Edit event form** (`/events/new`, `/events/:id/edit`):
- Title (required for milestone/custom; auto-generated for birthday/anniversary: "Dad's Birthday")
- Type (select)
- Date (LocalDate — all three fields required for events, unlike Person birthday)
- Person link (optional person picker — searchable dropdown)
- Description (optional)
- Recurrence (none / yearly / monthly) — auto-set to yearly for birthday/anniversary
- Tags (multi-input, optional — Phase 1.5 feature, stub the field)

**Things to consider:**
- Birthdays/anniversaries created from a person's profile should auto-link to that person
- When type is birthday or anniversary, title should auto-populate from the person's name if a person is selected: "Dad's Birthday", "Parents' Anniversary"
- Allow title override (user may want "Papa's Birthday" instead)
- Recurrence rule defaults: birthday → yearly, anniversary → yearly, milestone/custom → none (user sets it)
- Event date for birthdays: this is the actual birthday, not the next occurrence. The app calculates next occurrence.
- Event deletion: warn if the event has linked memories or gifts

---

### 1.4 — Date utilities — implement and test

This is where correctness is critical. These functions are used everywhere.

**`nextOccurrence(date: LocalDate, from: Date): Date`**

For yearly recurring events, find the next occurrence from `from`:
```
If this year's occurrence is today or in the future → return it
Otherwise → return next year's occurrence
```

Edge case: leap year birthdays (Feb 29). If the current year is not a leap year, use Feb 28.

**`daysUntil(target: Date, from: Date): number`**

Returns 0 for today, 1 for tomorrow. Always non-negative (this is "days until", not "days since").

**`ageOnDate(birthday: LocalDate, on: Date): number | null`**

Returns null if birthday.year is undefined. Otherwise: `on.year - birthday.year`, subtract 1 if the birthday hasn't happened yet this year.

**`yearsSince(date: LocalDate, on: Date): number | null`**

Returns null if date.year is undefined. Used for anniversaries.

**`isMilestone(years: number): boolean`**

True for: 1, 2, 5, 10, 15, 18, 20, 21, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100

**`milestoneLabel(years: number): string | null`**

Returns human label: "10 years", "half century", "golden anniversary" (50 years), etc.

**`onThisDayEvents(events: MomentoEvent[], on: Date): MomentoEvent[]`**

Returns events whose month/day match `on`, where `event.date.year` is in the past.

---

### Phase 1 Done Criteria

- [ ] Can create a person with all fields
- [ ] Can edit and delete a person (with confirmation)
- [ ] Can create each event type (birthday, anniversary, milestone, custom)
- [ ] Can set recurrence (none, yearly, monthly)
- [ ] Can link an event to a person
- [ ] All date utility functions have passing unit tests including edge cases (leap year, year-unknown birthday, New Year boundary)
- [ ] Data persists across page refresh and tab close
- [ ] Delete cascades correctly (delete person → events/gifts/memories also deleted)
- [ ] Form validation shows correct errors before allowing submit

---

## Phase 2 — Home Screen

**Goal:** The first genuinely useful screen. A user who has added a few people and events should immediately see value on the home screen.

**The home screen answers: What matters soon?**

---

### 2.1 — Upcoming events section

**Query:** All non-archived events with `recurrence.type !== 'none'` OR events with a future date, sorted by `daysUntil`.

For each upcoming event, compute `UpcomingEvent`:
- `daysUntil` — calculated from today
- `nextOccurrence` — the actual upcoming date
- `age` — for birthdays (how old they will be turning)
- `yearsCount` — for anniversaries
- `isMilestone` — is this a milestone occurrence
- `milestoneLabel` — human-readable milestone label

**Display window:** Configurable in settings, default 60 days.

**Card design for each upcoming event:**
- Name + event type
- Countdown: "in 12 days" / "tomorrow" / "today"
- Context: "Turning 30" (birthday) / "5 years together" (anniversary)
- Milestone badge if applicable
- Tap → event detail (Phase 3 for person context; Phase 2 just routes there)

**Ordering:** Sort by daysUntil ascending. Events today first.

---

### 2.2 — Today section

Events happening on today's exact date. This section appears only if there are events today. Otherwise hidden (not shown as empty).

If a birthday is today: show prominently. Consider a slight visual distinction from the Upcoming section.

---

### 2.3 — On This Day

Query `onThisDayEvents()` — all events where month/day matches today, in previous years.

If results exist: show a quiet, personal section at the bottom of the home screen.

```
On this day
3 years ago — You started your new job.
1 year ago  — Dad's 60th birthday.
```

If no results: section is hidden.

This section should feel like a gentle surprise, not a feature you expect. Never show it as an empty state.

---

### 2.4 — Empty state (new user)

A new user has no data. The home screen must not feel broken or empty.

Show:
- A warm welcome message
- The core value proposition in one sentence
- A clear call to action: "Add your first person" or "Add an important date"
- Not a generic illustration — something that feels personal to Momento

---

### 2.5 — Performance

The home screen query runs on every render. With a large dataset (hundreds of events over years), this must be fast.

- `liveQuery` returns sorted data from Dexie — avoid sorting in JavaScript if Dexie can do it
- `UpcomingEvent` computation is done in a `computed()` that memoizes the result
- Long lists use Angular CDK `CdkVirtualScrollViewport` if needed (unlikely for V1 scale)

---

### Phase 2 Done Criteria

- [ ] Upcoming events show correctly for sample data across all event types
- [ ] Days until countdown is accurate (test with manually set dates)
- [ ] Age and years-together calculations are correct
- [ ] Milestone badge appears for milestone events
- [ ] "Today" section appears only when events are happening today
- [ ] "On This Day" section appears only when there are past matches
- [ ] New user empty state renders correctly
- [ ] Home screen updates reactively when new events are added from another tab or the Quick Add sheet

---

## Phase 3 — Person Detail

**Goal:** A rich person profile that becomes more valuable the more data is in it. This is the "memory layer" in practice.

---

### 3.1 — Profile header

- Name + relationship
- Birthday: "Born June 15, 1990 · Turning 35 in 12 days"
- If year unknown: "Birthday in 12 days (June 15)"
- Quick actions: Edit, Add event, Add memory, Add gift

---

### 3.2 — Upcoming section (scoped to person)

Same query as home screen but filtered to `personId === person.id`.

Shows their next birthday, anniversary, any custom events linked to them.

---

### 3.3 — Events tab

All events linked to this person, chronological. Past and future.

Each event shows:
- Date
- Type badge
- Description
- Whether there is a memory attached
- Whether there is a gift recorded

Tap to go to event detail.

---

### 3.4 — Gifts tab

Gifts for this person grouped by year, most recent first.

Each gift shows:
- Description
- Status badge (idea / planned / purchased / given)
- Price (if set)
- Notes

"This year" section at the top if the current year has no "given" gift yet — prompt: "Have you thought about a gift yet?"

Quick add gift button in this tab.

---

### 3.5 — Memories tab

All memories linked to this person, reverse chronological.

Each memory shows:
- Date
- Title (if set)
- Note (truncated with expand)
- Linked event (if any)

---

### 3.6 — Notes section

A free-form text note on the person. Editable inline (click to edit, auto-save on blur).

---

### Phase 3 Done Criteria

- [ ] Person profile renders all sections correctly
- [ ] Countdown and age calculations correct on profile header
- [ ] Events, gifts, memories all load and display correctly
- [ ] Tabs switch without data loss
- [ ] Empty state for each tab when no data exists
- [ ] Quick action buttons navigate or open sheets correctly
- [ ] Notes auto-save on blur

---

## Phase 4 — Gifts & Memories

**Goal:** The context layer. Without gifts and memories, Momento is just another birthday app. This phase is what makes it different.

---

### 4.1 — Gift form

- Description (required) — "Blue leather wallet", "Dinner at Nobu"
- Status (required) — idea / planned / purchased / given
- Year (required, defaults to current year)
- Price (optional)
- Notes (optional)
- Link to event (optional — e.g., "Dad's Birthday 2025")

Can be opened from:
- Person detail → Gifts tab → Add gift button
- Event detail → Add gift button (pre-fills personId and eventId)

---

### 4.2 — Gift list and history

- Per-person view (in person detail) — primary
- Per-event view — in event detail, show "gift for this event" if present

Gift status flow: idea → planned → purchased → given
Allow forward and backward status changes (not a one-way flow).

Marking a gift as "given" → optionally prompt to add a memory: "Want to note how it went?"

---

### 4.3 — Memory form

- Note (required) — what happened, how it went
- Title (optional) — "Dad's 60th Dinner"
- Date (required) — when this happened (date picker for past dates)
- People involved (multi-select from people list)
- Link to event (optional)

---

### 4.4 — Memory detail and edit

Show memory in full. Editability. Delete with confirmation.

---

### 4.5 — Contextual surfacing

On the Event detail screen and on the home screen Upcoming card, surface last year's context:

```
Dad's Birthday · in 12 days
─────────────────────────────
Last year: You gave him a watch (June 15, 2024).
           "He loved it — thinking about leather goods again."
```

This is the feature that makes the reminder useful. Query: for the event's person, find gift where `year === currentYear - 1` and memory where linked to the previous year's birthday event.

This query must be fast and the result must fit naturally into the existing card design.

---

### Phase 4 Done Criteria

- [ ] Gifts can be added, edited, and deleted
- [ ] Gift status can be changed through all four states
- [ ] Memories can be added, edited, and deleted
- [ ] Last year's gift/memory surfaces on the upcoming event card
- [ ] Memory prompts after marking a gift as "given"
- [ ] Multiple people can be linked to a memory

---

## Phase 5 — Timeline

**Goal:** A chronological history of all moments that makes the user feel like they are looking at their personal story.

---

### 5.1 — Data structure

Group all events (past occurrences, not future ones) by year, then by month within the year. Most recent year first.

```
2025
  June
  · Dad's Birthday — turned 70
  · Goa Trip

  March
  · Promoted at work

2024
  December
  · Parents' Anniversary — 40 years

  June
  · Dad's Birthday — turned 69
```

**Query:** Events with `recurrence.type === 'yearly'` need their past occurrences generated. An event with `date: { year: 2015, month: 6, day: 15 }` and yearly recurrence should appear in the timeline for every year from 2015 to last year.

This is the `getNextOccurrences` inverse: generate all past occurrences. Implement `getPastOccurrences(event, from, to)` in `recurrence.ts`.

One-time events appear exactly once in the year they occurred.

---

### 5.2 — Timeline component

- Year headers (sticky or prominent)
- Month sub-headers
- Event rows with: date, title, person name, type badge, memory indicator
- Clicking an event row → event detail
- `@defer` the timeline list (it can be long) — show a loading skeleton while it initialises
- Virtual scrolling for large datasets

---

### 5.3 — Empty state

New users: "Your timeline starts the moment you add your first event. Come back and watch your history grow."

---

### Phase 5 Done Criteria

- [ ] Timeline groups correctly by year → month
- [ ] Recurring events show once per year they occurred in
- [ ] One-time events appear once
- [ ] Events with attached memories show an indicator
- [ ] Scrolling is smooth on mobile (test on a real device or Safari emulation)
- [ ] Empty state renders for new users

---

## Phase 6 — Search

**Goal:** Find anything, fast. Search is a power feature for users who have built up data.

---

### 6.1 — Search scope

Search covers:
- People (name, notes)
- Events (title, description)
- Memories (title, note)
- Gifts (description, notes)

---

### 6.2 — Implementation

Angular Signals + a debounced search signal:

```typescript
readonly query = signal('');
readonly debouncedQuery = ... // 200ms debounce via RxJS or a custom signal

readonly results = computed(async () => {
  const q = this.debouncedQuery().toLowerCase().trim();
  if (!q || q.length < 2) return null;

  const [people, events, memories, gifts] = await Promise.all([
    db.people.filter(p => p.name.toLowerCase().includes(q) || (p.notes ?? '').toLowerCase().includes(q)).toArray(),
    db.events.filter(e => e.title.toLowerCase().includes(q) || (e.description ?? '').toLowerCase().includes(q)).toArray(),
    db.memories.filter(m => (m.title ?? '').toLowerCase().includes(q) || m.note.toLowerCase().includes(q)).toArray(),
    db.gifts.filter(g => g.description.toLowerCase().includes(q) || (g.notes ?? '').toLowerCase().includes(q)).toArray(),
  ]);

  return { people, events, memories, gifts };
});
```

This is a linear scan. At V1 scale (hundreds of records) this is fast enough. Full-text indexing is a V2 consideration.

---

### 6.3 — Search UI

Search is accessible from the home screen header (search icon → inline search field).

Results are grouped by type: People, Events, Memories, Gifts.

Results are shown as you type (after 2 characters, after 200ms debounce).

Keyboard navigation: arrow keys move through results, Enter opens the selected result.

Empty result state: "No results for 'goa'. Try a different word."

---

### Phase 6 Done Criteria

- [ ] Search returns results across all four entity types
- [ ] Results update as user types (debounced)
- [ ] Clicking a result navigates to the correct detail screen
- [ ] Search works correctly with no results (no crash, good message)
- [ ] Search clears when user navigates away

---

## Phase 7 — Settings & Backup

**Goal:** The user can export all their data, import it back, change preferences, and reset if needed. Non-negotiable for a local-first app.

---

### 7.1 — Export

Serialize all Dexie tables to a single JSON object:

```typescript
async function exportData(): Promise<string> {
  const [people, events, memories, gifts] = await Promise.all([
    db.people.toArray(),
    db.events.toArray(),
    db.memories.toArray(),
    db.gifts.toArray(),
  ]);

  const backup = {
    version: 1,
    exportedAt: Date.now(),
    data: { people, events, memories, gifts }
  };

  return JSON.stringify(backup, null, 2);
}
```

Trigger a browser file download via a temporary `<a>` with `download` attribute and `URL.createObjectURL`.

Filename: `momento-backup-2025-06-15.json`

---

### 7.2 — Import

Parse the JSON, validate the structure, then upsert into Dexie:

```typescript
async function importData(json: string): Promise<void> {
  const backup = JSON.parse(json);

  // Validate version, validate that data has expected keys, validate each entity shape
  if (!isValidBackup(backup)) throw new Error('Invalid backup file');

  await db.transaction('rw', [db.people, db.events, db.memories, db.gifts], async () => {
    await db.people.bulkPut(backup.data.people);
    await db.events.bulkPut(backup.data.events);
    await db.memories.bulkPut(backup.data.memories);
    await db.gifts.bulkPut(backup.data.gifts);
  });
}
```

`bulkPut` upserts — so re-importing the same backup does not create duplicates. IDs are preserved.

Before import: show a warning — "This will add or overwrite data. Existing data with the same IDs will be updated." NOT "This will erase everything."

Show import result: "Imported 23 people, 67 events, 12 memories, 34 gifts."

---

### 7.3 — Clear all data

A destructive action behind a two-step confirmation:

1. Button: "Clear all data"
2. Modal: "This will permanently delete all people, events, memories, and gifts. This cannot be undone. Type DELETE to confirm."
3. On confirm: `await db.delete()` then `await db.open()` (re-creates the empty DB)

Then navigate to home screen.

---

### 7.4 — Preferences

- Theme: Light / Dark / System (radio group)
- Date format: DD/MM/YYYY or MM/DD/YYYY
- Upcoming window: 30 / 60 / 90 / 180 days (select)

Preferences save immediately on change via `SettingsService`.

---

### Phase 7 Done Criteria

- [ ] Export produces a valid, readable JSON file that downloads correctly
- [ ] Import reads the file, validates it, and upserts all records
- [ ] Re-importing same file does not duplicate records
- [ ] Import shows a result summary
- [ ] Clear data requires typing "DELETE" and wipes the IndexedDB
- [ ] Theme preference applies immediately on change
- [ ] Settings persist across sessions

---

## Phase 8 — Theme & Brand

**Goal:** Decide on the visual identity. Replace placeholder tokens with the real brand. Try multiple options before committing.

---

### 8.1 — What to experiment with

For each theme candidate, change only `styles.css` — nothing else should need to change.

**Things to try:**
- 3–4 accent color families (warm amber, dusty rose, deep teal, muted sage, terracotta)
- 2 type combinations (serif display + system body vs. geometric sans + serif body)
- Light mode tuning (how warm/cool is the background? How much contrast?)
- Dark mode tuning (is it warm dark or cool dark?)

**Evaluation criteria:**
- Does it feel personal and warm, not corporate?
- Does it have a distinctive character without being loud?
- Does it work equally well for dark and light mode?
- Does the accent color work for both primary actions AND birthday/milestone highlights?
- Is there enough contrast for accessibility (WCAG AA minimum)?

---

### 8.2 — Logo

Options to explore:
- Wordmark only (typography is the brand)
- Wordmark + simple icon (ring, circle, letter M in a distinctive treatment)
- Icon only for PWA icon

The icon must work at 16px (favicon), 192px (PWA), and as an SVG at any size.

Avoid:
- Calendar icons (makes it look like a calendar app)
- Bell icons (reminder app)
- Anything that looks like it belongs in a project management tool

Consider:
- A ring / loop (continuity, memory, time)
- A subtle serif M
- An abstract mark

---

### 8.3 — Typography

Candidates for display font (headings, wordmark):
- DM Serif Display — warm, literary
- Playfair Display — elegant, editorial
- Lora — readable serif, warm
- Cabinet Grotesk — modern geometric, personality without being a serif

Body font decision:
- System font stack: fastest, native feel, no loading flash
- Inter: clean, legible, widely used (downside: everywhere)
- Instrument Sans: warm, slightly different

Decision criteria: load performance, distinctiveness, how it pairs with the display font.

---

### 8.4 — Apply final brand

Once decided:
1. Update CSS variables in `styles.css`
2. Update Google Fonts import (if any)
3. Update `manifest.webmanifest` — `theme_color`, `background_color`
4. Update PWA icons with real logo
5. Update coming soon page (`index.html`) with final brand

---

### Phase 8 Done Criteria

- [ ] Final accent color and palette committed to `styles.css`
- [ ] Final typography chosen and loading correctly (or confirmed as system fonts)
- [ ] Logo SVG exists in `src/assets/`
- [ ] PWA icons generated in all required sizes (72, 96, 128, 144, 152, 192, 384, 512)
- [ ] Favicon set
- [ ] `manifest.webmanifest` updated with final brand values
- [ ] Coming soon page updated

---

## Phase 9 — PWA & Offline Polish

**Goal:** The app is fully installable, works completely offline after first load, and the offline experience is handled gracefully.

---

### 9.1 — Service worker cache strategy

Review and finalise `ngsw-config.json`:

- **App shell** (index.html, main bundle, polyfills): `CacheFirst` — always serve from cache, update in background
- **Fonts** (if self-hosted): `CacheFirst` with long TTL
- **Icons and assets**: `CacheFirst`

IndexedDB data does not go through the service worker — it is browser-native storage and is always available offline by definition.

---

### 9.2 — Update UX

When a new version of the app is deployed, the service worker detects it. Handle this gracefully:

```typescript
// In app.component.ts — check for SW updates
const swUpdate = inject(SwUpdate);

if (swUpdate.isEnabled) {
  swUpdate.versionUpdates.pipe(
    filter(e => e.type === 'VERSION_READY'),
    takeUntilDestroyed()
  ).subscribe(() => {
    // Show a non-intrusive "Update available" banner with a "Reload" button
    this.uiState.notify('A new version is available. Reload to update.', 'info');
  });
}
```

Never force-reload without user action.

---

### 9.3 — Install prompt

Browsers show the install prompt automatically (PWA criteria: served over HTTPS, has a manifest, has a service worker). Android Chrome does this reliably. iOS Safari requires manual "Add to Home Screen" from the share menu.

Capture the `beforeinstallprompt` event and surface an in-app "Install app" button in Settings for Android users. Do not show a pop-up banner — put it in the Settings screen.

For iOS: show a manual instruction in Settings: "On iPhone, tap the Share button then 'Add to Home Screen'."

---

### 9.4 — Offline state

The app works fully offline — all data is local. The one thing that could fail is loading Google Fonts if self-hosted is not set up.

Decision: self-host fonts (download and serve from `src/assets/fonts/`). This removes the Google Fonts dependency and the app works 100% offline with zero network requests after install.

Use `@font-face` in `styles.css` pointing to local asset paths.

---

### 9.5 — Performance audit

Run Lighthouse on the production build:
- Performance: target 90+
- PWA: all checks passing
- Accessibility: target 95+
- Best Practices: 100

Address any failures before calling Phase 9 done.

---

### Phase 9 Done Criteria

- [ ] App installs correctly as PWA on Android Chrome
- [ ] App installs correctly on iOS Safari (via Add to Home Screen)
- [ ] App loads and functions fully with network disabled after first load
- [ ] New version update banner appears and triggers reload correctly
- [ ] Lighthouse PWA score: all checks passing
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 95+
- [ ] No console errors or warnings in production build
- [ ] Fonts load with no flash of unstyled text (FOUT) — self-hosted or preloaded

---

## Dependency Summary

```
Core:
  @angular/core (via Angular CLI)
  @angular/pwa
  dexie
  date-fns
  nanoid
  lucide-angular

Dev:
  tailwindcss
  @tailwindcss/vite (or postcss equivalent for Angular)
  @testing-library/angular
  fake-indexeddb
  vitest (for utils)
  @angular/cdk (FocusTrap, VirtualScroll)
```

No other runtime dependencies. If a package is not in this list, justify it before adding.

---

## Open Decisions Log

Track decisions that are still open or were made during development.

| Decision | Status | Resolution |
|---|---|---|
| Person-less events (can events exist without a person?) | **Resolved** — Yes, `personId` is optional | Events like "Trip to Goa" can exist standalone |
| Birthday year optional | **Resolved** — Yes, `LocalDate.year` is optional | Shows countdown without age if year is unknown |
| Push notifications in V1 | **Resolved** — No, visual only | Service worker + browser push is V2 |
| Quick Add in V1 | **Resolved** — Structured form, no NLP | Natural language is a V1.5/V2 consideration |
| Theme and brand identity | **Open** — Decided in Phase 8 | CSS tokens are in place for easy swap |

---

*This document is updated as phases complete and decisions are made.*
