import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildCharacter } from './scene-character';
import { BuiltScene, ScenePrimitivesContract } from './scene-types';

export function buildIntroScene(p: ScenePrimitivesContract): BuiltScene {
  const group = new THREE.Group();
  const floor = p.material(0x847564, 0.9);
  const seams = p.material(0x675d50, 0.95);
  p.add(group, new RoundedBoxGeometry(3.05, 0.11, 2.25, 3, 0.05), floor, [0, -1.035, 0.18]).name = 'intro-floor';
  for (let i = 0; i < 4; i++) p.add(group, new RoundedBoxGeometry(2.92, 0.008, 0.012, 2, 0.003), seams, [0, -0.976, -0.5 + i * 0.46]);
  const host = buildCharacter(p, 'host');
  host.position.set(-0.12, -0.98, 0.05);
  host.rotation.y = -0.16;
  host.scale.setScalar(1.65);
  group.add(host);
  return { group };
}
