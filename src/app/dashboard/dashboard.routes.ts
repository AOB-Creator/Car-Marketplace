import { Routes } from '@angular/router';
import { DashboardLayout } from './dashboard-layout';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      { path: '', title: 'Dashboard — CARZONE', loadComponent: () => import('./pages/overview').then((m) => m.Overview) },
      { path: 'vehicles', title: 'Avtomobillar — Dashboard', loadComponent: () => import('./pages/vehicles').then((m) => m.Vehicles) },
      { path: 'orders', title: 'Buyurtmalar — Dashboard', loadComponent: () => import('./pages/orders').then((m) => m.Orders) },
      { path: 'customers', title: 'Mijozlar — Dashboard', loadComponent: () => import('./pages/customers').then((m) => m.Customers) },
      { path: 'messages', title: 'Xabarlar — Dashboard', loadComponent: () => import('./pages/messages').then((m) => m.Messages) },
      { path: 'favourites', title: 'Sevimlilar — Dashboard', loadComponent: () => import('./pages/misc').then((m) => m.Favourites) },
      { path: 'analytics', title: 'Analitika — Dashboard', loadComponent: () => import('./pages/misc').then((m) => m.Analytics) },
      { path: 'notifications', title: 'Bildirishnomalar — Dashboard', loadComponent: () => import('./pages/misc').then((m) => m.Notifications) },
      { path: 'settings', title: 'Sozlamalar — Dashboard', loadComponent: () => import('./pages/misc').then((m) => m.Settings) },
    ],
  },
];
