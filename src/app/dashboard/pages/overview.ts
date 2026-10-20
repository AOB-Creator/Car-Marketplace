import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { ACTIVITY, CUSTOMERS, ORDERS } from '../../core/data/crm.data';
import { MONTHS, WEEKDAYS, avatarBg, initials, orderBadge, shortDate } from '../../core/ui';
import { CarImage } from '../../shared/car-image';
import { Icon } from '../../shared/icon';
import { AreaChart, BarChart, Donut, Series, Sparkline } from '../charts';

type Period = '7d' | '30d' | '12m';

function wave(n: number, base: number, amp: number, seed: number): number[] {
  return Array.from({ length: n }, (_, i) =>
    Math.round(base + Math.sin(i * 0.9 + seed) * amp + Math.cos(i * 0.37 + seed * 2) * amp * 0.6 + i * (amp / n) * 1.5),
  );
}

@Component({
  selector: 'app-overview',
  imports: [RouterLink, DecimalPipe, CarImage, Icon, AreaChart, BarChart, Donut, Sparkline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly store = inject(CarStore);
  protected readonly period = signal<Period>('12m');
  protected readonly activity = ACTIVITY;
  protected readonly orderBadge = orderBadge;
  protected readonly initials = initials;
  protected readonly avatarBg = avatarBg;
  protected readonly shortDate = shortDate;

  private readonly scale = computed(() => ({ '7d': 0.08, '30d': 0.32, '12m': 1 })[this.period()]);

  protected readonly kpis = computed(() => {
    const k = this.scale();
    return [
      { label: 'Umumiy daromad', value: Math.round(1_284_600 * k), prefix: '$', delta: 12.4, icon: 'card', spark: wave(12, 50, 14, 1) },
      { label: 'Buyurtmalar', value: Math.round(1_642 * k), prefix: '', delta: 8.1, icon: 'cart', spark: wave(12, 40, 10, 2) },
      { label: 'Faol ijaralar', value: this.store.cars().filter((c) => c.status === 'Band').length + 37, prefix: '', delta: -2.3, icon: 'key', spark: wave(12, 30, 9, 3).reverse() },
      { label: 'Yangi mijozlar', value: Math.round(486 * k), prefix: '', delta: 18.7, icon: 'users', spark: wave(12, 20, 8, 4) },
    ];
  });

  protected readonly chart = computed<{ labels: string[]; series: Series[] }>(() => {
    const p = this.period();
    const n = p === '7d' ? 7 : p === '30d' ? 15 : 12;
    const labels =
      p === '7d'
        ? WEEKDAYS
        : p === '30d'
          ? Array.from({ length: n }, (_, i) => `${i * 2 + 1}`)
          : MONTHS;
    const base = p === '7d' ? 14_000 : p === '30d' ? 26_000 : 96_000;
    return {
      labels,
      series: [
        { name: 'Sotuv', color: '#0b0b0c', values: wave(n, base, base * 0.28, 1.2) },
        { name: 'Ijara', color: '#36c58c', values: wave(n, base * 0.55, base * 0.18, 2.4) },
      ],
    };
  });

  protected readonly brandShare = computed(() => {
    const palette = ['#0b0b0c', '#36c58c', '#7d858c', '#a9e6c8', '#d9d9de', '#3d7cf5'];
    const totals = new Map<string, number>();
    for (const o of ORDERS) {
      const car = this.store.byId(o.carId);
      if (car) totals.set(car.make, (totals.get(car.make) ?? 0) + 1);
    }
    const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5).map(([label, value], i) => ({ label, value, color: palette[i] }));
    const rest = sorted.slice(5).reduce((a, [, v]) => a + v, 0);
    return rest ? [...top, { label: 'Boshqalar', value: rest, color: palette[5] }] : top;
  });

  protected readonly recent = computed(() =>
    ORDERS.slice(0, 6).map((o) => ({
      ...o,
      car: this.store.byId(o.carId),
      customer: CUSTOMERS.find((c) => c.id === o.customerId)!,
    })),
  );

  protected readonly fleet = computed(() => {
    const cars = this.store.cars();
    const count = (s: string) => cars.filter((c) => c.status === s).length;
    const total = cars.length || 1;
    return [
      { label: 'Sotuvda', value: count('Sotuvda'), color: '#36c58c' },
      { label: 'Band', value: count('Band'), color: '#f2a93b' },
      { label: 'Servisda', value: count('Servisda'), color: '#3d7cf5' },
      { label: 'Sotilgan', value: count('Sotilgan'), color: '#0b0b0c' },
    ].map((s) => ({ ...s, pct: (s.value / total) * 100 }));
  });

  protected readonly topCars = computed(() => [...this.store.cars()].sort((a, b) => b.reviews - a.reviews).slice(0, 4));
  protected readonly star = computed(() => this.topCars()[0]);
  protected readonly weekly = [42, 58, 51, 74, 66, 88, 61];
  protected readonly weekdays = WEEKDAYS;
}
