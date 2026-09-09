import { Injectable, inject } from '@angular/core';
import { db } from '@core/db/database.service';
import { SettingsService } from '@core/services/settings.service';
import { nextOccurrence, daysUntil } from '@utils/dates';

const SHOWN_KEY = 'momento-notif-shown';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly settingsService = inject(SettingsService);

  get permission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    return Notification.requestPermission();
  }

  async checkAndNotify(): Promise<void> {
    const settings = this.settingsService.settings();
    if (!settings.notificationsEnabled) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const today = new Date().toISOString().slice(0, 10);
    const shownKey = `${SHOWN_KEY}-${today}`;
    let shown: Set<string>;
    try {
      shown = new Set<string>(JSON.parse(localStorage.getItem(shownKey) ?? '[]'));
    } catch {
      shown = new Set();
    }

    const events = await db.events.filter(e => !e.isArchived).toArray();
    const reminderDays = settings.reminderDays;

    for (const event of events) {
      if (shown.has(event.id)) continue;
      const next = nextOccurrence(event.date, event.recurrence.type);
      const days = daysUntil(next);
      if (reminderDays.includes(days)) {
        const label = days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `In ${days} days`;
        new Notification(`${event.title} — ${label}`, {
          body: 'Open Momento to see details.',
          icon: '/favicon.svg',
          tag: event.id,
        });
        shown.add(event.id);
      }
    }

    try {
      localStorage.setItem(shownKey, JSON.stringify([...shown]));
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(SHOWN_KEY + '-') && key !== shownKey) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
  }
}
