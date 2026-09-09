import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventsService } from '@core/services/events.service';
import { PeopleService } from '@core/services/people.service';
import { GiftsService } from '@core/services/gifts.service';
import { MemoriesService } from '@core/services/memories.service';
import { UiStateService } from '@core/services/ui-state.service';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import {
  daysUntil, nextOccurrence, formatLocalDate, formatDate,
  yearsSince, milestoneLabel, isMilestoneYear, formatCountdown,
} from '@utils/dates';
import { getNextOccurrences } from '@utils/recurrence';

@Component({
  selector: 'app-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetail {
  readonly id = input.required<string>();

  private readonly eventsService   = inject(EventsService);
  private readonly people          = inject(PeopleService);
  private readonly gifts           = inject(GiftsService);
  private readonly memories        = inject(MemoriesService);
  private readonly ui              = inject(UiStateService);
  private readonly router          = inject(Router);

  protected readonly showDeleteConfirm   = signal(false);
  protected readonly showArchiveConfirm  = signal(false);
  protected readonly showRestoreConfirm  = signal(false);

  protected readonly event = computed(() =>
    this.eventsService.allWithArchived().find(e => e.id === this.id())
  );

  protected readonly isArchived = computed(() => !!this.event()?.isArchived);

  protected readonly person = computed(() => {
    const ids = this.event()?.personIds ?? [];
    return ids[0] ? this.people.all().find(p => p.id === ids[0]) : undefined;
  });

  protected readonly linkedPeople = computed(() => {
    const ids = this.event()?.personIds ?? [];
    return ids.map(id => this.people.all().find(p => p.id === id)).filter(Boolean);
  });

  protected readonly daysAway = computed(() => {
    const e = this.event();
    if (!e) return 0;
    return daysUntil(nextOccurrence(e.date, e.recurrence.type));
  });

  protected readonly countdownLabel = computed(() => formatCountdown(this.daysAway()));

  protected readonly nextOccurrences = computed(() => {
    const e = this.event();
    if (!e) return [];
    return getNextOccurrences(e, 3).map(d => ({
      label: formatDate(d),
      days: daysUntil(d),
    }));
  });

  protected readonly yearsCount = computed(() => {
    const e = this.event();
    return e ? yearsSince(e.date) : null;
  });

  protected readonly milestoneInfo = computed(() => {
    const y = this.yearsCount();
    if (y !== null && isMilestoneYear(y + 1)) {
      return milestoneLabel(y + 1);
    }
    return null;
  });

  protected readonly thisYearMemory = computed(() => {
    const e = this.event();
    if (!e) return null;
    const thisYear = new Date().getFullYear();
    const yearStart = new Date(thisYear, 0, 1).getTime();
    const yearEnd   = new Date(thisYear, 11, 31, 23, 59, 59, 999).getTime();
    return this.memories.allChronological()
      .find(m => m.eventId === e.id && m.date >= yearStart && m.date <= yearEnd) ?? null;
  });

  protected readonly lastYearContext = computed(() => {
    const e = this.event();
    if (!e?.personIds?.length) return null;

    const prevYear  = new Date().getFullYear() - 1;
    const yearStart = new Date(prevYear, 0, 1).getTime();
    const yearEnd   = new Date(prevYear, 11, 31, 23, 59, 59, 999).getTime();

    const personGifts = this.gifts.all()
      .filter(g => g.personId === e.personIds[0] && g.year === prevYear);
    const topGift = personGifts.find(g => g.status === 'given')
      ?? personGifts.find(g => g.status === 'purchased')
      ?? personGifts[0];

    const memory = this.memories.allChronological()
      .find(m => m.eventId === e.id && m.date >= yearStart && m.date <= yearEnd);

    if (!topGift && !memory) return null;
    return { gift: topGift, memory, year: prevYear };
  });

  protected formatEventDate(): string {
    const e = this.event();
    return e ? formatLocalDate(e.date) : '';
  }

  protected readonly formatCountdown = formatCountdown;

  protected typeLabel(t: string): string {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  protected recurrenceLabel(r: string): string {
    if (r === 'yearly')  return 'Every year';
    if (r === 'monthly') return 'Every month';
    return 'One-time';
  }

  protected giftStatusLabel(s: string): string {
    return { idea: 'Idea', planned: 'Planned', purchased: 'Purchased', given: 'Given' }[s] ?? s;
  }

  protected async archiveEvent(): Promise<void> {
    const e = this.event();
    if (!e) return;
    this.showArchiveConfirm.set(false);
    await this.eventsService.archive(e.id);
    this.ui.notify('Event archived', 'info');
    this.router.navigate(['/people']);
  }

  protected async restoreEvent(): Promise<void> {
    const e = this.event();
    if (!e) return;
    this.showRestoreConfirm.set(false);
    await this.eventsService.unarchive(e.id);
    this.ui.notify('Event restored', 'success');
  }

  protected async deleteEvent(): Promise<void> {
    const e = this.event();
    if (!e) return;
    this.showDeleteConfirm.set(false);
    await this.eventsService.delete(e.id);
    this.ui.notify('Event deleted', 'info');
    this.router.navigate(['/people']);
  }
}
