import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CarStore } from '../../core/car-store.service';
import { FAQ } from '../../core/data/content.data';
import { FaqList } from '../../shared/faq-list';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-faq',
  imports: [FaqList, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container wrap">
      <div class="intro">
        <span class="eyebrow">Yordam markazi</span>
        <h1 class="section-title">Ko‘p beriladigan savollar</h1>
        <p class="section-sub">Javob topa olmadingizmi? Bizga yozing — 15 daqiqa ichida javob beramiz.</p>

        <form class="contact card" (submit)="send($event)">
          <h3>Savol yuborish</h3>
          <input class="input" placeholder="Ismingiz" aria-label="Ism" [value]="name()" (input)="name.set($any($event.target).value)" />
          <textarea class="input" placeholder="Savolingiz..." aria-label="Savol" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
          <button class="btn btn--dark btn--block" type="submit"><app-icon name="send" [size]="15" /> Yuborish</button>
          <div class="channels">
            <a href="tel:+998712000000"><app-icon name="phone" [size]="15" /> +998 71 200 00 00</a>
            <a href="mailto:info@carzone.uz"><app-icon name="mail" [size]="15" /> info&#64;carzone.uz</a>
          </div>
        </form>
      </div>
      <app-faq-list [items]="faq" />
    </section>
  `,
  styles: `
    .wrap { display: grid; grid-template-columns: 1fr 1.3fr; gap: 48px; padding-top: 64px; }
    .intro { display: flex; flex-direction: column; gap: 6px; }
    .intro h1 { margin-top: 8px; }
    .contact { display: flex; flex-direction: column; gap: 10px; margin-top: 28px; padding: 22px; }
    .contact h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
    .channels { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 6px; font-size: 13px; color: var(--muted); }
    .channels a { display: inline-flex; align-items: center; gap: 6px; }
    .channels a:hover { color: var(--ink); }
    @media (max-width: 860px) { .wrap { grid-template-columns: 1fr; } }
  `,
})
export class Faq {
  private readonly store = inject(CarStore);
  protected readonly faq = FAQ;
  protected readonly name = signal('');
  protected readonly text = signal('');

  protected send(e: Event): void {
    e.preventDefault();
    if (!this.name().trim() || !this.text().trim()) {
      this.store.notify('Iltimos, ism va savolni kiriting');
      return;
    }
    this.name.set('');
    this.text.set('');
    this.store.notify('Savolingiz yuborildi! Tez orada javob beramiz.');
  }
}
