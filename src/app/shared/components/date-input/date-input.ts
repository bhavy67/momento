import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { LocalDate } from '@types';

const MONTHS = [
  { v: 1, n: 'January' }, { v: 2, n: 'February' }, { v: 3, n: 'March' },
  { v: 4, n: 'April' },   { v: 5, n: 'May' },       { v: 6, n: 'June' },
  { v: 7, n: 'July' },    { v: 8, n: 'August' },    { v: 9, n: 'September' },
  { v: 10, n: 'October' }, { v: 11, n: 'November' }, { v: 12, n: 'December' },
];

@Component({
  selector: 'app-date-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './date-input.html',
  styleUrl: './date-input.css',
})
export class DateInput {
  readonly value = model<LocalDate | null>(null);
  readonly yearOptional = input(false);

  protected readonly MONTHS = MONTHS;

  protected readonly availableDays = computed(() => {
    const v = this.value();
    const month = v?.month ?? 1;
    const year = v?.year ?? new Date().getFullYear();
    const count = new Date(year, month, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  protected get month(): number { return this.value()?.month ?? 0; }
  protected set month(v: number) {
    if (!v) { this.value.set(null); return; }
    const cur = this.value();
    const year = cur?.year ?? new Date().getFullYear();
    const maxDay = new Date(year, v, 0).getDate();
    const day = Math.min(cur?.day ?? 1, maxDay);
    this.value.set({ month: v, day, year: cur?.year });
  }

  protected get day(): number { return this.value()?.day ?? 0; }
  protected set day(v: number) {
    const cur = this.value();
    if (!cur || !v) return;
    this.value.set({ ...cur, day: v });
  }

  protected get yearStr(): string { return this.value()?.year?.toString() ?? ''; }
  protected set yearStr(v: string) {
    const cur = this.value();
    if (!cur) return;
    this.value.set({ ...cur, year: v ? parseInt(v, 10) : undefined });
  }

  protected get yearUnknown(): boolean {
    const v = this.value();
    return v !== null && v.year === undefined;
  }
  protected set yearUnknown(checked: boolean) {
    const cur = this.value();
    if (!cur) return;
    this.value.set(checked ? { month: cur.month, day: cur.day } : { ...cur, year: new Date().getFullYear() });
  }
}
