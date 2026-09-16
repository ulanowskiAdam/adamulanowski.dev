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
import type { AddonId, IndustryId } from './configurator.store';
import type { BusinessSceneRuntime } from './business-scene.runtime';

@Component({
  selector: 'app-business-scene',
  standalone: true,
  template: `<div #host class="canvas-host">
    <canvas #sceneCanvas class="scene-canvas" aria-hidden="true"></canvas>
    @for (item of addonLabels(); track item.id) {
      @if (industry() !== 'gastronomia' && addonIds().has(item.id)) {
        <span
          class="addon-label"
          [attr.data-addon-id]="item.id"
          [class.active]="activeAddonId() === item.id"
          aria-hidden="true"
          >{{ item.shortLabel }}</span
        >
      }
    }
  </div>`,
  styles: [
    ':host,.canvas-host{position:absolute;inset:0;display:block}.canvas-host canvas{display:block;width:100%;height:100%;filter:saturate(.96) contrast(1.04)}.addon-label{position:absolute;z-index:3;width:27%;transform:translateX(-50%);padding:4px 3px;border-bottom:1px solid transparent;border-radius:3px;background:#0c0e0de6;color:#f2efe5b8;text-align:center;font:600 clamp(8px, .7vw, 10px)/1.25 var(--font-mono);pointer-events:none;visibility:hidden}.addon-label.active{color:var(--lime);border-bottom-color:var(--lime)}.addon-label[data-addon-id^="gastronomia-"]{padding:4px 0;border:0;border-radius:0;background:transparent;color:#a8dde0;font-weight:400;line-height:1.4}.addon-label[data-addon-id^="gastronomia-"].active,.addon-label[data-addon-id^="gastronomia-"]:hover{color:#d3f7f8}',
  ],
})
export class BusinessScene implements OnDestroy {
  @ViewChild('host') host?: ElementRef<HTMLElement>;
  @ViewChild('sceneCanvas') sceneCanvas?: ElementRef<HTMLCanvasElement>;
  readonly industry = input<IndustryId | null>(null);
  readonly addonIds = input<ReadonlySet<AddonId>>(new Set());
  readonly addonLabels = input<readonly { id: AddonId; shortLabel: string }[]>([]);
  readonly activeAddonId = input<AddonId | null>(null);
  readonly step = input(0);

  private readonly zone = inject(NgZone);
  private readonly errors = inject(ErrorHandler);
  private runtime?: BusinessSceneRuntime;
  private destroyed = false;

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    effect(() => {
      this.industry();
      this.addonIds();
      this.activeAddonId();
      this.step();
      this.addonLabels();
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
}
