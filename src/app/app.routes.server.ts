import { services } from './content/services';
import { projects } from './content/projects';
import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  ...[
    '',
    'o-mnie',
    'polityka-prywatnosci',
    'demo/konfigurator',
    ...services.map((s) => s.slug),
    ...projects.map((p) => 'realizacje/' + p.slug),
  ].map((path) => ({
    path,
    renderMode: RenderMode.Prerender as const,
  })),
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
