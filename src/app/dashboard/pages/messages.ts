import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { CONVERSATIONS, CUSTOMERS } from '../../core/data/crm.data';
import { Conversation } from '../../core/models';
import { avatarBg, initials, tel } from '../../core/ui';
import { CarImage } from '../../shared/car-image';
import { Icon } from '../../shared/icon';

const REPLIES = [
  'Rahmat! Tushunarli 👍',
  'Yaxshi, kutaman.',
  'Narxda chegirma bormi?',
  'Ertaga ofisingizga boraman.',
];

@Component({
  selector: 'app-messages',
  imports: [RouterLink, CarImage, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chat" [class.chat--open]="mobileOpen()">
      <aside class="threads">
        <div class="threads__head">
          <h1>Xabarlar</h1>
          <span class="badge badge--dark badge--plain">{{ unread() }}</span>
        </div>
        <label class="search">
          <app-icon name="search" [size]="14" />
          <input type="search" placeholder="Suhbatlarni qidirish" [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Suhbat qidirish" />
        </label>
        <div class="threads__list">
          @for (t of threads(); track t.id) {
            <button type="button" class="thread" [class.on]="t.id === activeId()" (click)="open(t.id)">
              <span class="ava" [style.background]="avatarBg(t.customer)">
                {{ initials(t.customer.name) }}
                @if (t.online) { <i></i> }
              </span>
              <span class="thread__text">
                <b>{{ t.customer.name }}</b>
                <small>{{ t.messages[t.messages.length - 1].text }}</small>
              </span>
              <span class="thread__meta">
                <small>{{ t.messages[t.messages.length - 1].time }}</small>
                @if (t.unread) { <em>{{ t.unread }}</em> }
              </span>
            </button>
          }
        </div>
      </aside>

      @if (active(); as t) {
        <section class="conv">
          <header class="conv__head">
            <button type="button" class="icon-btn icon-btn--sm back" aria-label="Orqaga" (click)="mobileOpen.set(false)"><app-icon name="arrow-left" [size]="14" /></button>
            <span class="ava" [style.background]="avatarBg(t.customer)">{{ initials(t.customer.name) }}</span>
            <div>
              <b>{{ t.customer.name }}</b>
              <small>{{ t.online ? 'Onlayn' : 'Yaqinda faol edi' }} · {{ t.customer.city }}</small>
            </div>
            <div class="conv__tools">
              <a class="icon-btn icon-btn--sm" [href]="tel(t.customer.phone)" aria-label="Qo‘ng‘iroq"><app-icon name="phone" [size]="14" /></a>
              <button type="button" class="icon-btn icon-btn--sm" aria-label="Ko‘proq"><app-icon name="more" [size]="14" /></button>
            </div>
          </header>

          @if (t.car; as car) {
            <a class="ctx" [routerLink]="['/cars', car.id]">
              <app-car-image [car]="car" [width]="200" />
              <div><b>{{ car.make }} {{ car.model }}</b><small>\${{ car.price.toLocaleString('en-US') }} · {{ car.status }}</small></div>
              <app-icon name="arrow-up-right" [size]="14" />
            </a>
          }

          <div class="msgs" #scroller>
            <span class="day">Bugun</span>
            @for (m of t.messages; track $index) {
              <div class="msg" [class.msg--me]="m.from === 'me'">
                <p>{{ m.text }}</p>
                <small>{{ m.time }} @if (m.from === 'me') { <app-icon name="check" [size]="11" /> }</small>
              </div>
            }
            @if (typing()) {
              <div class="msg typing"><p><i></i><i></i><i></i></p></div>
            }
          </div>

          <form class="composer" (submit)="send($event)">
            <div class="quick">
              @for (q of quick; track q) {
                <button type="button" class="chip chip--pill" (click)="draft.set(q)">{{ q }}</button>
              }
            </div>
            <div class="composer__row">
              <input class="input" placeholder="Xabar yozing..." [value]="draft()" (input)="draft.set($any($event.target).value)" aria-label="Xabar" />
              <button type="submit" class="icon-btn icon-btn--dark send" [disabled]="!draft().trim()" aria-label="Yuborish"><app-icon name="send" [size]="16" /></button>
            </div>
          </form>
        </section>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .chat { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 64px - 48px); min-height: 520px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); overflow: hidden; }
    .threads { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--line); }
    .threads__head { display: flex; align-items: center; gap: 10px; padding: 20px 18px 12px; }
    .threads__head h1 { font-size: 20px; font-weight: 600; }
    .search { display: flex; align-items: center; gap: 8px; height: 38px; margin: 0 14px 10px; padding: 0 12px; border-radius: 12px; background: var(--surface-2); color: var(--muted); }
    .search input { flex: 1; min-width: 0; border: 0; outline: none; background: none; color: var(--ink); font-size: 13px; }
    .threads__list { flex: 1; overflow-y: auto; padding: 0 8px 8px; }
    .thread { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px; border-radius: 14px; text-align: left; transition: background .2s; }
    .thread:hover { background: var(--bg-soft); }
    .thread.on { background: var(--surface-2); }
    .ava { position: relative; display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%; color: #fff; font-size: 12px; font-weight: 700; }
    .ava i { position: absolute; right: 0; bottom: 1px; width: 11px; height: 11px; border-radius: 50%; background: var(--accent); border: 2px solid #fff; }
    .thread__text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .thread__text b { font-size: 13px; font-weight: 600; }
    .thread__text small { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--muted); font-size: 12px; }
    .thread__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .thread__meta small { font-size: 11px; color: var(--muted-2); }
    .thread__meta em { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--ink); color: #fff; font-size: 10px; font-style: normal; font-weight: 700; line-height: 18px; text-align: center; }
    .conv { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
    .conv__head { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--line); }
    .conv__head div:not(.conv__tools) { display: flex; flex-direction: column; }
    .conv__head b { font-size: 14px; }
    .conv__head small { font-size: 12px; color: var(--muted); }
    .conv__tools { display: flex; gap: 6px; margin-left: auto; }
    .back { display: none !important; }
    .ctx { display: flex; align-items: center; gap: 12px; margin: 12px 18px 0; padding: 8px 14px 8px 8px; border-radius: 14px; background: var(--accent-grad); border: 1px solid #cdebdc; font-size: 12px; }
    .ctx app-car-image { width: 70px; height: 40px; }
    .ctx div { flex: 1; display: flex; flex-direction: column; }
    .ctx small { color: var(--muted); }
    .msgs { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 18px; overflow-y: auto; }
    .day { align-self: center; padding: 3px 10px; border-radius: 99px; background: var(--surface-2); font-size: 11px; color: var(--muted); margin-bottom: 6px; }
    .msg { display: flex; flex-direction: column; align-items: flex-start; max-width: 70%; animation: fade-up .3s var(--ease); }
    .msg p { padding: 10px 14px; border-radius: 18px 18px 18px 6px; background: var(--surface-2); font-size: 13px; line-height: 1.45; }
    .msg small { display: inline-flex; align-items: center; gap: 3px; margin-top: 3px; padding: 0 4px; font-size: 10px; color: var(--muted-2); }
    .msg--me { align-self: flex-end; align-items: flex-end; }
    .msg--me p { background: var(--ink); color: #fff; border-radius: 18px 18px 6px 18px; }
    .typing p { display: flex; gap: 4px; padding: 14px; }
    .typing i { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: bounce 1s infinite; }
    .typing i:nth-child(2) { animation-delay: .15s; }
    .typing i:nth-child(3) { animation-delay: .3s; }
    @keyframes bounce { 50% { transform: translateY(-4px); opacity: .5; } }
    .composer { padding: 10px 18px 16px; border-top: 1px solid var(--line); }
    .quick { display: flex; gap: 6px; margin-bottom: 10px; overflow-x: auto; }
    .quick .chip { flex-shrink: 0; height: 28px; font-size: 12px; }
    .composer__row { display: flex; gap: 8px; }
    .composer__row .input { border-radius: 99px; }
    .send { width: 42px; height: 42px; flex-shrink: 0; }
    .send:disabled { opacity: .4; cursor: default; }
    @media (max-width: 900px) {
      .chat { grid-template-columns: 1fr; height: calc(100vh - 64px - 32px); }
      .conv { display: none; }
      .chat--open .threads { display: none; }
      .chat--open .conv { display: flex; }
      .back { display: inline-grid !important; }
      .msg { max-width: 85%; }
    }
  `,
})
export class Messages {
  private readonly store = inject(CarStore);
  protected readonly avatarBg = avatarBg;
  protected readonly initials = initials;
  protected readonly tel = tel;
  protected readonly quick = ['Ha, mavjud ✅', 'Test-drayvga yozib qo‘yaman', 'Kredit shartlarini yuboraman', 'Rahmat!'];

  private readonly convos = signal<Conversation[]>(structuredClone(CONVERSATIONS));
  protected readonly activeId = signal(CONVERSATIONS[0].id);
  protected readonly query = signal('');
  protected readonly draft = signal('');
  protected readonly typing = signal(false);
  protected readonly mobileOpen = signal(false);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  protected readonly threads = computed(() => {
    const q = this.query().toLowerCase();
    return this.convos()
      .map((c) => ({ ...c, customer: CUSTOMERS.find((x) => x.id === c.customerId)!, car: this.store.byId(c.carId) }))
      .filter((c) => !q || c.customer.name.toLowerCase().includes(q));
  });
  protected readonly active = computed(() => this.threads().find((t) => t.id === this.activeId()));
  protected readonly unread = computed(() => this.convos().reduce((a, c) => a + c.unread, 0));

  protected open(id: string): void {
    this.activeId.set(id);
    this.mobileOpen.set(true);
    this.convos.update((l) => l.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    this.scrollDown();
  }

  protected send(e: Event): void {
    e.preventDefault();
    const text = this.draft().trim();
    if (!text) return;
    const id = this.activeId();
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    this.push(id, { from: 'me', text, time });
    this.draft.set('');
    this.typing.set(true);
    setTimeout(() => {
      this.typing.set(false);
      this.push(id, { from: 'them', text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time });
    }, 1400);
  }

  private push(id: string, msg: Conversation['messages'][number]): void {
    this.convos.update((l) => l.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg] } : c)));
    this.scrollDown();
  }

  private scrollDown(): void {
    setTimeout(() => {
      const el = this.scroller()?.nativeElement;
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }
}
