import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { Hotspot } from '../../core/models';
import { CarCard } from '../../shared/car-card';
import { CarImage } from '../../shared/car-image';
import { Icon } from '../../shared/icon';

type Category = 'Ishlash' | 'Dizayn' | 'Xavfsizlik' | 'Hashamat' | 'Multimedia';

const HOTSPOTS: Record<Category, Hotspot[]> = {
  Ishlash: [
    { label: 'Sport rejimi', x: 30, y: 38 },
    { label: 'Uglerod tormozlar', x: 70, y: 70 },
    { label: 'Adaptiv osma', x: 27, y: 72 },
    { label: 'Turbo dvigatel', x: 80, y: 46 },
  ],
  Dizayn: [
    { label: 'Panorama tom', x: 52, y: 22 },
    { label: 'Night Pack', x: 22, y: 45 },
    { label: 'Aero kuzov', x: 48, y: 58 },
    { label: 'Pure Perform', x: 74, y: 72 },
  ],
  Xavfsizlik: [
    { label: '360° kamera', x: 84, y: 40 },
    { label: '10 ta yostiq', x: 52, y: 40 },
    { label: 'Ko‘r zona', x: 22, y: 48 },
  ],
  Hashamat: [
    { label: 'Charm salon', x: 45, y: 40 },
    { label: 'Ambient yoritish', x: 58, y: 48 },
    { label: 'Massaj o‘rindiq', x: 38, y: 55 },
  ],
  Multimedia: [
    { label: 'Burmester audio', x: 34, y: 46 },
    { label: '14.9" ekran', x: 60, y: 38 },
    { label: 'Apple CarPlay', x: 70, y: 52 },
  ],
};

const ANGLES = ['23', '01', '05', '09', '13', '17', '21', '29'];

@Component({
  selector: 'app-car-detail',
  imports: [RouterLink, DecimalPipe, CarImage, CarCard, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.scss',
})
export class CarDetail {
  protected readonly store = inject(CarStore);
  private readonly router = inject(Router);

  /** Route param bound via withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly car = computed(() => this.store.byId(this.id()));
  protected readonly categories = Object.keys(HOTSPOTS) as Category[];
  protected readonly angles = ANGLES;

  protected readonly category = signal<Category>('Dizayn');
  protected readonly hotspots = computed(() => HOTSPOTS[this.category()]);
  protected readonly activeSpot = signal<number | null>(null);
  protected readonly angle = linkedSignal({ source: this.id, computation: () => '23' });
  protected readonly color = linkedSignal({ source: this.car, computation: (c) => c?.colors[0]?.hex ?? null });
  protected readonly colorName = computed(() => this.car()?.colors.find((c) => c.hex === this.color())?.name);
  protected readonly highlightOffset = signal(0);

  protected readonly highlights = computed(() => {
    const c = this.car();
    if (!c) return [];
    return [
      { icon: 'seat', top: 'Yo‘lovchi', title: 'sig‘imi', value: String(c.seats), unit: '' },
      { icon: 'engine', top: 'Dvigatel', title: c.engine, value: '', unit: '' },
      { icon: 'zap', top: 'Quvvat', title: `@ ${c.torque} N·m`, value: String(c.hp), unit: 'o.k.' },
      { icon: 'gauge', top: c.transmission, title: `${c.drive} · 8 pog‘onali`, value: '', unit: '', dark: true },
      { icon: 'clock', top: 'Tezlanish', title: '0–100 km/s', value: String(c.accel), unit: 'sek' },
      { icon: 'navigation', top: 'Maks. tezlik', title: 'elektron cheklangan', value: String(c.topSpeed), unit: 'km/s' },
    ];
  });

  protected readonly specs = computed(() => {
    const c = this.car();
    if (!c) return [];
    return [
      ['Brend', c.make],
      ['Model', `${c.model} ${c.trim}`],
      ['Yil', String(c.year)],
      ['Kuzov', c.body],
      ['Yoqilg‘i', c.fuel.join(', ')],
      ['Dvigatel', c.engine],
      ['Quvvat', `${c.hp} o.k.`],
      ['Moment', `${c.torque} N·m`],
      ['Uzatma', c.transmission],
      ['Yuritma', c.drive],
      ['O‘rinlar', String(c.seats)],
      ['Yurgan masofa', c.mileage ? `${c.mileage.toLocaleString('ru-RU')} km` : 'Yangi'],
      ['Joylashuv', c.location],
      ['Holati', c.status],
    ];
  });

  protected readonly similar = computed(() => {
    const c = this.car();
    if (!c) return [];
    return this.store
      .cars()
      .filter((x) => x.id !== c.id)
      .sort((a, b) => Number(b.body === c.body) - Number(a.body === c.body) || Math.abs(a.price - c.price) - Math.abs(b.price - c.price))
      .slice(0, 4);
  });

  // Booking / finance
  protected readonly mode = signal<'buy' | 'rent' | 'test'>('buy');
  protected readonly downPct = signal(20);
  protected readonly months = signal(36);
  protected readonly rate = 0.169;
  protected readonly days = signal(3);
  protected readonly withDriver = signal(false);
  protected readonly fullCover = signal(true);
  protected readonly testDate = signal(this.isoDay(1));
  protected readonly startDate = signal(this.isoDay(1));

  protected readonly monthly = computed(() => {
    const c = this.car();
    if (!c) return 0;
    const principal = c.price * (1 - this.downPct() / 100);
    const r = this.rate / 12;
    const n = this.months();
    return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
  });
  protected readonly rentTotal = computed(() => {
    const c = this.car();
    if (!c) return 0;
    const extra = (this.withDriver() ? 60 : 0) + (this.fullCover() ? 25 : 0);
    return (c.rentPerDay + extra) * this.days();
  });

  protected readonly Math = Math;

  constructor() {
    effect(() => {
      this.id();
      this.activeSpot.set(null);
    });
  }

  protected scrollToBook(): void {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected shift(dir: number): void {
    const max = Math.max(0, this.highlights().length - 3);
    this.highlightOffset.update((o) => Math.min(max, Math.max(0, o + dir)));
  }

  protected submit(): void {
    const c = this.car();
    if (!c) return;
    const text =
      this.mode() === 'buy'
        ? `${c.make} ${c.model} uchun ariza yuborildi. Menejer 15 daqiqada bog‘lanadi.`
        : this.mode() === 'rent'
          ? `${c.model} ${this.days()} kunga bron qilindi — $${this.rentTotal().toLocaleString('en-US')}`
          : `Test-drayv ${this.testDate()} sanasiga yozildi`;
    this.store.notify(text);
  }

  protected back(): void {
    this.router.navigate(['/cars']);
  }

  private isoDay(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }
}
