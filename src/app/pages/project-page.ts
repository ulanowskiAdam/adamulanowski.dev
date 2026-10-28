import { ScreenshotMockup } from '../components/screenshot-mockup';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-page',
  imports: [RouterLink, ScreenshotMockup],
  template: `<main id="main" class="container project-page" tabindex="-1">
    <p class="eyebrow">Realizacje / {{ project.category }}</p>
    <h1>{{ project.name }}</h1>
    <p class="lead">{{ project.teaser }}</p>
    <a class="button" [href]="project.url" target="_blank" rel="noopener noreferrer"
      >{{ project.slug.startsWith('loadlift') ? 'Zobacz sklep LOADLIFT ↗' : 'Odwiedź stronę ↗' }} <span class="sr-only">(nowa karta)</span></a
    >
    <app-screenshot-mockup class="project-mockup"
      [src]="project.image" [srcset]="project.imageSrcset"
      [width]="project.imageWidth" [height]="project.imageHeight"
      [alt]="'Zrzut realizacji ' + project.name" [fullSize]="true" [eager]="true"
      [workflow]="project.slug === 'loadlift-automatyzacje'"
      [label]="project.slug === 'loadlift-automatyzacje' ? 'n8n / Synchronizacja zamówień LOADLIFT' : project.url.replace('https://', '').replace('www.', '').replace('/', '')"
    />
    @if (project.imageCaption) {
      <p class="screen-caption">{{ project.imageCaption }}</p>
    }
    <div class="project-story">
      <section>
        <p class="eyebrow">01 / Potrzeba</p>
        <h2>Punkt wyjścia</h2>
        <p>{{ project.problem }}</p>
      </section>
      <section>
        <p class="eyebrow">02 / Rozwiązanie</p>
        <h2>Co powstało</h2>
        <p>{{ project.solution }}</p>
        <ul>
          @for (feature of project.features; track feature) {
            <li>{{ feature }}</li>
          }
        </ul>
      </section>
      <section>
        <p class="eyebrow">03 / Efekt</p>
        <h2>Co umożliwia rozwiązanie</h2>
        <p>{{ project.result }}</p>
      </section>
    </div>
    @if (project.comparison) {
      <section class="comparison" aria-labelledby="comparison-title">
        <p class="eyebrow">Od ręcznej obsługi do przepływu danych</p>
        <h2 id="comparison-title">Co przejmuje automatyzacja?</h2>
        <p>Porównanie z ręcznym wykonaniem tych samych zadań. Pokazuje zakres rozwiązania; nie jest pomiarem zaoszczędzonego czasu.</p>
        @for (row of project.comparison; track row.task) {
          <article class="comparison-row"><h3>{{ row.task }}</h3><div class="comparison-columns">
            <div><h4>Ręczna obsługa</h4><p>{{ row.before }}</p></div>
            <div><h4>Po wdrożeniu</h4><p>{{ row.after }}</p></div>
          </div></article>
        }
      </section>
    }
    @if (project.evidence) {
      <section class="scope"><h2>Zakres prac i potwierdzenie działania</h2>
        @for (item of project.evidence; track item.title) { <h3>{{ item.title }}</h3><p>{{ item.text }}</p> }
      </section>
    }
    @if (project.gallery) {
      <section class="project-evidence" aria-labelledby="evidence-title">
        <p class="eyebrow">Przebieg i weryfikacja</p>
        <h2 id="evidence-title">Automatyzacja w praktyce</h2>
        @for (screen of project.gallery; track screen.image) {
          <figure>
            <app-screenshot-mockup [src]="screen.image" [alt]="screen.alt" [width]="871" [height]="594" [fullSize]="true" [workflow]="true" [shipping]="true" label="n8n / Monitorowanie przesyłek LOADLIFT" [srcset]="screen.image.replace('.png', '-320.webp') + ' 320w, ' + screen.image.replace('.png', '-640.webp') + ' 640w, ' + screen.image + ' 871w'" />
            <figcaption>{{ screen.caption }}</figcaption>
          </figure>
        }
      </section>
    }
    @if (project.relatedSlug) {
      <p class="related-project"><a [routerLink]="['/realizacje', project.relatedSlug]">{{ project.relatedLabel }}</a></p>
    }
    <div class="project-contact">
      <h2>Podobna potrzeba w Twojej firmie?</h2>
      <p>{{ project.slug === 'loadlift-automatyzacje' ? 'Opisz zadanie, które wykonujesz ręcznie, używane narzędzia i oczekiwany wynik.' : 'Porozmawiajmy o stronie lub sklepie dopasowanym do Twojej oferty i klientów.' }}</p>
      <div class="actions">
        <a
          class="button primary"
          routerLink="/"
          fragment="contact"
          [queryParams]="{ context: 'Inspiracja: ' + project.name }"
          >Opowiedz o swoim projekcie</a
        ><a [routerLink]="'/' + (project.serviceSlug || 'strony-internetowe-dla-firm')">{{ project.serviceLabel || 'Poznaj usługę tworzenia stron →' }}</a>
      </div>
    </div>
    <a routerLink="/" fragment="realizacje">← Wszystkie realizacje</a>
  </main>`,
  styles: `
    .project-page {
      padding-block: 56px 80px;
    }
    .lead {
      max-width: 720px;
      font-size: 21px;
      color: var(--muted);
      margin-block: 24px;
    }
    .project-mockup { margin-block:40px 24px; }
    .screen-caption, figcaption { color: var(--muted); line-height: 1.7; max-width: 850px; }
    .screen-caption { margin-top: 16px; margin-bottom: 48px; }
    .project-evidence { margin-top: 64px; }
    figure { margin: 24px 0 0; }
    figure img { display: block; width: 100%; height: auto; border: 1px solid var(--border); border-radius: 10px; }
    figcaption { margin-top: 16px; }
    .comparison, .scope { margin-top: 64px; max-width: 100%; }
    .comparison > p, .scope p, .comparison-row p { color: var(--muted); line-height: 1.8; }
    .comparison-row { border-top: 1px solid var(--border); padding-block: 24px; }
    .comparison-row h3, .scope h3 { font-size: 22px; margin-block: 16px; }
    .comparison-columns { display: grid; gap: 24px; }
    .comparison-columns h4 { margin-block: 0 12px; }
    @media (min-width: 768px) { .comparison-columns { grid-template-columns: 1fr 1fr; } }
    .related-project { margin-top: 40px; }
    .project-story {
      display: grid;
      gap: 40px;
    }
    h2 {
      font-size: 30px;
      margin-bottom: 20px;
    }
    .project-story p:not(.eyebrow),
    li {
      color: var(--muted);
    }
    ul {
      padding-left: 20px;
      list-style: disc;
    }
    .project-contact {
      padding-block: 64px;
    }
    .project-contact p {
      margin-bottom: 24px;
      color: var(--muted);
    }
    @media (min-width: 900px) {
      .project-story {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `,
})
export class ProjectPage {
  private readonly route = inject(ActivatedRoute);
  get project() {
    return this.route.snapshot.data['project'];
  }
}
