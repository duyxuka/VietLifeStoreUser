import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberShort',
  standalone: true
})
export class NumberShortPipe implements PipeTransform {

  transform(value: number): string {
    if (value == null) return '0';

    if (value < 1000) {
      return value.toString();
    }

    if (value < 1000000) {
      return (value / 1000).toFixed(1).replace('.0', '') + 'k';
    }

    return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
}