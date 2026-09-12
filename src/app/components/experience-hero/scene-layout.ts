import * as THREE from 'three';
import { AddonId, IndustryId } from './configurator.store';

export const ADDON_SLOTS: readonly THREE.Vector3Tuple[] = [
  [-1.32, 0.9, 1.1],
  [1.32, 0.9, 1.1],
  [-1.32, -0.49, 1.1],
  [1.32, -0.49, 1.1],
] as const;

export const ADDON_SLOT_INDEX: Record<AddonId, number> = {
  'gastronomia-zamowienia-online': 0,
  'gastronomia-rezerwacje': 1,
  'gastronomia-asystent-ai': 2,
  'gastronomia-kontakt-po-wizycie': 3,
  'wizyty-rezerwacje': 0,
  'wizyty-przypomnienia': 1,
  'wizyty-asystent-ai': 2,
  'wizyty-powrot-klienta': 3,
  'fachowcy-formularz-zapytania': 0,
  'fachowcy-konfigurator-wyceny': 1,
  'fachowcy-status-realizacji': 2,
  'fachowcy-obsluga-zlecen': 3,
};

export interface CameraPreset {
  readonly position: THREE.Vector3Tuple;
  readonly target: THREE.Vector3Tuple;
  readonly worldScale: number;
  readonly worldRotation: number;
}

export const CAMERA_PRESETS: readonly CameraPreset[] = [
  { position: [0, 0.75, 7.8], target: [0, -0.08, 0], worldScale: 1, worldRotation: 0 },
  { position: [0, 0.72, 7.25], target: [0, -0.12, 0], worldScale: 1, worldRotation: 0 },
  { position: [0, 0.72, 7.8], target: [0, 0.1, 0.15], worldScale: 1, worldRotation: 0 },
  { position: [0.5, 1.02, 7.45], target: [0, -0.12, 0], worldScale: 1, worldRotation: -0.16 },
  { position: [-0.25, 0.84, 8.1], target: [0, -0.1, 0.08], worldScale: 0.96, worldRotation: 0.08 },
  { position: [0.7, 1.02, 7.35], target: [0, -0.1, 0.06], worldScale: 1, worldRotation: -0.12 },
] as const;

export const INDUSTRY_ROTATIONS: Record<IndustryId, number> = {
  gastronomia: -0.3,
  wizyty: 0.3,
  fachowcy: -0.12,
};

export function damp(current: number, target: number, smoothing: number, delta: number): number {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-smoothing * delta));
}
