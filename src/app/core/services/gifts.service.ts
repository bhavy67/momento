import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';
import { db } from '@core/db/database.service';
import { generateId } from '@utils/id';
import type { Gift, GiftStatus } from '@types';

export type GiftInput = Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class GiftsService {
  readonly all = toSignal(
    from(liveQuery(() => db.gifts.toArray())),
    { initialValue: [] as Gift[] }
  );

  forPerson(personId: string) {
    return toSignal(
      from(liveQuery(() =>
        db.gifts.where('personId').equals(personId).sortBy('year').then(arr => arr.reverse())
      )),
      { initialValue: [] as Gift[] }
    );
  }

  forPersonAndYear(personId: string, year: number) {
    return toSignal(
      from(liveQuery(() =>
        db.gifts.where('[personId+year]').equals([personId, year]).toArray()
      )),
      { initialValue: [] as Gift[] }
    );
  }

  async add(input: GiftInput): Promise<string> {
    const now = Date.now();
    const gift: Gift = { ...input, id: generateId(), createdAt: now, updatedAt: now };
    await db.gifts.add(gift);
    return gift.id;
  }

  async update(id: string, changes: Partial<GiftInput>): Promise<void> {
    await db.gifts.update(id, { ...changes, updatedAt: Date.now() });
  }

  async updateStatus(id: string, status: GiftStatus): Promise<void> {
    const changes: Partial<Gift> = { status, updatedAt: Date.now() };
    if (status === 'given') changes.givenAt = Date.now();
    await db.gifts.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    await db.gifts.delete(id);
  }
}
