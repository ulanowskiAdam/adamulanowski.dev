import { Component } from '@angular/core';
import { ExperienceHero } from '../components/experience-hero/experience-hero';
@Component({
  selector: 'app-configurator-page',
  imports: [ExperienceHero],
  template: `<main id="main" class="container section" tabindex="-1">
    <p class="eyebrow">Interaktywne demo</p>
    <h1>Pobaw się możliwościami.</h1>
    <p style="margin-block:24px">
      Zmieniaj branże i dodawaj funkcje. Masz własny pomysł? Napisz do mnie w dowolnym momencie.
    </p>
    <app-experience-hero />
  </main>`,
})
export class ConfiguratorPage {}
