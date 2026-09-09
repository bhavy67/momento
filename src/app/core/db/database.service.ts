import Dexie, { type EntityTable } from 'dexie';
import type { Person, MomentoEvent, Memory, Gift } from '@types';

class MomentoDB extends Dexie {
  people!: EntityTable<Person, 'id'>;
  events!: EntityTable<MomentoEvent, 'id'>;
  memories!: EntityTable<Memory, 'id'>;
  gifts!: EntityTable<Gift, 'id'>;

  constructor() {
    super('momento-db');

    this.version(1).stores({
      people:   'id, name, relationship, createdAt',
      events:   'id, type, personId, isArchived, createdAt, [personId+type]',
      memories: 'id, eventId, date, createdAt, *personIds',
      gifts:    'id, personId, year, status, createdAt, [personId+year]',
    });

    /**
     * v2: events.personId (single) → personIds (multi-entry array).
     * Existing records are migrated: personId → personIds[0].
     */
    this.version(2).stores({
      people:   'id, name, relationship, createdAt',
      events:   'id, type, *personIds, isArchived, createdAt',
      memories: 'id, eventId, date, createdAt, *personIds',
      gifts:    'id, personId, year, status, createdAt, [personId+year]',
    }).upgrade(tx =>
      tx.table('events').toCollection().modify((event: any) => {
        if (!Array.isArray(event.personIds)) {
          event.personIds = event.personId ? [event.personId] : [];
        }
        delete event.personId;
      })
    );
  }
}

export const db = new MomentoDB();
