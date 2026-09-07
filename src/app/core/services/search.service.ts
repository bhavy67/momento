import { Injectable, computed, signal } from '@angular/core';
import { db } from '@core/db/database.service';
import type { SearchResults } from '@types';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly query = signal('');
  readonly isSearching = computed(() => this.query().trim().length >= 2);

  /** Cached results — populated by `search()` calls, not reactively */
  readonly results = signal<SearchResults | null>(null);

  async search(query: string): Promise<void> {
    const q = query.toLowerCase().trim();
    this.query.set(query);

    if (q.length < 2) {
      this.results.set(null);
      return;
    }

    const [people, events, memories, gifts] = await Promise.all([
      db.people
        .filter(p => p.name.toLowerCase().includes(q) || (p.notes ?? '').toLowerCase().includes(q))
        .toArray(),
      db.events
        .filter(e => e.title.toLowerCase().includes(q) || (e.description ?? '').toLowerCase().includes(q))
        .toArray(),
      db.memories
        .filter(m => (m.title ?? '').toLowerCase().includes(q) || m.note.toLowerCase().includes(q))
        .toArray(),
      db.gifts
        .filter(g => g.description.toLowerCase().includes(q) || (g.notes ?? '').toLowerCase().includes(q))
        .toArray(),
    ]);

    this.results.set({ people, events, memories, gifts });
  }

  clear(): void {
    this.query.set('');
    this.results.set(null);
  }
}
