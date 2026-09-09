import { Injectable, effect, signal } from '@angular/core';
import type { Settings, Theme } from '@types';

const STORAGE_KEY = 'momento-settings';

const DEFAULTS: Settings = {
  theme: 'system',
  dateFormat: 'dmy',
  upcomingWindowDays: 60,
  notificationsEnabled: false,
  reminderDays: [0, 1, 7],
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<Settings>(this.load());

  constructor() {
    // Apply the stored theme immediately on init
    this.applyTheme(this.settings().theme);

    // Persist + apply whenever settings change
    effect(() => {
      const s = this.settings();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      } catch {
        // localStorage may be unavailable in some contexts
      }
      this.applyTheme(s.theme);
    });
  }

  update(partial: Partial<Settings>): void {
    this.settings.update(current => ({ ...current, ...partial }));
  }

  applyTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'system') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', theme);
    }
  }

  private load(): Settings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      // corrupt storage — fall through to defaults
    }
    return { ...DEFAULTS };
  }
}
