import type { RequestHandler } from 'express';
import { validEmail, validateContact } from '../shared/contact-validation';
import { contactSource } from '../shared/contact-sources';

type Dependencies = {
  apiKey: () => string | undefined;
  from: () => string | undefined;
  to: () => string;
  send?: typeof fetch;
  now?: () => number;
  onAccepted?: (source: string) => void;
};
const text = (value: unknown, max: number) =>
  typeof value === 'string' && value.length <= max ? value.trim() : '';
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]!,
  );

/** Isolated state per handler; production creates one handler per process. */
export function createContactHandler(deps: Dependencies): RequestHandler {
  const attempts = new Map<string, number[]>();
  let daily: number[] = [];
  const now = deps.now ?? Date.now;
  return async (req, res) => {
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      res.status(400).json({ code: 'validation_error', fields: {}, error: 'Invalid payload' });
      return;
    }
    if (typeof payload.website === 'string' && payload.website.trim()) {
      res.status(202).json({ ok: true, status: 'accepted' });
      return;
    }
    const time = now();
    const windowMs = 15 * 60 * 1000;
    // Cleanup on requests: no timer or unbounded accumulation of expired IPs.
    for (const [ip, times] of attempts) {
      const recent = times.filter((t) => time - t < windowMs);
      if (recent.length) attempts.set(ip, recent);
      else attempts.delete(ip);
    }
    const ip = req.ip ?? 'unknown';
    const recent = attempts.get(ip) ?? [];
    daily = daily.filter((t) => time - t < 24 * 60 * 60 * 1000);
    if (recent.length >= 5 || daily.length >= 80) {
      const retry =
        recent.length >= 5
          ? Math.ceil((recent[0] + windowMs - time) / 1000)
          : Math.ceil((daily[0] + 86400000 - time) / 1000);
      res.setHeader('Retry-After', String(Math.max(1, retry)));
      res.status(429).json({ code: 'rate_limited' });
      return;
    }
    recent.push(time);
    attempts.set(ip, recent);
    let name = '',
      email = '',
      message = '',
      context = '';
    if (payload.version === 2) {
      const fields = {
        name: typeof payload.name === 'string' ? payload.name : '',
        email: typeof payload.email === 'string' ? payload.email : '',
        message: typeof payload.message === 'string' ? payload.message : '',
      };
      const errors = validateContact(fields);
      if (payload.name != null && typeof payload.name !== 'string')
        errors.name = 'Podaj imię jako tekst lub pozostaw pole puste.';
      if (Object.keys(errors).length) {
        res.status(400).json({ code: 'validation_error', fields: errors });
        return;
      }
      ({ name, email, message } = fields);
      context = text(payload.context, 500);
    } else if (payload.version == null || payload.version === 1) {
      // Temporary adapter for cached copies of the previous configurator.
      name = text(payload.name, 100);
      email = text(payload.contact, 200);
      const city = text(payload.city, 100),
        industry = text(payload.industry, 120);
      const solutions: string[] = Array.isArray(payload.solutions)
        ? payload.solutions
            .map((item: unknown) => text(item, 160))
            .filter(Boolean)
            .slice(0, 12)
        : [];
      const errors: Record<string, string> = {};
      if (!name) errors['name'] = 'Podaj imię.';
      if (!email) errors['contact'] = 'Podaj kontakt.';
      if (!city) errors['city'] = 'Podaj miasto.';
      if (!industry) errors['industry'] = 'Wybierz branżę.';
      if (!solutions.length) errors['solutions'] = 'Wybierz rozwiązanie.';
      if (
        payload.message != null &&
        (typeof payload.message !== 'string' || payload.message.length > 2000)
      )
        errors['message'] = 'Wiadomość może mieć maksymalnie 2000 znaków.';
      if (Object.keys(errors).length) {
        res.status(400).json({ code: 'validation_error', fields: errors });
        return;
      }
      message = text(payload.message, 2000);
      context = `Miasto: ${city}\nBranża: ${industry}\nRozwiązania: ${solutions.join(', ')}`;
    } else {
      res.status(400).json({ code: 'validation_error', fields: {}, error: 'Unsupported version' });
      return;
    }
    const apiKey = deps.apiKey(),
      from = deps.from();
    if (!apiKey || !from) {
      res.status(503).json({ code: 'not_configured' });
      return;
    }
    const source = contactSource(payload.source);
    const body = `Nowe zapytanie ze strony\n\nImię: ${name.trim() || 'Nie podano'}\nKontakt: ${email.trim()}\nŹródło kontaktu: ${source?.label ?? 'Nie podano'}\n\n${message.trim()}${context ? '\n\nKontekst: ' + context : ''}`;
    // Reserve quota before awaiting the provider to cover concurrent requests.
    daily.push(time);
    try {
      const response = await (deps.send ?? fetch)('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [deps.to()],
          subject: 'Nowe zapytanie — adamulanowski.dev',
          ...(validEmail(email.trim()) ? { reply_to: email.trim() } : {}),
          text: body,
          html: `<div style="white-space:pre-wrap">${escapeHtml(body)}</div>`,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        res.status(502).json({ code: 'provider_error' });
        return;
      }
      // Analytics failures must not turn a successfully sent message into a retry.
      try { deps.onAccepted?.(source?.value ?? 'unknown'); } catch { /* best effort */ }
      res.status(202).json({ ok: true, status: 'accepted' });
    } catch {
      res.status(502).json({ code: 'provider_error' });
    }
  };
}
