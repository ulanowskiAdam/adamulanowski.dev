import { Component, input } from '@angular/core';

@Component({
  selector: 'app-screenshot-mockup',
  host: { '[class.compact]': 'compact()', '[class.workflow]': 'workflow()' },
  template: `<div class="mockup-stage">
    <div class="mockup-window">
      <div class="window-bar"><span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="window-label">{{ label() }}</span><span class="window-symbol" aria-hidden="true">{{ workflow() ? '⇄' : '↗' }}</span></div>
      @if (fullSize()) {
        <a class="screen" [href]="src()" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Otwórz zrzut: ' + alt() + ' (pełny rozmiar, nowa karta)'">
          <img [src]="src()" [attr.srcset]="srcset() || null" [attr.sizes]="sizes()" [alt]="alt()" [width]="width()" [height]="height()" [attr.loading]="eager() ? 'eager' : 'lazy'" />
        </a>
      } @else {
        <div class="screen"><img [src]="src()" [attr.srcset]="srcset() || null" [attr.sizes]="sizes()" [alt]="alt()" [width]="width()" [height]="height()" [attr.loading]="eager() ? 'eager' : 'lazy'" /></div>
      }
    </div>
    @if (workflow()) { <p class="flow-label" aria-hidden="true">{{ shipping() ? 'Przesyłka' : 'WooCommerce' }} <span>→</span> n8n <span>→</span> {{ shipping() ? 'Alert operatora' : 'ClickUp' }}</p> } @else if (compact()) { <p class="flow-label" aria-hidden="true">Podgląd witryny <span>↗</span></p> }
  </div>
  @if (fullSize()) { <p class="zoom-hint">Kliknij zrzut, aby zobaczyć szczegóły ↗</p> }`,
  styles: `
    :host { display:block; min-width:0; --frame:#253027; --frame-text:#dce5d2; }
    .mockup-stage { position:relative; padding:clamp(18px,4vw,48px); border:1px solid var(--border,#c5cabb); border-radius:18px; background:radial-gradient(ellipse at 15% 10%,#b3c86e24,transparent 65%),linear-gradient(135deg,#273323,#182019); }
    .mockup-window { position:relative; overflow:hidden; border:1px solid #71826565; border-radius:10px; background:var(--frame); box-shadow:0 12px 26px #00000035; }
    .window-bar { display:flex; align-items:center; gap:12px; min-height:36px; padding:8px 12px; color:var(--frame-text); font:12px/1.3 system-ui,sans-serif; }
    .window-dots { display:flex; gap:4px; flex-shrink:0; }
    i { width:5px; height:5px; background:#9dae91; border-radius:50%; }
    .window-label { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .window-symbol { margin-left:auto; }
    .screen { display:block; background:#171a1b; }
    .screen:focus-visible { outline:3px solid #d1fa4a; outline-offset:-3px; }
    img { display:block; width:100%; height:auto; }
    .flow-label { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:12px; color:#e3ecd9; margin:20px 0 0; font:12px/1.5 system-ui,sans-serif; }
    .flow-label span { color:#d1fa4a; }
    .zoom-hint { color:var(--muted); font-size:13px; margin:12px 0 0; }
    :host(.compact) .mockup-stage { padding:20px 16px; border-color:#c5cabb; border-radius:12px; background:radial-gradient(ellipse at 20% 0,#f6f8e9,transparent 75%),#d8ddcd; }
    :host(.compact) .mockup-window { border-radius:6px; }
    :host(.compact) .window-bar { min-height:26px; padding:6px 8px; font-size:10px; gap:8px; }
    :host(.compact) .screen { aspect-ratio:1.6; display:flex; align-items:center; }
    :host(.compact) img { height:100%; object-fit:contain; }
    :host(.compact) .flow-label { color:#34432a; margin-top:14px; gap:8px; font-size:10px; }
    :host(.compact) .flow-label span { color:#4b6222; }
    @media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) {
      :host(.compact:not(.workflow)) .mockup-window { transform:perspective(1100px) rotateY(-5deg) rotateX(2deg); transition:transform 220ms ease; }
      :host(.compact:not(.workflow)):hover .mockup-window { transform:perspective(1100px) rotateY(0) rotateX(0) translateY(-3px); }
    }
    @media (max-width:600px) { .mockup-stage { padding:14px 10px; border-radius:12px; } .window-bar { font-size:10px; min-height:30px; gap:8px; } .flow-label { gap:8px; font-size:10px; margin-top:14px; } }
    @media print { .mockup-stage { background:none; padding:0; border:0; } .mockup-window { box-shadow:none; } .flow-label { color:#222; } }
  `,
})
export class ScreenshotMockup {
  readonly src=input.required<string>();
  readonly alt=input.required<string>();
  readonly srcset=input<string>();
  readonly width=input(1440);
  readonly height=input(1000);
  readonly label=input('Podgląd strony');
  readonly compact=input(false);
  readonly eager=input(false);
  readonly fullSize=input(false);
  readonly workflow=input(false);
  readonly shipping=input(false);
  readonly sizes=input('(min-width: 1264px) 1080px, (min-width: 768px) calc(100vw - 160px), calc(100vw - 64px)');
}
