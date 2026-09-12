import * as THREE from 'three';
import { buildCharacter } from './scene-character';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { BuiltScene, ScenePrimitivesContract } from './scene-types';

/** A small, furnished cafe: curved joinery, ceramic, brass and warm practical lights. */
export function buildRestaurant(p: ScenePrimitivesContract): BuiltScene {
  const group = new THREE.Group();
  const plaster = p.material(0x4d6b59, 0.92);
  const inset = p.material(0x647d6b, 0.88);
  const oak = p.material(0xb58b60, 0.48);
  const walnut = p.material(0x73503b, 0.6);
  const stone = p.material(0xe7d8b9, 0.38);
  const brass = p.material(0xc38b42, 0.3, 0.72);
  const metal = p.material(0x111a16, 0.4, 0.45);
  const ceramic = p.material(0xf6ebd8, 0.24);
  const coffee = p.material(0x261109, 0.3);
  const leaf = p.material(0x3f6540, 0.7);
  const terracotta = p.material(0xa85b3d, 0.8);
  const warm = p.material(0xffd49b, 0.4);
  warm.emissive.setHex(0xffbe70); warm.emissiveIntensity = 0.6;

  const rounded = (parent: THREE.Group, size: THREE.Vector3Tuple, pos: THREE.Vector3Tuple, material: THREE.Material, radius = 0.04) =>
    p.add(parent, new RoundedBoxGeometry(...size, 3, radius), material, pos);
  const lathe = (parent: THREE.Group, points: THREE.Vector2Tuple[], pos: THREE.Vector3Tuple, material: THREE.Material) =>
    p.add(parent, new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), 32), material, pos);
  const tube = (parent: THREE.Group, points: THREE.Vector3Tuple[], radius: number, material: THREE.Material) =>
    p.add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v))), 24, radius, 8, false), material, [0, 0, 0]);

  // A floor belonging to the cafe, rather than an unrelated display podium.
  rounded(group, [3.35, 0.11, 3.35], [0, -1.035, 0.65], p.material(0xc5b6a2, 0.9), 0.05).name = 'cafe-floor';

  // Rounded plaster backdrop with an arched, recessed-looking coffee alcove.
  rounded(group, [2.85, 2.05, 0.17], [0, 0.045, -0.78], plaster, 0.1);
  const arch = new THREE.Shape();
  arch.moveTo(-0.55, -0.45); arch.lineTo(0.55, -0.45); arch.lineTo(0.55, 0.39);
  arch.absarc(0, 0.39, 0.55, 0, Math.PI, false); arch.lineTo(-0.55, -0.45);
  p.add(group, new THREE.ExtrudeGeometry(arch, { depth: 0.035, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.01, bevelSegments: 3 }), inset, [0.18, 0, -0.663]);
  const archPoints: THREE.Vector3Tuple[] = [[-0.41, -0.43, -0.6], [-0.41, 0.39, -0.6]];
  for (let i = 1; i <= 24; i++) { const a = Math.PI - i * Math.PI / 24; archPoints.push([0.18 + Math.cos(a) * 0.59, 0.39 + Math.sin(a) * 0.59, -0.6]); }
  archPoints.push([0.77, -0.43, -0.6]); tube(group, archPoints, 0.018, brass);

  // Floating shelf and jars: a few larger silhouettes instead of many tiny props.
  rounded(group, [1.12, 0.055, 0.25], [0.18, 0.34, -0.52], walnut, 0.022);
  [-0.15, 0.16, 0.47].forEach((x, i) => {
    lathe(group, [[0.075, 0], [0.082, 0.02], [0.082, 0.18 + i * 0.02], [0.06, 0.2 + i * 0.02]], [x, 0.37, -0.5], i === 1 ? ceramic : terracotta);
    p.cylinder(group, 0.087, 0.025, [x, 0.59 + i * 0.02, -0.5], walnut, 24);
  });

  // Leave a working aisle between the counter and the back wall.
  const counter = new THREE.Group(); counter.name = 'cafe-counter'; counter.position.z = 0.55; group.add(counter);
  const counterStart = group.children.length;
  // Stone counter with a curved oak front, plinth and restrained fluted joinery.
  rounded(group, [1.96, 0.65, 0.58], [0.35, -0.59, -0.24], walnut, 0.16);
  rounded(group, [2.04, 0.10, 0.69], [0.35, -0.23, -0.24], stone, 0.048);
  rounded(group, [1.78, 0.08, 0.5], [0.35, -0.94, -0.24], metal, 0.035);
  for (let i = 0; i < 16; i++) rounded(group, [0.069, 0.53, 0.052], [-0.43 + i * 0.104, -0.59, 0.065], oak, 0.024);
  rounded(group, [1.64, 0.022, 0.035], [0.35, -0.3, 0.08], warm, 0.01);

  const machineStart = group.children.length;
  // Recognizable espresso machine: rounded shell, dark inset, brewing head and tray.
  rounded(group, [0.55, 0.35, 0.32], [0.18, 0.005, -0.29], metal, 0.055);
  rounded(group, [0.46, 0.13, 0.045], [0.18, 0.11, -0.105], brass, 0.02);
  rounded(group, [0.46, 0.035, 0.2], [0.18, -0.13, -0.07], metal, 0.015);
  [-0.01, 0.29].forEach(x => p.cylinder(group, 0.035, 0.045, [x, 0.005, -0.09], brass, 16));
  p.link(group, [0.01, 0, -0.07], [0.01, 0, 0.06], 0.021, metal);
  tube(group, [[0.43, 0.08, -0.19], [0.49, 0.03, -0.05], [0.47, -0.045, 0]], 0.013, brass);

  const machineParts = group.children.slice(machineStart);
  rounded(group, [1.45, 0.65, 0.42], [0.18, -0.59, -0.49], walnut);
  rounded(group, [1.53, 0.09, 0.47], [0.18, -0.22, -0.49], stone);
  const backParts = group.children.slice(-2);
  const cup = (parent: THREE.Group, x: number, y: number, z: number, scale = 1) => {
    const mug = new THREE.Group(); mug.position.set(x, y, z); mug.scale.setScalar(scale); parent.add(mug);
    lathe(mug, [[0.04, 0], [0.065, 0.025], [0.075, 0.12], [0.06, 0.12], [0.055, 0.03]], [0, 0, 0], ceramic);
    p.cylinder(mug, 0.058, 0.008, [0, 0.103, 0], coffee, 24, false);
    p.cylinder(mug, 0.11, 0.014, [0, -0.009, 0], ceramic, 32);
    const handle = p.add(mug, new THREE.TorusGeometry(0.037, 0.012, 8, 20, Math.PI * 1.5), ceramic, [0.076, 0.067, 0], false);
    handle.rotation.z = -Math.PI * 0.75;
    return mug;
  };
  cup(group, 0.69, -0.17, -0.05, 1.3);
  cup(group, 0.13, -0.108, -0.04, 0.6);
  // A small payment terminal is a cafe prop, not a new configurator feature.
  const terminal = rounded(group, [0.2, 0.07, 0.25], [1.03, -0.125, -0.12], metal, 0.025);
  terminal.rotation.x = 0.3;
  const display = rounded(group, [0.14, 0.012, 0.14], [1.03, -0.08, -0.15], p.material(0x85b6a4, 0.25), 0.012);
  display.rotation.x = 0.3;
  // These objects were authored in the same local counter coordinates.
  group.children.slice(counterStart).filter(o => !machineParts.includes(o) && !backParts.includes(o)).forEach(object => counter.add(object));

  const barista = buildCharacter(p, 'host');
  barista.name = 'cafe-customer'; barista.position.set(1.2, -0.97, 1.12); barista.rotation.y = Math.PI;
  group.add(barista);

  // Cafe table with a stone top, pedestal and two bentwood chairs.
  const table = new THREE.Group(); table.name = 'cafe-table'; table.position.z = 0.3; group.add(table);
  p.cylinder(table, 0.36, 0.045, [-0.9, -0.54, 0.85], stone, 48);
  p.cylinder(table, 0.037, 0.41, [-0.9, -0.765, 0.85], brass, 20);
  lathe(table, [[0.21, 0], [0.22, 0.025], [0.12, 0.045], [0.04, 0.1]], [-0.9, -0.98, 0.85], metal);
  cup(table, -0.91, -0.5, 0.84, 0.8);
  const chair = (x: number, z: number, rotation: number) => {
    const g = new THREE.Group(); g.name = 'cafe-chair'; g.position.set(x, -0.97, z); g.rotation.y = rotation; group.add(g);
    p.cylinder(g, 0.18, 0.05, [0, 0.28, 0], walnut, 32);
    p.cylinder(g, 0.16, 0.035, [0, 0.32, 0], p.material(0xa6623c, 0.86), 32);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.link(g, [sx * 0.115, 0.27, sz * 0.1], [sx * 0.15, 0, sz * 0.14], 0.018, walnut);
    tube(g, [[-0.16, 0.27, -0.08], [-0.17, 0.53, -0.1], [-0.12, 0.66, -0.14], [0, 0.69, -0.16], [0.12, 0.66, -0.14], [0.17, 0.53, -0.1], [0.16, 0.27, -0.08]], 0.024, walnut);
    tube(g, [[-0.16, 0.49, -0.1], [0, 0.53, -0.17], [0.16, 0.49, -0.1]], 0.027, walnut);
  };
  chair(-1.39, 1.08, Math.PI / 2); chair(-0.43, 1.45, -Math.PI * 2 / 3);

  // Tall plant and organic foliage frame the counter without obscuring the table.
  lathe(group, [[0.1, 0], [0.14, 0.02], [0.17, 0.3], [0.145, 0.32]], [-1.13, -0.97, -0.34], terracotta);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4, x = -1.13 + Math.cos(a) * 0.17, z = -0.34 + Math.sin(a) * 0.13, y = -0.23 + (i % 3) * 0.11;
    p.link(group, [-1.13, -0.68, -0.34], [x, y, z], 0.009, leaf);
    const foliage = p.add(group, new THREE.SphereGeometry(1, 12, 8), leaf, [x, y, z]);
    foliage.scale.set(0.08, 0.2, 0.045); foliage.rotation.z = Math.cos(a) * 0.65;
  }

  // Brass pendants add warm highlights and visibly curved silhouettes.
  [-0.71, 0.97].forEach(x => {
    p.link(group, [x, 1.04, -0.26], [x, 0.69, -0.26], 0.012, metal);
    lathe(group, [[0.22, 0], [0.21, 0.045], [0.15, 0.16], [0.07, 0.2], [0.028, 0.21]], [x, 0.48, -0.26], brass);
    p.cylinder(group, 0.19, 0.018, [x, 0.475, -0.26], warm, 32, false);
    const lamp = new THREE.PointLight(0xffbf83, 0.65, 2.2, 2); lamp.position.set(x, 0.43, -0.26); group.add(lamp);
  });

  // Keep the requested rising bubbles, now clearly attached to the hot coffee.
  const steam = Array.from({ length: 4 }, (_, i) => {
    const material = p.material(0xeee4d3, 1); material.transparent = true; material.opacity = 0.34; material.depthWrite = false;
    material.userData['baseOpacity'] = 0.34; material.userData['baseDepthWrite'] = false;
    return p.add(counter, new THREE.SphereGeometry(0.025 + i * 0.004, 12, 8), material, [0.69, 0.05 + i * 0.075, -0.05], false);
  });
  return { group, animate: ({ time, reducedMotion }) => {
    steam.forEach((node, i) => {
      const phase = reducedMotion ? (i + 0.5) / 4 : (time * 0.22 + i / 4) % 1;
      node.position.set(0.69 + Math.sin(phase * 5 + i) * 0.035, 0.02 + phase * 0.38, -0.05);
      node.scale.setScalar(0.55 + phase * 0.8);
      // setGroupOpacity restores the base each frame; fade only this billow.
      (node.material as THREE.Material).opacity *= reducedMotion ? 1 : Math.sin(Math.PI * phase);
    });
  } };
}
