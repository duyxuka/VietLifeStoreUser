import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string): SafeHtml {
    if (!html) return '';

    const cleaned = html
      .replace(/&nbsp;/g, ' ')        // FIX NHẢY CHỮ
      .replace(/\u00A0/g, ' ');       // cover NBSP unicode

    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }
}
