import Dexie, { type EntityTable } from 'dexie';
import type { Person, MomentoEvent, Memory, Gift } from '@types';

class MomentoDB extends Dexie {
  people!: EntityTable<Person, 'id'>;
  events!: EntityTable<MomentoEvent, 'id'>;
  memories!: EntityTable<Memory, 'id'>;
  gifts!: EntityTable<Gift, 'id'>;

  constructor() {
    super('momento-db');

    /**
     * Version 1 schema.
     * Indexed fields: only those used in queries/sorts — not every field.
     *
     * people:   query by name (sort), relationship (filter)
     * events:   query by personId (person profile), type, isArchived (home screen filter)
     * memories: query by eventId (event detail), date (timeline sort)
     * gifts:    query by personId (person profile), year (annual grouping), status (filter)
     *
     * Multi-entry index on memories.personIds allows querying by a single personId
     * even though the field is an array.
     */
    this.version(1).stores({
      people:   'id, name, relationship, createdAt',
      events:   'id, type, personId, isArchived, createdAt, [personId+type]',
      memories: 'id, eventId, date, createdAt, *personIds',
      gifts:    'id, personId, year, status, createdAt, [personId+year]',
    });
  }
}

/**
 * Singleton Dexie instance — import `db` directly in services.
 * Never instantiate MomentoDB more than once; IndexedDB connections
 * are shared per origin, and Dexie manages the connection lifecycle.
 */
export const db = new MomentoDB();
