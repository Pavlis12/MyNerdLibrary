import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'item-detail',
    loadComponent: () => import('./pages/item-detail/item-detail.page').then((m) => m.ItemDetailPage),
  },
];
