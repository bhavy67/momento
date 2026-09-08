import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsService } from '@core/services/events.service';
import { PeopleService } from '@core/services/people.service';
import { MemoriesService } from '@core/services/memories.service';
import { getPastOccurrences } from '@utils/recurrence';
import type { MomentoEvent, Person } from '@types';

interface TimelineEntry {
  event:     MomentoEvent;
  person?:   Person;
  date:      Date;
  hasMemory: boolean;
}

interface TimelineMonth {
  month:     number;
  monthName: string;
  entries:   TimelineEntry[];
}

interface TimelineYear {
  year:   number;
  months: TimelineMonth[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
})
export class Timeline {
  private readonly events   = inject(EventsService);
  private readonly people   = inject(PeopleService);
  private readonly memories = inject(MemoriesService);

  protected readonly hasAnyEvents  = computed(() => this.events.all().length > 0);

  protected readonly timelineYears = computed((): TimelineYear[] => {
    const allEvents = this.events.all();
    const allPeople = this.people.all();
    const allMem    = this.memories.allChronological();
    const today     = new Date();

    const entries: TimelineEntry[] = [];

    for (const event of allEvents) {
      const pastDates = getPastOccurrences(event, today);
      if (!pastDates.length) continue;

      const person = event.personId
        ? allPeople.find(p => p.id === event.personId)
        : undefined;

      for (const date of pastDates) {
        const yearStart = new Date(date.getFullYear(), 0, 1).getTime();
        const yearEnd   = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
        const hasMemory = allMem.some(
          m => m.eventId === event.id && m.date >= yearStart && m.date <= yearEnd
        );
        entries.push({ event, person, date, hasMemory });
      }
    }

    entries.sort((a, b) => b.date.getTime() - a.date.getTime());

    const yearMap = new Map<number, Map<number, TimelineEntry[]>>();
    for (const entry of entries) {
      const y = entry.date.getFullYear();
      const m = entry.date.getMonth() + 1;
      if (!yearMap.has(y)) yearMap.set(y, new Map());
      const mMap = yearMap.get(y)!;
      if (!mMap.has(m)) mMap.set(m, []);
      mMap.get(m)!.push(entry);
    }

    return Array.from(yearMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, mMap]) => ({
        year,
        months: Array.from(mMap.entries())
          .sort(([a], [b]) => b - a)
          .map(([month, ents]) => ({
            month,
            monthName: MONTH_NAMES[month - 1],
            entries:   ents,
          })),
      }));
  });

  protected readonly hasPastEvents = computed(() => this.timelineYears().length > 0);

  protected typeLabel(t: string): string {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  protected entryKey(entry: TimelineEntry): string {
    return entry.event.id + '-' + entry.date.getFullYear();
  }
}
