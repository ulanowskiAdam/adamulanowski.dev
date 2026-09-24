import { afterNextRender, DestroyRef, Directive, ElementRef, inject, NgZone } from '@angular/core';

/** Reveals static page copy once per page visit, leaving SSR content readable. */
@Directive({ selector: '[appTextReveal]' })
export class TextReveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motion.matches) return;

      this.zone.runOutsideAngular(() => {
        const elements = Array.from(
          this.host.nativeElement.querySelectorAll<HTMLElement>('h1, h2, h3, p'),
        ).filter((element) => !element.closest('app-contact-form, .hero-stage'));
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.remove('text-reveal-pending');
              entry.target.classList.add('text-reveal-enter');
              observer.unobserve(entry.target);
            }
          },
          { threshold: 0.08 },
        );

        for (const element of elements) {
          element.classList.add('text-reveal-pending');
          observer.observe(element);
        }

        const showAll = () => {
          observer.disconnect();
          for (const element of elements) {
            element.classList.remove('text-reveal-pending', 'text-reveal-enter');
          }
        };
        const onMotionChange = () => {
          if (motion.matches) showAll();
        };
        motion.addEventListener('change', onMotionChange);
        this.destroyRef.onDestroy(() => {
          showAll();
          motion.removeEventListener('change', onMotionChange);
        });
      });
    });
  }
}
