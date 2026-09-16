import { NgComponentOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { AddonDefinition, AddonId } from './configurator.store';

/** One selection-driven strip for every industry. Animated flex bases also
 * move the remaining tiles, including when a selection is removed mid-entry. */
@Component({
  selector: 'app-selected-addons',
  imports: [NgComponentOutlet],
  template: `<div class="tiles" role="list" aria-label="Wybrane usprawnienia">
    @for (item of addons(); track item.id) {
      <div class="slot" role="listitem" animate.enter="tile-enter" animate.leave="tile-leave">
        <div class="tile" [class.active]="activeId() === item.id">
          <span class="icon" aria-hidden="true"
            ><ng-container *ngComponentOutlet="item.icon"
          /></span>
          <span>{{ item.shortLabel }}</span>
        </div>
      </div>
    }
  </div>`,
  styles: [
    `
      :host {
        display: block;
        container-type: inline-size;
      }
      .tiles {
        display: flex;
        justify-content: center;
        gap: 0;
        min-height: 7.5rem;
      }
      .slot {
        --tile-width: min(8rem, 25cqw);
        flex: 0 0 var(--tile-width);
        min-width: 0;
        overflow: hidden;
      }
      .tile {
        box-sizing: border-box;
        width: calc(var(--tile-width) - 0.5rem);
        min-height: 7rem;
        margin: 0.25rem;
        padding: 0.8rem 0.3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        text-align: center;
        border: 1px solid #f2efe530;
        border-radius: 0.8rem;
        background: #171c19;
        color: var(--paper);
        font: 600 clamp(0.6rem, 2.3cqw, 0.75rem)/1.35 var(--font-mono);
      }
      .tile.active {
        border-color: var(--lime);
        background: #d3ff4810;
      }
      .icon {
        color: var(--lime);
        display: grid;
        place-items: center;
      }
      .tile-enter {
        animation: tile-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
      }
      .tile-leave {
        animation: tile-out 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
      }
      @keyframes tile-in {
        from {
          flex-basis: 0;
          opacity: 0;
          transform: translateY(14px);
        }
      }
      @keyframes tile-out {
        to {
          flex-basis: 0;
          opacity: 0;
          transform: translateY(10px);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .tile-enter,
        .tile-leave {
          animation-duration: 1ms;
        }
      }
    `,
  ],
})
export class SelectedAddons {
  readonly addons = input<readonly AddonDefinition[]>([]);
  readonly activeId = input<AddonId | null>(null);
}
