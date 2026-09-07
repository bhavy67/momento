import { ChangeDetectionStrategy, Component, ElementRef, model, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-tag-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag-input.html',
  styleUrl: './tag-input.css',
})
export class TagInput {
  readonly tags = model<string[]>([]);

  protected readonly draft = signal('');
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('tagInput');

  protected onKeydown(e: KeyboardEvent): void {
    const raw = this.draft().trim();
    if ((e.key === 'Enter' || e.key === ',') && raw) {
      e.preventDefault();
      this.addTag(raw);
    }
    if (e.key === 'Backspace' && !this.draft() && this.tags().length) {
      this.removeTag(this.tags().length - 1);
    }
  }

  protected onBlur(): void {
    const raw = this.draft().trim();
    if (raw) this.addTag(raw);
  }

  protected addTag(raw: string): void {
    const tag = raw.replace(/,/g, '').trim().toLowerCase();
    if (!tag || this.tags().includes(tag)) { this.draft.set(''); return; }
    this.tags.update(t => [...t, tag]);
    this.draft.set('');
  }

  protected removeTag(i: number): void {
    this.tags.update(t => t.filter((_, idx) => idx !== i));
    this.inputRef()?.nativeElement.focus();
  }

  protected focusInput(): void {
    this.inputRef()?.nativeElement.focus();
  }
}
