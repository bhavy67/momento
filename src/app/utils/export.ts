import { db } from '@core/db/database.service';
import type { BackupData } from '@types';

const BACKUP_VERSION = 1;

export async function exportData(): Promise<string> {
  const [people, events, memories, gifts] = await Promise.all([
    db.people.toArray(),
    db.events.toArray(),
    db.memories.toArray(),
    db.gifts.toArray(),
  ]);

  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    data: { people, events, memories, gifts },
  };

  return JSON.stringify(backup, null, 2);
}

export function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function backupFilename(): string {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `momento-backup-${date}.json`;
}
