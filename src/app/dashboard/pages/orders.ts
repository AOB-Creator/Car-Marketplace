import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CarStore } from '../../core/car-store.service';
import { CUSTOMERS, ORDERS } from '../../core/data/crm.data';
import { Order, OrderKind, OrderStatus } from '../../core/models';
import { avatarBg, initials, orderBadge, shortDate } from '../../core/ui';
import { CarImage } from '../../shared/car-image';
import { Icon } from '../../shared/icon';

const STATUSES: OrderStatus[] = ['Yangi', 'Tasdiqlangan', "To'langan", 'Yetkazilmoqda', 'Yakunlangan', 'Bekor qilingan'];
const PER_PAGE = 10;

@Component({
  selector: 'app-orders',
  imports: [DecimalPipe, CarImage, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-head">
      <div>
        <h1>Buyurtmalar</h1>
        <p>{{ orders().length }} ta buyurtma · jami \${{ total() | number }}</p>
      </div>
      <div class="dash-head__tools">
        <div class="segmented">
          <button type="button" [class.on]="kind() === 'all'" (click)="setKind('all')">Barchasi</button>
          @for (k of kinds; track k) {
            <button type="button" [class.on]="kind() === k" (click)="setKind(k)">{{ k }}</button>
          }
        </div>
        <button type="button" class="btn btn--light btn--sm" (click)="store.notify('CSV fayl tayyorlanmoqda...')"><app-icon name="download" [size]="14" /> CSV</button>
      </div>
    </div>

    <div class="tabs">
      <button type="button" [class.on]="status() === 'all'" (click)="setStatus('all')">Barchasi <span>{{ orders().length }}</span></button>
      @for (s of statuses; track s) {
        <button type="button" [class.on]="status() === s" (click)="setStatus(s)">{{ s }} <span>{{ count(s) }}</span></button>
      }
    </div>

    <article class="panel">
      <div class="panel__head">
        <label class="search">
          <app-icon name="search" [size]="15" />
          <input type="search" placeholder="Buyurtma ID, mijoz yoki avtomobil..." [value]="query()" (input)="query.set($any($event.target).value); page.set(0)" aria-label="Qidirish" />
        </label>
        <span class="muted small">{{ filtered().length }} ta natija</span>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr><th>ID</th><th>Mijoz</th><th>Avtomobil</th><th>Turi</th><th>Sana</th><th>To‘lov</th><th>Summa</th><th>Holat</th><th></th></tr>
          </thead>
          <tbody>
            @for (o of pageRows(); track o.id) {
              <tr (click)="selectedId.set(o.id)" class="clickable">
                <td><b>{{ o.id }}</b></td>
                <td>
                  <div class="person">
                    <span [style.background]="avatarBg(o.customer)">{{ initials(o.customer.name) }}</span>
                    <div><b>{{ o.customer.name }}</b><small>{{ o.customer.phone }}</small></div>
                  </div>
                </td>
                <td>
                  @if (o.car; as car) {
                    <div class="thumb"><app-car-image [car]="car" [width]="160" /><div><b>{{ car.make }} {{ car.model }}</b><small>{{ car.trim }}</small></div></div>
                  } @else { <span class="muted">O‘chirilgan</span> }
                </td>
                <td><span class="badge badge--plain">{{ o.kind }}</span></td>
                <td class="muted">{{ shortDate(o.date) }}</td>
                <td>{{ o.payment }}</td>
                <td><b>{{ o.amount ? '$' + (o.amount | number) : 'Bepul' }}</b></td>
                <td><span class="badge" [class]="orderBadge(o.status)">{{ o.status }}</span></td>
                <td><app-icon name="chevron-right" [size]="16" class="muted" /></td>
              </tr>
            } @empty {
              <tr><td colspan="9" class="none">Buyurtma topilmadi</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (pages() > 1) {
        <div class="pager">
          <span class="muted small">{{ page() * perPage + 1 }}–{{ Math.min((page() + 1) * perPage, filtered().length) }} / {{ filtered().length }}</span>
          <div>
            <button type="button" class="icon-btn icon-btn--sm" [disabled]="page() === 0" aria-label="Oldingi sahifa" (click)="page.set(page() - 1)"><app-icon name="chevron-left" [size]="14" /></button>
            @for (p of pageList(); track p) {
              <button type="button" class="num" [class.on]="p === page()" (click)="page.set(p)">{{ p + 1 }}</button>
            }
            <button type="button" class="icon-btn icon-btn--sm" [disabled]="page() >= pages() - 1" aria-label="Keyingi sahifa" (click)="page.set(page() + 1)"><app-icon name="chevron-right" [size]="14" /></button>
          </div>
        </div>
      }
    </article>

    @if (selected(); as o) {
      <div class="scrim" (click)="selectedId.set(null)"></div>
      <aside class="detail" role="dialog" aria-modal="true" aria-label="Buyurtma tafsilotlari">
        <header>
          <div><span class="eyebrow">{{ o.kind }}</span><h2>{{ o.id }}</h2></div>
          <button type="button" class="icon-btn icon-btn--sm" aria-label="Yopish" (click)="selectedId.set(null)"><app-icon name="x" [size]="16" /></button>
        </header>
        @if (o.car; as car) {
          <div class="detail__car"><app-car-image [car]="car" [width]="600" /><b>{{ car.make }} {{ car.model }} {{ car.trim }}</b></div>
        }
        <div class="detail__rows">
          <div><span>Mijoz</span><b>{{ o.customer.name }}</b></div>
          <div><span>Telefon</span><b>{{ o.customer.phone }}</b></div>
          <div><span>Sana</span><b>{{ shortDate(o.date) }}</b></div>
          <div><span>To‘lov usuli</span><b>{{ o.payment }}</b></div>
          <div><span>Summa</span><b>\${{ o.amount | number }}</b></div>
        </div>
        <div class="field">
          <label for="st">Holatni o‘zgartirish</label>
          <select id="st" class="input" [value]="o.status" (change)="updateStatus(o, $any($event.target).value)">
            @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
          </select>
        </div>
        <ol class="timeline">
          @for (s of statuses.slice(0, 5); track s; let i = $index) {
            <li [class.done]="stepIndex(o.status) >= i"><i></i>{{ s }}</li>
          }
        </ol>
        <div class="detail__actions">
          <button type="button" class="btn btn--light" (click)="store.notify('Mijozga SMS yuborildi')"><app-icon name="phone" [size]="15" /> Bog‘lanish</button>
          <button type="button" class="btn btn--dark" (click)="store.notify('Hisob-faktura yuklab olindi')"><app-icon name="download" [size]="15" /> Invoice</button>
        </div>
      </aside>
    }
  `,
  styles: `
    .tabs { display: flex; gap: 4px; margin-bottom: 14px; overflow-x: auto; border-bottom: 1px solid var(--line); }
    .tabs button { position: relative; display: flex; align-items: center; gap: 6px; padding: 10px 12px 12px; font-size: 13px; color: var(--muted); white-space: nowrap; }
    .tabs button span { padding: 1px 7px; border-radius: 99px; background: var(--surface-3); font-size: 11px; color: var(--ink-2); }
    .tabs button.on { color: var(--ink); font-weight: 600; }
    .tabs button.on::after { content: ''; position: absolute; left: 8px; right: 8px; bottom: -1px; height: 2px; border-radius: 2px; background: var(--ink); }
    .tabs button.on span { background: var(--ink); color: #fff; }
    .search { display: flex; align-items: center; gap: 8px; width: min(380px, 100%); height: 38px; padding: 0 12px; border-radius: 12px; background: var(--surface-2); color: var(--muted); }
    .search input { flex: 1; min-width: 0; border: 0; outline: none; background: none; color: var(--ink); font-size: 13px; }
    .small { font-size: 12px; white-space: nowrap; }
    .clickable { cursor: pointer; }
    .none { padding: 50px; text-align: center; color: var(--muted); }
    .pager { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
    .pager div { display: flex; gap: 4px; align-items: center; }
    .pager .icon-btn:disabled { opacity: .35; cursor: default; }
    .num { width: 32px; height: 32px; border-radius: 10px; font-size: 12px; }
    .num.on { background: var(--ink); color: #fff; }
    .scrim { position: fixed; inset: 0; z-index: 110; background: rgba(11,11,12,.35); animation: fade-in .3s; }
    .detail { position: fixed; top: 12px; right: 12px; bottom: 12px; z-index: 111; display: flex; flex-direction: column; gap: 16px; width: min(400px, calc(100% - 24px)); padding: 22px; overflow-y: auto; border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-lg); animation: fade-up .4s var(--ease); }
    .detail header { display: flex; justify-content: space-between; align-items: flex-start; }
    .detail h2 { font-size: 22px; font-weight: 600; }
    .detail__car { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: var(--radius); background: var(--accent-grad); }
    .detail__car app-car-image { height: 140px; }
    .detail__rows div { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed var(--line); font-size: 13px; }
    .detail__rows span { color: var(--muted); }
    .timeline { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0; }
    .timeline li { position: relative; display: flex; align-items: center; gap: 12px; padding: 8px 0; font-size: 13px; color: var(--muted); }
    .timeline li::before { content: ''; position: absolute; left: 6px; top: -8px; height: 16px; width: 2px; background: var(--line); }
    .timeline li:first-child::before { display: none; }
    .timeline i { position: relative; z-index: 1; width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--line-2); background: var(--surface); }
    .timeline li.done { color: var(--ink); font-weight: 500; }
    .timeline li.done i { border-color: var(--accent); background: var(--accent); }
    .timeline li.done::before { background: var(--accent); }
    .detail__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: auto; }
  `,
})
export class Orders {
  protected readonly store = inject(CarStore);
  protected readonly statuses = STATUSES;
  protected readonly kinds: OrderKind[] = ['Xarid', 'Ijara', 'Test-drayv'];
  protected readonly perPage = PER_PAGE;
  protected readonly Math = Math;
  protected readonly orderBadge = orderBadge;
  protected readonly avatarBg = avatarBg;
  protected readonly initials = initials;
  protected readonly shortDate = shortDate;

  private readonly data = signal<Order[]>(ORDERS);
  protected readonly status = signal<OrderStatus | 'all'>('all');
  protected readonly kind = signal<OrderKind | 'all'>('all');
  protected readonly query = signal('');
  protected readonly page = signal(0);
  protected readonly selectedId = signal<string | null>(null);

  protected readonly orders = computed(() =>
    this.data()
      .filter((o) => this.kind() === 'all' || o.kind === this.kind())
      .map((o) => ({ ...o, car: this.store.byId(o.carId), customer: CUSTOMERS.find((c) => c.id === o.customerId)! })),
  );
  protected readonly total = computed(() => this.orders().reduce((a, o) => a + (o.status === 'Bekor qilingan' ? 0 : o.amount), 0));
  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.orders().filter(
      (o) =>
        (this.status() === 'all' || o.status === this.status()) &&
        (!q || `${o.id} ${o.customer.name} ${o.car?.make} ${o.car?.model}`.toLowerCase().includes(q)),
    );
  });
  protected readonly pages = computed(() => Math.ceil(this.filtered().length / PER_PAGE));
  protected readonly pageRows = computed(() => this.filtered().slice(this.page() * PER_PAGE, (this.page() + 1) * PER_PAGE));
  protected readonly pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i));

  protected readonly selected = computed(() => this.orders().find((o) => o.id === this.selectedId()) ?? null);

  protected count(s: OrderStatus): number {
    return this.orders().filter((o) => o.status === s).length;
  }

  protected setStatus(s: OrderStatus | 'all'): void {
    this.status.set(s);
    this.page.set(0);
  }

  protected setKind(k: OrderKind | 'all'): void {
    this.kind.set(k);
    this.page.set(0);
  }

  protected stepIndex(s: OrderStatus): number {
    return s === 'Bekor qilingan' ? -1 : STATUSES.indexOf(s);
  }

  protected updateStatus(o: { id: string }, status: OrderStatus): void {
    this.data.update((list) => list.map((x) => (x.id === o.id ? { ...x, status } : x)));
    this.store.notify(`${o.id} holati: ${status}`);
  }
}
