import { Routes } from '@angular/router';
import { SiteLayout } from './layouts/site-layout';

export const routes: Routes = [
  {
    path: '',
    component: SiteLayout,
    children: [
      { path: '', title: 'CARZONE — Premium avtomobillar', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
      { path: 'cars', title: 'Avtomobillar — CARZONE', loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog) },
      { path: 'cars/:id', title: 'Avtomobil — CARZONE', loadComponent: () => import('./pages/car-detail/car-detail').then((m) => m.CarDetail) },
      { path: 'about', title: 'Biz haqimizda — CARZONE', loadComponent: () => import('./pages/info/about').then((m) => m.About) },
      { path: 'faq', title: 'FAQ — CARZONE', loadComponent: () => import('./pages/info/faq').then((m) => m.Faq) },
    ],
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
