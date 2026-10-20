import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Car } from '../core/models';
import { CarStore } from '../core/car-store.service';
import { CarImage } from './car-image';
import { Icon } from './icon';

@Component({
  selector: 'app-car-card',
  imports: [RouterLink, DecimalPipe, CarImage, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.list]': 'layout() === "list"' },
  template: `
    <a class="card" [routerLink]="['/cars', car().id]">
      <span class="watermark" aria-hidden="true">{{ watermark() }}</span>
      <div class="head">
        <div>
          <h3>{{ car().make === 'Mercedes-Benz' ? 'Mercedes' : car().make }} {{ car().model }} {{ car().trim }}</h3>
          <p>{{ car().fuel.join(' · ') }}</p>
        </div>
        <div class="price">
          <b>\${{ car().price | number }}</b>
          <span class="go"><app-icon name="arrow-up-right" [size]="16" /></span>
        </div>
      </div>
      <app-car-image class="img" [car]="car()" [width]="700" />
      <div class="specs">
        <div><b>{{ car().torque }} N·m</b><span>Maks. moment</span></div>
        <div><b>{{ car().accel }} s</b><span>0–100 km/s</span></div>
        <div><b>{{ car().topSpeed }} km/s</b><span>Maks. tezlik</span></div>
      </div>
    </a>
    <button class="fav" type="button" [class.on]="store.isFavorite(car().id)"
      [attr.aria-label]="store.isFavorite(car().id) ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'"
      (click)="store.toggleFavorite(car().id)">
      <app-icon name="heart" [size]="16" [fill]="store.isFavorite(car().id)" />
    </button>
    @if (car().status !== 'Sotuvda') {
      <span class="status badge badge--warning">{{ car().status }}</span>
    }
  `,
  styleUrl: './car-card.scss',
})
export class CarCard {
  protected readonly store = inject(CarStore);
  readonly car = input.required<Car>();
  readonly layout = input<'grid' | 'list'>('grid');

  protected watermark(): string {
    return this.car().model.replace(/\s+/g, '').slice(0, 4).toUpperCase();
  }
}
