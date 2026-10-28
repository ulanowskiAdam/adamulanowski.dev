import { Analytics } from '../analytics';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
export { SiteHeader } from './site-header';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `<footer class="container">
    <span>© {{ year }} Adam Ułanowski</span>
    <nav aria-label="Linki w stopce">
      <a routerLink="/polityka-prywatnosci">Polityka prywatności</a
      ><a href="https://github.com/ulanowskiAdam">GitHub ↗</a
      ><a routerLink="/" fragment="configurator">Interaktywne demo</a><button type="button" (click)="analytics.visible.set(true)">Ustawienia analityki</button>
    </nav>
  </footer>`,
  styles: `
    footer {
      border-top: 1px solid var(--border);
      padding-block: 28px;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
      color: var(--muted);
      font-size: 14px;
    }
    nav {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    button { color:inherit; background:none; border:0; font:inherit; padding-block:10px; cursor:pointer; }
    a {
      padding-block: 10px;
    }
  `,
})
export class SiteFooter {
  readonly analytics = inject(Analytics);
  readonly year = new Date().getFullYear();
}
