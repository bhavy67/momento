import { Pipe, PipeTransform } from '@angular/core';
import { formatLocalDate } from '@utils/dates';
import type { LocalDate } from '@types';

@Pipe({ name: 'localDate', standalone: true })
export class LocalDatePipe implements PipeTransform {
  transform(date: LocalDate, style: 'short' | 'long' = 'long'): string {
    return formatLocalDate(date, style);
  }
}
