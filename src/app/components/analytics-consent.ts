import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Analytics } from '../analytics';
@Component({
 selector: 'app-analytics-consent', imports: [RouterLink],
 template: `@if (analytics.visible()) {
  <section class="consent" role="region" aria-label="Ustawienia analityki">
   <h2>Pomóż mi ulepszać stronę</h2>
   <p>Za Twoją zgodą Google Analytics mierzy odwiedziny i użycie formularza. Treść wiadomości i adres e-mail nie trafiają do Analytics. Możesz odmówić i korzystać ze strony tak samo.</p>
   <div class="choices"><button type="button" (click)="analytics.choose(false)">Bez analityki</button><button type="button" (click)="analytics.choose(true)">Zgadzam się na analitykę</button></div>
   <a routerLink="/polityka-prywatnosci">Szczegóły prywatności</a>
  </section>
 }`,
 styles: `:host{position:relative;z-index:1000}.consent{position:fixed;bottom:16px;right:16px;width:min(520px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;padding:24px;background:var(--surface,#171c16);color:var(--text,#eee);border:1px solid var(--border,#555);border-radius:10px;box-shadow:0 8px 40px #0006}.consent h2{font-size:22px;margin:0 0 12px}.consent p{font-size:14px;line-height:1.7}.choices{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0}.choices button{flex:1;min-height:48px;padding:10px 14px;border:1px solid var(--accent);border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer}.choices button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}a{font-size:14px;text-decoration:underline}`
})
export class AnalyticsConsent { readonly analytics = inject(Analytics); }
