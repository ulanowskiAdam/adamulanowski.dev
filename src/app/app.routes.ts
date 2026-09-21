import { services } from './content/services';
import { projects } from './content/projects';
import { Routes } from '@angular/router';
export const routes: Routes = [
  ...services.map((service) => ({
    path: service.slug,
    loadComponent: () => import('./pages/service-page').then((m) => m.ServicePage),
    title: service.title + ' — Adam Ułanowski',
    data: { description: service.description, service },
  })),
  ...projects.map((project) => ({
    path: 'realizacje/' + project.slug,
    loadComponent: () => import('./pages/project-page').then((m) => m.ProjectPage),
    title: project.name + ' — realizacja strony | Adam Ułanowski',
    data: { description: project.teaser, project },
  })),
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
    loadComponent: () => import('./pages/configurator-page').then((m) => m.ConfiguratorPage),
    title: 'Interaktywne demo — Adam Ułanowski',
    data: {
      noindex: true,
      description:
        'Pobaw się interaktywnym demo 3D: zmieniaj branże i dodawaj funkcje. Zobacz możliwości i porozmawiajmy o Twoim pomyśle.',
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
