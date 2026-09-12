import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildCharacter } from './scene-character';
import { BuiltScene, ScenePrimitivesContract } from './scene-types';

/** A small lifestyle shop with physical products and a distinct checkout. */
export function buildShop(p: ScenePrimitivesContract): BuiltScene {
  const group = new THREE.Group();
  const sage = p.material(0x53695b, 0.86);
  const oak = p.material(0xac7e50, 0.62);
  const dark = p.material(0x293e32, 0.72);
  const cream = p.material(0xe5dcc8, 0.8);
  const clay = p.material(0xb87553, 0.68);
  const brass = p.material(0xb29b66, 0.34, 0.6);
  const rounded = (parent: THREE.Group, size: THREE.Vector3Tuple, pos: THREE.Vector3Tuple, material: THREE.Material, radius = 0.035) =>
    p.add(parent, new RoundedBoxGeometry(...size, 3, radius), material, pos);
  const tube = (parent: THREE.Group, points: THREE.Vector3Tuple[], radius: number, material: THREE.Material) =>
    p.add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v))), 20, radius, 8, false), material, [0, 0, 0]);

  rounded(group, [3.35, 0.11, 2.65], [0, -1.035, 0.27], p.material(0x96816a, 0.9), 0.05).name = 'shop-floor';
  const seam = p.material(0x766653, 0.95);
  for (let i = 0; i < 5; i++) rounded(group, [3.22, 0.008, 0.012], [0, -0.976, -0.65 + i * 0.48], seam, 0.003);
  rounded(group, [2.85, 2.05, 0.17], [0, 0.045, -0.78], sage, 0.1);

  // A framed oak shelving unit, with enough space to read individual products.
  rounded(group, [1.52, 1.65, 0.075], [-0.6, 0.03, -0.66], dark, 0.07);
  for (const x of [-1.35, 0.15]) rounded(group, [0.07, 1.68, 0.36], [x, 0.03, -0.49], oak, 0.024);
  for (const y of [-0.76, -0.23, 0.3, 0.83]) rounded(group, [1.56, 0.065, 0.39], [-0.6, y, -0.48], oak, 0.024);
  const bottle = (x: number, base: number, material: THREE.Material) => {
    p.cylinder(group, 0.08, 0.2, [x, base + 0.1, -0.46], material, 24);
    p.add(group, new THREE.CylinderGeometry(0.035, 0.08, 0.07, 24), material, [x, base + 0.235, -0.46]);
    p.cylinder(group, 0.035, 0.065, [x, base + 0.3, -0.46], brass, 20);
    rounded(group, [0.085, 0.085, 0.012], [x, base + 0.12, -0.375], cream, 0.012);
  };
  bottle(-1.06, 0.333, clay); bottle(-0.76, 0.333, cream); bottle(-0.44, 0.333, sage);
  // Rounded ceramic vessels with an actual recessed mouth, rather than solid blocks.
  const vase = (x: number, base: number, material: THREE.Material) => {
    const profile = [[0, 0], [0.07, 0], [0.11, 0.04], [0.12, 0.16], [0.07, 0.25], [0.065, 0.29], [0.045, 0.29], [0.045, 0.245], [0.085, 0.15], [0.075, 0.04], [0, 0.035]];
    p.add(group, new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 28), material, [x, base, -0.45]);
  };
  vase(-1.03, -0.197, cream); vase(-0.65, -0.197, clay);
  rounded(group, [0.25, 0.065, 0.24], [-0.25, -0.16, -0.45], cream, 0.02);
  rounded(group, [0.25, 0.065, 0.24], [-0.25, -0.088, -0.45], clay, 0.02);
  for (const x of [-1.04, -0.57]) {
    rounded(group, [0.34, 0.3, 0.25], [x, -0.576, -0.45], cream, 0.025);
    rounded(group, [0.055, 0.3, 0.012], [x, -0.576, -0.318], clay, 0.006);
  }

  // Ribbed checkout counter; the seller has an unobstructed aisle behind it.
  const counter = new THREE.Group(); counter.name = 'shop-checkout'; counter.position.set(0.75, -0.98, 0.61); group.add(counter);
  rounded(counter, [1.13, 0.63, 0.59], [0, 0.365, 0], dark, 0.075);
  for (let i = 0; i < 11; i++) rounded(counter, [0.058, 0.52, 0.04], [-0.46 + i * 0.092, 0.37, 0.305], oak, 0.019);
  rounded(counter, [1.22, 0.075, 0.68], [0, 0.72, 0], oak, 0.045);
  rounded(counter, [1.01, 0.06, 0.49], [0, 0.05, 0], brass, 0.025);
  // Opaque screen layers have explicit spacing, including the large checkout check.
  rounded(counter, [0.24, 0.025, 0.2], [-0.4, 0.77, 0], dark, 0.02);
  p.link(counter, [-0.4, 0.78, -0.015], [-0.4, 0.92, -0.055], 0.028, brass);
  const terminal = new THREE.Group(); terminal.position.set(-0.4, 1.035, -0.025); terminal.rotation.x = -0.16; counter.add(terminal);
  rounded(terminal, [0.36, 0.29, 0.05], [0, 0, 0], dark, 0.03);
  rounded(terminal, [0.305, 0.235, 0.012], [0, 0, 0.032], cream, 0.018);
  p.link(terminal, [-0.09, 0, 0.046], [-0.025, -0.055, 0.046], 0.014, sage);
  p.link(terminal, [-0.025, -0.055, 0.046], [0.085, 0.065, 0.046], 0.014, sage);

  const bag = (parent: THREE.Group, pos: THREE.Vector3Tuple, scale: number) => {
    const item = new THREE.Group(); item.position.set(...pos); item.scale.setScalar(scale); parent.add(item);
    rounded(item, [0.31, 0.32, 0.2], [0, 0.16, 0], cream, 0.023);
    for (const z of [-0.065, 0.065]) tube(item, [[-0.075, 0.32, z], [-0.065, 0.45, z], [0.065, 0.45, z], [0.075, 0.32, z]], 0.013, clay);
    rounded(item, [0.085, 0.085, 0.012], [0, 0.18, 0.108], sage, 0.02);
  };
  bag(counter, [0.3, 0.76, 0.02], 0.8);

  // Low round product island balances the counter without hiding the shelving.
  p.cylinder(group, 0.38, 0.48, [-0.86, -0.74, 0.79], clay, 48);
  p.cylinder(group, 0.43, 0.065, [-0.86, -0.4675, 0.79], oak, 48);
  bag(group, [-0.92, -0.435, 0.75], 1);
  rounded(group, [0.2, 0.11, 0.18], [-0.6, -0.38, 0.84], sage, 0.025);
  rounded(group, [0.205, 0.025, 0.185], [-0.6, -0.313, 0.84], cream, 0.012);

  const seller = buildCharacter(p, 'host'); seller.name = 'shop-seller';
  seller.position.set(0.78, -0.98, -0.22); seller.rotation.y = -0.12; group.add(seller);
  // A warm pendant anchors the checkout area.
  p.link(group, [0.74, 1.04, -0.52], [0.74, 0.81, -0.38], 0.014, brass);
  p.add(group, new THREE.CylinderGeometry(0.07, 0.22, 0.18, 32, 1, true), clay, [0.74, 0.735, -0.38]);
  const glow = p.material(0xffdbaa, 0.6); glow.emissive.setHex(0xffcb8d); glow.emissiveIntensity = 0.3;
  p.cylinder(group, 0.19, 0.016, [0.74, 0.637, -0.38], glow, 32, false);
  const light = new THREE.PointLight(0xffd4a0, 0.55, 2.4, 2); light.position.set(0.74, 0.59, -0.3); group.add(light);
  return { group };
}

