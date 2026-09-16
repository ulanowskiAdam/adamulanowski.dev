import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  ErrorHandler,
  inject,
  input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import type { IndustryId } from './configurator.store';
import type { BusinessSceneRuntime } from './business-scene.runtime';

@Component({
  selector: 'app-business-scene',
  standalone: true,
  template: `<div #host class="canvas-host">
    <canvas #sceneCanvas class="scene-canvas" aria-hidden="true"></canvas>
  </div>`,
  styles: [
    ':host,.canvas-host{position:absolute;inset:0;display:block}.canvas-host canvas{display:block;width:100%;height:100%;filter:saturate(.96) contrast(1.04)}',
  ],
})
export class BusinessScene implements OnDestroy {
  @ViewChild('host') host?: ElementRef<HTMLElement>;
  @ViewChild('sceneCanvas') sceneCanvas?: ElementRef<HTMLCanvasElement>;
  readonly industry = input<IndustryId | null>(null);
  readonly step = input(0);

  private readonly zone = inject(NgZone);
  private readonly errors = inject(ErrorHandler);
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
          .catch((error) => {
            this.runtime?.destroy();
            this.errors.handleError(error);
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
