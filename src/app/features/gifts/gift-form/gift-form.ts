import {
  ChangeDetectionStrategy, Component, computed,
  effect, inject, input, signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GiftsService } from '@core/services/gifts.service';
import { PeopleService } from '@core/services/people.service';
import { EventsService } from '@core/services/events.service';
import { UiStateService } from '@core/services/ui-state.service';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import type { GiftStatus } from '@types';

const STATUSES: { value: GiftStatus; label: string }[] = [
  { value: 'idea',      label: 'Idea — just thinking about it'      },
  { value: 'planned',   label: 'Planned — know what I\'m getting'   },
  { value: 'purchased', label: 'Purchased — bought, not given yet'  },
  { value: 'given',     label: 'Given — they received it'           },
];

@Component({
  selector: 'app-gift-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ConfirmDialog],
  templateUrl: './gift-form.html',
  styleUrl: './gift-form.css',
})
export class GiftForm {
  readonly id       = input<string | undefined>(undefined);
  readonly personId = input<string | undefined>(undefined);
  readonly eventId  = input<string | undefined>(undefined);

  private readonly giftsService  = inject(GiftsService);
  private readonly people        = inject(PeopleService);
  private readonly eventsService = inject(EventsService);
  private readonly ui            = inject(UiStateService);
  private readonly router        = inject(Router);
  private readonly fb            = inject(FormBuilder);

  protected readonly STATUSES = STATUSES;
  protected readonly isEdit   = computed(() => !!this.id());
  protected readonly saving   = signal(false);
  protected readonly showDeleteConfirm  = signal(false);
  protected readonly showMemoryPrompt   = signal(false);

  private pendingPersonId = '';
  private pendingEventId  = '';

  protected readonly effectivePersonId = computed(() =>
    this.personId() ?? this.gift()?.personId ?? ''
  );

  protected readonly effectiveEventId = computed(() =>
    this.eventId() ?? this.gift()?.eventId ?? ''
  );

  protected readonly personName = computed(() => {
    const pid = this.effectivePersonId();
    return pid ? (this.people.all().find(p => p.id === pid)?.name ?? '') : '';
  });

  protected readonly form = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(200)]],
    status:      ['idea' as GiftStatus, Validators.required],
    year:        [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
    price:       [null as number | null],
    notes:       [''],
  });

  private readonly gift = computed(() =>
    this.giftsService.all().find(g => g.id === this.id())
  );

  constructor() {
    effect(() => {
      const g = this.gift();
      if (g) {
        this.form.patchValue({
          description: g.description,
          status:      g.status,
          year:        g.year,
          price:       g.price ?? null,
          notes:       g.notes ?? '',
        });
      }
    });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);

    const { description, status, year, price, notes } = this.form.getRawValue();
    const personId = this.effectivePersonId();
    const eventId  = this.effectiveEventId();

    const input = {
      personId,
      year,
      description: description.trim(),
      status,
      price:   price != null && price > 0 ? price : undefined,
      notes:   notes.trim() || undefined,
      eventId: eventId || undefined,
    };

    try {
      const giftId = this.id();
      if (giftId) {
        await this.giftsService.update(giftId, input);
        this.ui.notify('Gift updated', 'success');
      } else {
        await this.giftsService.add(input);
        this.ui.notify('Gift saved', 'success');
      }

      if (status === 'given') {
        this.pendingPersonId = personId;
        this.pendingEventId  = eventId;
        this.showMemoryPrompt.set(true);
      } else {
        this.navigateBack();
      }
    } catch {
      this.ui.notify('Something went wrong', 'error');
      this.saving.set(false);
    }
  }

  protected goToMemoryForm(): void {
    const params: Record<string, string> = {};
    if (this.pendingPersonId) params['personId'] = this.pendingPersonId;
    if (this.pendingEventId)  params['eventId']  = this.pendingEventId;
    this.router.navigate(['/memories/new'], { queryParams: params });
  }

  protected async deleteGift(): Promise<void> {
    const gid = this.id();
    if (!gid) return;
    this.showDeleteConfirm.set(false);
    await this.giftsService.delete(gid);
    this.ui.notify('Gift deleted', 'info');
    this.navigateBack();
  }

  protected cancel(): void { this.navigateBack(); }

  private navigateBack(): void {
    const pid = this.effectivePersonId();
    this.router.navigate(pid ? ['/people', pid] : ['/people']);
  }
}
