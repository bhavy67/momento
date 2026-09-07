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
| Framework | React 18 + TypeScript | Practical, maintainable, large ecosystem, suits the dev profile |
| Build tool | Vite | Fast dev server, excellent DX, native ESM, PWA plugin |
| Styling | Tailwind CSS v4 | Utility-first, easy responsiveness, no style drift |
| Local DB | Dexie.js (IndexedDB) | Best-in-class IndexedDB abstraction. TypeScript-native, reactive queries, versioned migrations |
| State (UI) | Zustand | Lightweight, no boilerplate, excellent TypeScript. Used for UI state only (modals, drawers, navigation). DB-backed data flows through Dexie hooks directly |
| Routing | React Router v6 | Well-understood, file-structure-friendly, good TypeScript |
| Date utils | date-fns | Tree-shakeable, immutable, excellent TypeScript. Not moment.js (bloated). Not dayjs (fewer features) |
| PWA | vite-plugin-pwa | Workbox-backed, zero-config baseline, excellent Vite integration |
| Testing | Vitest + Testing Library | Native Vite ecosystem, fast, same config as app |
| Icons | Lucide React | Clean, consistent, tree-shakeable |

### On state management

Momento has two distinct kinds of state:

1. **Persisted data** — People, events, gifts, memories. Lives in IndexedDB via Dexie. Components subscribe to this via Dexie's `useLiveQuery` hook. No Zustand involved.
2. **UI state** — Modals open/closed, active sheets, quick-add state, navigation. Lives in Zustand. Ephemeral, never persisted.

This separation keeps the data layer clean and avoids the anti-pattern of syncing between a state store and IndexedDB.

### What was deliberately excluded

- No backend, no API, no server
- No authentication or accounts
- No cloud sync (V2+ consideration)
- No push notifications in V1 (unreliable on mobile web, especially iOS, requires backend infrastructure)
- No photos/media attachments (IndexedDB blob handling adds significant complexity; V1.5)
- No natural language date parsing (deterministic parsers are fragile; build the structured form correctly first)
- No AI/LLM integration (V2+)
- No analytics or tracking of any kind

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     React UI                        │
│   Pages / Feature Components / Shared Components   │
└────────────────────┬────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼──────┐       ┌──────▼──────┐
    │   Zustand   │       │    Dexie    │
    │  (UI state) │       │  (DB hooks) │
    └─────────────┘       └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │  IndexedDB  │
                          │  (Browser)  │
                          └─────────────┘
                                 │
                     ┌───────────┴──────────┐
                     │   Domain utils layer │
                     │  (pure functions)    │
                     │  dates / recurrence  │
                     │  calculations        │
                     └──────────────────────┘
```

### Layers

**UI layer** — React components organized by feature. Pages are thin; feature components own their data subscriptions via Dexie hooks. No business logic in components.

**Domain utils** — Pure TypeScript functions for date calculations, recurrence expansion, age derivation, milestone detection, countdown computation. Fully testable with no dependencies on React or Dexie.

**DB layer** — Dexie instance with typed schema, versioned migrations. Each feature has a repository-style set of helper functions for its queries and mutations. Direct Dexie calls are never scattered across components.

**UI state layer** — Zustand stores for transient UI state. Separate stores per concern: modal state, navigation state, quick-add state.

**Export/import** — A dedicated module that serializes all Dexie tables to JSON and deserializes + validates on import. Completely standalone from the rest of the app.

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
│   ├── icons/                 # PWA app icons (multiple sizes)
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── ui/                # Atomic: Button, Input, Modal, Sheet, Badge, etc.
│   │   └── shared/            # Composed: PersonCard, EventCard, CountdownBadge, etc.
│   ├── features/
│   │   ├── home/              # Home screen — upcoming, on this day, needs attention
│   │   ├── people/            # People list, person profile, person form
│   │   ├── events/            # Event creation, event detail, recurrence editor
│   │   ├── gifts/             # Gift list, gift form per person/year
│   │   ├── memories/          # Memory capture, memory display
│   │   ├── timeline/          # Chronological history view
│   │   └── settings/          # Import, export, clear, preferences
│   ├── db/
│   │   ├── db.ts              # Dexie instance + table registration
│   │   ├── schema.ts          # Table schema types (enforced by Dexie)
│   │   ├── migrations.ts      # Versioned schema migrations
│   │   └── repositories/      # Query/mutation helpers per entity
│   │       ├── people.repo.ts
│   │       ├── events.repo.ts
│   │       ├── gifts.repo.ts
│   │       └── memories.repo.ts
│   ├── store/
│   │   ├── ui.store.ts        # Modal/drawer state, active sheet
│   │   └── quick-add.store.ts # Quick add overlay state
│   ├── hooks/                 # Shared React hooks (wrap Dexie queries)
│   │   ├── useUpcoming.ts
│   │   ├── useOnThisDay.ts
│   │   ├── usePerson.ts
│   │   └── useSearch.ts
│   ├── utils/
│   │   ├── dates.ts           # All date math — age, countdown, next occurrence, milestones
│   │   ├── recurrence.ts      # Expand recurring events to next N occurrences
│   │   ├── export.ts          # Serialize all tables to JSON
│   │   ├── import.ts          # Parse, validate, and import JSON backup
│   │   └── id.ts              # nanoid wrapper
│   ├── types/
│   │   └── index.ts           # All shared TypeScript types
│   ├── router/
│   │   └── index.tsx          # React Router route definitions
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
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
# Clone the repository
git clone <repo>
cd momento

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Type check
npm run typecheck
```

---

## Scripts

| Script | Purpose |
|---|---|
| `dev` | Start Vite dev server |
| `build` | TypeScript compile + Vite production build |
| `preview` | Preview production build locally |
| `test` | Run Vitest |
| `test:ui` | Vitest with UI |
| `typecheck` | Run `tsc --noEmit` |
| `lint` | ESLint |

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

### File naming
- React components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Repositories: `entityName.repo.ts`
- Stores: `feature.store.ts`

### Components
- One component per file.
- Feature components own their data subscription (Dexie hooks). They do not receive all data as props from a parent.
- UI components (`src/components/ui/`) are stateless and have no data dependencies.
- No business logic inside JSX. Extract to a hook or a util function.

### Date handling
- Dates in the database are stored as `{ year, month, day }` objects (1-indexed months) for annual recurrence events like birthdays, where the year is often irrelevant.
- Unix timestamps (milliseconds) are used for `createdAt`, `updatedAt`, and memories (which are about a specific moment in time).
- All date math lives in `src/utils/dates.ts`. No date calculations in components.
- Use `date-fns` for formatting and manipulation. Never use `new Date()` arithmetic directly.

### State
- Dexie `useLiveQuery` for all persisted data. Never mirror DB data into Zustand.
- Zustand only for UI state: what modal is open, what sheet is active, etc.
- Zustand stores are small and focused. One concern per store.

### Testing
- Pure utility functions in `src/utils/` must have unit tests. This is where the business logic lives and it must be correct.
- Repositories should have integration tests that run against an in-memory Dexie instance.
- Component tests for critical user interactions (creating a person, adding an event, exporting data).
- No snapshot tests.

### Accessibility
- Semantic HTML first. Landmark elements, proper heading hierarchy.
- All interactive elements are keyboard-accessible.
- All images have `alt` text. All icons used alone have `aria-label`.
- Minimum contrast ratios per WCAG AA.
- Focus management when modals and sheets open/close.

### No premature abstraction
- Do not create a utility for something used once.
- Do not create a component for something that exists in only one place.
- Duplication is cheaper than the wrong abstraction.

---

## Questions That Need Answers Before Implementation

These are product decisions that are not yet settled:

1. **Person-less events** — Should events always require a linked person, or can they exist independently (e.g., "Trip to Goa" without linking to specific people)? The current model allows optional `personId`, but this changes the home screen and timeline logic significantly.

2. **Birthday year optionality** — The spec stores birthday year as optional on Person. This is correct UX-wise. But it changes the recurrence calculation. Confirm this is the right tradeoff.

3. **Reminder strategy for V1** — Without push notifications, reminders in V1 are purely visual (the home screen shows upcoming events). Is this acceptable for V1, or should we investigate a local notification approach even with its limitations on mobile web?

4. **Quick Add scope in V1** — Is a structured form for Quick Add sufficient for V1, or is a text-input parser expected from the start?

---

*Built with care. Designed to last.*
