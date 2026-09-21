import { projects } from '../../content/projects';
import { ExperienceHero } from '../../components/experience-hero/experience-hero';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactForm } from '../../components/contact-form/contact-form';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ContactForm, ExperienceHero],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  readonly projects = projects;
  readonly services = [
    {
      path: '/strony-internetowe-dla-firm',
      title: 'Strony internetowe',
      need: 'Chcesz, żeby klient od razu rozumiał Twoją ofertę i wiedział, jak się odezwać.',
      solution:
        'Tworzę czytelne strony, które przedstawiają Twoją firmę i prowadzą do kontaktu — również na telefonie.',
      examples: 'Strona firmowa · landing page · prezentacja oferty',
      icon: '↗',
    },
    {
      path: '/aplikacje-webowe',
      title: 'Aplikacje webowe',
      need: 'Arkusze i gotowe narzędzia przestają wystarczać do codziennej pracy.',
      solution:
        'Buduję aplikacje w przeglądarce, dopasowane do sposobu działania Twojej firmy i potrzeb klientów.',
      examples: 'Panel klienta · rezerwacje · konfigurator wyceny',
      icon: '⊞',
    },
    {
      path: '/automatyzacja-procesow',
      title: 'Automatyzacje procesów',
      need: 'Kopiujesz dane, pilnujesz terminów i powtarzasz te same czynności.',
      solution:
        'Łączę narzędzia i automatyzuję przepływ informacji, żeby ograniczyć ręczną pracę i przeoczenia.',
      examples: 'Formularz → CRM · przypomnienia · raporty',
      icon: '⇄',
    },
    {
      path: '/integracje-ai',
      title: 'Integracje AI',
      need: 'Chcesz szybciej pracować z dokumentami i odpowiadać na powtarzające się pytania.',
      solution:
        'Łączę AI z Twoimi danymi i narzędziami. Ustalamy, co może działać automatycznie, a co wymaga Twojej kontroli.',
      examples: 'Asystent wiedzy · podsumowania · porządkowanie zapytań',
      icon: '✳',
    },
  ];
}
