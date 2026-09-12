import * as THREE from 'three';
import { AddonId, IndustryId } from './configurator.store';

export type SceneRole = 'primary' | 'accent' | 'dark' | 'light';

export interface SceneFrame {
  readonly time: number;
  readonly delta: number;
  readonly reducedMotion: boolean;
}

export interface BuiltScene {
  readonly group: THREE.Group;
  readonly animate?: (frame: SceneFrame) => void;
}

export type IndustrySceneBuilder = (primitives: ScenePrimitivesContract) => BuiltScene;
export type AddonSceneBuilder = (primitives: ScenePrimitivesContract) => BuiltScene;

export interface ScenePrimitivesContract {
  material(color: number, roughness?: number, metalness?: number): THREE.MeshPhysicalMaterial;
  roleMaterial(role: SceneRole, transparent?: boolean): THREE.MeshPhysicalMaterial;
  glass(): THREE.MeshPhysicalMaterial;
  add(group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, position: THREE.Vector3Tuple, shadows?: boolean): THREE.Mesh;
  box(group: THREE.Group, size: THREE.Vector3Tuple, position: THREE.Vector3Tuple, material: THREE.Material, shadows?: boolean): THREE.Mesh;
  cylinder(group: THREE.Group, radius: number, height: number, position: THREE.Vector3Tuple, material: THREE.Material, segments?: number, shadows?: boolean): THREE.Mesh;
  sphere(group: THREE.Group, radius: number, position: THREE.Vector3Tuple, material: THREE.Material, shadows?: boolean): THREE.Mesh;
  torus(group: THREE.Group, radius: number, tube: number, position: THREE.Vector3Tuple, material: THREE.Material): THREE.Mesh;
  link(group: THREE.Group, from: THREE.Vector3Tuple, to: THREE.Vector3Tuple, radius: number, material: THREE.Material): THREE.Mesh;
  person(group: THREE.Group, position: THREE.Vector3Tuple, shirt: THREE.Material, dark: THREE.Material): THREE.Group;
  screen(group: THREE.Group, position: THREE.Vector3Tuple, size?: THREE.Vector2Tuple): THREE.Group;
  moduleBase(group: THREE.Group): THREE.Mesh;
}

export interface AddonRuntime extends BuiltScene {
  readonly id: AddonId;
  readonly slotIndex: number;
  readonly activeIndicator: THREE.Mesh;
  opacity: number;
  scale: number;
  exiting: boolean;
}

export interface IndustryRuntime extends BuiltScene {
  readonly id: IndustryId | null;
}
