import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsService } from '@core/services/events.service';
import { PeopleService } from '@core/services/people.service';
import { nextOccurrence, daysUntil, formatCountdown, formatLocalDate } from '@utils/dates';
import type { EventType, MomentoEvent, Person } from '@types';

interface EventRow {
  event:        MomentoEvent;
  days:         number;
  dateLabel:    string;
  linkedPeople: Person[];
}

const TYPE_FILTERS: { value: EventType | null; label: string }[] = [
  { value: null,          label: 'All'          },
  { value: 'birthday',    label: 'Birthdays'    },
  { value: 'anniversary', label: 'Anniversaries'},
  { value: 'milestone',   label: 'Milestones'   },
  { value: 'custom',      label: 'Custom'       },
];

@Component({
  selector: 'app-event-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './event-list.html',
  styleUrl: './event-list.css',
})
export class EventList {
  private readonly eventsService = inject(EventsService);
  private readonly people        = inject(PeopleService);

  protected readonly TYPE_FILTERS = TYPE_FILTERS;
  protected readonly filterType   = signal<EventType | null>(null);

  protected readonly rows = computed((): EventRow[] => {
    const allPeople = this.people.all();
    const type      = this.filterType();

    return this.eventsService.all()
      .filter(e => !type || e.type === type)
      .map(e => {
        const next  = nextOccurrence(e.date, e.recurrence.type);
        const days  = daysUntil(next);
        const linkedPeople = (e.personIds ?? [])
          .map(id => allPeople.find(p => p.id === id))
          .filter((p): p is Person => !!p);
        return { event: e, days, dateLabel: formatLocalDate(e.date, 'short'), linkedPeople };
      })
      .sort((a, b) => a.days - b.days);
  });

  protected readonly totalCount    = computed(() => this.eventsService.all().length);
  protected readonly filteredCount = computed(() => this.rows().length);

  protected readonly formatCountdown = formatCountdown;

  protected typeIcon(type: string): string {
    return ({ birthday: '🎂', anniversary: '♥', milestone: '✦', custom: '📅' } as Record<string, string>)[type] ?? '📅';
  }
}
