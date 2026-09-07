import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PeopleService } from '@core/services/people.service';
import { UiStateService } from '@core/services/ui-state.service';
import { DateInput } from '@shared/components/date-input/date-input';
import { TagInput } from '@shared/components/tag-input/tag-input';
import type { LocalDate, Relationship } from '@types';

const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: 'family',    label: 'Family'    },
  { value: 'friend',    label: 'Friend'    },
  { value: 'partner',   label: 'Partner'   },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other',     label: 'Other'     },
];

@Component({
  selector: 'app-person-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DateInput, TagInput],
  templateUrl: './person-form.html',
  styleUrl: './person-form.css',
})
export class PersonForm {
  readonly id = input<string | undefined>(undefined);

  private readonly people = inject(PeopleService);
  private readonly ui     = inject(UiStateService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);

  protected readonly RELATIONSHIPS = RELATIONSHIPS;
  protected readonly isEdit = computed(() => !!this.id());
  protected readonly saving = signal(false);

  protected readonly birthday = signal<LocalDate | null>(null);
  protected readonly tags     = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name:         ['', Validators.required],
    relationship: ['friend' as Relationship, Validators.required],
    notes:        [''],
  });

  private readonly person = computed(() =>
    this.people.all().find(p => p.id === this.id())
  );

  constructor() {
    effect(() => {
      const p = this.person();
      if (p) {
        this.form.patchValue({ name: p.name, relationship: p.relationship, notes: p.notes ?? '' });
        this.birthday.set(p.birthday ?? null);
        this.tags.set([...p.tags]);
      }
    });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const { name, relationship, notes } = this.form.getRawValue();
    const input = {
      name: name.trim(),
      relationship,
      notes: notes.trim() || undefined,
      birthday: this.birthday() ?? undefined,
      tags: this.tags(),
    };
    try {
      const id = this.id();
      if (id) {
        await this.people.update(id, input);
        this.ui.notify(`${name} updated`, 'success');
        this.router.navigate(['/people', id]);
      } else {
        const newId = await this.people.add(input);
        this.ui.notify(`${name} added`, 'success');
        this.router.navigate(['/people', newId]);
      }
    } catch {
      this.ui.notify('Something went wrong', 'error');
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    const id = this.id();
    this.router.navigate(id ? ['/people', id] : ['/people']);
  }
}
