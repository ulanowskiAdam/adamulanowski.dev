import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class SeoTitleStrategy extends TitleStrategy {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  override updateTitle(snapshot: RouterStateSnapshot) {
    const title = this.buildTitle(snapshot) ?? 'Adam Ułanowski';
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const description = route.data['description'] ?? '';
    const url = 'https://adamulanowski.dev' + (snapshot.url.split(/[?#]/)[0] || '/');
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'robots',
      content: route.data['noindex'] ? 'noindex, follow' : 'index, follow',
    });
    for (const [property, content] of Object.entries({
      'og:title': title,
      'og:description': description,
      'og:url': url,
    })) {
      this.meta.updateTag({ property, content });
    }
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    const canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (route.data['noindex']) canonical?.remove();
    else {
      const link = canonical ?? this.document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      if (!canonical) this.document.head.appendChild(link);
    }
  }
}
