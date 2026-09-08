import {
  ChangeDetectionStrategy, Component, computed,
  inject, input, signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PeopleService } from '@core/services/people.service';
import { EventsService } from '@core/services/events.service';
import { GiftsService } from '@core/services/gifts.service';
import { MemoriesService } from '@core/services/memories.service';
import { UiStateService } from '@core/services/ui-state.service';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import {
  formatLocalDate, daysUntil, nextOccurrence,
  turningAge, ageOnDate,
} from '@utils/dates';
import type { Gift, Memory, MomentoEvent } from '@types';

type Tab = 'events' | 'gifts' | 'memories';

interface GiftGroup { year: number; gifts: Gift[] }

@Component({
  selector: 'app-person-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ConfirmDialog, FormsModule],
  templateUrl: './person-detail.html',
  styleUrl: './person-detail.css',
})
export class PersonDetail {
  readonly id = input.required<string>();

  private readonly people   = inject(PeopleService);
  private readonly events   = inject(EventsService);
  private readonly gifts    = inject(GiftsService);
  private readonly memories = inject(MemoriesService);
  private readonly ui       = inject(UiStateService);
  private readonly router   = inject(Router);

  protected readonly activeTab         = signal<Tab>('events');
  protected readonly showDeleteConfirm = signal(false);
  protected readonly isEditingNotes    = signal(false);
  protected readonly notesDraft        = signal('');

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

  protected readonly giftsByYear = computed((): GiftGroup[] => {
    const byYear = new Map<number, Gift[]>();
    for (const g of this.gifts.all().filter(g => g.personId === this.id())) {
      const list = byYear.get(g.year) ?? [];
      list.push(g);
      byYear.set(g.year, list);
    }
    return Array.from(byYear.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, gifts]) => ({ year, gifts }));
  });

  protected readonly personMemories = computed((): Memory[] =>
    this.memories.allChronological().filter(m => m.personIds.includes(this.id()))
  );

  protected readonly birthdayInfo = computed(() => {
    const p = this.person();
    if (!p?.birthday) return null;
    const days    = daysUntil(nextOccurrence(p.birthday, 'yearly'));
    const turning = turningAge(p.birthday);
    const current = ageOnDate(p.birthday);
    return { days, turning, current, formatted: formatLocalDate(p.birthday) };
  });

  protected readonly eventsCount   = computed(() => this.personEvents().length);
  protected readonly giftsCount    = computed(() =>
    this.gifts.all().filter(g => g.personId === this.id()).length
  );
  protected readonly memoriesCount = computed(() => this.personMemories().length);

  protected startEditingNotes(): void {
    this.notesDraft.set(this.person()?.notes ?? '');
    this.isEditingNotes.set(true);
  }

  protected async saveNotes(): Promise<void> {
    const p = this.person();
    if (!p) return;
    const notes = this.notesDraft().trim();
    this.isEditingNotes.set(false);
    if (notes !== (p.notes ?? '')) {
      await this.people.update(p.id, { notes: notes || undefined });
    }
  }

  protected countdownDays(e: MomentoEvent): number {
    return daysUntil(nextOccurrence(e.date, e.recurrence.type));
  }

  protected countdownLabel(e: MomentoEvent): string {
    const d = this.countdownDays(e);
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    if (d < 7)   return `${d} days`;
    if (d < 14)  return '1 week';
    const weeks = Math.round(d / 7);
    return `${weeks} weeks`;
  }

  protected formatMemoryDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  protected giftStatusLabel(status: string): string {
    return { idea: 'Idea', planned: 'Planned', purchased: 'Purchased', given: 'Given' }[status] ?? status;
  }

  protected relLabel(r: string): string {
    return r.charAt(0).toUpperCase() + r.slice(1);
  }

  protected async deletePerson(): Promise<void> {
    const p = this.person();
    if (!p) return;
    this.showDeleteConfirm.set(false);
    await this.people.delete(p.id);
    this.ui.notify(`${p.name} deleted`, 'info');
    this.router.navigate(['/people']);
  }
}
