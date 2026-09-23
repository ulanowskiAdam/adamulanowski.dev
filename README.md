# AdamulanowskiDev

Instrukcja widoczności, Search Console i pomiaru zapytań: [docs/widocznosc-i-pomiar.md](docs/widocznosc-i-pomiar.md).

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.

## VPS deployment behind the reverse proxy

The reverse proxy owns host ports 80 and 443. The website listens on port 4000
inside Docker and publishes no host port. Both containers must share a Docker
network. Check the existing proxy's networks on the VPS:

```bash
docker inspect proxy-app-1 --format '{{range $name, $network := .NetworkSettings.Networks}}{{println $name}}{{end}}'
```

Compose defaults to the existing `proxy_default` network. If the proxy uses a
different network, set `PROXY_NETWORK=actual_network_name` in
`~/projects/adamulanowski.dev/.env` on the VPS. Use a network attached to the proxy;
creating an unrelated network will not connect the two containers.

The contact form sends email through Resend. Verify `adamulanowski.dev` (preferably
a sending subdomain such as `mail.adamulanowski.dev`) in Resend and create a
sending-only API key restricted to that domain. Store the key as a Docker Compose
secret on the VPS; entering it with `read` keeps it out of shell history:

```bash
install -d -m 700 ~/projects/adamulanowski.dev/secrets
read -rsp 'Resend API key: ' RESEND_KEY
printf '\n'
printf '%s' "$RESEND_KEY" > ~/projects/adamulanowski.dev/secrets/resend_api_key
unset RESEND_KEY
chmod 600 ~/projects/adamulanowski.dev/secrets/resend_api_key
```

Keep only non-secret settings in `~/projects/adamulanowski.dev/.env`:

```dotenv
RESEND_FROM_EMAIL=Adam Ułanowski <kontakt@mail.adamulanowski.dev>
CONTACT_EMAIL_TO=aulanowski98@gmail.com
```

`RESEND_FROM_EMAIL` must use the exact domain verified in Resend. The API key is
mounted read-only at `/run/secrets/resend_api_key`, is not exposed through the
container environment, and is never included in the browser bundle or image.
The server also stops calling the provider after 80 send attempts in 24 hours,
leaving headroom below Resend's free daily limit.

Configure the proxy host for `adamulanowski.dev` to forward using HTTP to
`adamulanowski-web`, port `4000`. Do not use `localhost`: inside the proxy container
that address refers to the proxy itself.

GitHub Actions copies `docker-compose.yml` to the VPS before each deployment and
recreates the website container as needed, using the immutable digest produced by
that build. The server's `.env` is preserved. The workflow requires Docker Compose
v2 with `--wait`, `--wait-timeout`, and `config --format json` support.
For a manual deployment, copy the updated Compose file to the VPS, then run:

```bash
cd ~/projects/adamulanowski.dev
docker compose config --quiet
docker compose pull
docker compose up -d --no-deps --wait --wait-timeout 120 web
docker exec proxy-app-1 nginx -t && docker exec proxy-app-1 nginx -s reload
docker compose ps
```

The healthcheck uses Node (already present in the image) to require HTTP 200 from
the application. The explicit Host header matches the SSR host allowlist. No host
port mapping is needed: NPM must use HTTP to `adamulanowski-web:4000`.

Before replacing the container, the workflow checks that NPM is running and
attached to the configured external network. After startup it tests the upstream
from NPM's network namespace, then gracefully reloads Nginx to refresh upstream
resolution after a possible container IP change. This checks upstream connectivity;
verify public HTTPS separately to check the NPM proxy-host and certificate setup.

On a deployment failure, the workflow prints diagnostics and attempts to restore
the previous local image using the current Compose configuration. This is an image
rollback, not a rollback of configuration or data. A first deployment has no image
to restore. Images are retained for recovery. `WEB_IMAGE` can also be set to a
specific digest for a manual deployment; otherwise Compose defaults to `latest`.

This is a single-instance deployment with a brief interruption, not zero downtime.
Compose replaces the container and reconnects its successor to `proxy_default`
(or the configured external network); it does not preserve existing connections.
True zero downtime requires two application instances (blue-green), readiness
verification before switching NPM, and draining the old instance before stopping it.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Refaktoryzacja oferty i kontaktu

- Strona główna, cztery strony usług, trzy realizacje oraz strony o mnie, prywatności
  i zgodnościowy adres /demo/konfigurator są prerenderowane (łącznie 11 tras).
- Konfigurator to otwarte demo do zabawy: wybór sceny i dodatków bez ankiety lub kroków.
  Kontakt jest zawsze dostępny, także bez interakcji z demo. Wybrane inspiracje można
  przekazać do formularza bez utraty wpisanej wiadomości.
- Scena 3D jest widoczna od razu w pierwszym ekranie, bez przycisku uruchamiania.
  Three.js ładuje się automatycznie po renderowaniu strony; scenę aktualizuje wybór branży.
  Portret 3D pozostał wyłącznie jako niewykorzystywany kod eksperymentalny, poza publiczną ścieżką.
- /demo/konfigurator pozostaje dla starych linków z noindex. Sitemap zawiera ofertę,
  realizacje i stronę o mnie; pomija demo i prywatność.
- Stare kotwice działają: #about, #capabilities, #contact, #configurator.
  Nowa sekcja realizacji ma kotwicę #realizacje.
- Treść usług i realizacji znajduje się w src/app/content. Autor potwierdził trzy realizacje:
  Lifting Paulina Karol, Fizjomind i Kontent Architektura. Opisy dotyczą widocznych funkcji,
  bez deklaracji wzrostu sprzedaży lub wyników bez pomiarów. Zrzuty wykonano 21.09.2026.
- Grafika udostępniania: public/images/offer-social.png (1200×630), edytowalne źródło SVG obok.
  Dane strukturalne zawierają dane kontaktowe, logo i adresy usług; nie dodano adresu siedziby.
- Nieznane ścieżki zwracają stronę 404 i status HTTP 404 przez serwer Angular/Express.
  Hosting musi przekazywać te żądania do serwera, bez własnego przekierowania na home.

### Kontakt v2

POST /api/contact, JSON:

```json
{
  "version": 2,
  "name": "",
  "email": "client@example.com",
  "message": "Potrzebuję strony.",
  "website": "",
  "context": ""
}
```

Imię (do 100 znaków) i kontekst (do 500 znaków) są opcjonalne.
Wymagane: poprawny e-mail (do 254 znaków) i wiadomość (1–2000 znaków, nie same spacje).
Pole website jest honeypotem. Nie umieszczaj danych osobowych w kontekście konfiguratora,
ponieważ jest przekazywany w URL. Formularz pozwala usunąć kontekst.

Odpowiedzi: 202 {ok:true,status:"accepted"}; 400 {code:"validation_error",fields:{...}};
429 {code:"rate_limited"} z Retry-After; 503 {code:"not_configured"};
502 {code:"provider_error"}. Przyjęcie nie potwierdza doręczenia.
Nieprawidłowy JSON daje 400, przekroczenie 16 KB daje 413.
Kontrakt bez version lub z version:1 nadal obsługuje dawny formularz (także kontakt telefoniczny).
Limity: 5 prób / 15 minut / IP oraz 80 wywołań dostawcy / 24 h na proces;
przy wielu instancjach potrzebny jest wspólny magazyn limitów.
Zachowano konfigurację trust proxy=1 — infrastruktura powinna mieć jeden zaufany reverse proxy.

### Sprawdzenie lokalne

```sh
npm run build -- --stats-json
npm test -- --watch=false
npm run test:api
npm run serve:ssr:adamulanowski.dev
```

Test przeglądarkowy: `node tests/browser-check.mjs` przy uruchomionym serwerze na localhost:4000.
Wymaga Playwright i Edge. Można wskazać moduł przez PLAYWRIGHT_MODULE,
inny adres serwera przez TEST_ORIGIN. Test używa atrapy odpowiedzi na wysyłanie wiadomości
i nie wysyła prawdziwej poczty. Zrzuty i raport trafiają do ignorowanego artifacts/ux-check.

Przed publikacją właściciel powinien potwierdzić opis prywatności względem faktycznych
dostawców hostingu/poczty, transferów poza EOG i stosowanych okresów przechowywania.
Repozytorium nie zawiera umów ani konfiguracji retencji tych dostawców.
Konfigurację Resend i rzeczywiste doręczenie należy sprawdzić na środowisku wdrożenia.
