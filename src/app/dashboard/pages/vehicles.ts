import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { BODIES, BRANDS, FUELS } from '../../core/data/cars.data';
import { BodyType, Car, FuelType, Transmission } from '../../core/models';
import { carBadge } from '../../core/ui';
import { CarImage } from '../../shared/car-image';
import { Icon } from '../../shared/icon';
import { PriceRange } from '../../shared/price-range';
import { VehicleEditor } from './vehicle-editor';

type Rental = 'any' | 'day' | 'hour';
type Sort = 'near' | 'cheap' | 'rating' | 'new';

@Component({
  selector: 'app-vehicles',
  imports: [RouterLink, DecimalPipe, CarImage, Icon, PriceRange, VehicleEditor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles {
  protected readonly store = inject(CarStore);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly brands = BRANDS;
  protected readonly bodies = BODIES;
  protected readonly fuels = FUELS;
  protected readonly carBadge = carBadge;
  protected readonly sorts: { key: Sort; label: string }[] = [
    { key: 'near', label: 'Menga yaqin' },
    { key: 'cheap', label: 'Arzonroq' },
    { key: 'rating', label: 'Reyting' },
    { key: 'new', label: 'Yangi qo‘shilgan' },
  ];

  protected readonly rental = signal<Rental>('hour');
  protected readonly availableOnly = signal(false);
  protected readonly query = signal(this.params.get('q') ?? '');
  protected readonly selBrands = signal<string[]>([]);
  protected readonly selBodies = signal<BodyType[]>(['Sedan', 'Kupe', 'Krossover', 'Xetchbek', 'SUV', 'Sport kupe', 'Universal', 'Kabriolet']);
  protected readonly selFuels = signal<FuelType[]>([]);
  protected readonly transmission = signal<Transmission | 'any'>('any');
  protected readonly yearFrom = signal(2023);
  protected readonly open = signal<Record<string, boolean>>({ price: true, brand: false, year: false, body: true, tr: true, fuel: true });
  protected readonly sort = signal<Sort>('near');
  protected readonly sortOpen = signal(false);
  protected readonly view = signal<'grid' | 'table'>('grid');
  protected readonly filtersOpen = signal(false);

  protected readonly editing = signal<Car | null | undefined>(this.params.get('new') ? null : undefined);
  protected readonly confirmDelete = signal<Car | null>(null);

  /** Price shown per rental mode: per-hour is derived from the daily rate. */
  protected unitPrice(c: Car): number {
    return this.rental() === 'day' ? c.rentPerDay : Math.round((c.rentPerDay / 7.5) * 100) / 100;
  }
  protected readonly unit = computed(() => (this.rental() === 'day' ? 'kun' : 'soat'));

  protected readonly allPrices = computed(() => this.store.cars().map((c) => this.unitPrice(c)));
  protected readonly bounds = computed(() => {
    const p = this.allPrices();
    return { min: Math.floor(Math.min(...p)), max: Math.ceil(Math.max(...p)) };
  });
  protected readonly low = signal(0);
  protected readonly high = signal(Number.MAX_SAFE_INTEGER);

  protected readonly results = computed(() => {
    const q = this.query().toLowerCase().trim();
    const lo = Math.max(this.low(), this.bounds().min);
    const hi = Math.min(this.high(), this.bounds().max);
    const list = this.store.cars().filter((c) => {
      const p = this.unitPrice(c);
      return (
        (!q || `${c.make} ${c.model} ${c.trim} ${c.location}`.toLowerCase().includes(q)) &&
        (!this.availableOnly() || c.status === 'Sotuvda') &&
        (!this.selBrands().length || this.selBrands().includes(c.make)) &&
        this.selBodies().includes(c.body) &&
        (!this.selFuels().length || c.fuel.some((f) => this.selFuels().includes(f))) &&
        (this.transmission() === 'any' || c.transmission === this.transmission()) &&
        c.year >= this.yearFrom() &&
        p >= lo &&
        p <= hi
      );
    });
    const by: Record<Sort, (a: Car, b: Car) => number> = {
      near: (a, b) => a.distance - b.distance,
      cheap: (a, b) => a.rentPerDay - b.rentPerDay,
      rating: (a, b) => b.rating - a.rating,
      new: (a, b) => b.addedAt.localeCompare(a.addedAt),
    };
    return list.sort(by[this.sort()]);
  });

  protected readonly sortLabel = computed(() => this.sorts.find((s) => s.key === this.sort())!.label);

  protected sliderLow(): number {
    return Math.max(this.low(), this.bounds().min);
  }

  protected sliderHigh(): number {
    return Math.min(this.high(), this.bounds().max);
  }

  protected setRental(r: Rental): void {
    this.rental.set(r);
    this.low.set(0);
    this.high.set(Number.MAX_SAFE_INTEGER);
  }

  protected toggle<T>(list: WritableSignal<T[]>, v: T): void {
    list.update((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]));
  }

  protected section(key: string): void {
    this.open.update((o) => ({ ...o, [key]: !o[key] }));
  }

  protected reset(): void {
    this.availableOnly.set(false);
    this.query.set('');
    this.selBrands.set([]);
    this.selBodies.set([...BODIES]);
    this.selFuels.set([]);
    this.transmission.set('any');
    this.yearFrom.set(2023);
    this.low.set(0);
    this.high.set(Number.MAX_SAFE_INTEGER);
  }

  protected minutes(m: number): number {
    return Math.max(1, Math.round(m / 75));
  }

  protected save(car: Car): void {
    const existed = !!this.store.byId(car.id);
    this.store.upsert(car);
    this.editing.set(undefined);
    this.store.notify(existed ? 'Avtomobil yangilandi' : 'Yangi avtomobil qo‘shildi');
  }

  protected remove(): void {
    const car = this.confirmDelete();
    if (!car) return;
    this.store.remove(car.id);
    this.confirmDelete.set(null);
    this.store.notify(`${car.make} ${car.model} o‘chirildi`);
  }
}
