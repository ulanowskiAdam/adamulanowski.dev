import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  ErrorHandler,
  inject,
  input,
  NgZone,
  OnDestroy,
  output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import type { AddonId } from './configurator.store';
import type { CafeTilesRuntime } from './cafe-tiles.runtime';

@Component({
  selector: 'app-cafe-tiles',
  standalone: true,
  template: `<div #surface class="tiles">
    @for (item of items; track item.id) {
      <button
        type="button"
        [attr.aria-pressed]="selected().has(item.id)"
        (click)="toggle.emit(item.id)"
      >
        <span class="miniature" aria-hidden="true"></span
        ><span class="label">{{ item.label }}</span>
      </button>
    }
  </div>`,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        left: 3%;
        right: 3%;
        bottom: 3.7rem;
        height: 148px;
      }
      .tiles {
        position: relative;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 9px;
        height: 100%;
      }
      button {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 0 5px 9px;
        border: 1px solid #f2efe530;
        border-radius: 17px;
        background: #171c19;
        color: #f2efe5;
        cursor: pointer;
      }
      button[aria-pressed='true'] {
        border-color: #cdef5075;
        background: #20271d;
      }
      button:hover,
      button:focus-visible {
        outline: 2px solid #ceef50;
        outline-offset: 3px;
      }
      .miniature {
        display: block;
        height: 90px;
        flex: 1;
        min-height: 0;
      }
      .label {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        font: 500 14px/1.3 var(--font-body, sans-serif);
      }
      @media (max-width: 560px), (min-width: 901px) and (max-width: 1100px) {
        :host {
          height: 258px;
        }
        .tiles {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .label {
          font-size: 13px;
        }
      }
    `,
  ],
})
export class CafeTiles implements OnDestroy {
  @ViewChild('surface') surface?: ElementRef<HTMLElement>;
  readonly selected = input<ReadonlySet<AddonId>>(new Set());
  readonly toggle = output<AddonId>();
  readonly items: { id: AddonId; label: string }[] = [
    { id: 'gastronomia-zamowienia-online', label: 'Mobilne zamówienia' },
    { id: 'gastronomia-rezerwacje', label: 'Rezerwacje online' },
    { id: 'gastronomia-asystent-ai', label: 'Asystent AI' },
    { id: 'gastronomia-kontakt-po-wizycie', label: 'Automatyczna obsługa po wizycie' },
  ];
  private readonly zone = inject(NgZone);
  private readonly errors = inject(ErrorHandler);
  private runtime?: CafeTilesRuntime;
  private destroyed = false;

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    afterNextRender(() => {
      if (!browser || this.destroyed) return;
      this.zone.runOutsideAngular(() => {
        void import('./cafe-tiles.runtime')
          .then(({ CafeTilesRuntime }) => {
            if (this.destroyed || !this.surface) return;
            this.zone.runOutsideAngular(() => {
              this.runtime = new CafeTilesRuntime(this.surface!, this.items);
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
