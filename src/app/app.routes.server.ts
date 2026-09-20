import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  ...['', 'o-mnie', 'polityka-prywatnosci', 'demo/konfigurator'].map((path) => ({
    path,
    renderMode: RenderMode.Prerender as const,
  })),
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
