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
recreates the website container as needed. The server's `.env` is preserved.
For a manual deployment, copy the updated Compose file to the VPS, then run:

```bash
cd ~/projects/adamulanowski.dev
docker compose config --quiet
docker compose pull
docker compose up -d --remove-orphans --wait --wait-timeout 60
docker compose ps
```

The wait checks that the container is running; it does not verify an HTTP response.
Verify the public website after configuring the proxy.

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
