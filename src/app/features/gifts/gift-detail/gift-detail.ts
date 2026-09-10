import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GiftsService } from '@core/services/gifts.service';
import { PeopleService } from '@core/services/people.service';
import { EventsService } from '@core/services/events.service';
import { UiStateService } from '@core/services/ui-state.service';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-gift-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './gift-detail.html',
  styleUrl: './gift-detail.css',
})
export class GiftDetail {
  readonly id = input.required<string>();

  private readonly giftsService  = inject(GiftsService);
  private readonly people        = inject(PeopleService);
  private readonly eventsService = inject(EventsService);
  private readonly ui            = inject(UiStateService);
  private readonly router        = inject(Router);

  protected readonly showDeleteConfirm = signal(false);

  protected readonly gift = computed(() =>
    this.giftsService.all().find(g => g.id === this.id())
  );

  protected readonly person = computed(() => {
    const pid = this.gift()?.personId;
    return pid ? this.people.all().find(p => p.id === pid) : undefined;
  });

  protected readonly linkedEvent = computed(() => {
    const eid = this.gift()?.eventId;
    return eid ? this.eventsService.allWithArchived().find(e => e.id === eid) : undefined;
  });

  protected statusLabel(s: string): string {
    return { idea: 'Idea', planned: 'Planned', purchased: 'Purchased', given: 'Given' }[s] ?? s;
  }

  protected formatGivenAt(ts: number): string {
    return new Date(ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  protected async deleteGift(): Promise<void> {
    const g = this.gift();
    if (!g) return;
    this.showDeleteConfirm.set(false);
    await this.giftsService.delete(g.id);
    this.ui.notify('Gift deleted', 'info');
    const pid = g.personId;
    this.router.navigate(pid ? ['/people', pid] : ['/people']);
  }
}
