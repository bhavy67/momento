import {
  ChangeDetectionStrategy, Component, computed,
  inject, input, signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MemoriesService } from '@core/services/memories.service';
import { PeopleService } from '@core/services/people.service';
import { EventsService } from '@core/services/events.service';
import { UiStateService } from '@core/services/ui-state.service';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-memory-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './memory-detail.html',
  styleUrl: './memory-detail.css',
})
export class MemoryDetail {
  readonly id = input.required<string>();

  private readonly memoriesService = inject(MemoriesService);
  private readonly people          = inject(PeopleService);
  private readonly events          = inject(EventsService);
  private readonly ui              = inject(UiStateService);
  private readonly router          = inject(Router);

  protected readonly showDeleteConfirm = signal(false);

  protected readonly memory = computed(() =>
    this.memoriesService.allChronological().find(m => m.id === this.id())
  );

  protected readonly linkedPeople = computed(() => {
    const m = this.memory();
    if (!m) return [];
    return m.personIds
      .map(pid => this.people.all().find(p => p.id === pid))
      .filter((p): p is NonNullable<typeof p> => !!p);
  });

  protected readonly linkedEvent = computed(() => {
    const eid = this.memory()?.eventId;
    return eid ? this.events.all().find(e => e.id === eid) : undefined;
  });

  protected formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  protected backLink(): string[] {
    const pids = this.memory()?.personIds;
    return pids?.[0] ? ['/people', pids[0]] : ['/people'];
  }

  protected async deleteMemory(): Promise<void> {
    const m = this.memory();
    if (!m) return;
    this.showDeleteConfirm.set(false);
    await this.memoriesService.delete(m.id);
    this.ui.notify('Memory deleted', 'info');
    const pids = m.personIds;
    this.router.navigate(pids[0] ? ['/people', pids[0]] : ['/people']);
  }
}
