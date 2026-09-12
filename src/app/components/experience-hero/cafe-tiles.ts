import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { AddonId } from './configurator.store';
import { ADDON_SCENE_BUILDERS } from './addon-scenes';
import { disposeGroup, ScenePrimitives } from './scene-primitives';

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
export class CafeTiles implements AfterViewInit, OnDestroy {
  @ViewChild('surface') surface?: ElementRef<HTMLElement>;
  readonly selected = input<ReadonlySet<AddonId>>(new Set());
  readonly toggle = output<AddonId>();
  readonly items: { id: AddonId; label: string }[] = [
    { id: 'gastronomia-zamowienia-online', label: 'Mobilne zamówienia' },
    { id: 'gastronomia-rezerwacje', label: 'Rezerwacje online' },
    { id: 'gastronomia-asystent-ai', label: 'Asystent AI' },
    { id: 'gastronomia-kontakt-po-wizycie', label: 'Automatyczna obsługa po wizycie' },
  ];
  private readonly platform = inject(PLATFORM_ID);
  private renderer?: THREE.WebGLRenderer;
  private observer?: ResizeObserver;
  private scenes: THREE.Scene[] = [];
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platform) || !this.surface) return;
    const host = this.surface.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const canvas = this.renderer.domElement;
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    });
    canvas.setAttribute('aria-hidden', 'true');
    host.append(canvas);
    const p = new ScenePrimitives();
    this.scenes = this.items.map((item) => {
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xfff7e9, 0x666b61, 3));
      const light = new THREE.DirectionalLight(0xffeed7, 3);
      light.position.set(-3, 5, 6);
      scene.add(light);
      const model = ADDON_SCENE_BUILDERS[item.id](p).group;
      model.rotation.y = -0.12;
      scene.add(model);
      return scene;
    });
    this.observer = new ResizeObserver(() => this.render());
    this.observer.observe(host);
    this.render();
  }
  private render(): void {
    if (!this.renderer || !this.surface) return;
    const host = this.surface.nativeElement,
      r = host.getBoundingClientRect();
    this.renderer.setSize(r.width, r.height, false);
    this.renderer.setScissorTest(false);
    this.renderer.clear();
    this.renderer.setScissorTest(true);
    host.querySelectorAll('.miniature').forEach((el, i) => {
      const b = el.getBoundingClientRect(),
        aspect = b.width / b.height;
      const h = Math.max(1.45, 1.55 / aspect);
      const camera = new THREE.OrthographicCamera(
        (-h * aspect) / 2,
        (h * aspect) / 2,
        h / 2,
        -h / 2,
        0.1,
        30,
      );
      camera.position.set(0, 1.1, 7);
      camera.lookAt(0, 0, 0);
      this.renderer!.setViewport(b.left - r.left, r.bottom - b.bottom, b.width, b.height);
      this.renderer!.setScissor(b.left - r.left, r.bottom - b.bottom, b.width, b.height);
      this.renderer!.render(this.scenes[i], camera);
    });
    this.renderer.setScissorTest(false);
  }
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.scenes.forEach((s) => disposeGroup(s));
    this.renderer?.dispose();
  }
}
