import { Injectable, computed, effect, signal } from '@angular/core';
import { CARS } from './data/cars.data';
import { Car } from './models';

const CARS_KEY = 'carzone.cars.v1';
const FAV_KEY = 'carzone.favorites.v1';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep in memory only */
  }
}

/** Single source of truth for the fleet, favourites and the toast queue. */
@Injectable({ providedIn: 'root' })
export class CarStore {
  readonly cars = signal<Car[]>(load(CARS_KEY, CARS));
  readonly favorites = signal<string[]>(load(FAV_KEY, [CARS[0].id, CARS[7].id]));
  readonly toast = signal<{ id: number; text: string } | null>(null);

  readonly favoriteCars = computed(() => {
    const ids = new Set(this.favorites());
    return this.cars().filter((c) => ids.has(c.id));
  });
  readonly available = computed(() => this.cars().filter((c) => c.status === 'Sotuvda'));
  readonly priceBounds = computed(() => {
    const prices = this.cars().map((c) => c.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  });

  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => save(CARS_KEY, this.cars()));
    effect(() => save(FAV_KEY, this.favorites()));
  }

  byId(id: string | null | undefined): Car | undefined {
    return this.cars().find((c) => c.id === id);
  }

  isFavorite(id: string): boolean {
    return this.favorites().includes(id);
  }

  toggleFavorite(id: string): void {
    const on = this.isFavorite(id);
    this.favorites.update((f) => (on ? f.filter((x) => x !== id) : [...f, id]));
    this.notify(on ? 'Sevimlilardan olib tashlandi' : 'Sevimlilarga qo‘shildi');
  }

  upsert(car: Car): void {
    this.cars.update((list) => {
      const i = list.findIndex((c) => c.id === car.id);
      return i === -1 ? [car, ...list] : list.map((c) => (c.id === car.id ? car : c));
    });
  }

  remove(id: string): void {
    this.cars.update((list) => list.filter((c) => c.id !== id));
    this.favorites.update((f) => f.filter((x) => x !== id));
  }

  reset(): void {
    this.cars.set(CARS);
    this.notify('Demo ma’lumotlar tiklandi');
  }

  notify(text: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set({ id: Date.now(), text });
    this.toastTimer = setTimeout(() => this.toast.set(null), 2600);
  }
}
