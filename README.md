# AdamulanowskiDev

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
