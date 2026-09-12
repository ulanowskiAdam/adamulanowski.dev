import { TestBed } from '@angular/core/testing';
import * as THREE from 'three';
import { ADDON_SCENE_BUILDERS } from './addon-scenes';
import { ExperienceHero } from './experience-hero';
import { ConfiguratorStore } from './configurator.store';
import { INDUSTRY_SCENE_BUILDERS } from './industry-scenes';
import { ADDON_SLOT_INDEX, ADDON_SLOTS, CAMERA_PRESETS } from './scene-layout';
import { disposeGroup, ScenePrimitives, setGroupOpacity } from './scene-primitives';

describe('hero configurator', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [ConfiguratorStore] }));

  it('defines four unique solutions for every industry', () => {
    const store = TestBed.inject(ConfiguratorStore);
    const solutionIds = store.industries.flatMap((industry) => industry.addons.map((addon) => addon.id));

    expect(store.industries).toHaveLength(4);
    expect(store.industries.every((industry) => industry.addons.length === 4)).toBe(true);
    expect(new Set(solutionIds).size).toBe(16);
  });

  it('maps every industry and solution to a buildable Three.js scene and a stable slot', () => {
    const store = TestBed.inject(ConfiguratorStore);
    const primitives = new ScenePrimitives();

    store.industries.forEach((industry) => {
      const base = INDUSTRY_SCENE_BUILDERS[industry.id](primitives);
      expect(base.group.children.length).toBeGreaterThan(4);
      base.animate?.({ time: 1, delta: 1 / 60, reducedMotion: false });
      base.animate?.({ time: 1, delta: 1 / 60, reducedMotion: true });
      disposeGroup(base.group);

      industry.addons.forEach((addon, index) => {
        expect(ADDON_SLOT_INDEX[addon.id]).toBe(index);
        expect(ADDON_SLOTS[index]).toBeDefined();
        const scene = ADDON_SCENE_BUILDERS[addon.id](primitives);
        expect(scene.group.children.length).toBeGreaterThan(4);
        scene.animate?.({ time: 1, delta: 1 / 60, reducedMotion: false });
        scene.animate?.({ time: 1, delta: 1 / 60, reducedMotion: true });
        disposeGroup(scene.group);
      });
    });

    expect(CAMERA_PRESETS).toHaveLength(6);
  });

  it('clears solutions selected for the previous industry', () => {
    const store = TestBed.inject(ConfiguratorStore);
    store.selectIndustry('gastronomia');
    store.toggleAddon('gastronomia-zamowienia-online');

    store.selectIndustry('wizyty');

    expect(store.selectedAddonIds().size).toBe(0);
    expect(store.activeAddonId()).toBeNull();
  });

  it('keeps cafe seating clear of the counter and within its floor', () => {
    const { group } = INDUSTRY_SCENE_BUILDERS.gastronomia(new ScenePrimitives());
    const counter = new THREE.Box3().setFromObject(group.getObjectByName('cafe-counter')!);
    const floor = new THREE.Box3().setFromObject(group.getObjectByName('cafe-floor')!);
    const seating = group.children.filter(object => ['cafe-chair', 'cafe-table'].includes(object.name));
    expect(seating).toHaveLength(3);
    seating.forEach(object => {
      const bounds = new THREE.Box3().setFromObject(object);
      expect(counter.intersectsBox(bounds)).toBe(false);
      expect(bounds.min.x).toBeGreaterThan(floor.min.x);
      expect(bounds.max.x).toBeLessThan(floor.max.x);
      expect(bounds.min.z).toBeGreaterThan(floor.min.z);
      expect(bounds.max.z).toBeLessThan(floor.max.z);
    });
    expect(group.getObjectByName('cafe-barista')).toBeDefined();
    disposeGroup(group);
  });

  it('keeps every addon opaque, bounded and unchanged over time with reduced motion', () => {
    const p = new ScenePrimitives();
    Object.values(ADDON_SCENE_BUILDERS).forEach((build) => {
      const scene = build(p);
      const snapshot = () => {
        scene.group.updateMatrixWorld(true);
        const values: unknown[] = [];
        scene.group.traverse((object) => {
          values.push(object.matrixWorld.toArray(), object.visible);
          if (object instanceof THREE.Mesh) {
            const material = object.material as THREE.Material;
            expect(material.transparent).toBe(false);
            expect(material.depthWrite).toBe(true);
            values.push(material.opacity);
          }
        });
        return values;
      };
      scene.animate?.({ time: 1, delta: 1 / 60, reducedMotion: true });
      const still = snapshot();
      scene.animate?.({ time: 40, delta: 1 / 60, reducedMotion: true });
      expect(snapshot()).toEqual(still);
      for (const time of [0, 0.5, 1, 3]) {
        scene.animate?.({ time, delta: 1 / 60, reducedMotion: false });
        const bounds = new THREE.Box3().setFromObject(scene.group);
        expect(bounds.min.x).toBeGreaterThanOrEqual(-0.51);
        expect(bounds.max.x).toBeLessThanOrEqual(0.51);
        expect(bounds.min.y).toBeGreaterThan(-0.53);
        expect(bounds.max.y).toBeLessThan(0.56);
        // The rectangular industry floors end at z=1.6 locally. At the addon
        // step their scale is .65 and z offset is -.35; modules sit in front.
        ADDON_SLOTS.forEach((slot) => expect(slot[2] + bounds.min.z * 1.05).toBeGreaterThan(1.6 * 0.65 - 0.35));
      }
      disposeGroup(scene.group);
    });
  });

  it('disables depth writes for fading surfaces and restores opaque depth writes', () => {
    const p = new ScenePrimitives();
    const group = new THREE.Group();
    const solid = p.box(group, [1, 1, 1], [0, 0, 0], p.roleMaterial('dark'));
    const glass = p.box(group, [1, 1, 1], [2, 0, 0], p.glass());
    setGroupOpacity(group, 0.5);
    expect((solid.material as THREE.Material).depthWrite).toBe(false);
    expect((glass.material as THREE.Material).depthWrite).toBe(false);
    setGroupOpacity(group, 1);
    expect((solid.material as THREE.Material).depthWrite).toBe(true);
    expect((solid.material as THREE.Material).transparent).toBe(false);
    expect((glass.material as THREE.Material).depthWrite).toBe(false);
    disposeGroup(group);
  });

  it('completes the local flow, builds mailto content, and fully restarts', () => {
    const hero = TestBed.runInInjectionContext(() => new ExperienceHero());
    hero.start();
    hero.selectIndustry('fachowcy');
    hero.toggleAddon('fachowcy-formularz-zapytania');
    hero.toggleAddon('fachowcy-obsluga-zlecen');
    hero.selectMood('Profesjonalnie i premium');
    hero.name = 'Jan';
    hero.contact = 'jan@example.com';
    hero.city = 'Gdańsk';
    hero.showResult();

    const mailto = decodeURIComponent(hero.mailtoLink);
    expect(hero.store.step()).toBe(5);
    expect(mailto).toContain('Imię: Jan');
    expect(mailto).toContain('Kontakt: jan@example.com');
    expect(mailto).toContain('Miasto: Gdańsk');
    expect(mailto).toContain('Branża: Fachowcy i usługi');
    expect(mailto).toContain('Inteligentny formularz zapytania');
    expect(mailto).toContain('Automatyzacja obsługi zleceń');
    expect(mailto).toContain('Charakter wizualny: Profesjonalnie i premium');

    hero.restart();
    expect(hero.store.step()).toBe(0);
    expect(hero.store.industryId()).toBeNull();
    expect(hero.store.selectedAddonIds().size).toBe(0);
    expect(hero.store.mood()).toBeNull();
    expect(hero.name).toBe('');
    expect(hero.contact).toBe('');
    expect(hero.city).toBe('');
  });
});
