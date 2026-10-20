import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { BODIES, BRANDS, FUELS } from '../../core/data/cars.data';
import { BodyType, Car, FuelType, Transmission } from '../../core/models';
import { CarCard } from '../../shared/car-card';
import { Icon } from '../../shared/icon';
import { PriceRange } from '../../shared/price-range';

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'new' | 'rating' | 'speed';

const SORTS: { key: SortKey; label: string; fn: (a: Car, b: Car) => number }[] = [
  { key: 'popular', label: 'Ommabop', fn: (a, b) => b.reviews - a.reviews },
  { key: 'price-asc', label: 'Arzonroq', fn: (a, b) => a.price - b.price },
  { key: 'price-desc', label: 'Qimmatroq', fn: (a, b) => b.price - a.price },
  { key: 'new', label: 'Yangi', fn: (a, b) => b.year - a.year || b.addedAt.localeCompare(a.addedAt) },
  { key: 'rating', label: 'Reyting', fn: (a, b) => b.rating - a.rating },
  { key: 'speed', label: 'Tezroq', fn: (a, b) => a.accel - b.accel },
];

const PAGE = 8;

@Component({
  selector: 'app-catalog',
  imports: [CarCard, Icon, PriceRange],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog {
  protected readonly store = inject(CarStore);
  protected readonly fuels = FUELS;
  protected readonly brands = BRANDS;
  protected readonly bodies = BODIES;
  protected readonly sorts = SORTS;

  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;
  private readonly bounds = this.store.priceBounds();

  protected readonly floor = Math.floor(this.bounds.min / 1000) * 1000;
  protected readonly ceil = Math.ceil(this.bounds.max / 1000) * 1000;

  protected readonly query = signal('');
  protected readonly selFuels = signal<FuelType[]>([]);
  protected readonly selBrands = signal<string[]>(this.params.get('brand') ? [this.params.get('brand')!] : []);
  protected readonly selBodies = signal<BodyType[]>(this.params.get('body') ? [this.params.get('body') as BodyType] : []);
  protected readonly transmission = signal<Transmission | 'all'>('all');
  protected readonly low = signal(this.floor);
  protected readonly high = signal(Math.min(this.ceil, Number(this.params.get('max')) || this.ceil));
  protected readonly onlyFav = signal(this.params.get('fav') === '1');
  protected readonly onlyAvailable = signal(false);
  protected readonly sort = signal<SortKey>((this.params.get('sort') as SortKey) || 'popular');
  protected readonly layout = signal<'grid' | 'list'>('grid');
  protected readonly sortOpen = signal(false);
  protected readonly filtersOpen = signal(false);
  protected readonly limit = signal(PAGE);
  protected readonly showAllBrands = signal(false);

  protected readonly prices = computed(() => this.store.cars().map((c) => c.price));
  protected readonly sortLabel = computed(() => SORTS.find((s) => s.key === this.sort())!.label);

  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    const fuels = this.selFuels();
    const brands = this.selBrands();
    const bodies = this.selBodies();
    const tr = this.transmission();
    const favs = new Set(this.store.favorites());
    const list = this.store.cars().filter(
      (c) =>
        (!q || `${c.make} ${c.model} ${c.trim}`.toLowerCase().includes(q)) &&
        (!fuels.length || c.fuel.some((f) => fuels.includes(f))) &&
        (!brands.length || brands.includes(c.make)) &&
        (!bodies.length || bodies.includes(c.body)) &&
        (tr === 'all' || c.transmission === tr) &&
        c.price >= this.low() &&
        c.price <= this.high() &&
        (!this.onlyFav() || favs.has(c.id)) &&
        (!this.onlyAvailable() || c.status === 'Sotuvda'),
    );
    return list.sort(SORTS.find((s) => s.key === this.sort())!.fn);
  });
  protected readonly visible = computed(() => this.results().slice(0, this.limit()));

  protected readonly brandCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const c of this.store.cars()) counts[c.make] = (counts[c.make] ?? 0) + 1;
    return counts;
  });

  protected readonly activeCount = computed(
    () =>
      this.selFuels().length +
      this.selBrands().length +
      this.selBodies().length +
      (this.transmission() !== 'all' ? 1 : 0) +
      (this.low() !== this.floor || this.high() !== this.ceil ? 1 : 0) +
      (this.onlyFav() ? 1 : 0) +
      (this.onlyAvailable() ? 1 : 0) +
      (this.query() ? 1 : 0),
  );

  protected toggle<T>(list: WritableSignal<T[]>, value: T): void {
    list.update((l) => (l.includes(value) ? l.filter((x) => x !== value) : [...l, value]));
    this.limit.set(PAGE);
  }

  protected setSort(key: SortKey): void {
    this.sort.set(key);
    this.sortOpen.set(false);
  }

  protected reset(): void {
    this.query.set('');
    this.selFuels.set([]);
    this.selBrands.set([]);
    this.selBodies.set([]);
    this.transmission.set('all');
    this.low.set(this.floor);
    this.high.set(this.ceil);
    this.onlyFav.set(false);
    this.onlyAvailable.set(false);
    this.limit.set(PAGE);
  }

  protected loadMore(): void {
    this.limit.update((l) => l + PAGE);
  }
}
