import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { Car } from '../core/models';

/**
 * Studio render of a car from the imagin.studio CDN, with a drawn silhouette in
 * the car's colour when the render can't be loaded (offline, blocked, unknown model).
 */
@Component({
  selector: 'app-car-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!failed()) {
      <img
        [src]="src()"
        [alt]="car().make + ' ' + car().model"
        [attr.loading]="eager() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="eager() ? 'high' : 'auto'"
        decoding="async"
        [class.ready]="loaded()"
        (load)="loaded.set(true)"
        (error)="failed.set(true)"
      />
    } @else {
      <svg viewBox="0 0 400 170" role="img" [attr.aria-label]="car().make + ' ' + car().model">
        <defs>
          <linearGradient [attr.id]="gid() + 'b'" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" [attr.stop-color]="hex()" stop-opacity="0.75" />
            <stop offset="0.45" [attr.stop-color]="hex()" />
            <stop offset="1" [attr.stop-color]="hex()" />
          </linearGradient>
          <linearGradient [attr.id]="gid() + 'g'" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#1b1f26" />
            <stop offset="1" stop-color="#4b5563" />
          </linearGradient>
          <radialGradient [attr.id]="gid() + 's'" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#000" stop-opacity="0.35" />
            <stop offset="1" stop-color="#000" stop-opacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="150" rx="185" ry="13" [attr.fill]="'url(#' + gid() + 's)'" />
        @if (shape() === 'suv') {
          <path [attr.fill]="'url(#' + gid() + 'b)'" stroke="rgba(0,0,0,.25)" stroke-width="1"
            d="M22 118c-3-18 2-32 18-38l42-10 38-34c8-7 18-10 29-10h120c12 0 21 4 28 12l30 34 34 8c12 3 19 12 20 26l1 14c0 6-4 10-10 10H32c-6 0-9-4-10-12z" />
          <path [attr.fill]="'url(#' + gid() + 'g)'" d="M96 70l32-28c5-4 11-6 18-6h52v34zM210 36h56c8 0 14 3 19 9l22 25H210z" />
        } @else if (shape() === 'sport') {
          <path [attr.fill]="'url(#' + gid() + 'b)'" stroke="rgba(0,0,0,.25)" stroke-width="1"
            d="M14 120c0-14 6-22 18-26l70-16 56-28c12-6 26-9 40-9h52c18 0 34 6 48 17l38 30 38 8c10 2 16 9 17 19l1 13c0 5-4 9-9 9H26c-7 0-12-5-12-12z" />
          <path [attr.fill]="'url(#' + gid() + 'g)'" d="M120 78l44-22c10-5 20-7 31-7h22v29zM228 49h22c14 0 27 5 38 13l18 16h-78z" />
        } @else {
          <path [attr.fill]="'url(#' + gid() + 'b)'" stroke="rgba(0,0,0,.25)" stroke-width="1"
            d="M18 120c0-15 6-24 20-28l58-14 44-30c9-6 19-9 30-9h70c14 0 26 5 37 13l40 28 46 8c12 2 19 10 19 22v12c0 6-4 10-10 10H30c-7 0-12-5-12-12z" />
          <path [attr.fill]="'url(#' + gid() + 'g)'" d="M112 78l36-25c7-5 15-7 24-7h40v32zM222 46h26c11 0 20 4 28 10l28 22h-82z" />
        }
        <path d="M30 112h340" stroke="rgba(255,255,255,.25)" stroke-width="2" />
        @for (x of [100, 300]; track x) {
          <circle [attr.cx]="x" cy="130" r="27" fill="#16181d" />
          <circle [attr.cx]="x" cy="130" r="17" fill="#9aa0a8" />
          <circle [attr.cx]="x" cy="130" r="6" fill="#2b2f36" />
        }
      </svg>
    }
  `,
  host: { '[class.loading]': '!loaded() && !failed()' },
  styles: `
    :host { display: block; position: relative; }
    img, svg { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 18px 18px rgba(0,0,0,.12)); }
    img { opacity: 0; transform: translateY(6px); transition: opacity .45s var(--ease), transform .6s var(--ease); }
    img.ready { opacity: 1; transform: none; }
    svg { filter: none; }
    /* Skeleton while the render streams in. */
    :host(.loading)::before {
      content: ''; position: absolute; left: 12%; right: 12%; top: 34%; bottom: 22%;
      border-radius: 40% 40% 18% 18% / 55% 55% 20% 20%;
      background: linear-gradient(100deg, rgba(0,0,0,.05) 30%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.05) 70%);
      background-size: 300% 100%; animation: shimmer 1.3s linear infinite;
    }
    @keyframes shimmer { from { background-position: 100% 0; } to { background-position: -50% 0; } }
  `,
})
export class CarImage {
  readonly car = input.required<Car>();
  readonly color = input<string | null>(null);
  /** imagin.studio camera angle; 23 is a front three-quarter. */
  readonly angle = input<string>('23');
  readonly width = input(800);
  readonly eager = input(false);

  protected readonly failed = linkedSignal({ source: () => this.src(), computation: () => false });
  protected readonly loaded = linkedSignal({ source: () => this.src(), computation: () => false });

  private readonly paint = computed(() => {
    const car = this.car();
    return car.colors.find((c) => c.hex === this.color()) ?? car.colors[0];
  });
  protected readonly hex = computed(() => this.paint()?.hex ?? '#888');
  protected readonly gid = computed(() => `g-${this.car().id}-${this.hex().slice(1)}`);
  protected readonly shape = computed(() => {
    const body = this.car().body;
    if (body === 'SUV' || body === 'Krossover') return 'suv';
    if (body === 'Sport kupe' || body === 'Kabriolet' || body === 'Kupe') return 'sport';
    return 'sedan';
  });

  protected readonly src = computed(() => {
    const car = this.car();
    const params = new URLSearchParams({
      customer: 'img',
      make: car.render.make,
      modelFamily: car.render.model,
      modelYear: String(car.year),
      paintdescription: this.paint()?.paint ?? 'white',
      angle: this.angle(),
      zoomType: 'fullscreen',
      width: String(this.width()),
    });
    return `https://cdn.imagin.studio/getImage?${params}`;
  });
}
