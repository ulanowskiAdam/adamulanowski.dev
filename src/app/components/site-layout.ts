import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  template: `<a class="skip-link" href="#main">Przejdź do treści</a>
    <header class="container">
      <a class="brand" routerLink="/" aria-label="Adam Ułanowski — strona główna"
        >A<span>.</span></a
      >
      <nav aria-label="Główna nawigacja">
        <a routerLink="/" fragment="uslugi">Usługi</a><a routerLink="/o-mnie">O mnie</a
        ><a class="contact-link" routerLink="/" fragment="contact"
          >Porozmawiajmy <span aria-hidden="true">↗</span></a
        >
      </nav>
    </header>`,
  styles: `
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 88px;
      border-bottom: 1px solid var(--border);
    }
    .brand {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -4px;
      text-decoration: none;
      line-height: 1;
    }
    .brand span {
      color: var(--accent);
    }
    nav {
      display: flex;
      gap: 28px;
      align-items: center;
    }
    nav a {
      padding: 10px 0;
      text-decoration: none;
    }
    .contact-link {
      color: var(--accent);
    }
    @media (max-width: 480px) {
      header {
        min-height: 76px;
      }
      nav {
        gap: 16px;
      }
      nav a {
        font-size: 16px;
      }
      .contact-link span {
        display: none;
      }
    }
  `,
})
export class SiteHeader {}

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `<footer class="container">
    <span>© {{ year }} Adam Ułanowski</span>
    <nav aria-label="Linki w stopce">
      <a routerLink="/polityka-prywatnosci">Polityka prywatności</a
      ><a href="https://github.com/ulanowskiAdam">GitHub ↗</a
      ><a routerLink="/demo/konfigurator">Demo</a>
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
    a {
      padding-block: 10px;
    }
  `,
})
export class SiteFooter {
  readonly year = new Date().getFullYear();
}
