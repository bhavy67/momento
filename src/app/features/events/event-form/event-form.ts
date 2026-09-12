import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventsService } from '@core/services/events.service';
import { PeopleService } from '@core/services/people.service';
import { UiStateService } from '@core/services/ui-state.service';
import { DateInput } from '@shared/components/date-input/date-input';
import { TagInput } from '@shared/components/tag-input/tag-input';
import type { EventType, LocalDate, RecurrenceType } from '@types';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'birthday',    label: 'Birthday'    },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'milestone',   label: 'Milestone'   },
  { value: 'custom',      label: 'Custom'      },
];

const RECURRENCE_TYPES: { value: RecurrenceType; label: string }[] = [
  { value: 'none',    label: 'One-time'    },
  { value: 'yearly',  label: 'Every year'  },
  { value: 'monthly', label: 'Every month' },
];

@Component({
  selector: 'app-event-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DateInput, TagInput, RouterLink],
  templateUrl: './event-form.html',
  styleUrl: './event-form.css',
})
export class EventForm {
  readonly id        = input<string | undefined>(undefined);
  readonly personId  = input<string | undefined>(undefined);
  readonly eventType = input<string | undefined>(undefined);

  private readonly eventsService = inject(EventsService);
  private readonly people        = inject(PeopleService);
  private readonly ui            = inject(UiStateService);
  private readonly router        = inject(Router);
  private readonly fb            = inject(FormBuilder);

  protected readonly EVENT_TYPES      = EVENT_TYPES;
  protected readonly RECURRENCE_TYPES = RECURRENCE_TYPES;
  protected readonly isEdit           = computed(() => !!this.id());
  protected readonly saving           = signal(false);
  protected readonly allPeople        = computed(() => this.people.all());

  protected readonly date              = signal<LocalDate | null>(null);
  protected readonly tags              = signal<string[]>([]);
  protected readonly selectedPersonIds = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    title:       ['', Validators.required],
    type:        ['birthday' as EventType, Validators.required],
    description: [''],
    recurrence:  ['yearly' as RecurrenceType, Validators.required],
  });

  private readonly event = computed(() =>
    this.eventsService.all().find(e => e.id === this.id())
  );

  constructor() {
    // Create-mode pre-fill: personId, eventType, auto-title
    effect(() => {
      const pid   = this.personId();
      const etype = this.eventType();
      const allP  = this.people.all();
      if (this.id()) return; // edit mode handles separately

      const patches: Record<string, unknown> = {};
      if (etype) patches['type'] = etype;

      if (pid && !this.selectedPersonIds().length) {
        this.selectedPersonIds.set([pid]);
      }

      if (pid && etype && !this.form.controls.title.dirty) {
        const person = allP.find(p => p.id === pid);
        if (person) {
          const map: Record<string, string> = {
            birthday:    `${person.name}'s Birthday`,
            anniversary: `${person.name}'s Anniversary`,
            milestone:   `${person.name}'s Milestone`,
          };
          if (map[etype]) patches['title'] = map[etype];

          // Pre-fill date from person's birthday when adding a birthday event
          if (etype === 'birthday' && person.birthday && !untracked(() => this.date())) {
            this.date.set(person.birthday);
          }
        }
      }

      if (Object.keys(patches).length) this.form.patchValue(patches);
    });

    // Edit-mode pre-fill
    effect(() => {
      const e = this.event();
      if (e) {
        this.form.patchValue({
          title:       e.title,
          type:        e.type,
          description: e.description ?? '',
          recurrence:  e.recurrence.type,
        });
        this.date.set(e.date);
        this.tags.set([...e.tags]);
        this.selectedPersonIds.set([...(e.personIds ?? [])]);
      }
    });
  }

  protected togglePerson(personId: string): void {
    const current = this.selectedPersonIds();
    if (current.includes(personId)) {
      this.selectedPersonIds.set(current.filter(id => id !== personId));
    } else {
      this.selectedPersonIds.set([...current, personId]);
    }
  }

  protected isPersonSelected(personId: string): boolean {
    return this.selectedPersonIds().includes(personId);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || !this.date() || this.saving()) return;
    this.saving.set(true);
    const { title, type, description, recurrence } = this.form.getRawValue();
    const input = {
      title:       title.trim(),
      type,
      date:        this.date()!,
      personIds:   this.selectedPersonIds(),
      description: description.trim() || undefined,
      recurrence:  { type: recurrence },
      tags:        this.tags(),
      isArchived:  false,
    };
    try {
      const id = this.id();
      if (id) {
        await this.eventsService.update(id, input);
        this.ui.notify('Event updated', 'success');
        this.router.navigate(['/events', id]);
      } else {
        const newId = await this.eventsService.add(input);
        this.ui.notify('Event added', 'success');
        this.router.navigate(['/events', newId]);
      }
    } catch {
      this.ui.notify('Something went wrong', 'error');
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    const id  = this.id();
    const pid = this.personId();
    if (id)  this.router.navigate(['/events', id]);
    else if (pid) this.router.navigate(['/people', pid]);
    else     this.router.navigate(['/people']);
  }
}
