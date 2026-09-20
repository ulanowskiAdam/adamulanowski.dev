import * as THREE from 'three';
import { AddonId } from './configurator.store';
import { ADDON_SCENE_BUILDERS } from './addon-scenes';
import { disposeGroup, ScenePrimitives } from './scene-primitives';

export class CafeTilesRuntime {
  private renderer?: THREE.WebGLRenderer;
  private observer?: ResizeObserver;
  private scenes: THREE.Scene[] = [];
  constructor(
    private readonly surface: { nativeElement: HTMLElement },
    private readonly items: readonly { id: AddonId }[],
  ) {}
  init(): void {
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
    this.items.forEach((item) => {
      const scene = new THREE.Scene();
      this.scenes.push(scene);
      scene.add(new THREE.HemisphereLight(0xfff7e9, 0x666b61, 3));
      const light = new THREE.DirectionalLight(0xffeed7, 3);
      light.position.set(-3, 5, 6);
      scene.add(light);
      const model = ADDON_SCENE_BUILDERS[item.id](p).group;
      model.rotation.y = -0.12;
      scene.add(model);
    });
    this.observer = new ResizeObserver(() => this.render());
    this.observer.observe(host);
    this.render();
  }
  private render(): void {
    if (!this.renderer || !this.surface) return;
    const host = this.surface.nativeElement,
      r = host.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    this.renderer.setSize(r.width, r.height, false);
    this.renderer.setScissorTest(false);
    this.renderer.clear();
    this.renderer.setScissorTest(true);
    host.querySelectorAll('.miniature').forEach((el, i) => {
      const b = el.getBoundingClientRect();
      if (b.width <= 0 || b.height <= 0) return;
      const aspect = b.width / b.height;
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
  destroy(): void {
    this.observer?.disconnect();
    this.scenes.forEach((s) => disposeGroup(s));
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.renderer = undefined;
    this.scenes = [];
  }
}
