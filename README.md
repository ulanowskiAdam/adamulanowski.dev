# adamulanowski.dev

Personal website and portfolio of **Adam Ułanowski**, presenting web development, business process automation, and AI integration services.

The site is written in Polish and combines service pages, selected client projects, an interactive 3D demo, and a contact form.

## Features

- Dedicated pages for business websites, web applications, process automation, and AI integrations.
- Project showcases for Lifting Paulina Karol, Fizjomind, and Kontent Architektura.
- A Three.js demo with industry scenes and selectable features that visitors can include as context in a contact enquiry.
- A contact endpoint backed by Resend, with shared validation, a honeypot, and request limits.
- Prerendered content pages, route metadata, a sitemap, canonical host redirects, and server-rendered HTTP 404 responses.

## Stack

Angular 22 · TypeScript 6 · Three.js · Tailwind CSS 4 · Express 5 · Vitest

Production runs on Node.js 24 in Docker, behind an existing reverse proxy. GitHub Actions builds the image, publishes it to GHCR, and deploys it to a VPS.

## Getting started

Use **Node.js 24** and **npm 11** (the project declares npm 11.19.0).

```sh
npm ci
npm start
```

Open `http://localhost:4200`. Email credentials are optional for browsing and UI development; sending a contact request requires the configuration below.

To build and run the production server locally:

```sh
npm run preview
```

Open `http://localhost:4000`. Use this production build when checking rendering or performance.

## Commands

| Command                               | Purpose                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm start`                           | Start the development server with live reload.                                       |
| `npm run build`                       | Build the production app and prerender content pages into `dist/adamulanowski.dev/`. |
| `npm run preview`                     | Build and start the production Express server.                                       |
| `npm run serve:ssr:adamulanowski.dev` | Start an existing production build.                                                  |
| `npm run watch`                       | Rebuild in development mode when files change.                                       |
| `npm test -- --watch=false`           | Run Angular unit and component tests once.                                           |
| `npm run test:api`                    | Run contact API and canonical host tests.                                            |

## Project structure

```text
src/app/
  components/        Shared UI, contact form, and interactive 3D scenes
  content/           Service and project data
  pages/             Home, services, projects, about, privacy, demo, and 404
  app.routes.ts      Browser routes
  app.routes.server.ts  Prerendering and server rendering rules
src/server/          Contact handler and canonical host middleware
src/shared/          Contact validation and source values
src/server.ts        Express server and Angular SSR integration
public/              Site images, favicon, robots.txt, and sitemap.xml
scripts/             Contact log reporting utility
tests/              API and redirect tests
.github/workflows/   Docker build and VPS deployment
```

Edit service and portfolio content in `src/app/content/`. Public image variants are used by the site for responsive rendering. When changing public routes, keep `public/sitemap.xml` in sync.

The main content routes are prerendered at build time. `/demo/konfigurator` remains available with `noindex`; unknown paths return HTTP 404. The application still needs the Node server for the contact API and request handling.

## Contact configuration

The server reads these environment variables:

| Variable              | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `RESEND_API_KEY_FILE` | Path to a file containing the Resend API key; preferred in Docker. |
| `RESEND_API_KEY`      | Fallback API key when no usable secret file is available.          |
| `RESEND_FROM_EMAIL`   | Sender address on a domain verified in Resend.                     |
| `CONTACT_EMAIL_TO`    | Recipient; defaults to `kontakt@adamulanowski.dev`.                |
| `PORT`                | Production server port; defaults to `4000`.                        |

For local email testing, create an ignored `.env` file with `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optionally `CONTACT_EMAIL_TO`, then run:

```sh
npm run build
node --env-file=.env dist/adamulanowski.dev/server/server.mjs
```

The npm scripts do not automatically load `.env`. Docker Compose reads it for deployment settings; `.env.example` contains those non-secret defaults.

`POST /api/contact` accepts the current form payload:

```json
{
  "version": 2,
  "name": "Jane",
  "email": "jane@example.com",
  "message": "I would like to discuss a website.",
  "website": "",
  "context": ""
}
```

Email and message are required. Name and demo context are optional; `website` is a honeypot and must remain empty. A `202` response acknowledges acceptance, not confirmed email delivery. Missing email configuration returns `503`.

Limits are held in memory per process: five attempts per IP in 15 minutes and 80 provider calls in 24 hours. The server trusts one reverse proxy; changing the proxy topology or running multiple instances requires reviewing this setup.

## Deployment

The [deployment guide](docs/deployment.md) describes the Docker network, email secret, reverse proxy, and GitHub Actions configuration.

Operational notes for search visibility and contact-source reporting are available in [docs/widocznosc-i-pomiar.md](docs/widocznosc-i-pomiar.md) (Polish). The reporting utility counts provider-accepted enquiries from existing server logs:

```sh
node scripts/contact-report.mjs contact-log.txt
```
