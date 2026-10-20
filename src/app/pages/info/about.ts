import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarStore } from '../../core/car-store.service';
import { SERVICES } from '../../core/data/content.data';
import { CarImage } from '../../shared/car-image';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-about',
  imports: [RouterLink, CarImage, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container hero">
      <span class="eyebrow">Biz haqimizda</span>
      <h1 class="display">Avtomobil — bu shunchaki transport emas.<br />Bu his-tuyg‘u.</h1>
      <p>CARZONE 2020-yilda Toshkentda kichik showroom sifatida boshlangan. Bugun biz 500 dan ortiq premium avtomobil, 60+ olib ketish nuqtasi va minglab mamnun mijozlarga ega platformamiz.</p>
    </section>

    @if (car(); as car) {
      <section class="container banner">
        <app-car-image [car]="car" [width]="1400" angle="01" />
        <div class="banner__stats">
          @for (s of stats; track s.label) {
            <div><b>{{ s.value }}</b><span>{{ s.label }}</span></div>
          }
        </div>
      </section>
    }

    <section class="container values">
      @for (s of services; track s.key) {
        <article>
          <span class="icon-btn"><app-icon [name]="s.icon" [size]="18" /></span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </article>
      }
      <article class="dark">
        <h3>Jamoamizga qo‘shiling</h3>
        <p>Biz doimo iste’dodli menejerlar, mexaniklar va dasturchilarni izlaymiz.</p>
        <a routerLink="/faq" class="btn btn--accent btn--sm">Bog‘lanish <app-icon name="arrow-up-right" [size]="14" /></a>
      </article>
    </section>
  `,
  styles: `
    .hero { padding-top: 72px; max-width: 900px; }
    .hero h1 { margin-top: 16px; font-size: clamp(34px, 5vw, 62px); }
    .hero p { margin-top: 20px; max-width: 620px; color: var(--muted); font-size: 16px; }
    .banner { position: relative; margin-top: 48px; }
    .banner app-car-image { height: clamp(220px, 34vw, 420px); padding: 30px; border-radius: var(--radius-xl); background: var(--accent-grad); }
    .banner__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }
    .banner__stats div { display: flex; flex-direction: column; padding: 22px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); }
    .banner__stats b { font-size: 34px; font-weight: 500; letter-spacing: -.03em; }
    .banner__stats span { color: var(--muted); font-size: 13px; }
    .values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 64px; }
    .values article { display: flex; flex-direction: column; gap: 10px; padding: 26px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); }
    .values h3 { margin-top: 12px; font-size: 18px; font-weight: 500; }
    .values p { color: var(--muted); font-size: 13px; }
    .values .dark { background: var(--ink); color: #fff; justify-content: flex-end; }
    .values .dark p { color: rgba(255,255,255,.6); margin-bottom: 10px; }
    .values .dark .btn { width: fit-content; }
    @media (max-width: 860px) { .values, .banner__stats { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 540px) { .values, .banner__stats { grid-template-columns: 1fr; } }
  `,
})
export class About {
  private readonly store = inject(CarStore);
  protected readonly car = computed(() => this.store.byId('mercedes-benz-g-63-amg') ?? this.store.cars()[0]);
  protected readonly services = SERVICES;
  protected readonly stats = [
    { value: '2020', label: 'Tashkil topgan yil' },
    { value: '500+', label: 'Avtomobillar' },
    { value: '12k', label: 'Yakunlangan bitimlar' },
    { value: '4.9', label: 'O‘rtacha reyting' },
  ];
}
