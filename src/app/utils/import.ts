import { db } from '@core/db/database.service';
import type { BackupData } from '@types';

export interface ImportResult {
  people: number;
  events: number;
  memories: number;
  gifts: number;
}

function isValidBackup(raw: unknown): raw is BackupData {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  if (typeof obj['version'] !== 'number') return false;
  if (typeof obj['exportedAt'] !== 'number') return false;
  const data = obj['data'];
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d['people']) && Array.isArray(d['events']) &&
         Array.isArray(d['memories']) && Array.isArray(d['gifts']);
}

export async function importData(json: string): Promise<ImportResult> {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error('The file is not valid JSON. Please check the file and try again.');
  }

  if (!isValidBackup(raw)) {
    throw new Error('This does not look like a Momento backup file. Make sure you selected the correct file.');
  }

  const { people, events, memories, gifts } = raw.data;

  await db.transaction('rw', [db.people, db.events, db.memories, db.gifts], async () => {
    await db.people.bulkPut(people);
    await db.events.bulkPut(events);
    await db.memories.bulkPut(memories);
    await db.gifts.bulkPut(gifts);
  });

  return {
    people: people.length,
    events: events.length,
    memories: memories.length,
    gifts: gifts.length,
  };
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.people, db.events, db.memories, db.gifts], async () => {
    await Promise.all([
      db.people.clear(),
      db.events.clear(),
      db.memories.clear(),
      db.gifts.clear(),
    ]);
  });
}
