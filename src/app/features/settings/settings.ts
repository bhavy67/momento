import {
  ChangeDetectionStrategy, Component, computed,
  ElementRef, inject, signal, viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '@core/services/settings.service';
import { NotificationService } from '@core/services/notification.service';
import { PeopleService } from '@core/services/people.service';
import { EventsService } from '@core/services/events.service';
import { GiftsService } from '@core/services/gifts.service';
import { MemoriesService } from '@core/services/memories.service';
import { UiStateService } from '@core/services/ui-state.service';
import { db } from '@core/db/database.service';
import type { BackupData, Theme } from '@types';

interface ImportResult {
  people: number;
  events: number;
  memories: number;
  gifts: number;
}

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly settingsService = inject(SettingsService);
  private readonly notifService    = inject(NotificationService);
  private readonly people          = inject(PeopleService);
  private readonly eventsService   = inject(EventsService);
  private readonly gifts           = inject(GiftsService);
  private readonly memories        = inject(MemoriesService);
  private readonly ui              = inject(UiStateService);
  private readonly router          = inject(Router);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly s = this.settingsService.settings;

  protected readonly counts = computed(() => ({
    people:   this.people.all().length,
    events:   this.eventsService.all().length,
    memories: this.memories.allChronological().length,
    gifts:    this.gifts.all().length,
  }));

  // ── Import state ──────────────────────────────────────────────────────────
  protected readonly importing     = signal(false);
  protected readonly importResult  = signal<ImportResult | null>(null);
  protected readonly importError   = signal<string | null>(null);

  // ── Clear state ───────────────────────────────────────────────────────────
  protected readonly showClearConfirm = signal(false);
  protected readonly clearText        = signal('');
  protected readonly clearing         = signal(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  protected readonly notifPermission = signal<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  protected readonly reminderDayOptions: { value: number; label: string }[] = [
    { value: 0,  label: 'Day of'  },
    { value: 1,  label: '1 day'   },
    { value: 3,  label: '3 days'  },
    { value: 7,  label: '7 days'  },
    { value: 14, label: '14 days' },
  ];

  protected readonly themeOptions: { value: Theme; label: string }[] = [
    { value: 'light',  label: 'Light'  },
    { value: 'system', label: 'System' },
    { value: 'dark',   label: 'Dark'   },
  ];

  protected readonly countItems = computed(() => [
    { label: 'People',   count: this.counts().people   },
    { label: 'Events',   count: this.counts().events   },
    { label: 'Memories', count: this.counts().memories },
    { label: 'Gifts',    count: this.counts().gifts    },
  ]);

  // ── Preferences ───────────────────────────────────────────────────────────

  protected setTheme(theme: Theme): void {
    this.settingsService.update({ theme });
  }

  protected setWindow(e: Event): void {
    const val = parseInt((e.target as HTMLSelectElement).value, 10);
    this.settingsService.update({ upcomingWindowDays: val });
  }

  protected setDateFormat(e: Event): void {
    const val = (e.target as HTMLSelectElement).value as 'dmy' | 'mdy';
    this.settingsService.update({ dateFormat: val });
  }

  // ── Export ────────────────────────────────────────────────────────────────

  protected async exportData(): Promise<void> {
    try {
      const [people, events, memories, gifts] = await Promise.all([
        db.people.toArray(),
        db.events.toArray(),
        db.memories.toArray(),
        db.gifts.toArray(),
      ]);

      const backup: BackupData = {
        version: 1,
        exportedAt: Date.now(),
        data: { people, events, memories, gifts },
      };

      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `momento-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.ui.notify('Backup downloaded', 'success');
    } catch {
      this.ui.notify('Export failed', 'error');
    }
  }

  protected triggerImport(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected async onFileChange(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.importing.set(true);
    this.importResult.set(null);
    this.importError.set(null);

    try {
      const text   = await file.text();
      const backup = JSON.parse(text) as BackupData;

      if (
        typeof backup.version !== 'number' ||
        !backup.data ||
        !Array.isArray(backup.data.people) ||
        !Array.isArray(backup.data.events) ||
        !Array.isArray(backup.data.memories) ||
        !Array.isArray(backup.data.gifts)
      ) {
        throw new Error('Invalid backup format — this file was not created by Momento');
      }

      await db.transaction('rw', [db.people, db.events, db.memories, db.gifts], async () => {
        await db.people.bulkPut(backup.data.people);
        await db.events.bulkPut(backup.data.events);
        await db.memories.bulkPut(backup.data.memories);
        await db.gifts.bulkPut(backup.data.gifts);
      });

      this.importResult.set({
        people:   backup.data.people.length,
        events:   backup.data.events.length,
        memories: backup.data.memories.length,
        gifts:    backup.data.gifts.length,
      });
      this.ui.notify('Import successful', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.importError.set(msg);
      this.ui.notify('Import failed', 'error');
    } finally {
      this.importing.set(false);
      // Reset file input so the same file can be re-selected
      const input = this.fileInput()?.nativeElement;
      if (input) input.value = '';
    }
  }

  // ── Clear data ────────────────────────────────────────────────────────────

  protected get canClear(): boolean {
    return this.clearText() === 'DELETE';
  }

  protected async clearAllData(): Promise<void> {
    if (!this.canClear || this.clearing()) return;
    this.clearing.set(true);
    try {
      await db.delete();
      await db.open();
      this.showClearConfirm.set(false);
      this.clearText.set('');
      this.ui.notify('All data cleared', 'info');
      this.router.navigate(['/home']);
    } catch {
      this.ui.notify('Failed to clear data', 'error');
      this.clearing.set(false);
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  protected isReminderDayActive(day: number): boolean {
    return this.s().reminderDays.includes(day);
  }

  protected toggleReminderDay(day: number): void {
    const current = this.s().reminderDays;
    const next = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort((a, b) => a - b);
    this.settingsService.update({ reminderDays: next });
  }

  protected async toggleNotifications(): Promise<void> {
    const current = this.s().notificationsEnabled;
    if (!current && 'Notification' in window) {
      const perm = await this.notifService.requestPermission();
      this.notifPermission.set(perm);
      if (perm !== 'granted') return;
    }
    this.settingsService.update({ notificationsEnabled: !current });
  }

  // ── ICS Export ────────────────────────────────────────────────────────────

  protected async exportICS(): Promise<void> {
    try {
      const events = await db.events.filter(e => !e.isArchived).toArray();
      const pad    = (n: number) => String(n).padStart(2, '0');
      const now    = new Date();
      const dtstamp = now.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

      const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Momento//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
      ];

      for (const e of events) {
        const yy = e.date.year ?? now.getFullYear();
        const dtstart = `${yy}${pad(e.date.month)}${pad(e.date.day)}`;
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${e.id}@momento`);
        lines.push(`DTSTAMP:${dtstamp}`);
        lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
        if (e.recurrence.type === 'yearly')  lines.push('RRULE:FREQ=YEARLY');
        if (e.recurrence.type === 'monthly') lines.push('RRULE:FREQ=MONTHLY');
        lines.push(`SUMMARY:${e.title.replace(/[\r\n]+/g, '\\n')}`);
        if (e.description) lines.push(`DESCRIPTION:${e.description.replace(/[\r\n]+/g, '\\n')}`);
        lines.push('END:VEVENT');
      }

      lines.push('END:VCALENDAR');

      const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `momento-events-${now.toISOString().slice(0, 10)}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.ui.notify('Calendar exported', 'success');
    } catch {
      this.ui.notify('Export failed', 'error');
    }
  }

}
