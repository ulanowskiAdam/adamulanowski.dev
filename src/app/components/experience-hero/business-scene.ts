import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ADDON_SCENE_BUILDERS } from './addon-scenes';
import { AddonId, IndustryId } from './configurator.store';
import { buildCoreScene, INDUSTRY_SCENE_BUILDERS } from './industry-scenes';
import {
  ADDON_SLOT_INDEX,
  ADDON_SLOTS,
  CAMERA_PRESETS,
  damp,
  INDUSTRY_ROTATIONS,
} from './scene-layout';
import { disposeGroup, ScenePrimitives, setGroupOpacity } from './scene-primitives';
import { AddonRuntime, BuiltScene, IndustryRuntime, SceneFrame } from './scene-types';

interface TransitioningIndustry extends IndustryRuntime {
  opacity: number;
  scale: number;
  exiting: boolean;
}

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
export class BusinessScene implements AfterViewInit, OnDestroy {
  @ViewChild('host') host?: ElementRef<HTMLElement>;
  @ViewChild('sceneCanvas') sceneCanvas?: ElementRef<HTMLCanvasElement>;
  readonly industry = input<IndustryId | null>(null);
  readonly addonIds = input<ReadonlySet<AddonId>>(new Set());
  readonly addonLabels = input<readonly { id: AddonId; shortLabel: string }[]>([]);
  readonly activeAddonId = input<AddonId | null>(null);
  readonly step = input(0);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly primitives = new ScenePrimitives();
  private renderer?: THREE.WebGLRenderer;
  private camera?: THREE.PerspectiveCamera;
  private scene?: THREE.Scene;
  private world?: THREE.Group;
  private platform?: THREE.Group;
  private addonLayer?: THREE.Group;
  private stars?: THREE.Points;
  private keyLight?: THREE.PointLight;
  private rimLight?: THREE.PointLight;
  private environmentTexture?: THREE.Texture;
  private resizeObserver?: ResizeObserver;
  private motionQuery?: MediaQueryList;
  private frameId = 0;
  private startedAt = 0;
  private previousFrame = 0;
  private currentIndustry: IndustryId | null | undefined;
  private activeAddon: AddonId | null = null;
  private currentStep = 0;
  private reducedMotion = false;
  private narrowPanel = false;
  private pointerEnabled = false;
  private readonly pointer = new THREE.Vector2();
  private readonly pointerTarget = new THREE.Vector2();
  private readonly lookTarget = new THREE.Vector3(0, -0.08, 0);
  private readonly industries: TransitioningIndustry[] = [];
  private readonly addons = new Map<AddonId, AddonRuntime>();

  private readonly pointerMove = (event: PointerEvent): void => {
    if (!this.pointerEnabled) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.pointerTarget.set(
      ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    );
  };

  private readonly pointerLeave = (): void => {
    this.pointerTarget.set(0, 0);
  };
  private readonly motionChange = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    if (this.reducedMotion) this.pointerTarget.set(0, 0);
  };

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    effect(() => {
      const industry = this.industry();
      const selected = this.addonIds();
      this.activeAddon = this.activeAddonId();
      this.currentStep = this.step();
      if (!this.world) return;
      if (industry !== this.currentIndustry) this.swapIndustry(industry);
      this.syncAddons(selected);
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) this.init();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.motionQuery?.removeEventListener('change', this.motionChange);
    const host = this.host?.nativeElement;
    host?.removeEventListener('pointermove', this.pointerMove);
    host?.removeEventListener('pointerleave', this.pointerLeave);
    if (this.scene) disposeGroup(this.scene);
    this.environmentTexture?.dispose();
    this.renderer?.dispose();
  }

  private init(): void {
    const host = this.host?.nativeElement;
    if (!host) return;
    this.motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener('change', this.motionChange);
    this.pointerEnabled = matchMedia('(pointer: fine)').matches;
    host.addEventListener('pointermove', this.pointerMove);
    host.addEventListener('pointerleave', this.pointerLeave);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x090c0a, 0.052);
    this.camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    this.camera.position.set(...CAMERA_PRESETS[0].position);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.sceneCanvas!.nativeElement,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x090c0a, 0);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    // Angular owns the canvas node, preserving it across hydration and option changes.
    // Explicit CSS sizing keeps DPR buffer dimensions out of layout calculations.
    Object.assign(this.renderer.domElement.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      filter: 'saturate(.96) contrast(1.04)',
    });

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environmentTexture = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    this.scene.environment = this.environmentTexture;
    pmrem.dispose();

    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.platform = new THREE.Group();
    this.world.add(this.platform);
    this.buildPlatform(this.platform);
    this.addonLayer = new THREE.Group();
    this.world.add(this.addonLayer);
    this.buildLighting();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
    this.swapIndustry(this.industry());
    this.syncAddons(this.addonIds());
    this.activeAddon = this.activeAddonId();
    this.currentStep = this.step();
    this.startedAt = performance.now();
    this.previousFrame = this.startedAt;
    this.animate(this.startedAt);
  }

  private buildPlatform(group: THREE.Group): void {
    const base = this.primitives.cylinder(
      group,
      2.45,
      0.22,
      [0, -1.18, 0],
      this.primitives.material(0x343a36, 0.8, 0.18),
      48,
    );
    base.scale.z = 0.72;
    const top = this.primitives.cylinder(
      group,
      2.34,
      0.08,
      [0, -1.03, 0],
      this.primitives.material(0x78817a, 0.68, 0.12),
      48,
    );
    top.scale.z = 0.72;
    const ring = this.primitives.torus(
      group,
      2.41,
      0.022,
      [0, -1.08, 0],
      this.primitives.roleMaterial('accent', true),
    );
    ring.scale.z = 0.72;
  }

  private buildLighting(): void {
    if (!this.scene) return;
    const positions = new Float32Array(150 * 3);
    for (let index = 0; index < positions.length; index += 3) {
      const radius = 3 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      positions[index] = Math.cos(angle) * radius;
      positions[index + 1] = (Math.random() - 0.5) * 5;
      positions[index + 2] = Math.sin(angle) * radius - 1.2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xcfff47,
      size: 0.023,
      transparent: true,
      opacity: 0.34,
    });
    material.userData['baseOpacity'] = material.opacity;
    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
    this.scene.add(new THREE.HemisphereLight(0xe6f1ea, 0x111512, 2));
    this.keyLight = new THREE.PointLight(0xcfff47, 24, 12);
    this.keyLight.position.set(3.4, 4.2, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.scene.add(this.keyLight);
    this.rimLight = new THREE.PointLight(0x48ffb0, 16, 10);
    this.rimLight.position.set(-4, 0.2, 3);
    this.scene.add(this.rimLight);
  }

  private swapIndustry(id: IndustryId | null): void {
    this.currentIndustry = id;
    if (this.platform) this.platform.visible = false;
    this.industries.forEach((runtime) => (runtime.exiting = true));
    const built = id
      ? INDUSTRY_SCENE_BUILDERS[id](this.primitives)
      : buildCoreScene(this.primitives);
    built.group.scale.setScalar(this.reducedMotion ? 1 : 0.01);
    setGroupOpacity(built.group, this.reducedMotion ? 1 : 0);
    this.world?.add(built.group);
    this.industries.push({
      ...built,
      id,
      opacity: this.reducedMotion ? 1 : 0,
      scale: this.reducedMotion ? 1 : 0.01,
      exiting: false,
    });
  }

  private syncAddons(selected: ReadonlySet<AddonId>): void {
    if (this.currentIndustry === 'gastronomia') selected = new Set();
    this.addons.forEach((runtime, id) => (runtime.exiting = !selected.has(id)));
    selected.forEach((id) => {
      const existing = this.addons.get(id);
      if (existing) {
        existing.exiting = false;
        return;
      }
      const built = ADDON_SCENE_BUILDERS[id](this.primitives);
      const slotIndex = ADDON_SLOT_INDEX[id];
      const slot = ADDON_SLOTS[slotIndex];
      built.group.position.set(slot[0], slot[1] - (this.reducedMotion ? 0 : 0.15), slot[2]);
      built.group.scale.setScalar(this.reducedMotion ? 1 : 0.01);
      const activeIndicator = this.primitives.box(
        built.group,
        [0.94, 0.055, 0.04],
        [0, -0.475, 0.29],
        this.primitives.roleMaterial('accent'),
        false,
      );
      (activeIndicator.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.15;
      // Solid models enter by scaling, avoiding per-mesh alpha sorting of reliefs.
      setGroupOpacity(built.group, 1);
      this.addonLayer?.add(built.group);
      this.addons.set(id, {
        ...built,
        id,
        slotIndex,
        activeIndicator,
        opacity: this.reducedMotion ? 1 : 0,
        scale: this.reducedMotion ? 1 : 0.01,
        exiting: false,
      });
    });
  }

  private readonly animate = (now: number): void => {
    if (!this.renderer || !this.scene || !this.camera || !this.world) return;
    const delta = Math.min((now - this.previousFrame) / 1000, 0.05);
    const frame: SceneFrame = {
      time: (now - this.startedAt) / 1000,
      delta,
      reducedMotion: this.reducedMotion,
    };
    this.previousFrame = now;
    this.updateIndustries(frame);
    this.updateAddons(frame);
    this.updateCamera(frame);
    if (this.stars && !this.reducedMotion) this.stars.rotation.y -= delta * 0.018;
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
    this.frameId = requestAnimationFrame(this.animate);
  };

  private updateIndustries(frame: SceneFrame): void {
    for (let index = this.industries.length - 1; index >= 0; index--) {
      const runtime = this.industries[index];
      const target = runtime.exiting ? 0 : 1;
      runtime.scale = this.reducedMotion ? target : damp(runtime.scale, target, 7, frame.delta);
      runtime.opacity = this.reducedMotion ? target : damp(runtime.opacity, target, 8, frame.delta);
      const cafe = runtime.id === 'gastronomia';
      const contextScale = cafe ? 1 : this.currentStep >= 2 ? 0.65 : 1;
      runtime.group.scale.setScalar(runtime.scale * contextScale);
      runtime.group.position.y = cafe ? 0 : this.currentStep >= 2 ? -0.25 : 0;
      runtime.group.position.z = cafe ? 0 : this.currentStep >= 2 ? -0.35 : 0;
      setGroupOpacity(runtime.group, runtime.opacity);
      if (!runtime.exiting) runtime.animate?.(frame);
      if (runtime.exiting && runtime.opacity < 0.015) {
        this.world?.remove(runtime.group);
        disposeGroup(runtime.group);
        this.industries.splice(index, 1);
      }
    }
  }

  private updateAddons(frame: SceneFrame): void {
    this.addons.forEach((runtime, id) => {
      const active = id === this.activeAddon && !runtime.exiting;
      const cafe = id.startsWith('gastronomia-');
      const targetScale = runtime.exiting ? 0 : (active ? 1.05 : 1) * 0.72 * (cafe ? 0.87 : 1);
      const targetOpacity = runtime.exiting ? 0 : 1;
      runtime.scale = this.reducedMotion
        ? targetScale
        : damp(runtime.scale, targetScale, 9, frame.delta);
      runtime.opacity = this.reducedMotion
        ? targetOpacity
        : damp(runtime.opacity, targetOpacity, 10, frame.delta);
      const slot = ADDON_SLOTS[runtime.slotIndex];
      const targetY = slot[1] - (cafe ? 0.07 : 0);
      runtime.group.position.y = this.reducedMotion
        ? targetY
        : damp(runtime.group.position.y, targetY, 9, frame.delta);
      runtime.group.scale.setScalar(runtime.scale);
      runtime.activeIndicator.visible = active && !cafe;
      // Cancel the industry's yaw for legible faces while keeping a small 3D tilt.
      runtime.group.rotation.y =
        -this.world!.rotation.y + (runtime.slotIndex % 2 === 0 ? 0.1 : -0.1);
      runtime.animate?.(frame);
      if (runtime.exiting && runtime.opacity < 0.015) {
        this.addonLayer?.remove(runtime.group);
        disposeGroup(runtime.group);
        this.addons.delete(id);
      }
    });
  }

  private updateLabels(): void {
    if (!this.camera || !this.host) return;
    // Measure the full projected model, including its active indicator. A fixed
    // pixel gap remains legible at every scale and perspective, including mobile.
    for (const label of this.host.nativeElement.querySelectorAll<HTMLElement>('.addon-label')) {
      const runtime = this.addons.get(label.dataset['addonId'] as AddonId);
      if (!runtime || runtime.exiting) {
        label.style.visibility = 'hidden';
        continue;
      }
      const anchor = new THREE.Vector3()
        .setFromMatrixPosition(runtime.group.matrixWorld)
        .project(this.camera);
      const bounds = new THREE.Box3().setFromObject(runtime.group);
      let bottom = -Infinity;
      for (const x of [bounds.min.x, bounds.max.x])
        for (const y of [bounds.min.y, bounds.max.y])
          for (const z of [bounds.min.z, bounds.max.z]) {
            const corner = new THREE.Vector3(x, y, z).project(this.camera);
            bottom = Math.max(bottom, (1 - corner.y) * 0.5);
          }
      label.style.left = `${(anchor.x + 1) * 50}%`;
      label.style.top = `calc(${bottom * 100}% + 8px)`;
      label.style.opacity = String(runtime.opacity);
      label.style.visibility = 'visible';
    }
  }

  private updateCamera(frame: SceneFrame): void {
    if (!this.camera || !this.world) return;
    if (this.currentIndustry === 'gastronomia') {
      // Long focal distance gives an isometric feel; fit the square floor at every aspect.
      const distance = Math.max(7.1, 7.0 / this.camera.aspect);
      this.camera.position.set(-distance * 0.57, distance * 0.65, distance * 0.75);
      this.camera.lookAt(0, -0.48, 0.4);
      this.world.rotation.set(0, 0, 0);
      this.world.scale.setScalar(1);
      if (this.stars) this.stars.visible = false;
      return;
    }
    if (this.stars) this.stars.visible = true;
    const preset = CAMERA_PRESETS[Math.min(5, Math.max(0, this.currentStep))];
    const distance = Math.max(
      0,
      2.8 / (Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect) -
        preset.position[2],
    );
    const narrowScale = 1;
    const parallaxX =
      this.pointerEnabled && !this.reducedMotion
        ? this.pointer.x * (this.narrowPanel ? 0.07 : 0.17)
        : 0;
    const parallaxY = this.pointerEnabled && !this.reducedMotion ? this.pointer.y * 0.08 : 0;
    const cameraHeight =
      this.currentIndustry === null ? 1.75 : this.currentStep === 1 ? 2.2 : preset.position[1];
    const desiredPosition = new THREE.Vector3(
      preset.position[0] + parallaxX,
      cameraHeight - parallaxY,
      preset.position[2] + distance,
    );
    const desiredTarget = new THREE.Vector3(
      preset.target[0] + parallaxX * 0.12,
      preset.target[1] - parallaxY * 0.15,
      preset.target[2],
    );
    const smoothing = this.reducedMotion ? 100 : 5.5;
    this.camera.position.lerp(desiredPosition, 1 - Math.exp(-smoothing * frame.delta));
    this.lookTarget.lerp(desiredTarget, 1 - Math.exp(-smoothing * frame.delta));
    this.camera.lookAt(this.lookTarget);
    this.pointer.lerp(this.pointerTarget, this.reducedMotion ? 1 : 1 - Math.exp(-7 * frame.delta));
    const industryRotation =
      this.currentStep >= 2
        ? 0
        : this.currentIndustry
          ? INDUSTRY_ROTATIONS[this.currentIndustry]
          : 0;
    this.world.rotation.y = damp(
      this.world.rotation.y,
      preset.worldRotation + industryRotation,
      this.reducedMotion ? 100 : 4.5,
      frame.delta,
    );
    this.world.rotation.x = damp(
      this.world.rotation.x,
      -0.08,
      this.reducedMotion ? 100 : 5,
      frame.delta,
    );
    const scale = damp(
      this.world.scale.x,
      preset.worldScale * narrowScale,
      this.reducedMotion ? 100 : 5,
      frame.delta,
    );
    this.world.scale.setScalar(scale);
  }

  private resize(): void {
    const host = this.host?.nativeElement;
    if (!host || !this.renderer || !this.camera) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    this.narrowPanel = width / height < 0.9;
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.narrowPanel ? 1.5 : 1.75));
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
