import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PeopleService } from '@core/services/people.service';
import { EventsService } from '@core/services/events.service';
import { UiStateService } from '@core/services/ui-state.service';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { formatLocalDate, daysUntil, nextOccurrence, turningAge } from '@utils/dates';
import type { MomentoEvent } from '@types';

@Component({
  selector: 'app-person-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './person-detail.html',
  styleUrl: './person-detail.css',
})
export class PersonDetail {
  readonly id = input.required<string>();

  private readonly people = inject(PeopleService);
  private readonly events = inject(EventsService);
  private readonly ui     = inject(UiStateService);
  private readonly router = inject(Router);

  protected readonly showDeleteConfirm = signal(false);

  protected readonly person = computed(() =>
    this.people.all().find(p => p.id === this.id())
  );

  protected readonly personEvents = computed(() =>
    this.events.all()
      .filter(e => e.personId === this.id() && !e.isArchived)
      .sort((a, b) => {
        const da = daysUntil(nextOccurrence(a.date, a.recurrence.type));
        const db = daysUntil(nextOccurrence(b.date, b.recurrence.type));
        return da - db;
      })
  );

  protected formatBirthday(): string {
    const p = this.person();
    return p?.birthday ? formatLocalDate(p.birthday) : '—';
  }

  protected turningAge(): number | null {
    const p = this.person();
    return p?.birthday ? turningAge(p.birthday) : null;
  }

  protected countdownDays(e: MomentoEvent): number {
    return daysUntil(nextOccurrence(e.date, e.recurrence.type));
  }

  protected countdownLabel(e: MomentoEvent): string {
    const d = this.countdownDays(e);
    if (d === 0) return 'Today';
    if (d === 1) return '1 day';
    return `${d}d`;
  }

  protected async deletePerson(): Promise<void> {
    const p = this.person();
    if (!p) return;
    this.showDeleteConfirm.set(false);
    await this.people.delete(p.id);
    this.ui.notify(`${p.name} deleted`, 'info');
    this.router.navigate(['/people']);
  }

  protected relLabel(r: string): string {
    return r.charAt(0).toUpperCase() + r.slice(1);
  }
}
