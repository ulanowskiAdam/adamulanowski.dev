import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-page',
  imports: [RouterLink],
  template: `<main id="main" class="container project-page" tabindex="-1">
    <p class="eyebrow">Realizacje / {{ project.category }}</p>
    <h1>{{ project.name }}</h1>
    <p class="lead">{{ project.teaser }}</p>
    <a class="button" [href]="project.url" target="_blank" rel="noopener noreferrer"
      >{{ project.slug.startsWith('loadlift') ? 'Zobacz sklep LOADLIFT ↗' : 'Odwiedź stronę ↗' }} <span class="sr-only">(nowa karta)</span></a
    >
    <img
      class="project-screen"
      [src]="project.image"
      [attr.srcset]="project.imageSrcset"
      sizes="(min-width: 1264px) 1184px, (min-width: 768px) calc(100vw - 80px), calc(100vw - 40px)"
      [alt]="'Zrzut realizacji ' + project.name"
      width="1440"
      height="1000"
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
    @if (project.gallery) {
      <section class="project-evidence" aria-labelledby="evidence-title">
        <p class="eyebrow">Przebieg i weryfikacja</p>
        <h2 id="evidence-title">Automatyzacja w praktyce</h2>
        @for (screen of project.gallery; track screen.image) {
          <figure>
            <a [href]="screen.image" target="_blank" rel="noopener noreferrer" aria-label="Otwórz zrzut w pełnym rozmiarze (nowa karta)">
              <img [src]="screen.image" [alt]="screen.alt" loading="lazy" width="1480" height="668" />
            </a>
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
      <p>Porozmawiajmy o stronie dopasowanej do Twojej oferty i klientów.</p>
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
    .project-screen {
      display: block;
      width: 100%;
      margin-block: 48px;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    .project-screen { height: auto; }
    .screen-caption, figcaption { color: var(--muted); line-height: 1.7; max-width: 850px; }
    .screen-caption { margin-top: -28px; margin-bottom: 48px; }
    .project-evidence { margin-top: 64px; }
    figure { margin: 24px 0 0; }
    figure img { display: block; width: 100%; height: auto; border: 1px solid var(--border); border-radius: 10px; }
    figcaption { margin-top: 16px; }
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
