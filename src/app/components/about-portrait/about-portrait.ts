import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import type { PortraitScene } from './portrait-scene';
@Component({
  selector: 'app-about-portrait',
  standalone: true,
  template: ` <div class="portrait-stage" [class.ready]="ready()">
    <div class="stage-meta"><span>AU / człowiek za kodem</span><i aria-hidden="true"></i></div>
    <div
      #surface
      class="surface"
      tabindex="0"
      role="group"
      aria-label="Interaktywny portret Adama. Obracaj strzałkami lub kursorem. Home resetuje widok."
      (pointermove)="point($event)"
      (pointerdown)="point($event)"
      (pointerleave)="reset()"
      (keydown)="key($event)"
    >
      <img
        class="profile-photo"
        src="/images/adam-ulanowski-dark.webp"
        alt="Adam Ułanowski — full-stack developer"
        width="900"
        height="1125"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div class="stage-bottom">
      <span>{{ ready() ? 'Porusz portretem ↔' : 'Adam Ułanowski' }}</span>
      @if (ready()) {
        <button type="button" (click)="toggle()" [attr.aria-pressed]="animated()">
          {{ animated() ? 'Ⅱ Pauza' : '▷ Animuj' }}
        </button>
      }
    </div>
  </div>`,
  styles: `
    :host {
      display: block;
    }
    .portrait-stage {
      position: relative;
      aspect-ratio: 1;
      isolation: isolate;
      background: radial-gradient(ellipse at 50% 65%, #d3ff4812, transparent 63%), #0c0f0c;
      border: 1px solid #f2efe51a;
      border-radius: 2px;
      overflow: hidden;
    }
    .surface {
      position: absolute;
      inset: 0;
      touch-action: pan-y;
      cursor: grab;
    }
    .surface:focus-visible {
      outline: 2px solid var(--lime);
      outline-offset: -3px;
    }
    .profile-photo {
      position: absolute;
      left: 22%;
      top: 13%;
      width: 56%;
      height: 70%;
      object-fit: cover;
    }
    .ready .profile-photo {
      opacity: 0;
    }
    .stage-meta,
    .stage-bottom {
      position: absolute;
      z-index: 2;
      left: 1.15rem;
      right: 1.15rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      color: #f2efe577;
      font: 0.6rem/1.5 var(--font-mono);
    }
    .stage-meta {
      top: 1.1rem;
      pointer-events: none;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .stage-meta i {
      width: 0.4rem;
      height: 0.4rem;
      background: var(--lime);
      border-radius: 50%;
    }
    .stage-bottom {
      bottom: 0.55rem;
      pointer-events: none;
    }
    .stage-bottom button {
      pointer-events: auto;
      background: transparent;
      color: #f2efe5a8;
      border: 0;
      min-height: 44px;
      padding: 0.5rem;
      cursor: pointer;
      font: inherit;
    }
    .stage-bottom button:hover {
      color: var(--lime);
    }
    button:focus-visible {
      outline: 2px solid var(--lime);
      outline-offset: 2px;
    }
    @media (max-width: 360px) {
      .stage-meta,
      .stage-bottom {
        font-size: 0.52rem;
        left: 0.8rem;
        right: 0.8rem;
      }
    }
  `,
})
export class AboutPortrait implements OnDestroy {
  readonly ready = signal(false);
  readonly animated = signal(false);
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private scene?: PortraitScene;
  private destroyed = false;
  constructor() {
    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          this.observer?.disconnect();
          this.zone.runOutsideAngular(() => void this.load());
        },
        { rootMargin: '200px' },
      );
      this.observer.observe(this.surface().nativeElement);
    });
  }
  private async load() {
    try {
      const { PortraitScene } = await import('./portrait-scene');
      if (this.destroyed) return;
      this.scene = new PortraitScene(
        this.surface().nativeElement,
        () => this.zone.run(() => this.ready.set(false)),
        (value) => this.zone.run(() => this.animated.set(value)),
      );
      const ok = await this.scene.init();
      if (!this.destroyed) this.zone.run(() => this.ready.set(ok));
    } catch {
      this.scene?.destroy();
      this.scene = undefined;
      this.zone.run(() => this.ready.set(false));
    }
  }
  point(event: PointerEvent) {
    const rect = this.surface().nativeElement.getBoundingClientRect();
    this.scene?.point(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      ((event.clientY - rect.top) / rect.height) * 2 - 1,
    );
  }
  reset() {
    this.scene?.point(0, 0);
  }
  key(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.scene?.turn(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.reset();
    }
  }
  toggle() {
    this.scene?.setAnimated(!this.animated());
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.observer?.disconnect();
    this.scene?.destroy();
  }
}
