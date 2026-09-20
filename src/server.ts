import { createContactHandler } from './server/contact';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

app.set('trust proxy', 1);
app.use(express.json({ limit: '16kb' }));

const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['adamulanowski.dev', 'www.adamulanowski.dev', 'localhost', 'adamulanowski_dev'],
});

const readSecret = (name: string): string | undefined => {
  const file = process.env[`${name}_FILE`];
  if (file) {
    try {
      const value = readFileSync(file, 'utf8').trim();
      if (value) return value;
    } catch {
      console.error(`Could not read ${name} from its secret file.`);
    }
  }
  return process.env[name]?.trim() || undefined;
};

app.post(
  '/api/contact',
  createContactHandler({
    apiKey: () => readSecret('RESEND_API_KEY'),
    from: () => process.env['RESEND_FROM_EMAIL'],
    to: () => process.env['CONTACT_EMAIL_TO'] ?? 'aulanowski98@gmail.com',
  }),
);

app.use(((error, _req, res, next) => {
  if (error?.type === 'entity.parse.failed' || error?.type === 'entity.too.large') {
    res
      .status(error.type === 'entity.too.large' ? 413 : 400)
      .json({ code: 'validation_error', fields: {}, error: 'Invalid JSON payload' });
    return;
  }
  next(error);
}) as import('express').ErrorRequestHandler);
/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT']) || 4000;
  app.listen(port, '0.0.0.0', (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
