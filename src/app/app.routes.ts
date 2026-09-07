import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page').then(({ HomePage }) => HomePage),
    title: 'Sformatuj Swój Biznes — Adam Ułanowski',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
