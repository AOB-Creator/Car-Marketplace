import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-faq-list',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (item of items(); track item.q; let i = $index) {
      <div class="item" [class.open]="open() === i">
        <button type="button" [attr.aria-expanded]="open() === i" (click)="open.set(open() === i ? -1 : i)">
          <span>{{ item.q }}</span>
          <app-icon name="chevron-down" [size]="16" />
        </button>
        <div class="body"><div><p>{{ item.a }}</p></div></div>
      </div>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 10px; }
    .item { border-radius: var(--radius); background: var(--surface); border: 1px solid var(--line); transition: background .35s, color .35s, border-color .35s; }
    button { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; text-align: left; font-size: 14px; font-weight: 500; }
    app-icon { transition: transform .35s var(--ease); }
    .body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .4s var(--ease); }
    .body > div { overflow: hidden; }
    p { padding: 0 20px 18px; font-size: 13px; line-height: 1.6; opacity: .75; }
    .open { background: var(--ink); color: #fff; border-color: var(--ink); }
    .open .body { grid-template-rows: 1fr; }
    .open app-icon { transform: rotate(180deg); }
  `,
})
export class FaqList {
  readonly items = input.required<{ q: string; a: string }[]>();
  protected readonly open = signal(0);
}
