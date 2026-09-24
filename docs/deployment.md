# Deployment

The production setup uses a single Node.js 24 container behind Nginx Proxy Manager (NPM). The proxy owns ports 80 and 443; the application exposes port 4000 only on a shared Docker network.

## VPS setup

Place `docker-compose.yml` in `~/projects/adamulanowski.dev`. Copy the values from `.env.example` into `.env` there and set the verified Resend sender address.

The default external network is `proxy_default`. Check the existing proxy networks:

```sh
docker inspect proxy-app-1 --format '{{range $name, $network := .NetworkSettings.Networks}}{{println $name}}{{end}}'
```

If necessary, set `PROXY_NETWORK` in `.env` to a network already attached to the proxy.

Create a sending-only Resend key restricted to the verified sending domain. Store it as a Compose secret on the VPS. In Bash:

```bash
cd ~/projects/adamulanowski.dev
install -d -m 700 secrets
read -rsp 'Resend API key: ' RESEND_KEY
printf '\n'
printf '%s' "$RESEND_KEY" > secrets/resend_api_key
unset RESEND_KEY
chmod 600 secrets/resend_api_key
```

Compose mounts this file at `/run/secrets/resend_api_key`. Keep `.env` and `secrets/` out of Git.

Configure NPM to forward `adamulanowski.dev` and `www.adamulanowski.dev` over HTTP to `adamulanowski-web:4000`, preserving the original Host header. Both domains need valid certificates. The application redirects the www host to the canonical HTTPS domain.

## GitHub Actions

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and `feature/sformatuj-swoj-biznes-configurator`. Both branches deploy to the same production instance.

Required repository secrets:

| Secret         | Purpose                                                       |
| -------------- | ------------------------------------------------------------- |
| `GHCR_PAT`     | Authenticate image publishing and pulling as `ulanowskiadam`. |
| `VPS_HOST`     | Deployment server address.                                    |
| `VPS_USERNAME` | SSH user with access to Docker and the deployment directory.  |
| `VPS_SSH_KEY`  | SSH private key for that user.                                |

The workflow builds and publishes the image, copies the Compose file, and deploys the immutable image digest. The server's `.env` and secret file remain on the VPS.

The deployment expects the proxy container to be named `proxy-app-1` and requires Docker Compose v2 with support for `--wait`, `--wait-timeout`, and `config --format json`. It verifies the proxy network, waits for application health, checks upstream connectivity, and reloads Nginx after replacing the application container.

## Manual deployment

After copying the updated Compose file to the VPS and authenticating Docker with GHCR if required:

```sh
cd ~/projects/adamulanowski.dev
docker compose config --quiet
docker compose pull web
docker compose up -d --no-deps --wait --wait-timeout 120 web
docker exec proxy-app-1 nginx -t && docker exec proxy-app-1 nginx -s reload
docker compose ps
```

Compose uses `ghcr.io/ulanowskiadam/adamulanowski.dev:latest` by default. Set `WEB_IMAGE` to a specific image digest when deploying a pinned version.

The healthcheck requires HTTP 200 from the application. Verify public HTTPS and actual contact-email delivery separately.

Deployment replaces a single application instance, so a brief interruption is expected. On failure, the workflow attempts to restore the previous local image using the current Compose configuration. This does not restore earlier configuration or data, and a first deployment has no previous image to restore.
