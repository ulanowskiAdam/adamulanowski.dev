import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import type { IndustryId } from './configurator.store';
import type { BusinessSceneRuntime } from './business-scene.runtime';

@Component({
  selector: 'app-business-scene',
  standalone: true,
  template: `<div #host class="canvas-host">
    <canvas #sceneCanvas class="scene-canvas" aria-hidden="true"></canvas>
    @if (unavailable()) {
      <p role="status" style="position:absolute;inset:24px;color:var(--muted)">
        Podgląd 3D jest niedostępny. Nadal możesz wybierać rozwiązania i korzystać z podsumowania.
      </p>
    }
  </div>`,
  styles: [
    ':host,.canvas-host{position:absolute;inset:0;display:block}.canvas-host canvas{display:block;width:100%;height:100%;filter:saturate(.96) contrast(1.04)}',
  ],
})
export class BusinessScene implements OnDestroy {
  readonly unavailable = signal(false);
  @ViewChild('host') host?: ElementRef<HTMLElement>;
  @ViewChild('sceneCanvas') sceneCanvas?: ElementRef<HTMLCanvasElement>;
  readonly industry = input<IndustryId | null>(null);
  readonly step = input(0);

  private readonly zone = inject(NgZone);
  private runtime?: BusinessSceneRuntime;
  private destroyed = false;

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    effect(() => {
      this.industry();
      this.step();
      this.zone.runOutsideAngular(() => this.runtime?.update());
    });
    afterNextRender(() => {
      if (!browser || this.destroyed) return;
      this.zone.runOutsideAngular(() => {
        void import('./business-scene.runtime')
          .then(({ BusinessSceneRuntime }) => {
            if (this.destroyed || !this.host || !this.sceneCanvas) return;
            this.zone.runOutsideAngular(() => {
              this.runtime = new BusinessSceneRuntime(this.host!, this.sceneCanvas!, this);
              this.runtime.init();
            });
          })
          .catch(() => {
            this.runtime?.destroy();
            this.runtime = undefined;
            if (!this.destroyed) this.zone.run(() => this.unavailable.set(true));
          });
      });
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.zone.runOutsideAngular(() => this.runtime?.destroy());
    this.runtime = undefined;
  }

  sync(industry: IndustryId | null, step: number): void {
    this.zone.runOutsideAngular(() => this.runtime?.sync(industry, step));
  }
}
