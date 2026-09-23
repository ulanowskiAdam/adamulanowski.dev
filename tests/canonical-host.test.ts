import { describe, expect, it } from 'vitest';
import express from 'express';
import { request } from 'node:http';
import { canonicalHost } from '../src/server/canonical-host';

describe('canonical domain', () => {
  it('redirects www with the original path and query, preserves POST, ignores forwarded host', async () => {
    const app = express();
    app.use(canonicalHost);
    app.use((_req, res) => { res.sendStatus(200); });
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const port = (server.address() as { port: number }).port;
    const probe = (method: string, host: string) => new Promise<{ status: number; location?: string }>((resolve, reject) => {
      const req = request({ hostname: '127.0.0.1', port, path: '/integracje-ai?utm_source=test', method,
        headers: { host, 'x-forwarded-host': 'www.adamulanowski.dev' } }, (res) => {
        res.resume();
        res.on('end', () => resolve({ status: res.statusCode!, location: res.headers.location }));
      });
      req.on('error', reject);
      req.end();
    });
    try {
      for (const method of ['GET', 'HEAD', 'POST']) {
        const response = await probe(method, 'www.adamulanowski.dev');
        expect(response.status).toBe(method === 'POST' ? 308 : 301);
        expect(response.location).toBe('https://adamulanowski.dev/integracje-ai?utm_source=test');
      }
      for (const host of ['adamulanowski.dev', 'localhost']) {
        const response = await probe('GET', host);
        expect(response.status).toBe(200);
      }
    } finally { await new Promise<void>((resolve) => server.close(() => resolve())); }
  });
});
