import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { IndustryId } from './configurator.store';
import { buildCoreScene, INDUSTRY_SCENE_BUILDERS } from './industry-scenes';
import {
  CAMERA_PRESETS,
  damp,
  INDUSTRY_ROTATIONS,
} from './scene-layout';
import { disposeGroup, ScenePrimitives, setGroupOpacity } from './scene-primitives';
import { IndustryRuntime, SceneFrame } from './scene-types';

interface TransitioningIndustry extends IndustryRuntime {
  opacity: number;
  scale: number;
  exiting: boolean;
}

export class BusinessSceneRuntime {
  private readonly primitives = new ScenePrimitives();
  private renderer?: THREE.WebGLRenderer;
  private camera?: THREE.PerspectiveCamera;
  private scene?: THREE.Scene;
  private world?: THREE.Group;
  private platform?: THREE.Group;
  private stars?: THREE.Points;
  private keyLight?: THREE.PointLight;
  private rimLight?: THREE.PointLight;
  private environmentTarget?: THREE.WebGLRenderTarget;
  private destroyed = false;
  private visible = true;
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private motionQuery?: MediaQueryList;
  private frameId = 0;
  private startedAt = 0;
  private previousFrame = 0;
  private currentIndustry: IndustryId | null | undefined;
  private currentStep = 0;
  private reducedMotion = false;
  private narrowPanel = false;
  private pointerEnabled = false;
  private readonly pointer = new THREE.Vector2();
  private readonly pointerTarget = new THREE.Vector2();
  private readonly lookTarget = new THREE.Vector3(0, -0.08, 0);
  private readonly desiredPosition = new THREE.Vector3();
  private readonly desiredTarget = new THREE.Vector3();
  private readonly industries: TransitioningIndustry[] = [];
  private readonly mockups = new Map<IndustryId | null, IndustryRuntime>();

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
    this.invalidate();
  };

  constructor(
    private readonly host: { nativeElement: HTMLElement },
    private readonly sceneCanvas: { nativeElement: HTMLCanvasElement },
    private readonly state: {
      industry: () => IndustryId | null;
      step: () => number;
    },
  ) {}

  update(): void {
    if (!this.world || this.destroyed) return;
    this.sync(this.state.industry(), this.state.step());
  }

  sync(industry: IndustryId | null, step: number): void {
    if (!this.world || this.destroyed) return;
    this.currentStep = step;
    if (industry !== this.currentIndustry) this.swapIndustry(industry);
    // Paint the already prepared group inside the click handler. Waiting for
    // the next animation frame leaves the previous mock-up visible for one
    // extra browser paint while the labels have already changed.
    if (this.renderer && this.scene && this.camera)
      this.renderer.render(this.scene, this.camera);
    this.invalidate();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.motionQuery?.removeEventListener('change', this.motionChange);
    const host = this.host?.nativeElement;
    host?.removeEventListener('pointermove', this.pointerMove);
    host?.removeEventListener('pointerleave', this.pointerLeave);
    this.mockups.forEach((mockup) => mockup.group.removeFromParent());
    if (this.scene) disposeGroup(this.scene);
    this.mockups.forEach((mockup) => disposeGroup(mockup.group));
    this.mockups.clear();
    this.intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.visibilityChange);
    if (this.scene) this.scene.environment = null;
    this.environmentTarget?.dispose();
    this.industries.length = 0;
    this.scene?.clear();
    this.renderer?.dispose();
    this.renderer = undefined;
  }

  init(): void {
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
    const environment = new RoomEnvironment();
    try {
      this.environmentTarget = pmrem.fromScene(environment, 0.035);
      this.scene.environment = this.environmentTarget.texture;
    } finally {
      environment.dispose();
      pmrem.dispose();
    }

    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.platform = new THREE.Group();
    this.world.add(this.platform);
    this.buildPlatform(this.platform);
    this.buildLighting();
    this.prepareMockups();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
    this.swapIndustry(this.state.industry());
    this.currentStep = this.state.step();
    this.startedAt = performance.now();
    this.previousFrame = this.startedAt;
    document.addEventListener('visibilitychange', this.visibilityChange);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.visibilityChange();
    });
    this.intersectionObserver.observe(host);
    this.invalidate();
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
    // Replace the complete mock-up between frames. Fading every material and
    // scaling the group from almost zero made complex scenes look as if they
    // were being assembled in two separate passes.
    this.industries.forEach((runtime) => {
      this.world?.remove(runtime.group);
    });
    this.industries.length = 0;
    const built = this.getMockup(id);
    built.group.scale.setScalar(this.currentStep >= 2 ? 1.15 : 1);
    setGroupOpacity(built.group, 1);
    this.world?.add(built.group);
    this.industries.push({
      ...built,
      id,
      opacity: 1,
      scale: 1,
      exiting: false,
    });
  }

  private prepareMockups(): void {
    this.getMockup(null);
    (Object.keys(INDUSTRY_SCENE_BUILDERS) as IndustryId[]).forEach((id) => this.getMockup(id));
  }

  private getMockup(id: IndustryId | null): IndustryRuntime {
    const cached = this.mockups.get(id);
    if (cached) return cached;
    const built = id
      ? INDUSTRY_SCENE_BUILDERS[id](this.primitives)
      : buildCoreScene(this.primitives);
    const mockup: IndustryRuntime = { ...built, id };
    this.mockups.set(id, mockup);
    return mockup;
  }

  private readonly visibilityChange = (): void => {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    this.previousFrame = performance.now();
    this.invalidate();
  };

  // All callers run outside Angular; only one frame may be queued at a time.
  private invalidate(): void {
    if (this.destroyed || !this.renderer || this.frameId || !this.visible || document.hidden)
      return;
    this.frameId = requestAnimationFrame(this.animate);
  }

  private readonly animate = (now: number): void => {
    this.frameId = 0;
    if (this.destroyed || !this.visible || document.hidden) return;
    if (!this.renderer || !this.scene || !this.camera || !this.world) return;
    const delta = Math.min((now - this.previousFrame) / 1000, 0.05);
    const frame: SceneFrame = {
      time: (now - this.startedAt) / 1000,
      delta,
      reducedMotion: this.reducedMotion,
    };
    this.previousFrame = now;
    this.updateIndustries(frame);
    this.updateCamera(frame);
    if (this.stars && !this.reducedMotion) this.stars.rotation.y -= delta * 0.018;
    this.renderer.render(this.scene, this.camera);
    if (!this.reducedMotion) this.invalidate();
  };

  private updateIndustries(frame: SceneFrame): void {
    for (let index = this.industries.length - 1; index >= 0; index--) {
      const runtime = this.industries[index];
      const target = runtime.exiting ? 0 : 1;
      runtime.scale = this.reducedMotion ? target : damp(runtime.scale, target, 7, frame.delta);
      const previousOpacity = runtime.opacity;
      runtime.opacity = this.reducedMotion ? target : damp(runtime.opacity, target, 8, frame.delta);
      if (Math.abs(runtime.opacity - target) < 0.001) runtime.opacity = target;
      const contextScale = this.currentStep >= 2 ? 1.15 : 1;
      const targetScale = runtime.scale * contextScale;
      runtime.group.scale.setScalar(
        this.reducedMotion ? targetScale : damp(runtime.group.scale.x, targetScale, 7, frame.delta),
      );
      const targetY = 0;
      runtime.group.position.y = this.reducedMotion
        ? targetY
        : damp(runtime.group.position.y, targetY, 7, frame.delta);
      const targetZ = 0;
      runtime.group.position.z = this.reducedMotion
        ? targetZ
        : damp(runtime.group.position.z, targetZ, 7, frame.delta);
      // Some model animators multiply material opacity, so restore their base each frame.
      if (runtime.animate || runtime.opacity !== previousOpacity)
        setGroupOpacity(runtime.group, runtime.opacity);
      if (!runtime.exiting) runtime.animate?.(frame);
      if (runtime.exiting && runtime.opacity < 0.015) {
        this.world?.remove(runtime.group);
        disposeGroup(runtime.group);
        this.industries.splice(index, 1);
      }
    }
  }

  private updateCamera(frame: SceneFrame): void {
    if (!this.camera || !this.world) return;
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
    const desiredPosition = this.desiredPosition.set(
      preset.position[0] + parallaxX,
      cameraHeight - parallaxY,
      preset.position[2] + distance,
    );
    const desiredTarget = this.desiredTarget.set(
      preset.target[0] + parallaxX * 0.12,
      preset.target[1] - parallaxY * 0.15,
      preset.target[2],
    );
    const smoothing = 5.5;
    this.camera.position.lerp(
      desiredPosition,
      this.reducedMotion ? 1 : 1 - Math.exp(-smoothing * frame.delta),
    );
    this.lookTarget.lerp(
      desiredTarget,
      this.reducedMotion ? 1 : 1 - Math.exp(-smoothing * frame.delta),
    );
    this.camera.lookAt(this.lookTarget);
    this.pointer.lerp(this.pointerTarget, this.reducedMotion ? 1 : 1 - Math.exp(-7 * frame.delta));
    const industryRotation =
      this.currentStep >= 2
        ? 0
        : this.currentIndustry
          ? INDUSTRY_ROTATIONS[this.currentIndustry]
          : 0;
    this.world.rotation.y = this.reducedMotion
      ? preset.worldRotation + industryRotation
      : damp(
          this.world.rotation.y,
          preset.worldRotation + industryRotation,
          this.reducedMotion ? 100 : 4.5,
          frame.delta,
        );
    this.world.rotation.x = this.reducedMotion
      ? -0.08
      : damp(this.world.rotation.x, -0.08, this.reducedMotion ? 100 : 5, frame.delta);
    const scale = this.reducedMotion
      ? preset.worldScale * narrowScale
      : damp(
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
    this.invalidate();
  }
}
