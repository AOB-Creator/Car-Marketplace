import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { ACTIVITY, CUSTOMERS, ORDERS } from '../../core/data/crm.data';
import { BODIES } from '../../core/data/cars.data';
import { MONTHS } from '../../core/ui';
import { CarCard } from '../../shared/car-card';
import { Icon } from '../../shared/icon';
import { AreaChart, BarChart, Donut } from '../charts';

@Component({
  selector: 'app-favourites',
  imports: [RouterLink, CarCard, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-head">
      <div>
        <h1>Sevimlilar</h1>
        <p>Siz belgilagan {{ store.favoriteCars().length }} ta avtomobil</p>
      </div>
      <a routerLink="/cars" class="btn btn--dark btn--sm"><app-icon name="search" [size]="14" /> Katalogni ko‘rish</a>
    </div>
    @if (store.favoriteCars().length) {
      <div class="grid">
        @for (car of store.favoriteCars(); track car.id) {
          <app-car-card [car]="car" />
        }
      </div>
    } @else {
      <div class="empty">
        <span class="icon-btn"><app-icon name="heart" /></span>
        <h3>Hali sevimlilar yo‘q</h3>
        <p class="muted">Katalogdagi avtomobil kartasidagi ♥ tugmasini bosing.</p>
        <a routerLink="/cars" class="btn btn--dark btn--sm">Katalogga o‘tish</a>
      </div>
    }
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 90px 20px; border-radius: var(--radius-lg); background: var(--surface); border: 1px dashed var(--line-2); text-align: center; }
    .empty h3 { margin-top: 6px; font-size: 17px; font-weight: 500; }
    .empty p { margin-bottom: 10px; }
  `,
})
export class Favourites {
  protected readonly store = inject(CarStore);
}

@Component({
  selector: 'app-analytics',
  imports: [DecimalPipe, AreaChart, BarChart, Donut, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-head">
      <div>
        <h1>Analitika</h1>
        <p>2026-yil bo‘yicha samaradorlik ko‘rsatkichlari</p>
      </div>
      <button type="button" class="btn btn--light btn--sm" (click)="store.notify('PDF hisobot tayyorlanmoqda...')"><app-icon name="download" [size]="14" /> PDF hisobot</button>
    </div>

    <section class="cards">
      @for (m of metrics; track m.label) {
        <div class="metric">
          <span>{{ m.label }}</span>
          <b>{{ m.value }}</b>
          <small [class.down]="m.delta < 0">{{ m.delta > 0 ? '▲' : '▼' }} {{ m.delta > 0 ? m.delta : -m.delta }}% o‘tgan oyga nisbatan</small>
        </div>
      }
    </section>

    <section class="row">
      <article class="panel wide">
        <div class="panel__head"><div><h3>Saytga tashriflar va konversiya</h3><p>Oylik, ming</p></div></div>
        <app-area-chart [series]="traffic" [labels]="months" suffix="k" />
      </article>
      <article class="panel">
        <div class="panel__head"><div><h3>Sotuv voronkasi</h3><p>Oxirgi 30 kun</p></div></div>
        <div class="funnel">
          @for (f of funnel; track f.label; let i = $index) {
            <div class="funnel__row">
              <div class="funnel__bar" [style.width.%]="(f.value / funnel[0].value) * 100" [style.opacity]="1 - i * 0.16"></div>
              <span>{{ f.label }}</span>
              <b>{{ f.value | number }}</b>
            </div>
          }
        </div>
      </article>
    </section>

    <section class="row row--3">
      <article class="panel">
        <div class="panel__head"><div><h3>Kuzov turi bo‘yicha</h3><p>Avtomobillar soni</p></div></div>
        <app-bar-chart [values]="byBody().values" [labels]="byBody().labels" [highlight]="byBody().top" />
      </article>
      <article class="panel">
        <div class="panel__head"><div><h3>Shaharlar</h3><p>Mijozlar ulushi</p></div></div>
        <app-donut [items]="cities()" caption="mijoz" />
      </article>
      <article class="panel">
        <div class="panel__head"><div><h3>To‘lov usullari</h3><p>Buyurtmalar bo‘yicha</p></div></div>
        <app-donut [items]="payments()" caption="to‘lov" />
      </article>
    </section>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 16px; }
    .dash-head { margin-bottom: 4px; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric { display: flex; flex-direction: column; gap: 4px; padding: 18px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); }
    .metric span { font-size: 12px; color: var(--muted); }
    .metric b { font-size: 28px; font-weight: 600; letter-spacing: -.03em; }
    .metric small { font-size: 11px; color: #138a5b; }
    .metric small.down { color: #c42a37; }
    .row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    .row--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .funnel { display: flex; flex-direction: column; gap: 10px; }
    .funnel__row { position: relative; display: flex; justify-content: space-between; align-items: center; height: 44px; padding: 0 14px; font-size: 13px; }
    .funnel__bar { position: absolute; inset: 0 auto 0 0; border-radius: 12px; background: var(--ink); animation: grow-x 1s var(--ease) both; transform-origin: left; }
    .funnel__row span, .funnel__row b { position: relative; color: #fff; mix-blend-mode: difference; }
    @keyframes grow-x { from { transform: scaleX(0); } }
    @media (max-width: 1100px) { .cards { grid-template-columns: 1fr 1fr; } .row, .row--3 { grid-template-columns: 1fr; } }
  `,
})
export class Analytics {
  protected readonly store = inject(CarStore);
  protected readonly months = MONTHS;
  protected readonly metrics = [
    { label: 'Konversiya', value: '4.8%', delta: 0.6 },
    { label: 'O‘rtacha chek', value: '$46 210', delta: 5.2 },
    { label: 'Ijara bandligi', value: '82%', delta: 3.1 },
    { label: 'Qaytish darajasi', value: '37%', delta: -1.4 },
  ];
  protected readonly traffic = [
    { name: 'Tashriflar', color: '#0b0b0c', values: [42, 48, 51, 47, 62, 70, 76, 73, 84, 91, 88, 97] },
    { name: 'Lidlar', color: '#36c58c', values: [8, 9, 11, 10, 14, 16, 18, 17, 21, 24, 23, 27] },
  ];
  protected readonly funnel = [
    { label: 'Tashriflar', value: 96_400 },
    { label: 'Avtomobil sahifasi', value: 41_200 },
    { label: 'Bron / ariza', value: 8_940 },
    { label: 'Tasdiqlangan', value: 5_120 },
    { label: 'To‘langan', value: 4_630 },
  ];
  protected readonly byBody = computed(() => {
    const labels = BODIES.map((b) => b.slice(0, 5));
    const values = BODIES.map((b) => this.store.cars().filter((c) => c.body === b).length);
    return { labels, values, top: values.indexOf(Math.max(...values)) };
  });
  private readonly palette = ['#0b0b0c', '#36c58c', '#7d858c', '#a9e6c8', '#d9d9de', '#3d7cf5', '#f2a93b', '#ef4d5a'];
  protected readonly cities = computed(() => {
    const m = new Map<string, number>();
    CUSTOMERS.forEach((c) => m.set(c.city, (m.get(c.city) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value], i) => ({ label, value, color: this.palette[i] }));
  });
  protected readonly payments = computed(() => {
    const m = new Map<string, number>();
    ORDERS.forEach((o) => m.set(o.payment, (m.get(o.payment) ?? 0) + 1));
    return [...m.entries()].map(([label, value], i) => ({ label, value, color: this.palette[i] }));
  });
}

@Component({
  selector: 'app-notifications',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-head">
      <div><h1>Bildirishnomalar</h1><p>{{ unread() }} ta o‘qilmagan</p></div>
      <button type="button" class="btn btn--light btn--sm" (click)="readAll()"><app-icon name="check" [size]="14" /> Hammasini o‘qilgan deb belgilash</button>
    </div>
    <div class="panel list">
      @for (n of items(); track n.text; let i = $index) {
        <div class="item" [class.unread]="!n.read" (click)="read(i)">
          <span class="icon-btn"><app-icon [name]="n.icon" [size]="16" /></span>
          <div><p>{{ n.text }}</p><small>{{ n.time }}</small></div>
          @if (!n.read) { <i class="dot"></i> }
        </div>
      }
    </div>
  `,
  styles: `
    .list { padding: 8px; }
    .item { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 14px; cursor: pointer; transition: background .2s; }
    .item:hover { background: var(--bg-soft); }
    .item div { flex: 1; }
    .item p { font-size: 13px; }
    .item small { font-size: 12px; color: var(--muted); }
    .item.unread p { font-weight: 600; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  `,
})
export class Notifications {
  protected readonly items = signal(
    [...ACTIVITY, ...ACTIVITY.map((a) => ({ ...a, text: a.text + ' (takroriy)', time: '2 kun oldin' }))].map((a, i) => ({ ...a, read: i > 2 })),
  );
  protected readonly unread = computed(() => this.items().filter((i) => !i.read).length);

  protected read(i: number): void {
    this.items.update((l) => l.map((n, j) => (j === i ? { ...n, read: true } : n)));
  }

  protected readAll(): void {
    this.items.update((l) => l.map((n) => ({ ...n, read: true })));
  }
}

@Component({
  selector: 'app-settings',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-head">
      <div><h1>Sozlamalar</h1><p>Profil, kompaniya va bildirishnomalar</p></div>
    </div>
    <div class="layout">
      <nav class="tabs">
        @for (t of tabs; track t.key) {
          <button type="button" [class.on]="tab() === t.key" (click)="tab.set(t.key)"><app-icon [name]="t.icon" [size]="16" /> {{ t.label }}</button>
        }
      </nav>

      <form class="panel" (submit)="save($event)">
        @switch (tab()) {
          @case ('profile') {
            <div class="profile">
              <span class="ava">AK</span>
              <div><b>Akmal Karimov</b><p class="muted">Administrator · akmal&#64;carzone.uz</p></div>
              <button type="button" class="btn btn--light btn--sm" (click)="store.notify('Rasm yuklash tez orada')">Rasmni o‘zgartirish</button>
            </div>
            <div class="grid">
              <div class="field"><label for="fn">Ism</label><input id="fn" class="input" value="Akmal" /></div>
              <div class="field"><label for="ln">Familiya</label><input id="ln" class="input" value="Karimov" /></div>
              <div class="field"><label for="em">Email</label><input id="em" class="input" type="email" value="akmal@carzone.uz" /></div>
              <div class="field"><label for="ph">Telefon</label><input id="ph" class="input" value="+998 90 123 45 67" /></div>
              <div class="field span2"><label for="bio">Bio</label><textarea id="bio" class="input">CARZONE avtoparki va savdo bo‘limi rahbari.</textarea></div>
            </div>
          }
          @case ('company') {
            <div class="grid">
              <div class="field"><label for="cn">Kompaniya nomi</label><input id="cn" class="input" value="CARZONE MChJ" /></div>
              <div class="field"><label for="inn">STIR</label><input id="inn" class="input" value="305 123 456" /></div>
              <div class="field span2"><label for="ad">Manzil</label><input id="ad" class="input" value="Amir Temur ko‘chasi 108, Toshkent" /></div>
              <div class="field"><label for="cur">Valyuta</label><select id="cur" class="input"><option>USD ($)</option><option>UZS (so‘m)</option><option>EUR (€)</option></select></div>
              <div class="field"><label for="tz">Vaqt zonasi</label><select id="tz" class="input"><option>Asia/Tashkent (UTC+5)</option></select></div>
            </div>
          }
          @case ('notify') {
            <div class="toggles">
              @for (n of notifs(); track n.label; let i = $index) {
                <button type="button" class="toggle" (click)="toggle(i)">
                  <div><b>{{ n.label }}</b><small>{{ n.hint }}</small></div>
                  <span class="switch" [class.switch--on]="n.on"></span>
                </button>
              }
            </div>
          }
          @case ('danger') {
            <div class="danger">
              <div>
                <b>Demo ma’lumotlarni tiklash</b>
                <p class="muted">Qo‘shilgan, tahrirlangan va o‘chirilgan avtomobillar boshlang‘ich holatga qaytadi.</p>
              </div>
              <button type="button" class="btn btn--dark del" (click)="store.reset()"><app-icon name="history" [size]="14" /> Tiklash</button>
            </div>
          }
        }
        @if (tab() !== 'danger') {
          <div class="actions">
            <button type="button" class="btn btn--light">Bekor qilish</button>
            <button type="submit" class="btn btn--dark">Saqlash</button>
          </div>
        }
      </form>
    </div>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; align-items: start; }
    .tabs { display: flex; flex-direction: column; gap: 4px; padding: 8px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); }
    .tabs button { display: flex; align-items: center; gap: 10px; height: 40px; padding: 0 12px; border-radius: 12px; font-size: 13px; text-align: left; }
    .tabs button:hover { background: var(--surface-2); }
    .tabs button.on { background: var(--ink); color: #fff; }
    .panel { padding: 24px; }
    .profile { display: flex; align-items: center; gap: 16px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--line); }
    .profile div { flex: 1; }
    .profile p { font-size: 13px; }
    .ava { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, #f6d365, #fda085); color: #3b1d00; font-weight: 700; font-size: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .span2 { grid-column: 1 / -1; }
    .toggles { display: flex; flex-direction: column; }
    .toggle { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line); text-align: left; }
    .toggle div { display: flex; flex-direction: column; }
    .toggle b { font-size: 14px; font-weight: 500; }
    .toggle small { font-size: 12px; color: var(--muted); }
    .danger { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px; border-radius: var(--radius); border: 1px solid #f6c5ca; background: #fff6f7; }
    .danger p { font-size: 13px; margin-top: 2px; }
    .del { background: var(--danger); }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
    @media (max-width: 800px) { .layout { grid-template-columns: 1fr; } .tabs { flex-direction: row; overflow-x: auto; } .tabs button { flex-shrink: 0; } .grid { grid-template-columns: 1fr; } .danger { flex-direction: column; align-items: flex-start; } }
  `,
})
export class Settings {
  protected readonly store = inject(CarStore);
  protected readonly tabs = [
    { key: 'profile', label: 'Profil', icon: 'user' },
    { key: 'company', label: 'Kompaniya', icon: 'box' },
    { key: 'notify', label: 'Bildirishnomalar', icon: 'bell' },
    { key: 'danger', label: 'Ma’lumotlar', icon: 'shield' },
  ];
  protected readonly tab = signal('profile');
  protected readonly notifs = signal([
    { label: 'Yangi buyurtmalar', hint: 'Har bir yangi buyurtma haqida darhol xabar', on: true },
    { label: 'To‘lovlar', hint: 'Muvaffaqiyatli va rad etilgan to‘lovlar', on: true },
    { label: 'Mijoz xabarlari', hint: 'Chatdagi yangi xabarlar', on: true },
    { label: 'Haftalik hisobot', hint: 'Har dushanba emailga', on: false },
    { label: 'Marketing yangiliklari', hint: 'Mahsulot yangilanishlari va maslahatlar', on: false },
  ]);

  protected toggle(i: number): void {
    this.notifs.update((l) => l.map((n, j) => (j === i ? { ...n, on: !n.on } : n)));
  }

  protected save(e: Event): void {
    e.preventDefault();
    this.store.notify('Sozlamalar saqlandi');
  }
}
