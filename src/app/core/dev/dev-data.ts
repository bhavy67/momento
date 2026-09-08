import type { Person, MomentoEvent, Memory, Gift } from '@types';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day).getTime();

export const DEV_PEOPLE: Person[] = [
  {
    id: 'dev-p1', name: 'Sarah Chen', relationship: 'partner',
    birthday: { year: 1991, month: 9, day: 22 },
    notes: 'Loves hiking, photography, and strong coffee. Met at a design conference in 2017.',
    tags: [], createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1),
  },
  {
    id: 'dev-p2', name: 'Linda Johnson', relationship: 'family',
    birthday: { year: 1958, month: 3, day: 8 },
    notes: 'Mom. Retired teacher. Loves gardening and crossword puzzles.',
    tags: [], createdAt: d(2024, 1, 2), updatedAt: d(2024, 1, 2),
  },
  {
    id: 'dev-p3', name: 'Jake Miller', relationship: 'friend',
    birthday: { year: 1988, month: 10, day: 3 },
    notes: 'Best friend since college. Software engineer. Big on craft beer and board games.',
    tags: [], createdAt: d(2024, 1, 3), updatedAt: d(2024, 1, 3),
  },
  {
    id: 'dev-p4', name: 'Emma Williams', relationship: 'colleague',
    birthday: { year: 1994, month: 9, day: 15 },
    notes: 'Product manager. Sharp thinker. Runs marathons on weekends.',
    tags: [], createdAt: d(2024, 1, 4), updatedAt: d(2024, 1, 4),
  },
  {
    id: 'dev-p5', name: 'Robert Johnson', relationship: 'family',
    birthday: { year: 1955, month: 11, day: 12 },
    notes: 'Dad. Former architect, retired 2020. Passionate about fly fishing.',
    tags: [], createdAt: d(2024, 1, 5), updatedAt: d(2024, 1, 5),
  },
  {
    id: 'dev-p6', name: 'Grandma Rose', relationship: 'family',
    birthday: { year: 1945, month: 9, day: 8 },
    notes: 'Sharp as ever. Bakes the best apple pie. Facetimes every Sunday.',
    tags: [], createdAt: d(2024, 1, 6), updatedAt: d(2024, 1, 6),
  },
];

export const DEV_EVENTS: MomentoEvent[] = [
  // TODAY — Grandma Rose birthday (Sept 8)
  {
    id: 'dev-e1', title: "Grandma Rose's Birthday", type: 'birthday',
    date: { year: 1945, month: 9, day: 8 }, personId: 'dev-p6',
    recurrence: { type: 'yearly' },
    description: 'Call her in the morning before 10 — she naps early.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 1), updatedAt: d(2024, 1, 1),
  },
  // 7 days — Emma birthday (Sept 15), highlighted "soon"
  {
    id: 'dev-e2', title: "Emma's Birthday", type: 'birthday',
    date: { year: 1994, month: 9, day: 15 }, personId: 'dev-p4',
    recurrence: { type: 'yearly' },
    description: 'Usually does a team lunch. Check if she wants to do something after work.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 2), updatedAt: d(2024, 1, 2),
  },
  // 14 days — Sarah birthday (Sept 22), turning 35
  {
    id: 'dev-e3', title: "Sarah's Birthday", type: 'birthday',
    date: { year: 1991, month: 9, day: 22 }, personId: 'dev-p1',
    recurrence: { type: 'yearly' },
    description: 'Turning 35. Planning a surprise dinner with close friends.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 3), updatedAt: d(2024, 1, 3),
  },
  // 20 days — Wedding anniversary (Sept 28), 5-year milestone
  {
    id: 'dev-e4', title: 'Wedding Anniversary', type: 'anniversary',
    date: { year: 2021, month: 9, day: 28 }, personId: 'dev-p1',
    recurrence: { type: 'yearly' },
    description: 'Five years. Thinking Amalfi coast trip or a long weekend in Lisbon.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 4), updatedAt: d(2024, 1, 4),
  },
  // 25 days — Jake birthday (Oct 3)
  {
    id: 'dev-e5', title: "Jake's Birthday", type: 'birthday',
    date: { year: 1988, month: 10, day: 3 }, personId: 'dev-p3',
    recurrence: { type: 'yearly' },
    description: 'Usually wants to go to a new restaurant and then a bar crawl.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 5), updatedAt: d(2024, 1, 5),
  },
  // 65 days — Robert birthday (Nov 12)
  {
    id: 'dev-e6', title: "Dad's Birthday", type: 'birthday',
    date: { year: 1955, month: 11, day: 12 }, personId: 'dev-p5',
    recurrence: { type: 'yearly' },
    description: 'Turning 71. He loves a quiet dinner and a good bottle of scotch.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 6), updatedAt: d(2024, 1, 6),
  },
  // ~6 months — Linda birthday (March 8)
  {
    id: 'dev-e7', title: "Mom's Birthday", type: 'birthday',
    date: { year: 1958, month: 3, day: 8 }, personId: 'dev-p2',
    recurrence: { type: 'yearly' },
    description: "Turning 68. International Women's Day too — always make it special.",
    tags: [], isArchived: false, createdAt: d(2024, 1, 7), updatedAt: d(2024, 1, 7),
  },
  // Past one-time — "On This Day" Sept 8, 2023 (3 years ago)
  {
    id: 'dev-e8', title: "Jake's Housewarming", type: 'milestone',
    date: { year: 2023, month: 9, day: 8 }, personId: 'dev-p3',
    recurrence: { type: 'none' },
    description: 'Incredible rooftop view. Everyone brought a bottle.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 8), updatedAt: d(2024, 1, 8),
  },
  // Past one-time — "On This Day" Sept 8, 2021 (5 years ago)
  {
    id: 'dev-e9', title: 'First Product Launch', type: 'milestone',
    date: { year: 2021, month: 9, day: 8 },
    recurrence: { type: 'none' },
    description: 'Shipped v1. The whole team stayed until midnight.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 9), updatedAt: d(2024, 1, 9),
  },
  // Past one-time — Linda's retirement Jan 2024
  {
    id: 'dev-e10', title: "Mom's Retirement", type: 'milestone',
    date: { year: 2024, month: 1, day: 15 }, personId: 'dev-p2',
    recurrence: { type: 'none' },
    description: '34 years of teaching. The whole school came to the farewell.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 10), updatedAt: d(2024, 1, 10),
  },
  // Past one-time — Sarah's half-marathon Apr 2025
  {
    id: 'dev-e11', title: "Sarah's First Half-Marathon", type: 'milestone',
    date: { year: 2025, month: 4, day: 20 }, personId: 'dev-p1',
    recurrence: { type: 'none' },
    description: 'Finished in 2h 04m. Trained for six months. So proud.',
    tags: [], isArchived: false, createdAt: d(2024, 1, 11), updatedAt: d(2024, 1, 11),
  },
];

export const DEV_MEMORIES: Memory[] = [
  {
    id: 'dev-m1', title: 'Yosemite at sunrise',
    note: "We hiked the Half Dome trail starting at 4am with headlamps. When we reached the summit the sun cracked the horizon and Sarah just stood there in silence for a long time. One of those mornings you file away permanently.",
    date: d(2025, 5, 18), personIds: ['dev-p1'], eventId: 'dev-e3',
    createdAt: d(2025, 5, 19), updatedAt: d(2025, 5, 19),
  },
  {
    id: 'dev-m2', title: 'Fourth anniversary dinner',
    note: "Booked the chef's table at Maison — they put the menu in a little envelope as a keepsake. We stayed until the kitchen closed. Sarah kept the envelope.",
    date: d(2025, 9, 28), personIds: ['dev-p1'], eventId: 'dev-e4',
    createdAt: d(2025, 9, 29), updatedAt: d(2025, 9, 29),
  },
  {
    id: 'dev-m3', title: "Jake's housewarming",
    note: 'The rooftop was strung with Edison bulbs and you could see the whole skyline. Jake gave the most embarrassingly heartfelt speech about "adulting." Everyone laughed but he definitely meant every word.',
    date: d(2023, 9, 8), personIds: ['dev-p3'], eventId: 'dev-e8',
    createdAt: d(2023, 9, 9), updatedAt: d(2023, 9, 9),
  },
  {
    id: 'dev-m4', title: "Mom's retirement party",
    note: "The gymnasium was full — students she hadn't seen in twenty years showed up. She cried three times and pretended not to each time. Dad held her hand through the whole thing.",
    date: d(2024, 1, 15), personIds: ['dev-p2', 'dev-p5'], eventId: 'dev-e10',
    createdAt: d(2024, 1, 16), updatedAt: d(2024, 1, 16),
  },
  {
    id: 'dev-m5', title: "Emma's 30th surprise",
    note: "We told her we were going for 'a quiet work catch-up drink.' She walked into a room of 25 people and immediately looked for the exit. Then she laughed for about a minute straight.",
    date: d(2024, 9, 15), personIds: ['dev-p4'], eventId: 'dev-e2',
    createdAt: d(2024, 9, 16), updatedAt: d(2024, 9, 16),
  },
  {
    id: 'dev-m6', title: "Sarah's finish line",
    note: "I was at mile 11 with a sign that said 'You hate running but look at you.' She spotted it and sped up. Crossed the line in 2:04 — hands on knees, then both arms up. I still have the photo.",
    date: d(2025, 4, 20), personIds: ['dev-p1'], eventId: 'dev-e11',
    createdAt: d(2025, 4, 21), updatedAt: d(2025, 4, 21),
  },
];

export const DEV_GIFTS: Gift[] = [
  // Sarah — birthday 2026 (idea)
  {
    id: 'dev-g1', personId: 'dev-p1', year: 2026, eventId: 'dev-e3',
    description: 'Leica camera strap — leather, monogrammed',
    status: 'idea', price: 85,
    createdAt: d(2026, 8, 1), updatedAt: d(2026, 8, 1),
  },
  // Sarah — birthday 2025 — last year context
  {
    id: 'dev-g2', personId: 'dev-p1', year: 2025, eventId: 'dev-e3',
    description: 'Weekend hiking trip — Catskills cabin',
    status: 'given', price: 320,
    notes: 'Booked via Hipcamp. She loved the wood-burning stove.',
    givenAt: d(2025, 9, 22),
    createdAt: d(2025, 8, 10), updatedAt: d(2025, 9, 22),
  },
  // Sarah — anniversary 2025 — last year context
  {
    id: 'dev-g3', personId: 'dev-p1', year: 2025, eventId: 'dev-e4',
    description: 'Custom star map — the night we met',
    status: 'given', price: 110,
    notes: 'Framed print from Under Lucky Stars.',
    givenAt: d(2025, 9, 28),
    createdAt: d(2025, 9, 1), updatedAt: d(2025, 9, 28),
  },
  // Jake — birthday 2026 (purchased)
  {
    id: 'dev-g4', personId: 'dev-p3', year: 2026, eventId: 'dev-e5',
    description: 'Aged whiskey sampler — 5 bottles',
    status: 'purchased', price: 145,
    notes: 'Picked up from The Whisky Exchange. Ships in 3 days.',
    createdAt: d(2026, 9, 1), updatedAt: d(2026, 9, 1),
  },
  // Linda — birthday 2026 (planned)
  {
    id: 'dev-g5', personId: 'dev-p2', year: 2026, eventId: 'dev-e7',
    description: 'Spa day + afternoon tea for two',
    status: 'planned', price: 180,
    notes: 'Book The Retreat — she mentioned it last Christmas.',
    createdAt: d(2026, 1, 10), updatedAt: d(2026, 1, 10),
  },
  // Emma — birthday 2026 (idea)
  {
    id: 'dev-g6', personId: 'dev-p4', year: 2026, eventId: 'dev-e2',
    description: 'Single-origin coffee subscription — 3 months',
    status: 'idea', price: 90,
    createdAt: d(2026, 8, 20), updatedAt: d(2026, 8, 20),
  },
  // Robert — birthday 2026 (planned)
  {
    id: 'dev-g7', personId: 'dev-p5', year: 2026, eventId: 'dev-e6',
    description: 'Fly fishing rod — Orvis Clearwater 9ft 5wt',
    status: 'planned', price: 299,
    notes: 'He has been eyeing this for two years. Finally getting it.',
    createdAt: d(2026, 9, 5), updatedAt: d(2026, 9, 5),
  },
];
