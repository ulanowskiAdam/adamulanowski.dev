import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
    title: 'Strony, aplikacje i automatyzacje — Adam Ułanowski',
    data: {
      description:
        'Strony internetowe, aplikacje webowe, automatyzacje procesów i integracje AI dla Twojej firmy. Opowiedz, czego potrzebujesz — pomogę dobrać rozwiązanie.',
    },
  },
  {
    path: 'o-mnie',
    loadComponent: () => import('./pages/about-page').then((m) => m.AboutPage),
    title: 'O mnie — Adam Ułanowski',
    data: {
      description:
        'Poznaj Adama Ułanowskiego. Tworzę strony, aplikacje i integracje, zaczynając od potrzeb Twojej firmy.',
    },
  },
  {
    path: 'polityka-prywatnosci',
    loadComponent: () => import('./pages/privacy-page').then((m) => m.PrivacyPage),
    title: 'Polityka prywatności — Adam Ułanowski',
    data: {
      description:
        'Informacje o danych przekazywanych przez formularz kontaktowy na adamulanowski.dev.',
    },
  },
  {
    path: 'demo/konfigurator',
    loadComponent: () =>
      import('./components/experience-hero/experience-hero').then((m) => m.ExperienceHero),
    title: 'Demo konfiguratora — Adam Ułanowski',
    data: {
      description:
        'Wypróbuj konfigurator rozwiązań dla firm. Dwa kroki, bez danych kontaktowych, z opcjonalnym podglądem 3D.',
    },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
    title: 'Nie znaleziono strony — Adam Ułanowski',
    data: {
      noindex: true,
      description: 'Nie znaleziono strony. Przejdź do oferty Adama Ułanowskiego.',
    },
  },
];
