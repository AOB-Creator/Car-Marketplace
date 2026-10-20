import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CarStore } from '../core/car-store.service';
import { ACTIVITY, CONVERSATIONS, ORDERS } from '../core/data/crm.data';
import { CREDIT } from '../core/brand';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout {
  protected readonly store = inject(CarStore);
  private readonly router = inject(Router);

  protected readonly now = signal(new Date());
  protected readonly time = computed(() =>
    this.now().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' }),
  );
  protected readonly navOpen = signal(false);
  protected readonly bellOpen = signal(false);
  protected readonly collapsed = signal(false);
  protected readonly activity = ACTIVITY;
  protected readonly credit = CREDIT;

  protected readonly unread = CONVERSATIONS.reduce((n, c) => n + c.unread, 0);
  protected readonly newOrders = ORDERS.filter((o) => o.status === 'Yangi').length;

  protected readonly main = computed(() => [
    { icon: 'home', label: 'Bosh sahifa', link: '/dashboard', exact: true },
    { icon: 'car', label: 'Avtomobillar', link: '/dashboard/vehicles', count: this.store.cars().length },
    { icon: 'cart', label: 'Buyurtmalar', link: '/dashboard/orders', count: this.newOrders },
    { icon: 'users', label: 'Mijozlar', link: '/dashboard/customers' },
    { icon: 'heart', label: 'Sevimlilar', link: '/dashboard/favourites', count: this.store.favorites().length },
    { icon: 'history', label: 'Analitika', link: '/dashboard/analytics' },
  ]);
  protected readonly secondary = [
    { icon: 'bell', label: 'Bildirishnomalar', link: '/dashboard/notifications', count: ACTIVITY.length },
    { icon: 'chat', label: 'Xabarlar', link: '/dashboard/messages', count: this.unread },
  ];

  constructor() {
    const id = setInterval(() => this.now.set(new Date()), 15_000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.navOpen.set(false);
        this.bellOpen.set(false);
      });
  }

  protected search(e: Event, value: string): void {
    e.preventDefault();
    this.router.navigate(['/dashboard/vehicles'], { queryParams: value.trim() ? { q: value.trim() } : {} });
  }

  protected logout(): void {
    this.store.notify('Tizimdan chiqdingiz');
    this.router.navigate(['/']);
  }
}
