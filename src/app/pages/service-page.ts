import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-page',
  imports: [RouterLink],
  template: `<main id="main" class="container prose" tabindex="-1">
    <p class="eyebrow">Usługi / Adam Ułanowski</p>
    <h1>{{ service.title }}</h1>
    <p class="service-lead">{{ service.lead }}</p>
    <a
      class="button primary"
      routerLink="/"
      fragment="contact"
      [queryParams]="{ context: service.title }"
      >Opowiedz, co chcesz usprawnić ↗</a
    >
    <h2>Jaki problem rozwiązujemy?</h2>
    <p>{{ service.problem }}</p>
    <h2>Dla kogo?</h2>
    <p>{{ service.audience }}</p>
    <h2>Co możemy zbudować?</h2>
    <ul>
      @for (example of service.examples; track example) {
        <li>{{ example }}</li>
      }
    </ul>
    <h2>Jak wygląda współpraca?</h2>
    <ol>
      @for (step of service.process; track step) {
        <li>{{ step }}</li>
      }
    </ol>
    <h2>Zobacz w praktyce</h2>
    <p>{{ service.related }}</p>
    <p><a [routerLink]="['/realizacje', service.project]">Poznaj realizację →</a></p>
    <p><a routerLink="/" fragment="configurator">Pobaw się interaktywnym demo →</a></p>
    <h2>Częste pytania</h2>
    @for (item of service.faq; track item.q) {
      <details>
        <summary>{{ item.q }}</summary>
        <p>{{ item.a }}</p>
      </details>
    }
    <div class="service-cta">
      <h2>Zacznijmy od Twojej potrzeby.</h2>
      <p>
        Opisz obecny sposób pracy i to, co chcesz zmienić. Na tej podstawie ustalimy sensowny
        pierwszy krok.
      </p>
      <a
        class="button primary"
        routerLink="/"
        fragment="contact"
        [queryParams]="{ context: service.title }"
        >Porozmawiajmy o rozwiązaniu</a
      >
    </div>
    <a routerLink="/" fragment="uslugi">← Wszystkie usługi</a>
  </main>`,
  styles: `
    .service-lead {
      font-size: 24px;
    }
    .prose .button.primary {
      color: var(--accent-text);
    }
    li {
      margin-bottom: 12px;
      color: var(--muted);
    }
    ol,
    ul {
      padding-left: 24px;
    }
    ol {
      list-style: decimal;
    }
    ul {
      list-style: disc;
    }
    details {
      border-bottom: 1px solid var(--border);
      padding-block: 18px;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
    }
    details p {
      margin-top: 16px;
    }
    .service-cta {
      padding-block: 16px 40px;
    }
  `,
})
export class ServicePage {
  private readonly route = inject(ActivatedRoute);
  get service() {
    return this.route.snapshot.data['service'];
  }
}
