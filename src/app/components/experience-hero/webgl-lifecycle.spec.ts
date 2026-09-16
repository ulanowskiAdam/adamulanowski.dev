import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { vi } from 'vitest';
import * as THREE from 'three';
import { BusinessScene } from './business-scene';
import { CafeTiles } from './cafe-tiles';
import { CafeTilesRuntime } from './cafe-tiles.runtime';
import { BusinessSceneRuntime } from './business-scene.runtime';
import { disposeGroup } from './scene-primitives';

describe('WebGL resource ownership', () => {
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
      { industry: () => null, addonIds: () => new Set(), activeAddonId: () => null, step: () => 0 },
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
