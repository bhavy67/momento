import {
  ChangeDetectionStrategy, Component, computed,
  effect, inject, input, signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MemoriesService } from '@core/services/memories.service';
import { PeopleService } from '@core/services/people.service';
import { EventsService } from '@core/services/events.service';
import { UiStateService } from '@core/services/ui-state.service';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-memory-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ConfirmDialog],
  templateUrl: './memory-form.html',
  styleUrl: './memory-form.css',
})
export class MemoryForm {
  readonly id       = input<string | undefined>(undefined);
  readonly personId = input<string | undefined>(undefined);
  readonly eventId  = input<string | undefined>(undefined);

  private readonly memoriesService = inject(MemoriesService);
  private readonly people          = inject(PeopleService);
  private readonly eventsService   = inject(EventsService);
  private readonly ui              = inject(UiStateService);
  private readonly router          = inject(Router);
  private readonly fb              = inject(FormBuilder);

  protected readonly isEdit     = computed(() => !!this.id());
  protected readonly saving     = signal(false);
  protected readonly showDeleteConfirm = signal(false);

  protected readonly selectedPersonIds = signal<string[]>([]);
  protected readonly allPeople         = computed(() => this.people.all());

  protected readonly eventsForPicker = computed(() => {
    const ids = this.selectedPersonIds();
    const all = this.eventsService.all();
    if (!ids.length) return all;
    return all.filter(e => ids.some(pid => (e.personIds ?? []).includes(pid)));
  });

  protected readonly todayStr = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    note:    ['', [Validators.required, Validators.maxLength(2000)]],
    title:   ['', Validators.maxLength(100)],
    date:    [this.todayStr, Validators.required],
    eventId: [''],
  });

  private readonly memory = computed(() =>
    this.memoriesService.allChronological().find(m => m.id === this.id())
  );

  constructor() {
    effect(() => {
      const pid = this.personId();
      if (pid && !this.id()) {
        this.selectedPersonIds.set([pid]);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const eid = this.eventId();
      if (eid && !this.id()) {
        this.form.patchValue({ eventId: eid });
      }
    });

    effect(() => {
      const m = this.memory();
      if (m) {
        this.form.patchValue({
          note:    m.note,
          title:   m.title ?? '',
          date:    new Date(m.date).toISOString().slice(0, 10),
          eventId: m.eventId ?? '',
        });
        this.selectedPersonIds.set([...m.personIds]);
      }
    });
  }

  protected togglePerson(personId: string): void {
    const current = this.selectedPersonIds();
    if (current.includes(personId)) {
      this.selectedPersonIds.set(current.filter(p => p !== personId));
    } else {
      this.selectedPersonIds.set([...current, personId]);
    }
  }

  protected isPersonSelected(personId: string): boolean {
    return this.selectedPersonIds().includes(personId);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);

    const { note, title, date, eventId } = this.form.getRawValue();
    const input = {
      note:      note.trim(),
      title:     title.trim() || undefined,
      date:      new Date(date + 'T12:00:00').getTime(),
      personIds: this.selectedPersonIds(),
      eventId:   eventId || undefined,
    };

    try {
      const mid = this.id();
      if (mid) {
        await this.memoriesService.update(mid, input);
        this.ui.notify('Memory updated', 'success');
        this.router.navigate(['/memories', mid]);
      } else {
        const newId = await this.memoriesService.add(input);
        this.ui.notify('Memory saved ✨', 'success');
        const pid = this.personId();
        this.router.navigate(pid ? ['/people', pid] : ['/memories', newId]);
      }
    } catch {
      this.ui.notify('Something went wrong', 'error');
      this.saving.set(false);
    }
  }

  protected async deleteMemory(): Promise<void> {
    const mid = this.id();
    if (!mid) return;
    this.showDeleteConfirm.set(false);
    await this.memoriesService.delete(mid);
    this.ui.notify('Memory deleted', 'info');
    this.cancel();
  }

  protected cancel(): void {
    const mid = this.id();
    if (mid) {
      this.router.navigate(['/memories', mid]);
      return;
    }
    const pid = this.personId() ?? this.memory()?.personIds[0];
    this.router.navigate(pid ? ['/people', pid] : ['/people']);
  }
}
