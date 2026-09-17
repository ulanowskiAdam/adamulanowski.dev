import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { vi } from 'vitest';
import * as THREE from 'three';
import { BusinessScene } from './business-scene';
import { CafeTiles } from './cafe-tiles';
import { CafeTilesRuntime } from './cafe-tiles.runtime';
import { BusinessSceneRuntime } from './business-scene.runtime';
import { batchStaticMeshes, disposeGroup, ScenePrimitives } from './scene-primitives';

describe('WebGL resource ownership', () => {
  it('batches static mobile meshes while preserving animated nodes', () => {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial();
    group.add(
      new THREE.Mesh(new THREE.BoxGeometry(), material),
      new THREE.Mesh(new THREE.BoxGeometry(), material),
    );
    const animated = new THREE.Mesh(new THREE.SphereGeometry(), material);
    animated.userData['dynamic'] = true;
    group.add(animated);

    batchStaticMeshes(group);

    const meshes: THREE.Mesh[] = [];
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object);
    });
    expect(meshes).toHaveLength(2);
    expect(animated.parent).toBe(group);
    disposeGroup(group);
  });

  it('uses the cheaper standard material in the mobile scene profile', () => {
    const material = new ScenePrimitives(true).material(0xffffff);
    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(material).not.toBeInstanceOf(THREE.MeshPhysicalMaterial);
    material.dispose();
  });

  it('disposes shared geometry, materials, textures and shadow targets once', () => {
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry();
    const texture = new THREE.Texture();
    const material = new THREE.MeshStandardMaterial({ map: texture, normalMap: texture });
    group.add(new THREE.Mesh(geometry, material), new THREE.Mesh(geometry, [material]));
    const light = new THREE.PointLight();
    group.add(light);
    const disposals = [geometry, texture, material, light.shadow].map((resource) =>
      vi.spyOn(resource, 'dispose'),
    );
    disposeGroup(group);
    disposals.forEach((disposal) => expect(disposal).toHaveBeenCalledTimes(1));
  });

  it('disposes textures referenced by shader uniforms and line materials', () => {
    const texture = new THREE.Texture();
    const material = new THREE.ShaderMaterial({
      uniforms: { maps: { value: [texture, texture] } },
    });
    const line = new THREE.Line(new THREE.BufferGeometry(), material);
    const disposal = vi.spyOn(texture, 'dispose');
    disposeGroup(line);
    expect(disposal).toHaveBeenCalledTimes(1);
  });
});

describe('SSR WebGL isolation', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('renders both component shells on the server without initializing a runtime', async () => {
    const init = vi.spyOn(BusinessSceneRuntime.prototype, 'init').mockImplementation(() => {
      throw new Error('WebGL must not initialize on the server');
    });
    const tilesInit = vi.spyOn(CafeTilesRuntime.prototype, 'init').mockImplementation(() => {
      throw new Error('WebGL must not initialize on the server');
    });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    for (const component of [BusinessScene, CafeTiles]) {
      const fixture = TestBed.createComponent(component as typeof BusinessScene);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.destroy();
    }
    expect(init).not.toHaveBeenCalled();
    expect(tilesInit).not.toHaveBeenCalled();
  });
});

describe('scene frame scheduling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function scene() {
    const runtime = new BusinessSceneRuntime(
      { nativeElement: document.createElement('div') },
      { nativeElement: document.createElement('canvas') },
      { industry: () => null, step: () => 0 },
    );
    // Use a renderer double: these tests exercise scheduling without requiring a GPU.
    const state = runtime as any;
    state.renderer = { render: vi.fn(), dispose: vi.fn() };
    state.scene = new THREE.Scene();
    state.camera = new THREE.PerspectiveCamera();
    state.world = new THREE.Group();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    return { runtime, state };
  }

  it('shows each industry as one complete model and uses identical step transitions', () => {
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const transforms = ['gastronomia', 'wizyty', 'fachowcy'].map(id => {
      const { runtime, state } = scene();
      state.currentStep = 2;
      state.swapIndustry(id);
      expect(state.industries).toHaveLength(1);
      expect(state.industries[0].opacity).toBe(1);
      expect(state.industries[0].scale).toBe(1);
      state.industries[0].group.traverse((object: THREE.Object3D) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material: THREE.Material) =>
          expect(material.opacity).toBe(material.userData['baseOpacity'] ?? 1),
        );
      });
      const frames = [];
      for (let index = 0; index < 60; index++) {
        const frame = { time: index / 60, delta: 1 / 60, reducedMotion: false };
        state.updateIndustries(frame);
        state.updateCamera(frame);
        const model = state.industries[0].group;
        frames.push([model.position.toArray(), model.scale.toArray(),
          state.camera.position.toArray(), state.world.rotation.toArray()]);
      }
      runtime.destroy();
      return frames;
    });
    expect(transforms[0]).toEqual(transforms[1]);
    expect(transforms[1]).toEqual(transforms[2]);
  });

  it('prebuilds mock-ups once and reuses them when the selection changes', () => {
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const { runtime, state } = scene();
    state.prepareMockups();
    const gastronomy = state.mockups.get('gastronomia') as { group: THREE.Group };

    state.swapIndustry('gastronomia');
    state.swapIndustry('wizyty');
    state.swapIndustry('gastronomia');

    expect(state.mockups.size).toBe(4);
    expect(state.industries).toHaveLength(1);
    expect(state.industries[0].group).toBe(gastronomy.group);
    runtime.destroy();
  });

  it('coalesces invalidations and sleeps after a reduced-motion frame', () => {
    const raf = vi.fn().mockReturnValue(1);
    vi.stubGlobal('requestAnimationFrame', raf);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const { runtime, state } = scene();
    state.reducedMotion = true;
    state.invalidate();
    state.invalidate();
    expect(raf).toHaveBeenCalledTimes(1);
    state.animate(100);
    expect(state.renderer.render).toHaveBeenCalledTimes(1);
    expect(raf).toHaveBeenCalledTimes(1);
    runtime.destroy();
  });

  it('cancels queued frames and never schedules after destruction', () => {
    const raf = vi.fn().mockReturnValue(42);
    const cancel = vi.fn();
    vi.stubGlobal('requestAnimationFrame', raf);
    vi.stubGlobal('cancelAnimationFrame', cancel);
    const { runtime, state } = scene();
    state.invalidate();
    runtime.destroy();
    runtime.destroy();
    state.invalidate();
    state.animate(100);
    expect(cancel).toHaveBeenCalledWith(42);
    expect(raf).toHaveBeenCalledTimes(1);
  });

  it('does not schedule frames while the scene is offscreen or the tab is hidden', () => {
    const raf = vi.fn();
    vi.stubGlobal('requestAnimationFrame', raf);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const { runtime, state } = scene();
    state.visible = false;
    state.invalidate();
    state.visible = true;
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    state.invalidate();
    expect(raf).not.toHaveBeenCalled();
    runtime.destroy();
  });
});
