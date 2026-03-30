import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(html?: string | null): SafeHtml | null {
    if (!html) return null;

    const cleaned = html
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ');

    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }
}