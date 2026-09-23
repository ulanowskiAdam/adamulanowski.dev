import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IndustryId } from '../components/experience-hero/configurator.store';
import { ExperienceHero } from '../components/experience-hero/experience-hero';
@Component({
  selector: 'app-configurator-page',
  imports: [ExperienceHero, RouterLink],
  template: `<main id="main" class="container configurator-page" tabindex="-1">
    <header>
      <a routerLink="/">← Strona główna</a>
      <h1>Co ułatwi pracę Twojej firmie?</h1>
      <p>Wybierz funkcje dla swojej firmy i porozmawiajmy o ich wdrożeniu.</p>
    </header>
    <app-experience-hero [initialIndustry]="industry()" />
  </main>`,
  styles: [
    `
      .configurator-page {
        max-width: 1120px;
        padding-block: 24px 64px;
      }
      header {
        margin-bottom: 36px;
      }
      header a {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        color: var(--muted);
      }
      h1 {
        font-size: clamp(1.7rem, 3vw, 2.5rem);
        margin-block: 14px 12px;
      }
      header p {
        color: var(--muted);
      }
      @media (max-width: 800px) {
        .configurator-page { padding-top: 8px; }
        header { margin-bottom: 16px; }
        h1 { font-size: 1.5rem; margin-block: 8px; }
        header p { font-size: 13px; }
      }
    `,
  ],
})
export class ConfiguratorPage {
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap);
  readonly industry = computed<IndustryId>(() => {
    const value = this.params()?.get('branza');
    return value === 'wizyty' || value === 'fachowcy' ? value : 'gastronomia';
  });
}
