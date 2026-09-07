import { Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';
import { db } from '@core/db/database.service';
import { generateId } from '@utils/id';
import type { Person, Relationship } from '@types';

export type PersonInput = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class PeopleService {
  /** All people sorted by name — live-updating signal from IndexedDB */
  readonly all = toSignal(
    from(liveQuery(() => db.people.orderBy('name').toArray())),
    { initialValue: [] as Person[] }
  );

  getById(id: string) {
    return toSignal(
      from(liveQuery(() => db.people.get(id))),
      { initialValue: undefined as Person | undefined }
    );
  }

  getByRelationship(rel: Relationship) {
    return toSignal(
      from(liveQuery(() => db.people.where('relationship').equals(rel).sortBy('name'))),
      { initialValue: [] as Person[] }
    );
  }

  async add(input: PersonInput): Promise<string> {
    const now = Date.now();
    const person: Person = { ...input, id: generateId(), createdAt: now, updatedAt: now };
    await db.people.add(person);
    return person.id;
  }

  async update(id: string, changes: Partial<PersonInput>): Promise<void> {
    await db.people.update(id, { ...changes, updatedAt: Date.now() });
  }

  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.people, db.events, db.gifts, db.memories], async () => {
      // Remove person from memories.personIds arrays instead of deleting memories,
      // since memories may involve multiple people
      const linkedMemories = await db.memories.where('personIds').equals(id).toArray();
      for (const memory of linkedMemories) {
        const remaining = memory.personIds.filter(pid => pid !== id);
        if (remaining.length === 0) {
          await db.memories.delete(memory.id);
        } else {
          await db.memories.update(memory.id, { personIds: remaining, updatedAt: Date.now() });
        }
      }

      await db.events.where('personId').equals(id).delete();
      await db.gifts.where('personId').equals(id).delete();
      await db.people.delete(id);
    });
  }
}
