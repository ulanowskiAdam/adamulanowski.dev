import type { RequestHandler } from 'express';

/** Use the actual Host forwarded by the proxy, never a client-supplied forwarded host. */
export const canonicalHost: RequestHandler = (req, res, next) => {
  if (req.headers.host?.toLowerCase().split(':')[0] === 'www.adamulanowski.dev') {
    // Preserve POST bodies if an old client submits to the www domain.
    res.redirect(req.method === 'GET' || req.method === 'HEAD' ? 301 : 308,
      'https://adamulanowski.dev' + req.originalUrl);
    return;
  }
  next();
};
