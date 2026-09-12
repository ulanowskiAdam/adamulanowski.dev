import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildCharacter } from './scene-character';
import { BuiltScene, ScenePrimitivesContract } from './scene-types';

/** A warm appointment studio sharing the cafe's joinery, floor and human proportions. */
export function buildAppointmentStudio(p: ScenePrimitivesContract): BuiltScene {
  const group = new THREE.Group();
  const plaster = p.material(0x74877d, 0.92);
  const oak = p.material(0x9b7048, 0.58);
  const walnut = p.material(0x4b3729, 0.66);
  const cream = p.material(0xe9dec8, 0.72);
  const sage = p.material(0x9bab95, 0.84);
  const porcelain = p.material(0xf2e8d6, 0.25);
  const metal = p.material(0x263a33, 0.45, 0.35);
  const brass = p.material(0xba9157, 0.31, 0.65);
  const warm = p.material(0xffdfae, 0.5);
  warm.emissive.setHex(0xffd299); warm.emissiveIntensity = 0.35;
  const rounded = (parent: THREE.Group, size: THREE.Vector3Tuple, pos: THREE.Vector3Tuple, material: THREE.Material, radius = 0.04) =>
    p.add(parent, new RoundedBoxGeometry(...size, 3, radius), material, pos);
  const lathe = (parent: THREE.Group, points: THREE.Vector2Tuple[], pos: THREE.Vector3Tuple, material: THREE.Material) =>
    p.add(parent, new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), 32), material, pos);
  const tube = (parent: THREE.Group, points: THREE.Vector3Tuple[], radius: number, material: THREE.Material) =>
    p.add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v))), 20, radius, 8, false), material, [0, 0, 0]);

  rounded(group, [3.35, 0.11, 2.65], [0, -1.035, 0.27], p.material(0x847564, 0.9), 0.05).name = 'studio-floor';
  const seams = p.material(0x675d50, 0.95);
  for (let i = 0; i < 5; i++) rounded(group, [3.22, 0.008, 0.012], [0, -0.976, -0.65 + i * 0.48], seams, 0.003);
  rounded(group, [2.85, 2.05, 0.17], [0, 0.045, -0.78], plaster, 0.1);

  // An opaque satin mirror avoids sorting glass over the room behind it.
  const arch = (radius: number, bottom: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-radius, bottom); shape.lineTo(radius, bottom); shape.lineTo(radius, 0.42);
    shape.absarc(0, 0.42, radius, 0, Math.PI, false); shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 3, curveSegments: 16 });
  };
  p.add(group, arch(0.48, -0.36), brass, [-0.66, 0, -0.665]);
  p.add(group, arch(0.43, -0.31), p.material(0xa8c1b7, 0.22, 0.55), [-0.66, 0, -0.613]);

  // A reclined, upholstered treatment chair with a hydraulic pedestal.
  const chair = new THREE.Group(); chair.name = 'studio-treatment-chair';
  chair.position.set(-0.62, -0.98, 0.39); chair.rotation.y = -0.12; group.add(chair);
  lathe(chair, [[0.3, 0], [0.31, 0.03], [0.24, 0.055], [0.065, 0.09]], [0, 0, 0.04], metal);
  p.cylinder(chair, 0.06, 0.35, [0, 0.255, 0.04], brass, 24);
  rounded(chair, [0.57, 0.085, 0.48], [0, 0.445, 0.03], metal, 0.04);
  rounded(chair, [0.62, 0.15, 0.58], [0, 0.545, 0.04], cream, 0.07);
  rounded(chair, [0.62, 0.71, 0.15], [0, 0.965, -0.285], cream, 0.07).rotation.x = -0.32;
  rounded(chair, [0.4, 0.22, 0.17], [0, 1.35, -0.415], sage, 0.07).rotation.x = -0.32;
  rounded(chair, [0.56, 0.12, 0.53], [0, 0.38, 0.535], cream, 0.055).rotation.x = 0.4;
  [-0.38, 0.38].forEach(x => {
    tube(chair, [[x * 0.74, 0.43, -0.1], [x, 0.61, -0.1], [x, 0.71, 0.07]], 0.02, brass);
    rounded(chair, [0.115, 0.09, 0.43], [x, 0.74, 0.06], sage, 0.04);
  });
  // A folded towel at the foot end makes the function readable in a still frame.
  rounded(chair, [0.4, 0.065, 0.2], [0, 0.435, 0.66], sage, 0.025).rotation.x = 0.4;

  const desk = new THREE.Group(); desk.name = 'studio-reception'; desk.position.set(0.84, 0, -0.03); group.add(desk);
  rounded(desk, [1.04, 0.65, 0.5], [0, -0.615, 0], walnut, 0.11);
  rounded(desk, [1.1, 0.085, 0.58], [0, -0.247, 0], porcelain, 0.04);
  rounded(desk, [0.94, 0.06, 0.44], [0, -0.95, 0], metal, 0.025);
  for (let i = 0; i < 9; i++) rounded(desk, [0.065, 0.53, 0.04], [-0.41 + i * 0.1025, -0.61, 0.263], oak, 0.018);
  rounded(desk, [0.84, 0.022, 0.025], [0, -0.305, 0.271], warm, 0.01);
  rounded(desk, [0.28, 0.028, 0.2], [-0.25, -0.19, 0.015], metal, 0.012);
  const tablet = new THREE.Group(); tablet.position.set(-0.25, -0.08, 0.01); tablet.rotation.x = -0.18; desk.add(tablet);
  rounded(tablet, [0.25, 0.22, 0.025], [0, 0, 0], metal, 0.022);
  rounded(tablet, [0.21, 0.17, 0.012], [0, 0.005, 0.026], sage, 0.012);
  for (let i = 0; i < 2; i++) rounded(tablet, [0.13, 0.019, 0.008], [0, 0.035 - i * 0.05, 0.044], porcelain, 0.005);

  const practitioner = buildCharacter(p, 'practitioner');
  practitioner.position.set(0.88, -0.98, -0.49); practitioner.rotation.y = -0.1; group.add(practitioner);

  // Wall shelf: lotion bottles and rolled linens, restrained to a few large forms.
  rounded(group, [0.84, 0.045, 0.25], [0.75, 0.7, -0.53], oak, 0.019);
  [0.5, 0.76].forEach((x, i) => {
    lathe(group, [[0.055, 0], [0.062, 0.015], [0.062, 0.17], [0.034, 0.19], [0.034, 0.23]], [x, 0.73, -0.52], i ? sage : porcelain);
    rounded(group, [0.09, 0.025, 0.035], [x + 0.018, 0.97, -0.52], brass, 0.01);
  });
  const towel = p.cylinder(group, 0.073, 0.2, [1.02, 0.8, -0.5], porcelain, 24); towel.rotation.z = Math.PI / 2;
  rounded(group, [0.035, 0.15, 0.15], [1.02, 0.8, -0.5], sage, 0.018);

  // A movable tray on casters, separated from the chair's armrest and the desk.
  const trolley = new THREE.Group(); trolley.name = 'studio-trolley'; trolley.position.set(0.36, -0.98, 1.06); group.add(trolley);
  [0.18, 0.5].forEach(y => rounded(trolley, [0.4, 0.04, 0.3], [0, y, 0], porcelain, 0.025));
  for (const x of [-0.16, 0.16]) for (const z of [-0.11, 0.11]) {
    p.link(trolley, [x, 0.07, z], [x, 0.49, z], 0.012, brass);
    const wheel = p.cylinder(trolley, 0.035, 0.026, [x, 0.035, z], metal, 16); wheel.rotation.z = Math.PI / 2;
  }
  lathe(trolley, [[0.065, 0], [0.082, 0.045], [0.076, 0.05], [0.061, 0.015]], [0.06, 0.53, 0], sage);
  rounded(trolley, [0.16, 0.065, 0.16], [-0.09, 0.555, 0.015], cream, 0.02);

  // A stemmed plant and a warm wall sconce soften the studio.
  const leaf = p.material(0x456751, 0.85);
  lathe(group, [[0.11, 0], [0.15, 0.25], [0.13, 0.27]], [1.29, -0.98, 0.97], p.material(0xaa7655, 0.83));
  for (let i = 0; i < 5; i++) {
    const a = i * 2.4, x = 1.29 + Math.cos(a) * 0.12, z = 0.97 + Math.sin(a) * 0.1, y = -0.44 + (i % 3) * 0.1;
    p.link(group, [1.29, -0.76, 0.97], [x, y, z], 0.007, leaf);
    const foliage = p.add(group, new THREE.SphereGeometry(1, 12, 8), leaf, [x, y, z]);
    foliage.scale.set(0.062, 0.155, 0.032); foliage.rotation.z = Math.cos(a) * 0.5;
  }
  p.cylinder(group, 0.045, 0.38, [1.21, 0.37, -0.55], warm, 24, false);
  [0.16, 0.58].forEach(y => p.cylinder(group, 0.06, 0.028, [1.21, y, -0.55], brass, 24));
  const light = new THREE.PointLight(0xffd5a6, 0.6, 2.4, 2); light.position.set(1.21, 0.38, -0.42); group.add(light);
  return { group };
}
