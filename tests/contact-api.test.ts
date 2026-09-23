import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import { createServer, Server } from 'node:http';
import { createContactHandler } from '../src/server/contact';

const valid = { version: 2, email: 'jan@example.com', message: 'Potrzebuję strony.' };
async function server(
  options: { key?: string; from?: string; send?: typeof fetch; now?: () => number; onAccepted?: (source: string) => void } = {},
) {
  const send = options.send ?? vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  const app = express();
  app.use(express.json());
  app.post(
    '/api/contact',
    createContactHandler({
      apiKey: () => (options.key === undefined ? 'test-key' : options.key),
      from: () => (options.from === undefined ? 'test@example.com' : options.from),
      to: () => 'recipient@example.com',
      send,
      now: options.now,
      onAccepted: options.onAccepted,
    }),
  );
  const listener: Server = createServer(app);
  await new Promise<void>((resolve) => listener.listen(0, '127.0.0.1', resolve));
  const address = listener.address() as { port: number };
  return {
    send,
    close: () => new Promise<void>((resolve) => listener.close(() => resolve())),
    post: (body: unknown) =>
      fetch('http://127.0.0.1:' + address.port + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
  };
}

describe('contact API', () => {
  it('counts only provider-accepted messages and limits source to known categories', async () => {
    const onAccepted = vi.fn();
    const send = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 502 }))
      .mockResolvedValue(new Response('{}', { status: 200 }));
    const api = await server({ onAccepted, send });
    try {
      await api.post({ ...valid, website: 'spam', source: 'chatgpt' });
      await api.post({ ...valid, email: '', source: 'chatgpt' });
      await api.post({ ...valid, source: 'chatgpt' });
      expect(onAccepted).not.toHaveBeenCalled();
      await api.post({ ...valid, source: 'chatgpt' });
      expect(onAccepted).toHaveBeenNthCalledWith(1, 'chatgpt');
      await api.post({ ...valid, source: 'private@example.com' });
      expect(onAccepted).toHaveBeenNthCalledWith(2, 'unknown');
      const payload = JSON.parse(send.mock.calls[1][1].body);
      expect(payload.text).toContain('Źródło kontaktu: ChatGPT');
    } finally { await api.close(); }
  });
  it('accepts v2 without name or legacy fields, escapes HTML, preserves text and uses reply-to', async () => {
    const api = await server();
    try {
      const response = await api.post({ ...valid, message: '<script>alert(1)</script>' });
      expect(response.status).toBe(202);
      expect(await response.json()).toEqual({ ok: true, status: 'accepted' });
      const payload = JSON.parse((api.send as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(payload.reply_to).toBe(valid.email);
      expect(payload.html).toContain('&lt;script&gt;');
      expect(payload.text).toContain('<script>');
    } finally {
      await api.close();
    }
  });
  it.each([
    [{ version: 2, email: '', message: '' }, ['email', 'message']],
    [{ ...valid, email: 'broken' }, ['email']],
    [{ ...valid, message: ' '.repeat(5) }, ['message']],
    [{ ...valid, message: 'x'.repeat(2001) }, ['message']],
    [{ ...valid, name: 'x'.repeat(101) }, ['name']],
    [{ ...valid, name: {} }, ['name']],
  ])('returns field errors without contacting provider for %j', async (payload, fields) => {
    const api = await server();
    try {
      const response = await api.post(payload);
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.code).toBe('validation_error');
      expect(Object.keys(result.fields)).toEqual(fields);
      expect(api.send).not.toHaveBeenCalled();
    } finally {
      await api.close();
    }
  });
  it('accepts the 2000-character boundary and legacy phone-based submissions', async () => {
    const api = await server();
    try {
      expect((await api.post({ ...valid, message: 'x'.repeat(2000) })).status).toBe(202);
      expect(
        (
          await api.post({
            name: 'Jan',
            contact: '123456789',
            city: 'Gdańsk',
            industry: 'Usługi',
            solutions: ['Rezerwacje'],
            message: '',
          })
        ).status,
      ).toBe(202);
      const payload = JSON.parse((api.send as ReturnType<typeof vi.fn>).mock.calls[1][1].body);
      expect(payload.reply_to).toBeUndefined();
      expect(payload.text).toContain('Gdańsk');
    } finally {
      await api.close();
    }
  });
  it('ignores honeypot submissions and rejects unsupported versions and primitive bodies', async () => {
    const api = await server();
    try {
      expect((await api.post({ ...valid, website: 'spam' })).status).toBe(202);
      expect(api.send).not.toHaveBeenCalled();
      expect((await api.post({ ...valid, version: 3 })).status).toBe(400);
      expect((await api.post([])).status).toBe(400);
    } finally {
      await api.close();
    }
  });
  it('limits attempts and permits retry after the window', async () => {
    let now = 0;
    const api = await server({ now: () => now });
    try {
      for (let i = 0; i < 5; i++) await api.post(valid);
      const limited = await api.post(valid);
      expect(limited.status).toBe(429);
      expect(limited.headers.get('retry-after')).toBe('900');
      expect((await limited.json()).code).toBe('rate_limited');
      now = 900001;
      expect((await api.post(valid)).status).toBe(202);
    } finally {
      await api.close();
    }
  });
  it.each([
    [{ key: '' }, 503, 'not_configured'],
    [{ from: '' }, 503, 'not_configured'],
    [{ send: vi.fn().mockResolvedValue(new Response('', { status: 500 })) }, 502, 'provider_error'],
    [{ send: vi.fn().mockRejectedValue(new Error('timeout')) }, 502, 'provider_error'],
  ])('distinguishes configuration and provider errors', async (options, status, code) => {
    const api = await server(options);
    try {
      const response = await api.post(valid);
      expect(response.status).toBe(status);
      expect((await response.json()).code).toBe(code);
    } finally {
      await api.close();
    }
  });
  it('reserves daily quota before concurrent provider calls', async () => {
    let now = 0;
    const api = await server({ now: () => now });
    try {
      for (let batch = 0; batch < 16; batch++) {
        const responses = await Promise.all(Array.from({ length: 5 }, () => api.post(valid)));
        expect(responses.every((response) => response.status === 202)).toBe(true);
        now += 900001;
      }
      expect((await api.post(valid)).status).toBe(429);
      expect(api.send).toHaveBeenCalledTimes(80);
    } finally {
      await api.close();
    }
  });
});
