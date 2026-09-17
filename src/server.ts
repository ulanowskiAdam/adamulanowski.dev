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

type ContactPayload = {
  name?: unknown;
  contact?: unknown;
  city?: unknown;
  message?: unknown;
  website?: unknown;
  industry?: unknown;
  solutions?: unknown;
};

const contactAttempts = new Map<string, number[]>();
const contactWindowMs = 15 * 60 * 1000;
const maxContactAttempts = 5;
const contactDailyWindowMs = 24 * 60 * 60 * 1000;
const maxContactEmailsPerDay = 80;
let contactEmailAttempts: number[] = [];
const cleanupContactAttempts = setInterval(() => {
  const cutoff = Date.now() - contactWindowMs;
  contactAttempts.forEach((attempts, ip) => {
    const recent = attempts.filter((time) => time >= cutoff);
    if (recent.length) contactAttempts.set(ip, recent);
    else contactAttempts.delete(ip);
  });
}, contactWindowMs);
cleanupContactAttempts.unref();

const cleanText = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/\r\n/g, '\n');
  return cleaned && cleaned.length <= maxLength ? cleaned : null;
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]!);

const readSecret = (name: string): string | undefined => {
  const file = process.env[`${name}_FILE`];
  if (file) {
    try {
      const value = readFileSync(file, 'utf8').trim();
      if (value) return value;
    } catch (error) {
      console.error(`Could not read ${name} from its secret file.`, error);
    }
  }
  return process.env[name]?.trim() || undefined;
};

app.post('/api/contact', async (req, res) => {
  const payload = (req.body ?? {}) as ContactPayload;

  // A filled hidden field is treated as a successful no-op to discourage bots.
  if (typeof payload.website === 'string' && payload.website.trim()) {
    res.status(200).json({ ok: true });
    return;
  }

  const now = Date.now();
  const ip = req.ip ?? 'unknown';
  const recentAttempts = (contactAttempts.get(ip) ?? []).filter((time) => now - time < contactWindowMs);
  if (recentAttempts.length >= maxContactAttempts) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }
  recentAttempts.push(now);
  contactAttempts.set(ip, recentAttempts);

  contactEmailAttempts = contactEmailAttempts.filter(
    (time) => now - time < contactDailyWindowMs,
  );
  if (contactEmailAttempts.length >= maxContactEmailsPerDay) {
    res.status(429).json({ error: 'Daily contact limit reached' });
    return;
  }

  const name = cleanText(payload.name, 100);
  const contact = cleanText(payload.contact, 200);
  const city = cleanText(payload.city, 100);
  const industry = cleanText(payload.industry, 120);
  const message = typeof payload.message === 'string' ? payload.message.trim().slice(0, 2000) : '';
  const solutions = Array.isArray(payload.solutions)
    ? payload.solutions.map((item) => cleanText(item, 160)).filter((item): item is string => Boolean(item)).slice(0, 12)
    : [];

  if (!name || !contact || !city || !industry || solutions.length === 0) {
    res.status(400).json({ error: 'Invalid form data' });
    return;
  }

  const safeName = name.replace(/\s+/g, ' ');
  const safeContact = contact.replace(/\s+/g, ' ');
  const safeCity = city.replace(/\s+/g, ' ');
  const safeIndustry = industry.replace(/\s+/g, ' ');

  const apiKey = readSecret('RESEND_API_KEY');
  const to = process.env['CONTACT_EMAIL_TO'] ?? 'aulanowski98@gmail.com';
  const from = process.env['RESEND_FROM_EMAIL'];
  if (!apiKey || !from) {
    console.error('Contact form is missing RESEND_API_KEY or RESEND_FROM_EMAIL.');
    res.status(503).json({ error: 'Email service unavailable' });
    return;
  }

  const lines = solutions.map((solution) => `<li>${escapeHtml(solution)}</li>`).join('');
  const optionalMessage = message
    ? `<h2 style="font-size:16px">Dodatkowa wiadomość</h2><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`
    : '';
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeContact) ? safeContact : undefined;

  // Reserve quota before the asynchronous provider call so concurrent requests
  // cannot exceed the free-tier safety limit.
  contactEmailAttempts.push(Date.now());
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Nowe zapytanie: ${safeIndustry}`,
        ...(replyTo ? { reply_to: replyTo } : {}),
        html: `<h1 style="font-size:20px">Nowe zapytanie ze strony</h1><p><strong>Imię:</strong> ${escapeHtml(safeName)}</p><p><strong>Kontakt:</strong> ${escapeHtml(safeContact)}</p><p><strong>Miasto:</strong> ${escapeHtml(safeCity)}</p><p><strong>Branża:</strong> ${escapeHtml(safeIndustry)}</p><h2 style="font-size:16px">Wybrane rozwiązania</h2><ul>${lines}</ul>${optionalMessage}`,
        text: `Nowe zapytanie ze strony\n\nImię: ${safeName}\nKontakt: ${safeContact}\nMiasto: ${safeCity}\nBranża: ${safeIndustry}\n\nWybrane rozwiązania:\n- ${solutions.join('\n- ')}${message ? `\n\nDodatkowa wiadomość:\n${message}` : ''}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error(`Resend rejected contact email with status ${response.status}.`);
      res.status(502).json({ error: 'Email provider rejected request' });
      return;
    }

    res.status(202).json({ ok: true });
  } catch (error) {
    console.error('Contact email request failed.', error);
    res.status(502).json({ error: 'Email provider unavailable' });
  }
});

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
