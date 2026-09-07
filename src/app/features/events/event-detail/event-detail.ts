import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventsService } from '@core/services/events.service';
import { PeopleService } from '@core/services/people.service';
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

  private readonly eventsService = inject(EventsService);
  private readonly people        = inject(PeopleService);
  private readonly ui            = inject(UiStateService);
  private readonly router        = inject(Router);

  protected readonly showDeleteConfirm  = signal(false);
  protected readonly showArchiveConfirm = signal(false);

  protected readonly event = computed(() =>
    this.eventsService.all().find(e => e.id === this.id())
  );

  protected readonly person = computed(() => {
    const pid = this.event()?.personId;
    return pid ? this.people.all().find(p => p.id === pid) : undefined;
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

  protected async archiveEvent(): Promise<void> {
    const e = this.event();
    if (!e) return;
    this.showArchiveConfirm.set(false);
    await this.eventsService.archive(e.id);
    this.ui.notify('Event archived', 'info');
    this.router.navigate(['/people']);
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
