import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { BODIES, BRANDS } from '../../core/data/cars.data';
import { FAQ, SERVICES, STEPS, TESTIMONIALS } from '../../core/data/content.data';
import { CarImage } from '../../shared/car-image';
import { FaqList } from '../../shared/faq-list';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe, CarImage, FaqList, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly router = inject(Router);
  protected readonly store = inject(CarStore);

  protected readonly brands = BRANDS;
  protected readonly bodies = BODIES;
  protected readonly faq = FAQ;
  protected readonly services = SERVICES;
  protected readonly steps = STEPS;
  protected readonly testimonials = TESTIMONIALS;
  protected readonly stats = [
    { value: '500+', label: 'Premium avtomobil' },
    { value: '24/7', label: 'Yo‘l yordami' },
    { value: '100%', label: 'Xizmat kafolati' },
    { value: '60+', label: 'Olib ketish nuqtasi' },
    { value: '800+', label: 'Mamnun mijoz' },
  ];

  protected readonly heroCars = computed(() => this.store.cars().filter((c) => c.featured));
  protected readonly heroIndex = signal(0);
  protected readonly hero = computed(() => this.heroCars()[this.heroIndex() % this.heroCars().length]);

  protected readonly perfect = computed(() =>
    ['porsche-911-carrera-gts', 'audi-r8-v10-performance', 'ferrari-roma-spider']
      .map((id) => this.store.byId(id))
      .filter((c) => !!c),
  );
  protected readonly topPicks = computed(() => [...this.store.cars()].sort((a, b) => b.rating - a.rating).slice(0, 8));

  protected readonly service = signal(0);
  protected readonly serviceCar = computed(() => this.heroCars()[this.service() % this.heroCars().length]);

  protected readonly quote = signal(0);

  protected readonly searchBrand = signal('');
  protected readonly searchBody = signal('');
  protected readonly searchBudget = signal('');

  private readonly picks = viewChild<ElementRef<HTMLElement>>('picks');

  protected nextHero(dir: number): void {
    const n = this.heroCars().length;
    this.heroIndex.update((i) => (i + dir + n) % n);
  }

  protected scrollPicks(dir: number): void {
    const el = this.picks()?.nativeElement;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  protected moveQuote(dir: number): void {
    const n = this.testimonials.length;
    this.quote.update((i) => (i + dir + n) % n);
  }

  protected search(): void {
    const queryParams: Record<string, string> = {};
    if (this.searchBrand()) queryParams['brand'] = this.searchBrand();
    if (this.searchBody()) queryParams['body'] = this.searchBody();
    if (this.searchBudget()) queryParams['max'] = this.searchBudget();
    this.router.navigate(['/cars'], { queryParams });
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('');
  }
}
