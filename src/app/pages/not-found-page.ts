import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `<main id="main" class="container prose" tabindex="-1">
    <p class="eyebrow">Błąd 404</p>
    <h1>Nie ma takiej strony.</h1>
    <p>Adres może być nieaktualny. Wróć do oferty lub napisz, czego potrzebujesz.</p>
    <a class="button primary" routerLink="/">Przejdź na stronę główną</a>
  </main>`,
})
export class NotFoundPage {}
