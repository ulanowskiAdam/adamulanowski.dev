import { services } from './content/services';
import { projects } from './content/projects';
import { Routes } from '@angular/router';
export const routes: Routes = [
  ...services.map((service) => ({
    path: service.slug,
    loadComponent: () => import('./pages/service-page').then((m) => m.ServicePage),
    title: service.title + ' - Adam Ułanowski',
    data: { description: service.description, service },
  })),
  ...projects.map((project) => ({
    path: 'realizacje/' + project.slug,
    loadComponent: () => import('./pages/project-page').then((m) => m.ProjectPage),
    title: project.name + ' - realizacja | Adam Ułanowski',
    data: { description: project.teaser, project },
  })),
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
    title: 'Strony internetowe i automatyzacje Szczecin | Adam Ułanowski',
    data: {
      description:
        'Strony internetowe, sklepy i automatyzacje dla firm ze Szczecina i okolic. Zobacz realizacje i porozmawiaj o stronie, aplikacji lub integracji narzędzi.',
    },
  },
  {
    path: 'o-mnie',
    loadComponent: () => import('./pages/about-page').then((m) => m.AboutPage),
    title: 'O mnie - Adam Ułanowski',
    data: {
      description:
        'Poznaj Adama Ułanowskiego. Tworzę strony, aplikacje i integracje, zaczynając od potrzeb Twojej firmy.',
    },
  },
  {
    path: 'regulamin',
    loadComponent: () => import('./pages/terms-page').then((m) => m.TermsPage),
    title: 'Regulamin korzystania ze strony - Adam Ułanowski',
    data: { description: 'Zasady korzystania z formularza kontaktowego i demonstracji na adamulanowski.dev.' },
  },
  {
    path: 'polityka-prywatnosci',
    loadComponent: () => import('./pages/privacy-page').then((m) => m.PrivacyPage),
    title: 'Polityka prywatności - Adam Ułanowski',
    data: {
      description:
        'Informacje o danych przekazywanych przez formularz kontaktowy na adamulanowski.dev.',
    },
  },
  {
    path: 'demo/konfigurator',
    loadComponent: () => import('./pages/configurator-page').then((m) => m.ConfiguratorPage),
    title: 'Interaktywne demo - Adam Ułanowski',
    data: {
      noindex: true,
      description:
        'Pobaw się interaktywnym demo 3D: zmieniaj branże i dodawaj funkcje. Zobacz możliwości i porozmawiajmy o Twoim pomyśle.',
    },
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
    title: 'Nie znaleziono strony - Adam Ułanowski',
    data: {
      noindex: true,
      description: 'Nie znaleziono strony. Przejdź do oferty Adama Ułanowskiego.',
    },
  },
];
