import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { CUSTOMERS, ORDERS } from '../../core/data/crm.data';
import { Customer } from '../../core/models';
import { MONTHS, avatarBg, initials, tel } from '../../core/ui';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-customers',
  imports: [DecimalPipe, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-head">
      <div>
        <h1>Mijozlar</h1>
        <p>{{ customers().length }} ta mijoz · {{ vip() }} ta VIP</p>
      </div>
      <div class="dash-head__tools">
        <label class="search">
          <app-icon name="search" [size]="15" />
          <input type="search" placeholder="Ism, email, shahar..." [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Mijoz qidirish" />
        </label>
        <div class="segmented">
          @for (t of tiers; track t) {
            <button type="button" [class.on]="tier() === t" (click)="tier.set(t)">{{ t === 'all' ? 'Barchasi' : t }}</button>
          }
        </div>
      </div>
    </div>

    <div class="grid">
      @for (c of filtered(); track c.id; let i = $index) {
        <article class="cust" [style.animation-delay.ms]="i * 30">
          <div class="cust__top">
            <span class="ava" [style.background]="avatarBg(c)">{{ initials(c.name) }}</span>
            <span class="tier" [attr.data-tier]="c.tier"><app-icon [name]="c.tier === 'Standart' ? 'user' : 'crown'" [size]="12" /> {{ c.tier }}</span>
          </div>
          <h3>{{ c.name }}</h3>
          <p class="muted"><app-icon name="pin" [size]="12" /> {{ c.city }} · {{ joined(c) }} dan beri</p>
          <div class="cust__stats">
            <div><b>{{ c.orders }}</b><span>Buyurtma</span></div>
            <div><b>\${{ c.spent | number: '1.0-0' }}</b><span>Sarflagan</span></div>
          </div>
          <div class="cust__contact">
            <a [href]="'mailto:' + c.email" class="icon-btn icon-btn--sm" aria-label="Email"><app-icon name="mail" [size]="14" /></a>
            <a [href]="tel(c.phone)" class="icon-btn icon-btn--sm" aria-label="Qo‘ng‘iroq"><app-icon name="phone" [size]="14" /></a>
            <a routerLink="/dashboard/messages" class="btn btn--dark btn--sm">Xabar <app-icon name="chat" [size]="13" /></a>
          </div>
        </article>
      } @empty {
        <p class="none">Mijoz topilmadi</p>
      }
    </div>
  `,
  styles: `
    .search { display: flex; align-items: center; gap: 8px; width: 260px; height: 38px; padding: 0 12px; border-radius: var(--pill); background: var(--surface); border: 1px solid var(--line); color: var(--muted); }
    .search input { flex: 1; min-width: 0; border: 0; outline: none; background: none; color: var(--ink); font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
    .cust { display: flex; flex-direction: column; gap: 4px; padding: 18px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); animation: fade-up .5s var(--ease) both; transition: transform .35s var(--ease), box-shadow .35s; }
    .cust:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
    .cust__top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .ava { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 16px; color: #fff; font-weight: 700; font-size: 15px; }
    .tier { display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 9px; border-radius: 99px; font-size: 11px; font-weight: 600; background: var(--surface-2); }
    .tier[data-tier='Gold'] { background: #fdf3d8; color: #9a6a00; }
    .tier[data-tier='Platinum'] { background: var(--ink); color: #fff; }
    h3 { font-size: 15px; font-weight: 600; }
    p { display: flex; align-items: center; gap: 4px; font-size: 12px; }
    .cust__stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0; }
    .cust__stats div { display: flex; flex-direction: column; padding: 10px 12px; border-radius: 12px; background: var(--bg-soft); }
    .cust__stats b { font-size: 16px; font-weight: 600; }
    .cust__stats span { font-size: 11px; color: var(--muted); }
    .cust__contact { display: flex; gap: 6px; }
    .cust__contact .btn { margin-left: auto; }
    .none { padding: 60px; color: var(--muted); }
  `,
})
export class Customers {
  protected readonly store = inject(CarStore);
  protected readonly tiers = ['all', 'Standart', 'Gold', 'Platinum'] as const;
  protected readonly tier = signal<(typeof this.tiers)[number]>('all');
  protected readonly query = signal('');
  protected readonly avatarBg = avatarBg;
  protected readonly initials = initials;
  protected readonly tel = tel;

  protected readonly customers = computed(() =>
    CUSTOMERS.map((c) => {
      const mine = ORDERS.filter((o) => o.customerId === c.id && o.status !== 'Bekor qilingan');
      return { ...c, orders: mine.length, spent: mine.reduce((a, o) => a + o.amount, 0) };
    }).sort((a, b) => b.spent - a.spent),
  );
  protected readonly vip = computed(() => this.customers().filter((c) => c.tier !== 'Standart').length);
  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.customers().filter(
      (c) => (this.tier() === 'all' || c.tier === this.tier()) && (!q || `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q)),
    );
  });

  protected joined(c: Customer): string {
    const d = new Date(c.joined);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
}
