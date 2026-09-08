import {
  ChangeDetectionStrategy, Component, computed,
  ElementRef, inject, output, signal, viewChild, effect,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TooltipDirective } from '@shared/directives/tooltip.directive';
import { SearchService } from '@core/services/search.service';
import type { Person, MomentoEvent, Memory, Gift } from '@types';

interface FlatResult {
  type:  'person' | 'event' | 'memory' | 'gift';
  id:    string;
  route: string[];
  title: string;
  sub?:  string;
}

@Component({
  selector: 'app-search-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TooltipDirective],
  templateUrl: './search-overlay.html',
  styleUrl: './search-overlay.css',
  host: {
    '(document:keydown.escape)': 'close()',
    role: 'dialog',
    'aria-label': 'Search',
    'aria-modal': 'true',
  },
})
export class SearchOverlay {
  readonly closed = output<void>();

  private readonly searchService = inject(SearchService);
  private readonly router        = inject(Router);

  protected readonly draft    = signal('');
  protected readonly focused  = signal(-1);

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly results    = this.searchService.results;
  protected readonly isSearching = this.searchService.isSearching;

  constructor() {
    effect(() => {
      const el = this.inputRef();
      if (el) el.nativeElement.focus();
    });
  }

  protected readonly flatResults = computed((): FlatResult[] => {
    const res = this.results();
    if (!res) return [];
    return [
      ...res.people.map(p  => ({ type: 'person'  as const, id: p.id,  route: ['/people', p.id],            title: p.name,            sub: p.relationship })),
      ...res.events.map(e  => ({ type: 'event'   as const, id: e.id,  route: ['/events', e.id],            title: e.title,           sub: e.type })),
      ...res.memories.map(m => ({ type: 'memory' as const, id: m.id,  route: ['/memories', m.id],          title: m.title ?? 'Memory', sub: m.note.slice(0, 60) + (m.note.length > 60 ? '…' : '') })),
      ...res.gifts.map(g   => ({ type: 'gift'    as const, id: g.id,  route: ['/gifts', g.id, 'edit'],     title: g.description,     sub: g.status })),
    ];
  });

  protected readonly totalCount    = computed(() => this.flatResults().length);
  protected readonly hasResults    = computed(() => this.totalCount() > 0);
  protected readonly showNoResults = computed(() =>
    this.isSearching() && this.results() !== null && !this.hasResults()
  );

  // Start indices for each group (for keyboard focus mapping)
  protected groupOffset(type: FlatResult['type']): number {
    const res = this.results();
    if (!res) return 0;
    if (type === 'person')  return 0;
    if (type === 'event')   return res.people.length;
    if (type === 'memory')  return res.people.length + res.events.length;
    return res.people.length + res.events.length + res.memories.length;
  }

  protected isFocused(flatIndex: number): boolean {
    return this.focused() === flatIndex;
  }

  protected onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.draft.set(val);
    this.focused.set(-1);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.searchService.search(val), 200);
  }

  protected onKeyDown(e: KeyboardEvent): void {
    const total = this.totalCount();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.focused.update(i => Math.min(i + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.focused.update(i => Math.max(i - 1, -1));
      if (this.focused() === -1) this.inputRef()?.nativeElement.focus();
    } else if (e.key === 'Enter') {
      const idx = this.focused();
      if (idx >= 0 && idx < total) {
        this.router.navigate(this.flatResults()[idx].route);
        this.close();
      }
    }
  }

  protected relLabel(r: string): string {
    return r.charAt(0).toUpperCase() + r.slice(1);
  }

  protected typeLabel(t: string): string {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  protected statusLabel(s: string): string {
    return { idea: 'Idea', planned: 'Planned', purchased: 'Purchased', given: 'Given' }[s] ?? s;
  }

  close(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.searchService.clear();
    this.closed.emit();
  }
}
