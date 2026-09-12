import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemoriesService } from '@core/services/memories.service';
import { PeopleService } from '@core/services/people.service';
import { EventsService } from '@core/services/events.service';
import type { Memory, Person } from '@types';

interface MemoryRow {
  memory:   Memory;
  people:   Person[];
  eventTitle?: string;
  preview:  string;
  dateLabel: string;
}

interface MemoryYear {
  year:    number;
  entries: MemoryRow[];
}

@Component({
  selector: 'app-memory-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './memory-list.html',
  styleUrl: './memory-list.css',
})
export class MemoryList {
  private readonly memoriesService = inject(MemoriesService);
  private readonly people          = inject(PeopleService);
  private readonly eventsService   = inject(EventsService);

  protected readonly search         = signal('');
  protected readonly filterPersonId = signal<string | null>(null);

  protected readonly allPeople = computed(() => this.people.all());

  protected readonly peopleMentioned = computed((): Person[] => {
    const ids = new Set<string>();
    for (const m of this.memoriesService.allChronological()) {
      for (const id of m.personIds) ids.add(id);
    }
    return this.people.all().filter(p => ids.has(p.id));
  });

  protected readonly years = computed((): MemoryYear[] => {
    const allPeople = this.people.all();
    const allEvents = this.eventsService.allWithArchived();
    const q         = this.search().toLowerCase().trim();
    const personId  = this.filterPersonId();

    const rows: MemoryRow[] = this.memoriesService.allChronological()
      .filter(m => {
        if (personId && !m.personIds.includes(personId)) return false;
        if (!q) return true;
        return (
          m.note.toLowerCase().includes(q) ||
          (m.title ?? '').toLowerCase().includes(q)
        );
      })
      .map(m => {
        const linkedPeople = m.personIds
          .map(id => allPeople.find(p => p.id === id))
          .filter((p): p is Person => !!p);
        const linkedEvent  = m.eventId ? allEvents.find(e => e.id === m.eventId) : undefined;
        const preview = m.note.length > 100 ? m.note.slice(0, 100) + '…' : m.note;
        const dateLabel = new Date(m.date).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        });
        return { memory: m, people: linkedPeople, eventTitle: linkedEvent?.title, preview, dateLabel };
      });

    const yearMap = new Map<number, MemoryRow[]>();
    for (const row of rows) {
      const y = new Date(row.memory.date).getFullYear();
      const arr = yearMap.get(y) ?? [];
      arr.push(row);
      yearMap.set(y, arr);
    }

    return Array.from(yearMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, entries]) => ({ year, entries }));
  });

  protected readonly total = computed(() => this.memoriesService.allChronological().length);
  protected readonly filtered = computed(() => this.years().reduce((s, y) => s + y.entries.length, 0));
}
