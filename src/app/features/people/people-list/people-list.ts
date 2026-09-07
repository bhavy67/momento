import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PeopleService } from '@core/services/people.service';
import { UiStateService } from '@core/services/ui-state.service';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { formatLocalDate } from '@utils/dates';
import type { Person, Relationship } from '@types';

const RELATIONSHIPS: { value: Relationship | null; label: string }[] = [
  { value: null,       label: 'All' },
  { value: 'family',   label: 'Family' },
  { value: 'friend',   label: 'Friend' },
  { value: 'partner',  label: 'Partner' },
  { value: 'colleague',label: 'Colleague' },
  { value: 'other',    label: 'Other' },
];

@Component({
  selector: 'app-people-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './people-list.html',
  styleUrl: './people-list.css',
})
export class PeopleList {
  private readonly people = inject(PeopleService);
  private readonly ui     = inject(UiStateService);

  protected readonly RELATIONSHIPS = RELATIONSHIPS;
  protected readonly search      = signal('');
  protected readonly filterRel   = signal<Relationship | null>(null);
  protected readonly deletingId  = signal<string | null>(null);

  protected readonly allCount = computed(() => this.people.all().length);

  protected readonly filtered = computed(() => {
    const q   = this.search().toLowerCase().trim();
    const rel = this.filterRel();
    return this.people.all()
      .filter(p => !q   || p.name.toLowerCase().includes(q))
      .filter(p => !rel || p.relationship === rel);
  });

  protected formatBirthday(p: Person): string {
    return p.birthday ? formatLocalDate(p.birthday, 'short') : '—';
  }

  protected relLabel(r: Relationship): string {
    return r.charAt(0).toUpperCase() + r.slice(1);
  }

  protected confirmDelete(id: string): void { this.deletingId.set(id); }
  protected cancelDelete(): void            { this.deletingId.set(null); }

  protected async doDelete(): Promise<void> {
    const id = this.deletingId();
    if (!id) return;
    this.deletingId.set(null);
    const person = this.people.all().find(p => p.id === id);
    await this.people.delete(id);
    this.ui.notify(`${person?.name ?? 'Person'} deleted`, 'info');
  }

  protected deletingPerson(): Person | undefined {
    const id = this.deletingId();
    return id ? this.people.all().find(p => p.id === id) : undefined;
  }
}
