import { Pipe, PipeTransform } from '@angular/core';
import { formatCountdown } from '@utils/dates';

@Pipe({ name: 'countdown', standalone: true })
export class CountdownPipe implements PipeTransform {
  transform(days: number): string {
    return formatCountdown(days);
  }
}
