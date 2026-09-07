# Momento

**Your memory layer for the people and moments that matter.**

---

## The Core Insight

People do not forget dates. They forget the *context* around the date.

A typical reminder app says: *"Dad's birthday tomorrow."*

Momento says: *"Dad's birthday is in 7 days. Last year you gave him a watch and took him to dinner. You made a note to consider a wallet this year."*

The difference is not functionality — it is usefulness. Momento is not a calendar. It is not a reminder app. It is a personal memory layer that makes you a more thoughtful person.

---

## What Momento Is

Momento is a local-first, privacy-preserving app that helps you remember the context behind the dates that matter — birthdays, anniversaries, milestones, and moments with the people in your life.

The product is organized around:

```
People → Events → Context → Memories
```

You build up a picture of someone over time. Each year you return, the app knows more. It surfaces what you need, when you need it, without requiring you to maintain a complicated system.

---

## What Momento Is Not

- **Not a calendar.** Momento does not care about scheduling meetings or blocking time.
- **Not a reminder app.** The goal is context, not notification volume.
- **Not a CRM.** It is for meaningful personal relationships, not networking or sales pipelines.
- **Not a social app.** Nothing is shared. Nothing leaves your device. No accounts.
- **Not enterprise software.** The product should feel personal and warm, not like a productivity dashboard.

---

## Why Momento Exists

Existing tools fail in predictable ways:

- **Phone contacts** store a birthday but nothing else. No history. No gifts. No memories.
- **Calendar apps** show you the event but not why it matters or what happened last time.
- **Reminder apps** nag you that something is happening, but offer no context to act on.
- **Note apps** require you to remember to look. They do not proactively surface anything.

None of these tools treat past moments as valuable data for future moments. Momento does.

---

## Key Features — V1

### People
Create people who matter: family, friends, partners, colleagues. Attach relationships, birthdays, notes, and important dates. A person is the anchor — everything else connects to them.

### Events
Support birthdays, anniversaries, milestones, and custom events. Events can be one-time or recurring (yearly, monthly). The app derives useful values automatically: age, years together, days until next occurrence, milestone countdowns (100 days, 1 year, 5 years, 10 years, etc.).

### Countdown
Every upcoming event shows:
- Days until next occurrence
- Current age (for birthdays) or years (for anniversaries)
- Milestone proximity (e.g., "turning 30 in 18 days")

### Gift Tracking
For each person, track what gifts you have given across years. Prevents the classic problem: *"What did I give them last year? Did I already give them this?"* Gifts have a status (idea / planned / purchased / given) so you can track the whole lifecycle.

### Memories
After an event happens, record what occurred. A short note, what gift was given, who was there. This is what makes future reminders genuinely useful — the app can surface context from the previous year.

### Timeline
A chronological view of all your important moments by year. Scrolling back feels like reading a personal history. Not a grid calendar — a story.

### On This Day
A passive, surfaced feature. When you open the app, Momento quietly notes if something meaningful happened on this date in a previous year. No algorithm. No engagement mechanics. Just a moment of memory.

### Search
Global search across people, events, memories, and notes. Fast, local, instant.

### Backup & Restore
Export everything as a JSON file. Import it back. This is non-negotiable for a local-first app where data lives only on the user's device. Clear/reset with confirmation. No one should feel locked in.

### Responsive + PWA
Works on phone, tablet, and desktop. Installable as a PWA with offline functionality. Mobile experience is designed from scratch — not a shrunken desktop UI.

---

## Product Philosophy

### 1. Context over dates
A date is a trigger. Context is the value. Every feature decision should increase context, not just add more dates.

### 2. People over calendars
The primary mental model is a person, not a month. Navigate from people to their moments, not from days to their events.

### 3. Less input, more usefulness
The user should not need to maintain a complex system. Quick to add, useful over time, minimal upkeep.

### 4. Local-first by default
Privacy is not a feature toggle. It is the architecture. Nothing requires a server. Nothing leaves the device.

### 5. Proactive surfacing
The app should notice things the user has not thought to check. On This Day, upcoming milestones, reminders that go beyond the date to include last year's context.

### 6. Avoid notification spam
A reminder should arrive because it is actionable and useful. Not because a setting was checked. Volume is the enemy of attention.

### 7. Make history valuable
Past information is not a log. It is fuel for future moments being better.

### 8. Design for real usage
No features that sound impressive in a demo but create no actual user value.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Angular (latest) + TypeScript | Structured, opinionated, built-in DI + routing. Signals-based reactivity means no external state library needed |
| Build tool | Angular CLI (Vite-backed since v17) | Official toolchain, fast HMR, production-optimised builds |
| Styling | Tailwind CSS v4 | Utility-first, excellent responsive support, zero runtime |
| Local DB | Dexie.js (IndexedDB) | Best-in-class IndexedDB abstraction. TypeScript-native, reactive `liveQuery`, versioned migrations |
| State | Angular Signals | Built-in. `signal()` / `computed()` / `effect()` replace any external store. No Zustand, no NgRx needed |
| Routing | Angular Router | Built-in, lazy-loaded feature routes, functional guards |
| Date utils | date-fns | Tree-shakeable, immutable, excellent TypeScript. Not moment.js (bloated). Not dayjs (fewer features) |
| PWA | @angular/pwa | Official Angular PWA package. Workbox-backed service worker, `ngsw-config.json` |
| Testing | Vitest (utils) + Angular Testing Library (components) | Vitest for pure TS functions; Angular Testing Library for component behaviour |
| Icons | lucide-angular | Same Lucide icon set, Angular-native package |

### On state management

Angular Signals eliminate the need for an external state library entirely. Momento uses two kinds of state:

1. **Persisted data** — People, events, gifts, memories. Lives in IndexedDB via Dexie. Domain services expose this as signals by wrapping `liveQuery` with `toSignal`:

```typescript
// people.service.ts
readonly people = toSignal(
  from(liveQuery(() => db.people.orderBy('name').toArray())),
  { initialValue: [] }
);
```

Components inject the service and read the signal. No manual subscriptions, no `async` pipe gymnastics, no sync-to-store step.

2. **UI state** — Modals open/closed, active sheets, quick-add state. Lives in a lightweight `UiStateService` as plain signals. Ephemeral, never persisted.

```typescript
// ui-state.service.ts
readonly quickAddOpen = signal(false);
readonly activeSheet = signal<string | null>(null);
```

This replaces what Zustand handled in the original React plan. The separation is identical — only the mechanism is Angular-native.

### What was deliberately excluded

- No backend, no API, no server
- No authentication or accounts
- No NgRx (Angular Signals are sufficient; NgRx adds ceremony without benefit at this scale)
- No cloud sync (V2+ consideration)
- No push notifications in V1 (unreliable on mobile web, especially iOS, requires backend infrastructure)
- No photos/media attachments (IndexedDB blob handling adds significant complexity; V1.5)
- No natural language date parsing (deterministic parsers are fragile; build the structured form correctly first)
- No AI/LLM integration (V2+)
- No analytics or tracking of any kind

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│             Angular Component Tree                   │
│  Feature Components / Shared Components / Pipes     │
└────────────────────┬─────────────────────────────────┘
                     │  inject()
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼───────┐     ┌───────▼──────────────────┐
    │ UiState     │     │  Domain Services          │
    │ Service     │     │  PeopleService            │
    │ (signals)   │     │  EventsService            │
    └─────────────┘     │  GiftsService             │
                        │  MemoriesService          │
                        └───────┬──────────────────┘
                                │  toSignal(from(liveQuery(...)))
                         ┌──────▼──────┐
                         │  IndexedDB  │
                         │ (Dexie.js)  │
                         └─────────────┘
                                │
                    ┌───────────┴──────────┐
                    │    Utils layer        │
                    │  (pure functions,     │
                    │   no Angular deps)    │
                    │  dates / recurrence   │
                    └──────────────────────┘
```

### Layers

**Component layer** — Standalone Angular components organized by feature. Components are thin: they inject services, read signals, and render. No business logic, no direct Dexie calls.

**Service layer** — Injectable services are the state and data layer. Domain services (People, Events, Gifts, Memories) own their Dexie queries and expose the results as signals via `toSignal`. `UiStateService` holds ephemeral UI state as plain signals.

**Domain utils** — Pure TypeScript functions: date calculations, recurrence expansion, age derivation, milestone detection, countdown computation. No Angular decorators, no Dexie references. Fully unit-testable in isolation.

**DB layer** — A single `DatabaseService` holds the Dexie instance with typed schema and versioned migrations. Domain services call it directly; no extra repository abstraction layer is needed given Angular DI already provides that boundary.

**Export/import** — A dedicated util module serializes all Dexie tables to JSON and deserializes + validates on import. Completely standalone from Angular and from the rest of the app.

---

## Data Model

### Person
```ts
interface Person {
  id: string              // nanoid
  name: string
  relationship: Relationship  // 'family' | 'friend' | 'partner' | 'colleague' | 'other'
  birthday?: LocalDate    // { year?: number, month: number, day: number } — year is optional
  notes?: string
  tags: string[]
  createdAt: number       // Unix timestamp
  updatedAt: number
}
```

Birthday year is optional because many people know month and day but not birth year for older relatives. The app still calculates countdowns correctly without the year (just not age).

### Event
```ts
interface Event {
  id: string
  title: string
  type: EventType         // 'birthday' | 'anniversary' | 'milestone' | 'custom'
  date: LocalDate         // { year: number, month: number, day: number }
  personId?: string       // Optional — events can exist without a linked person
  description?: string
  recurrence: RecurrenceRule  // { type: 'none' | 'yearly' | 'monthly' }
  tags: string[]
  isArchived: boolean
  createdAt: number
  updatedAt: number
}
```

Birthdays and anniversaries on a Person are stored as Events linked to that person. This keeps the data model uniform and avoids special-casing logic.

### Memory
```ts
interface Memory {
  id: string
  title?: string
  note: string
  date: number            // Unix timestamp of when this memory is about
  personIds: string[]     // Can be about multiple people
  eventId?: string        // Optionally linked to an event
  createdAt: number
  updatedAt: number
}
```

### Gift
```ts
interface Gift {
  id: string
  personId: string
  year: number
  description: string
  status: GiftStatus      // 'idea' | 'planned' | 'purchased' | 'given'
  eventId?: string        // Optionally linked to an event (e.g., birthday)
  price?: number
  notes?: string
  givenAt?: number
  createdAt: number
  updatedAt: number
}
```

### Settings (localStorage — tiny, not IndexedDB)
```ts
interface Settings {
  theme: 'light' | 'dark' | 'system'
  dateFormat: 'dmy' | 'mdy'
  upcomingWindowDays: number  // default: 60
}
```

### Key derived values (computed, never stored)

- **Age** — `currentYear - person.birthday.year` (adjusted if birthday hasn't passed yet this year)
- **Days until** — next occurrence of the event from today
- **Years together / years since** — for anniversaries and milestones
- **Milestone proximity** — detect when an event is approaching a round number (50, 100 days; 1, 2, 5, 10 years)
- **On This Day** — query events whose month/day matches today, from any past year

These are pure functions in `src/utils/dates.ts`. They are computed at render time and never stored. This avoids the complexity of keeping derived data synchronized.

---

## Project Structure

```
momento/
├── public/
│   └── icons/                       # PWA app icons (multiple sizes)
├── src/
│   ├── app/
│   │   ├── core/                    # App-wide singletons — provided once, used everywhere
│   │   │   ├── db/
│   │   │   │   ├── database.service.ts   # Dexie instance + table registration
│   │   │   │   ├── schema.ts             # Dexie table type definitions
│   │   │   │   └── migrations.ts         # Versioned schema migrations
│   │   │   └── services/
│   │   │       ├── people.service.ts     # People state + mutations (signal-backed)
│   │   │       ├── events.service.ts     # Events state + mutations
│   │   │       ├── gifts.service.ts      # Gift tracking state + mutations
│   │   │       ├── memories.service.ts   # Memories state + mutations
│   │   │       ├── search.service.ts     # Cross-entity search
│   │   │       ├── settings.service.ts   # localStorage-backed settings signal
│   │   │       └── ui-state.service.ts   # Ephemeral UI state (modals, sheets, quick-add)
│   │   ├── features/                # Feature-based standalone components
│   │   │   ├── home/
│   │   │   │   ├── home.component.ts
│   │   │   │   └── home.component.html
│   │   │   ├── people/
│   │   │   │   ├── people-list/
│   │   │   │   ├── person-detail/
│   │   │   │   └── person-form/
│   │   │   ├── events/
│   │   │   │   ├── event-detail/
│   │   │   │   └── event-form/
│   │   │   ├── gifts/
│   │   │   ├── memories/
│   │   │   ├── timeline/
│   │   │   └── settings/
│   │   ├── shared/                  # Shared UI — no data dependencies
│   │   │   ├── components/          # Button, Modal, Sheet, Badge, Input, etc.
│   │   │   ├── pipes/               # countdown.pipe.ts, age-from-date.pipe.ts, local-date.pipe.ts
│   │   │   └── directives/          # click-outside.directive.ts
│   │   ├── utils/                   # Pure TS — zero Angular/Dexie imports
│   │   │   ├── dates.ts             # Age, countdown, next occurrence, milestone detection
│   │   │   ├── recurrence.ts        # Expand recurring events to next N occurrences
│   │   │   ├── export.ts            # Serialize all DB tables to JSON
│   │   │   ├── import.ts            # Parse, validate, upsert JSON backup
│   │   │   └── id.ts                # nanoid wrapper
│   │   ├── types/
│   │   │   └── index.ts             # All shared TypeScript interfaces and types
│   │   ├── app.component.ts         # Root shell (nav + router outlet)
│   │   ├── app.component.html
│   │   ├── app.config.ts            # provideRouter, provideAnimations, etc.
│   │   └── app.routes.ts            # Lazy-loaded feature routes
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.css                   # @import "tailwindcss"; global tokens
│   ├── index.html
│   └── main.ts
├── angular.json
├── ngsw-config.json                 # Angular service worker config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
└── README.md
```

---

## UX Direction

### Home Screen

The default view answers: **What matters soon?**

Not a calendar grid. Sections:

- **Today** — anything happening on this exact date
- **Coming Up** — next 30 days of events, ordered by proximity
- **Needs Attention** — events approaching without a gift planned (once gift tracking is active)
- **On This Day** — one quiet section: a past moment from this calendar date in previous years
- **Recently Added** — new people or events added in the last few days

### Navigation

**Mobile (bottom bar):**
- Home
- People
- Timeline
- Settings

With a persistent floating **+** button that opens the Quick Add sheet.

**Desktop (left sidebar):**
- Same sections, expanded into a sidebar with more breathing room
- The main content area uses the additional width for richer cards

### Quick Add

A bottom sheet on mobile, a modal on desktop. The form is intentionally minimal:
- What is this? (event type)
- Who is it for? (optional person picker)
- When? (date picker)
- A short title

No giant forms on first entry. Additional detail can always be added from the event detail screen.

### Person Profile

Each person has a profile page showing:
- Their upcoming events (next occurrence of birthday, anniversary, etc.)
- Gift history grouped by year
- Memories involving this person
- Notes
- All their associated events in a mini-timeline

### Empty States

Every empty state should be warm and inviting — not a generic "No items found" message. Each empty state should explain the value of adding the first item and make adding one feel obvious.

---

## Design System

The visual language is **warm, minimal, personal**. Not a productivity app. Not a social network.

**Color direction:**
- Backgrounds: warm off-white, not pure white
- Text: warm near-black (not pure `#000000`)
- Accent: a single warm color — amber/terracotta family — used sparingly for actions and highlights
- Surfaces: subtle off-white differentiation between cards and background
- Borders: soft, low contrast

**Typography:**
- Display/headings: a slightly characterful serif or semi-serif — adds personality without being decorative
- Body: clean system font stack — fast, legible, native feel
- Dates and numbers: tabular numerals enabled where relevant

**Motion:**
- Subtle transitions for sheet open/close
- No gratuitous animation
- Fast responses — UI should feel instant

**Component principles:**
- Avoid excessive card-within-card nesting
- Generous whitespace, especially on mobile
- Touch targets minimum 44px on mobile
- No tooltips for primary actions — label everything clearly

---

## Development Setup

```bash
# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli

# Clone the repository
git clone <repo>
cd momento

# Install dependencies
npm install

# Start dev server (http://localhost:4200)
ng serve

# Build for production
ng build

# Run unit tests
npm test

# Lint
npm run lint
```

---

## Scripts

| Command | Purpose |
|---|---|
| `ng serve` / `npm start` | Start Angular dev server on :4200 |
| `ng build` | Production build (output to `dist/`) |
| `ng test` / `npm test` | Run unit tests |
| `ng lint` / `npm run lint` | ESLint |
| `ng generate component` | Scaffold a new component |
| `ng generate service` | Scaffold a new service |

---

## Product Roadmap

### V1 — Core Momento

The focus is the core loop: **People → Events → Context → Memory.**

- [ ] People (name, relationship, birthday, notes)
- [ ] Events (birthday, anniversary, milestone, custom, recurring)
- [ ] Countdown display (days until, age, years together)
- [ ] Milestone detection (50/100 days, 1/2/5/10 years)
- [ ] Gift tracking (per person, per year, with status)
- [ ] Memories (short notes attached to a person or event)
- [ ] Timeline view (chronological history)
- [ ] Home screen (upcoming, on this day, today)
- [ ] On This Day feature
- [ ] Global search
- [ ] Local persistence (IndexedDB via Dexie)
- [ ] JSON export and import
- [ ] Data clear/reset with confirmation
- [ ] Responsive design (mobile-first, desktop-capable)
- [ ] PWA basics (manifest, service worker, installable, offline)
- [ ] Light / dark / system theme

### V1.5 — Context & Depth

- [ ] Event checklists (preparation tasks)
- [ ] Tags and categories
- [ ] Quick Add with smarter form (structured, fast)
- [ ] Contextual reminders — surface last year's gift/memory in upcoming events
- [ ] Photo attachments on memories (local only)
- [ ] Needs Attention section (no gift planned for upcoming birthday)
- [ ] Better On This Day presentation
- [ ] Person relationship graph view

### V2 — Platform Maturity

- [ ] iCal import/export (.ics)
- [ ] Year in Review (annual summary)
- [ ] Advanced search with filters
- [ ] Multiple export formats
- [ ] Optional encrypted backup
- [ ] Warranty and document tracking
- [ ] Multi-device sync (optional, user-initiated, no account required — WebRTC or QR-code based local sync)

---

## Privacy Philosophy

> Your memories belong to you.

Momento is built on a simple principle: personal data about your relationships, your family, and your life should not leave your device unless you explicitly choose to export it.

There is no:
- User account
- Sign-in
- Server
- Analytics
- Telemetry
- Ad network
- Third-party SDK that phones home

Everything the app stores lives in your browser's IndexedDB. Export is a JSON file that you control. If you uninstall the app, your data is gone — which is why export is a core V1 feature, not a V2 consideration.

This is not a marketing claim. It is the architecture.

---

## Development Conventions

### TypeScript
- Strict mode enabled. No `any` except at true external boundaries.
- Prefer `interface` for domain objects, `type` for unions and computed types.
- All database entities have an `id: string` (nanoid), `createdAt: number`, `updatedAt: number`.

### File naming (Angular conventions)
- Components: `kebab-case.component.ts` + `kebab-case.component.html`
- Services: `kebab-case.service.ts`
- Pipes: `kebab-case.pipe.ts`
- Directives: `kebab-case.directive.ts`
- Utils: `camelCase.ts`
- Types: grouped in `src/app/types/index.ts`

### Angular component rules
- **All components are standalone.** No NgModules anywhere.
- Use `inject()` function for dependency injection — not constructor parameter injection.
- Use the new control flow syntax everywhere: `@if`, `@for`, `@switch`, `@defer`. Not `*ngIf`, `*ngFor`.
- Use signal inputs: `input()`, `model()`, `output()`, `viewChild()`. Not `@Input()` / `@Output()` decorators.
- One component per file. Template inline only for trivial cases (< 5 lines); otherwise separate `.html` file.
- No business logic in templates. Extract to a `computed()` or method in the component class.
- Shared UI components (`src/app/shared/components/`) accept only primitive or typed inputs. No service injection.

### Signals and state
- Domain services expose data as `readonly` signals. Components never write to them directly.
- `computed()` for derived state — never duplicate a derived value as a separate `signal()`.
- `effect()` is a last resort. If you need it, there is usually a better way.
- Never mirror Dexie data into a signal manually — use `toSignal(from(liveQuery(...)))` to keep them in sync automatically.
- `UiStateService` is the only place ephemeral UI state (modal open/close, active sheet) lives.

### Date handling
- Dates in the database: `{ year?: number, month: number, day: number }` (1-indexed months) for birthday/anniversary types where year may be unknown.
- Unix timestamps (milliseconds) for `createdAt`, `updatedAt`, and memory dates.
- All date math lives in `src/app/utils/dates.ts`. Zero date calculations in components or templates.
- Use `date-fns` for formatting and manipulation. Never use raw `Date` arithmetic.
- Angular pipes in `src/app/shared/pipes/` wrap utils for template formatting only.

### Testing
- Pure utility functions in `src/app/utils/` must have unit tests (Vitest). This is where all business logic lives.
- Service tests for DB operations run against an in-memory Dexie instance (`fake-indexeddb`).
- Component tests via Angular Testing Library for critical flows (create person, add event, export data).
- No snapshot tests.

### Accessibility
- Semantic HTML first: landmark elements, correct heading hierarchy.
- All interactive elements are keyboard-accessible.
- Icons used standalone must have `aria-label`.
- Minimum WCAG AA contrast ratios.
- `cdkTrapFocus` or equivalent for modal/sheet focus management.

### No premature abstraction
- Do not create a utility for something used once.
- Do not create a component that exists in only one place.
- Duplication is cheaper than the wrong abstraction.

---

*Built with care. Designed to last.*
