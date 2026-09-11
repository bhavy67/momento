import { Injectable } from '@angular/core';
import { db } from '@core/db/database.service';
import { generateId } from '@utils/id';
import type { Person, MomentoEvent, Gift, Memory } from '@types';

@Injectable({ providedIn: 'root' })
export class SampleDataService {

  async load(): Promise<void> {
    const now = Date.now();
    const thisYear = new Date().getFullYear();

    // ── People ─────────────────────────────────────────────────────────────────
    const sarahId  = generateId();
    const robertId = generateId();
    const lisaId   = generateId();
    const jakeId   = generateId();

    const people: Person[] = [
      {
        id: sarahId, name: 'Sarah', relationship: 'partner',
        birthday: { month: 1, day: 15, year: 1991 },
        notes: 'Loves the coast, surprises, and Italian food.',
        tags: [], createdAt: now, updatedAt: now,
      },
      {
        id: robertId, name: 'Dad', relationship: 'family',
        birthday: { month: 3, day: 22, year: 1955 },
        notes: 'Retired engineer. Golf, jazz, and strong espresso.',
        tags: ['family'], createdAt: now, updatedAt: now,
      },
      {
        id: lisaId, name: 'Mom', relationship: 'family',
        birthday: { month: 7, day: 4, year: 1958 },
        notes: 'Loves gardening and cooking. Big on family dinners.',
        tags: ['family'], createdAt: now, updatedAt: now,
      },
      {
        id: jakeId, name: 'Jake', relationship: 'friend',
        birthday: { month: 11, day: 3, year: 1994 },
        notes: 'College friend. Outdoorsy, hikes every weekend.',
        tags: ['college'], createdAt: now, updatedAt: now,
      },
    ];

    // ── Events ─────────────────────────────────────────────────────────────────
    const sarahBdayId   = generateId();
    const parentsAnnId  = generateId();
    const dadBdayId     = generateId();
    const momBdayId     = generateId();
    const jakeMillId    = generateId();
    const roadTripId    = generateId();

    const events: MomentoEvent[] = [
      {
        id: sarahBdayId, title: "Sarah's Birthday",
        type: 'birthday', date: { month: 1, day: 15, year: thisYear - 5 },
        personIds: [sarahId], recurrence: { type: 'yearly' },
        description: 'Her golden birthday was the 15th — still a tradition.',
        tags: [], isArchived: false, createdAt: now, updatedAt: now,
      },
      {
        id: parentsAnnId, title: "Parents' Anniversary",
        type: 'anniversary', date: { month: 6, day: 8, year: 1983 },
        personIds: [robertId, lisaId], recurrence: { type: 'yearly' },
        description: 'They always do dinner at the same Italian place they went to on their first date.',
        tags: ['family'], isArchived: false, createdAt: now, updatedAt: now,
      },
      {
        id: dadBdayId, title: "Dad's Birthday",
        type: 'birthday', date: { month: 3, day: 22, year: 1955 },
        personIds: [robertId], recurrence: { type: 'yearly' },
        tags: [], isArchived: false, createdAt: now, updatedAt: now,
      },
      {
        id: momBdayId, title: "Mom's Birthday",
        type: 'birthday', date: { month: 7, day: 4, year: 1958 },
        personIds: [lisaId], recurrence: { type: 'yearly' },
        tags: [], isArchived: false, createdAt: now, updatedAt: now,
      },
      {
        id: jakeMillId, title: "Jake's 30th Birthday",
        type: 'milestone', date: { month: 11, day: 3, year: 1994 },
        personIds: [jakeId], recurrence: { type: 'yearly' },
        description: 'Big one — he said he wanted to do a hiking trip.',
        tags: [], isArchived: false, createdAt: now, updatedAt: now,
      },
      {
        id: roadTripId, title: 'Coastal Road Trip',
        type: 'milestone', date: { month: 8, day: 20, year: thisYear - 1 },
        personIds: [sarahId], recurrence: { type: 'none' },
        description: 'Spontaneous trip up the coast. Five days, no plan.',
        tags: ['travel'], isArchived: false, createdAt: now, updatedAt: now,
      },
    ];

    // ── Gifts ──────────────────────────────────────────────────────────────────
    const gifts: Gift[] = [
      {
        id: generateId(), personId: sarahId, year: thisYear - 1,
        description: 'Blue silk scarf', status: 'given',
        notes: 'From the boutique on Vine Street. She wore it immediately.',
        eventId: sarahBdayId,
        givenAt: new Date(thisYear - 1, 0, 15).getTime(),
        createdAt: now, updatedAt: now,
      },
      {
        id: generateId(), personId: robertId, year: thisYear - 1,
        description: 'Noise-cancelling headphones', status: 'given',
        price: 280, eventId: dadBdayId,
        notes: 'Sony WH-1000XM5. He uses them every morning for his jazz playlist.',
        givenAt: new Date(thisYear - 1, 2, 22).getTime(),
        createdAt: now, updatedAt: now,
      },
      {
        id: generateId(), personId: jakeId, year: thisYear,
        description: 'Hiking boots', status: 'planned',
        notes: 'Size 11. He mentioned the Salomon X Ultra 4.',
        eventId: jakeMillId,
        createdAt: now, updatedAt: now,
      },
      {
        id: generateId(), personId: lisaId, year: thisYear,
        description: 'Ceramic planter set', status: 'idea',
        notes: 'She mentioned wanting to expand the herb garden.',
        createdAt: now, updatedAt: now,
      },
    ];

    // ── Memories ───────────────────────────────────────────────────────────────
    const memories: Memory[] = [
      {
        id: generateId(),
        title: "Parents' 40th — the speech",
        note: 'Dad tried to give a speech halfway through dinner. Got three sentences in before he went quiet, smiled, and just raised his glass. Mom cried. We all did.',
        date: new Date(thisYear - 1, 5, 8).getTime(),
        personIds: [robertId, lisaId], eventId: parentsAnnId,
        createdAt: now, updatedAt: now,
      },
      {
        id: generateId(),
        title: 'Coastal surprise',
        note: "Sarah had absolutely no idea. Packed her bag while she was at the gym, told her we were going out for lunch. Didn't reveal the destination until we hit the highway. Her face. Worth it.",
        date: new Date(thisYear - 1, 7, 20).getTime(),
        personIds: [sarahId], eventId: roadTripId,
        createdAt: now, updatedAt: now,
      },
      {
        id: generateId(),
        title: "Jake's farewell hike",
        note: 'Eight miles, rain the whole way. Jake kept saying it was "character-building." Pretty sure he was miserable too but neither of us would admit it. Best day.',
        date: new Date(thisYear - 2, 4, 12).getTime(),
        personIds: [jakeId],
        createdAt: now, updatedAt: now,
      },
    ];

    await db.transaction('rw', [db.people, db.events, db.gifts, db.memories], async () => {
      await db.people.bulkAdd(people);
      await db.events.bulkAdd(events);
      await db.gifts.bulkAdd(gifts);
      await db.memories.bulkAdd(memories);
    });
  }

  async isEmpty(): Promise<boolean> {
    const [p, e] = await Promise.all([db.people.count(), db.events.count()]);
    return p === 0 && e === 0;
  }
}
