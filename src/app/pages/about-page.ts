import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink],
  template: `<main id="main" class="container prose" tabindex="-1">
    <p class="eyebrow">O mnie</p>
    <h1>Cześć, jestem Adam Ułanowski.</h1>
    <img
      src="/images/adam-ulanowski-dark.webp"
      alt="Adam Ułanowski"
      width="240"
      height="300"
      style="float:left;margin:0 28px 24px 0;border-radius:8px"
    />
    <p>
      Łączę to, co widzisz na ekranie, z tym, co dzieje się pod spodem. Tworzę strony internetowe i
      aplikacje webowe — od interfejsu, przez logikę działania, po połączenia z innymi systemami.
    </p>
    <p>
      Pracuję zarówno przy frontendzie, jak i backendzie, więc patrzę na produkt jako całość. Lubię
      projekty, które ułatwiają codzienną pracę: harmonogramy, rezerwacje, kreatory i konfiguratory.
    </p>
    <h2 style="clear:both">Najpierw potrzeba, potem technologia.</h2>
    <p>
      Zaczynam od rozmowy o tym, jak działa Twoja firma. Dopiero potem dobieram technologie i
      układam rozwiązanie. Korzystam też z n8n i narzędzi AI, żeby łączyć procesy i ograniczać
      powtarzalne zadania.
    </p>
    <h2>Mój warsztat</h2>
    <ul>
      <li>Frontend: Angular, Vue, Nuxt.</li>
      <li>Backend: Node.js, Express, Java.</li>
      <li>Integracje: n8n, API i narzędzia AI.</li>
    </ul>
    <p><a href="https://github.com/ulanowskiAdam">Zobacz kod na GitHub ↗</a></p>
    <a class="button primary" routerLink="/" fragment="contact">Porozmawiajmy o projekcie</a>
  </main>`,
})
export class AboutPage {}
