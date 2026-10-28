import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Analytics, measurementId } from './analytics';
import { AnalyticsConsent } from './components/analytics-consent';
describe('analytics consent', () => {
 beforeEach(() => { localStorage.clear(); document.querySelectorAll('script[src*="googletagmanager"]').forEach(s=>s.remove()); delete (window as any).dataLayer; delete (window as any).gtag; TestBed.configureTestingModule({imports:[AnalyticsConsent],providers:[provideRouter([])]}); });
 afterEach(() => { localStorage.clear(); history.replaceState(null,'','/'); });
 async function setup(){const fixture=TestBed.createComponent(AnalyticsConsent); fixture.detectChanges(); await fixture.whenStable(); return {fixture,analytics:TestBed.inject(Analytics)};}
 it('does not load Google or queue events before consent or after refusal',async()=>{const {analytics}=await setup();analytics.event('generate_lead');analytics.choose(false);expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();expect((window as any).dataLayer).toBeUndefined();expect(localStorage.getItem('analytics-consent-v1')).toBe('no');});
 it('starts only after consent and omits URL query parameters from page views',async()=>{history.replaceState(null,'','/?context=private@example.com');const {analytics}=await setup();analytics.choose(true);expect(document.querySelector('script[src*="'+measurementId+'"]')).toBeTruthy();const calls=(window as any).dataLayer.map((args:any)=>Array.from(args));const page=calls.find((args:any)=>args[0]==='event'&&args[1]==='page_view');expect(page).toBeTruthy();expect(page[2].page_location).not.toContain('context');expect(JSON.stringify(calls)).not.toContain('private@example.com');analytics.choose(true);expect(document.querySelectorAll('script[src*="googletagmanager"]').length).toBe(1);});
 it('keeps analytics failures from interrupting a contact action',async()=>{const {analytics}=await setup();analytics.choose(true);(window as any).gtag=()=>{throw new Error('blocked');};expect(()=>analytics.event('generate_lead')).not.toThrow();});
});
