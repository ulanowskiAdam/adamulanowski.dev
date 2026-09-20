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
        position: relative;
        z-index: 4;
      }
      .tiles {
        display: flex;
        justify-content: center;
        gap: 0;
        min-height: 7.5rem;
        perspective: 40rem;
      }
      .slot {
        --tile-width: min(8rem, 25cqw);
        flex: 0 0 var(--tile-width);
        min-width: 0;
        overflow: hidden;
      }
      .tile {
        position: relative;
        isolation: isolate;
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
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 1.15rem;
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.025) 52%),
          rgba(12, 17, 14, 0.54);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.16),
          inset 0 -1px 0 rgba(255, 255, 255, 0.035),
          0 16px 34px rgba(0, 0, 0, 0.24);
        backdrop-filter: blur(18px) saturate(135%);
        -webkit-backdrop-filter: blur(18px) saturate(135%);
        color: var(--paper);
        font: 600 clamp(0.6rem, 2.3cqw, 0.75rem)/1.35 var(--font-mono);
        letter-spacing: -0.01em;
        transition:
          border-color 0.35s ease,
          background 0.35s ease,
          box-shadow 0.35s ease,
          transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .tile::after {
        content: '';
        position: absolute;
        z-index: -1;
        inset: 0;
        background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.12), transparent 48%);
        pointer-events: none;
      }
      .tile.active {
        border-color: color-mix(in srgb, var(--lime) 58%, white 8%);
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(211, 255, 72, 0.055) 55%),
          rgba(15, 22, 15, 0.66);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          0 0 0 1px rgba(211, 255, 72, 0.06),
          0 18px 38px rgba(0, 0, 0, 0.3),
          0 0 26px rgba(211, 255, 72, 0.08);
        transform: translateY(-2px);
      }
      .icon {
        position: relative;
        width: 2.65rem;
        height: 2.65rem;
        border: 1px solid rgba(255, 255, 255, 0.17);
        border-radius: 0.88rem;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.045));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.18),
          0 10px 22px rgba(0, 0, 0, 0.24);
        color: #e1ff80;
        display: grid;
        place-items: center;
      }
      .icon :is(svg) {
        width: 1.28rem;
        height: 1.28rem;
        stroke-width: 1.65;
        filter: drop-shadow(0 2px 6px rgba(211, 255, 72, 0.2));
      }
      .tile.active .icon {
        border-color: rgba(211, 255, 72, 0.34);
        background: linear-gradient(145deg, rgba(211, 255, 72, 0.2), rgba(255, 255, 255, 0.055));
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
        .tile {
          transition: none;
        }
      }
      @media (max-width: 560px) {
        .tiles {
          min-height: 4.25rem;
          align-items: center;
          gap: 0.35rem;
        }
        .slot {
          --tile-width: 3.7rem;
          overflow: visible;
        }
        .tile {
          width: 3.7rem;
          min-height: 3.7rem;
          margin: 0;
          padding: 0.35rem;
          border-radius: 1rem;
        }
        .tile > span:last-child {
          display: none;
        }
        .icon {
          width: 2.65rem;
          height: 2.65rem;
          border: 0;
          background: transparent;
          box-shadow: none;
        }
        .tile.active {
          transform: translateY(-0.2rem);
        }
      }
    `,
  ],
})
export class SelectedAddons {
  readonly addons = input<readonly AddonDefinition[]>([]);
  readonly activeId = input<AddonId | null>(null);
}
