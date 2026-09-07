import { Injectable, signal } from '@angular/core';
import { generateId } from '@utils/id';
import type { Notification, NotificationType } from '@types';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  // ─── Quick Add sheet ───────────────────────────────────────────────────────
  readonly quickAddOpen = signal(false);

  openQuickAdd(): void { this.quickAddOpen.set(true); }
  closeQuickAdd(): void { this.quickAddOpen.set(false); }

  // ─── Notifications (toast) ────────────────────────────────────────────────
  readonly notifications = signal<Notification[]>([]);

  notify(message: string, type: NotificationType = 'info', durationMs = 3500): void {
    const id = generateId();
    this.notifications.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: string): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  // ─── Mobile nav drawer ────────────────────────────────────────────────────
  readonly navDrawerOpen = signal(false);

  openNavDrawer(): void { this.navDrawerOpen.set(true); }
  closeNavDrawer(): void { this.navDrawerOpen.set(false); }
}
