import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';
import { db } from '@core/db/database.service';
import { generateId } from '@utils/id';
import type { MomentoEvent, EventType } from '@types';

export type EventInput = Omit<MomentoEvent, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class EventsService {
  readonly all = toSignal(
    from(liveQuery(() =>
      db.events.orderBy('createdAt').reverse().filter(e => !e.isArchived).toArray()
    )),
    { initialValue: [] as MomentoEvent[] }
  );

  readonly allWithArchived = toSignal(
    from(liveQuery(() =>
      db.events.orderBy('createdAt').reverse().toArray()
    )),
    { initialValue: [] as MomentoEvent[] }
  );

  readonly archived = toSignal(
    from(liveQuery(() =>
      db.events.filter(e => !!e.isArchived).reverse().sortBy('updatedAt')
    )),
    { initialValue: [] as MomentoEvent[] }
  );

  forPerson(personId: string) {
    return toSignal(
      from(liveQuery(() =>
        db.events.where('personIds').equals(personId).sortBy('createdAt')
      )),
      { initialValue: [] as MomentoEvent[] }
    );
  }

  getById(id: string) {
    return toSignal(
      from(liveQuery(() => db.events.get(id))),
      { initialValue: undefined as MomentoEvent | undefined }
    );
  }

  byType(type: EventType) {
    return toSignal(
      from(liveQuery(() => db.events.where('type').equals(type).toArray())),
      { initialValue: [] as MomentoEvent[] }
    );
  }

  async add(input: EventInput): Promise<string> {
    const now = Date.now();
    const event: MomentoEvent = { ...input, id: generateId(), createdAt: now, updatedAt: now };
    await db.events.add(event);
    return event.id;
  }

  async update(id: string, changes: Partial<EventInput>): Promise<void> {
    await db.events.update(id, { ...changes, updatedAt: Date.now() });
  }

  async archive(id: string): Promise<void> {
    await db.events.update(id, { isArchived: true, updatedAt: Date.now() });
  }

  async unarchive(id: string): Promise<void> {
    await db.events.update(id, { isArchived: false, updatedAt: Date.now() });
  }

  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.events, db.memories], async () => {
      await db.memories.where('eventId').equals(id).modify({ eventId: undefined, updatedAt: Date.now() });
      await db.events.delete(id);
    });
  }
}
