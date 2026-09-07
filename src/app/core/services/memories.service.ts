import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';
import { db } from '@core/db/database.service';
import { generateId } from '@utils/id';
import type { Memory } from '@types';

export type MemoryInput = Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class MemoriesService {
  forPerson(personId: string) {
    return toSignal(
      from(liveQuery(() =>
        db.memories.where('personIds').equals(personId).reverse().sortBy('date')
      )),
      { initialValue: [] as Memory[] }
    );
  }

  forEvent(eventId: string) {
    return toSignal(
      from(liveQuery(() =>
        db.memories.where('eventId').equals(eventId).reverse().sortBy('date')
      )),
      { initialValue: [] as Memory[] }
    );
  }

  /** All memories in reverse chronological order — used for timeline */
  readonly allChronological = toSignal(
    from(liveQuery(() => db.memories.orderBy('date').reverse().toArray())),
    { initialValue: [] as Memory[] }
  );

  async add(input: MemoryInput): Promise<string> {
    const now = Date.now();
    const memory: Memory = { ...input, id: generateId(), createdAt: now, updatedAt: now };
    await db.memories.add(memory);
    return memory.id;
  }

  async update(id: string, changes: Partial<MemoryInput>): Promise<void> {
    await db.memories.update(id, { ...changes, updatedAt: Date.now() });
  }

  async delete(id: string): Promise<void> {
    await db.memories.delete(id);
  }
}
