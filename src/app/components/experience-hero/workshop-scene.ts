import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildCharacter } from './scene-character';
import { BuiltScene, ScenePrimitivesContract } from './scene-types';

export function buildWorkshop(p: ScenePrimitivesContract): BuiltScene {
  const group = new THREE.Group();
  const wall = p.material(0x4c6257, 0.92);
  const oak = p.material(0xa57543, 0.52);
  const walnut = p.material(0x493526, 0.72);
  const steel = p.material(0xa2aca7, 0.34, 0.68);
  const dark = p.material(0x20342b, 0.57, 0.22);
  const terracotta = p.material(0xb37148, 0.72);
  const paper = p.material(0xe5dcc7, 0.88);
  const warm = p.material(0xffd59d, 0.5);
  warm.emissive.setHex(0xffca8a); warm.emissiveIntensity = 0.35;
  const rounded = (parent: THREE.Group, size: THREE.Vector3Tuple, pos: THREE.Vector3Tuple, material: THREE.Material, radius = 0.035) =>
    p.add(parent, new RoundedBoxGeometry(...size, 3, radius), material, pos);
  const tube = (parent: THREE.Group, points: THREE.Vector3Tuple[], radius: number, material: THREE.Material) =>
    p.add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v))), 20, radius, 8, false), material, [0, 0, 0]);

  rounded(group, [3.35, 0.11, 2.65], [0, -1.035, 0.27], p.material(0x847564, 0.9), 0.05).name = 'workshop-floor';
  const seam = p.material(0x675d50, 0.95);
  for (let i = 0; i < 5; i++) rounded(group, [3.22, 0.008, 0.012], [0, -0.976, -0.65 + i * 0.48], seam, 0.003);
  rounded(group, [2.85, 2.05, 0.17], [0, 0.045, -0.78], wall, 0.1);

  // A real tool board: the holes are subordinate to three large tool silhouettes.
  rounded(group, [1.7, 1.02, 0.08], [-0.4, 0.36, -0.65], walnut, 0.04);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 9; col++) {
    const hole = p.cylinder(group, 0.013, 0.008, [-1.12 + col * 0.18, 0.08 + row * 0.18, -0.602], dark, 12, false);
    hole.rotation.x = Math.PI / 2;
  }
  rounded(group, [0.055, 0.43, 0.055], [-0.95, 0.37, -0.545], oak, 0.024);
  rounded(group, [0.29, 0.105, 0.095], [-0.95, 0.61, -0.53], steel, 0.025);
  rounded(group, [0.07, 0.16, 0.067], [-0.95, 0.22, -0.54], terracotta, 0.028);
  // Open-ended spanner, with a fork at each end rather than an abstract ring.
  rounded(group, [0.052, 0.32, 0.045], [-0.45, 0.41, -0.53], steel, 0.02);
  for (const y of [0.21, 0.61]) {
    rounded(group, [0.14, 0.055, 0.055], [-0.45, y, -0.53], steel, 0.02);
    [-0.052, 0.052].forEach(x => rounded(group, [0.04, 0.09, 0.055], [-0.45 + x, y + (y > 0.4 ? 0.045 : -0.045), -0.53], steel, 0.012));
  }
  // A broad handsaw blade with a shaped wooden handle and a short toothed edge.
  const blade = new THREE.Shape();
  blade.moveTo(-0.12, 0.64); blade.lineTo(0.19, 0.51); blade.lineTo(0.11, 0.14);
  for (let i = 0; i < 8; i++) blade.lineTo(0.07 - i * 0.022, 0.14 + i * 0.055 + (i % 2 ? 0.016 : 0));
  blade.closePath();
  p.add(group, new THREE.ExtrudeGeometry(blade, { depth: 0.025, bevelEnabled: false }), steel, [0.09, 0, -0.54]);
  tube(group, [[0.01, 0.68, -0.5], [0.14, 0.72, -0.5], [0.22, 0.65, -0.5], [0.14, 0.55, -0.5], [0.01, 0.6, -0.5], [0.01, 0.68, -0.5]], 0.025, oak);

  // Solid joiner's bench: rounded oak, braced steel legs and a lower storage shelf.
  const bench = new THREE.Group(); bench.name = 'workshop-bench'; bench.position.set(-0.35, 0, 0.12); group.add(bench);
  rounded(bench, [1.8, 0.12, 0.73], [0, -0.22, 0], oak, 0.05);
  for (const x of [-0.72, 0.72]) for (const z of [-0.25, 0.25]) rounded(bench, [0.085, 0.65, 0.085], [x, -0.615, z], dark, 0.025);
  rounded(bench, [1.56, 0.055, 0.58], [0, -0.79, 0], walnut, 0.022);
  rounded(bench, [1.48, 0.065, 0.055], [0, -0.43, 0.28], dark, 0.018);
  // Tool chest on the lower shelf, with a raised handle and visible latch.
  rounded(bench, [0.56, 0.23, 0.35], [-0.22, -0.646, 0.02], terracotta, 0.04);
  rounded(bench, [0.58, 0.055, 0.37], [-0.22, -0.51, 0.02], dark, 0.022);
  tube(bench, [[-0.33, -0.48, 0.02], [-0.33, -0.4, 0.02], [-0.11, -0.4, 0.02], [-0.11, -0.48, 0.02]], 0.018, steel);
  rounded(bench, [0.055, 0.065, 0.025], [-0.22, -0.59, 0.211], steel, 0.009);

  // A recognizable bench vice and a timber workpiece, safely held still.
  const vice = new THREE.Group(); vice.position.set(-0.63, -0.13, 0.1); bench.add(vice);
  p.cylinder(vice, 0.13, 0.045, [0, 0, 0], steel, 28);
  rounded(vice, [0.19, 0.12, 0.18], [0, 0.08, 0], dark, 0.025);
  [-0.08, 0.08].forEach(z => rounded(vice, [0.27, 0.065, 0.055], [0, 0.17, z], steel, 0.012));
  rounded(vice, [0.28, 0.105, 0.075], [0, 0.17, 0], oak, 0.012);
  p.link(vice, [0, 0.07, 0.07], [0, 0.07, 0.24], 0.022, steel);
  p.link(vice, [-0.1, 0.07, 0.24], [0.1, 0.07, 0.24], 0.014, steel);

  // Cordless drill with a battery, grip and forward-facing chuck.
  const drill = new THREE.Group(); drill.position.set(0.2, -0.157, -0.02); drill.rotation.y = -0.25; bench.add(drill);
  rounded(drill, [0.2, 0.055, 0.16], [0, 0.025, 0], dark, 0.019);
  rounded(drill, [0.085, 0.19, 0.085], [0, 0.135, 0], terracotta, 0.028).rotation.z = -0.15;
  rounded(drill, [0.27, 0.13, 0.13], [0.055, 0.25, 0], terracotta, 0.043);
  const chuck = p.cylinder(drill, 0.045, 0.065, [0.225, 0.25, 0], dark, 20); chuck.rotation.z = Math.PI / 2;
  p.link(drill, [0.26, 0.25, 0], [0.35, 0.25, 0], 0.012, steel);
  rounded(bench, [0.34, 0.012, 0.24], [0.56, -0.151, 0.1], paper, 0.008);
  [0.04, 0.10, 0.16].forEach(z => rounded(bench, [0.22, 0.005, 0.01], [0.56, -0.141, z], dark, 0.002));

  // Separate drawer cabinet leaves an aisle between bench and craftsman.
  const cabinet = new THREE.Group(); cabinet.name = 'workshop-cabinet'; cabinet.position.set(1.04, -0.98, 0.8); group.add(cabinet);
  rounded(cabinet, [0.62, 0.61, 0.5], [0, 0.355, 0], dark, 0.055);
  rounded(cabinet, [0.66, 0.065, 0.55], [0, 0.697, 0], oak, 0.025);
  [0.19, 0.37, 0.55].forEach(y => {
    rounded(cabinet, [0.53, 0.145, 0.035], [0, y, 0.27], terracotta, 0.018);
    rounded(cabinet, [0.23, 0.02, 0.028], [0, y + 0.025, 0.305], steel, 0.008);
  });
  for (const x of [-0.23, 0.23]) for (const z of [-0.17, 0.17]) {
    const wheel = p.cylinder(cabinet, 0.045, 0.035, [x, 0.045, z], dark, 16); wheel.rotation.z = Math.PI / 2;
  }
  // Folded cloth on the cabinet, one purposeful small prop.
  rounded(cabinet, [0.32, 0.055, 0.25], [0, 0.758, 0.02], paper, 0.02);

  const worker = buildCharacter(p, 'craftsman');
  worker.position.set(0.91, -0.98, -0.28); worker.rotation.y = -0.14; group.add(worker);

  // Warm task light on an articulated arm, rather than a glowing status cube.
  p.link(group, [-1.22, 0.21, -0.52], [-1.22, 0.93, -0.52], 0.018, dark);
  p.link(group, [-1.22, 0.93, -0.52], [-0.66, 0.96, -0.2], 0.018, dark);
  p.add(group, new THREE.CylinderGeometry(0.075, 0.18, 0.15, 32, 1, true), dark, [-0.66, 0.865, -0.2]);
  p.cylinder(group, 0.15, 0.018, [-0.66, 0.782, -0.2], warm, 32, false);
  const lamp = new THREE.PointLight(0xffd4a0, 0.7, 2.4, 2); lamp.position.set(-0.66, 0.75, -0.15); group.add(lamp);

  return { group };
}
