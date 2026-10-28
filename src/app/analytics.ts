import { afterNextRender, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
export const measurementId = 'G-JQJK7GL9KM';
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [key: string]: unknown };
@Injectable({ providedIn: 'root' })
export class Analytics {
  readonly visible = signal(false);
  readonly allowed = signal(false);
  private started = false;
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  constructor() {
    afterNextRender(() => {
      let choice: string | null = null;
      try { choice = localStorage.getItem('analytics-consent-v1'); } catch {}
      this.visible.set(choice !== 'yes' && choice !== 'no');
      if (choice === 'yes') this.start();
      const onClick = (event: MouseEvent) => {
        const target = event.target instanceof Element ? event.target.closest('a[href^="mailto:"]') : null;
        if (target) this.event('contact_email_click');
      };
      document.addEventListener('click', onClick);
      const routes = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd && this.allowed()) setTimeout(() => this.page(), 0);
      });
      this.destroyRef.onDestroy(() => { document.removeEventListener('click', onClick); routes.unsubscribe(); });
    });
  }
  choose(allow: boolean) {
    try { localStorage.setItem('analytics-consent-v1', allow ? 'yes' : 'no'); } catch {}
    this.visible.set(false);
    if (allow) { if (!this.allowed()) this.start(); return; }
    const wasAllowed = this.allowed();
    this.allowed.set(false);
    const win = window as unknown as AnalyticsWindow;
    win['ga-disable-' + measurementId] = true;
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!name.startsWith('_ga')) continue;
      for (const domain of ['', '; domain=' + location.hostname, '; domain=.' + location.hostname])
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax';
    }
    if (wasAllowed) location.reload();
  }
  private start() {
    this.allowed.set(true);
    const win = window as unknown as AnalyticsWindow;
    win['ga-disable-' + measurementId] = false;
    if (this.started) return;
    this.started = true;
    win.dataLayer ??= [];
    // Use gtag's arguments queue, and never send contact fields or query strings.
    win.gtag = function () { win.dataLayer!.push(arguments); };
    win.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    win.gtag('js', new Date());
    win.gtag('config', measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, ...this.pageData() });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(script);
    this.page();
  }
  private pageData() {
    let referrer = '';
    try { referrer = new URL(document.referrer).origin; } catch {}
    const safePaths = new Set(['/', '/regulamin', '/o-mnie', '/polityka-prywatnosci', '/strony-internetowe-dla-firm', '/aplikacje-webowe', '/automatyzacja-procesow', '/integracje-ai', '/demo/konfigurator', '/realizacje/loadlift', '/realizacje/loadlift-automatyzacje', '/realizacje/fizjomind', '/realizacje/lifting-paulina-karol', '/realizacje/kontent-architektura']);
    const pathname = location.pathname.replace(/\/$/, '') || '/';
    return { page_title: document.title, page_location: location.origin + (safePaths.has(pathname) ? pathname : '/404'), page_referrer: referrer };
  }
  private page() {
    const data = this.pageData();
    (window as unknown as AnalyticsWindow).gtag?.('set', data);
    this.event('page_view', data);
  }
  event(name: 'page_view' | 'generate_lead' | 'contact_email_click', params: Record<string, string> = {}) {
    if (!this.allowed() || typeof window === 'undefined') return;
    try { (window as unknown as AnalyticsWindow).gtag?.('event', name, { ...params, send_to: measurementId }); } catch { /* Measurement must never interrupt contact. */ }
  }
}
