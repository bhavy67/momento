import { Pipe, PipeTransform } from '@angular/core';
import { ageOnDate } from '@utils/dates';
import type { LocalDate } from '@types';

@Pipe({ name: 'ageFromDate', standalone: true })
export class AgeFromDatePipe implements PipeTransform {
  transform(birthday: LocalDate, on: Date = new Date()): number | null {
    return ageOnDate(birthday, on);
  }
}
