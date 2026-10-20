import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CarStore } from '../core/car-store.service';
import { CREDIT } from '../core/brand';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-site-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-layout.html',
  styleUrl: './site-layout.scss',
  host: { '(window:scroll)': 'onScroll()' },
})
export class SiteLayout {
  protected readonly store = inject(CarStore);
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly year = new Date().getFullYear();
  protected readonly email = signal('');
  protected readonly credit = CREDIT;

  protected readonly nav = [
    { label: 'Bosh sahifa', link: '/', exact: true },
    { label: 'Avtomobillar', link: '/cars', exact: false },
    { label: 'Biz haqimizda', link: '/about', exact: false },
    { label: 'FAQ', link: '/faq', exact: false },
  ];

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected subscribe(event: Event): void {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(this.email())) {
      this.store.notify('Iltimos, to‘g‘ri email kiriting');
      return;
    }
    this.email.set('');
    this.store.notify('Obuna bo‘ldingiz! Yangiliklarni birinchi bo‘lib olasiz.');
  }
}
