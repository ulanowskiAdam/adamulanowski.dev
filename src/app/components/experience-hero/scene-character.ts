import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ScenePrimitivesContract } from './scene-types';

/** The same soft proportions and physical materials for the host and cafe staff. */
export function buildCharacter(p: ScenePrimitivesContract, variant: 'host' | 'barista' | 'practitioner' | 'craftsman'): THREE.Group {
  const group = new THREE.Group();
  group.name = variant === 'barista' ? 'cafe-barista' : variant === 'practitioner' ? 'studio-practitioner' : variant === 'craftsman' ? 'workshop-craftsman' : 'intro-host';
  const skin = p.material(0xc78f69, 0.72);
  const hair = p.material(0x30231c, 0.85);
  const linen = p.material(0xe7dec9, 0.85);
  const green = p.material(variant === 'practitioner' ? 0xd5dfcf : variant === 'craftsman' ? 0xa9764d : 0x416451, 0.85);
  const apron = p.material(0xa36243, 0.83);
  const trousers = p.material(0x242e28, 0.82);
  const shoes = p.material(0x3e2d23, 0.48);
  const shirt = variant !== 'barista' ? green : linen;
  const rounded = (size: THREE.Vector3Tuple, pos: THREE.Vector3Tuple, material: THREE.Material, radius = 0.04) =>
    p.add(group, new RoundedBoxGeometry(...size, 3, radius), material, pos);
  const ellipsoid = (size: THREE.Vector3Tuple, pos: THREE.Vector3Tuple, material: THREE.Material) => {
    const mesh = p.add(group, new THREE.SphereGeometry(1, 24, 16), material, pos);
    mesh.scale.set(...size); return mesh;
  };
  const tube = (points: THREE.Vector3Tuple[], radius: number, material: THREE.Material) =>
    p.add(group, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v))), 24, radius, 8, false), material, [0, 0, 0]);

  [-0.075, 0.075].forEach(x => {
    rounded([0.085, variant !== 'barista' ? 0.5 : 0.42, 0.10], [x, variant !== 'barista' ? 0.29 : 0.25, 0], trousers, 0.04);
    ellipsoid([0.065, 0.04, 0.1], [x, 0.04, 0.025], shoes);
  });
  if (variant !== 'barista') {
    // Tailored shoulders and waist instead of an oval torso.
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, 0.48);
    shape.quadraticCurveTo(-0.12, 0.47, -0.115, 0.57);
    shape.lineTo(-0.145, 0.84);
    shape.quadraticCurveTo(-0.145, 0.89, -0.09, 0.91);
    shape.lineTo(0.09, 0.91);
    shape.quadraticCurveTo(0.145, 0.89, 0.145, 0.84);
    shape.lineTo(0.115, 0.57);
    shape.quadraticCurveTo(0.12, 0.47, 0.1, 0.48);
    shape.closePath();
    p.add(group, new THREE.ExtrudeGeometry(shape, { depth: 0.145, bevelEnabled: true, bevelSize: 0.013, bevelThickness: 0.013, bevelSegments: 3, curveSegments: 8 }), shirt, [0, 0, -0.0725]);
  } else {
    ellipsoid([0.18, 0.27, 0.115], [0, 0.66, 0], shirt);
  }
  if (variant === 'barista') {
    rounded([0.26, 0.41, 0.026], [0, 0.62, 0.113], apron, 0.045);
    [-0.084, 0.084].forEach(x => rounded([0.028, 0.2, 0.021], [x, 0.84, 0.105], apron, 0.01));
    rounded([0.12, 0.08, 0.012], [0, 0.61, 0.133], shoes, 0.018);
  } else {
    rounded([0.055, 0.25, 0.021], [0, 0.78, 0.09], linen, 0.016);
    const collarLeft = rounded([0.072, 0.09, 0.028], [-0.049, 0.875, 0.098], shirt, 0.02);
    collarLeft.rotation.z = -0.35;
    const collarRight = rounded([0.072, 0.09, 0.028], [0.049, 0.875, 0.098], shirt, 0.02);
    collarRight.rotation.z = 0.35;
    [0.72, 0.63, 0.54].forEach(y => ellipsoid([0.009, 0.009, 0.006], [0.019, y, 0.093], shoes));
    rounded([0.068, 0.065, 0.01], [-0.08, 0.74, 0.092], green, 0.012);
  }
  p.cylinder(group, 0.053, 0.12, [0, 0.94, 0], skin, 20);
  ellipsoid([0.117, 0.15, 0.112], [0, 1.075, 0.012], skin);
  const cap = p.add(group, new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.53), hair, [0, 1.11, 0]);
  cap.scale.set(0.122, 0.12, 0.12);
  ellipsoid([0.026, 0.036, 0.034], [0, 1.07, 0.119], skin);
  [-0.044, 0.044].forEach(x => ellipsoid([0.009, 0.012, 0.007], [x, 1.1, 0.116], hair));
  [-0.116, 0.116].forEach(x => ellipsoid([0.023, 0.039, 0.025], [x, 1.067, 0.012], skin));

  if (variant === 'barista') {
    for (const side of [-1, 1]) {
      tube([[side * 0.14, 0.84, 0], [side * 0.22, 0.87, 0.1], [side * 0.2, 0.86, 0.22]], 0.048, shirt);
      tube([[side * 0.2, 0.86, 0.22], [side * 0.15, 0.84, 0.35]], 0.032, skin);
      ellipsoid([0.037, 0.027, 0.048], [side * 0.15, 0.84, 0.35], skin);
    }
  } else {
    // Relaxed left arm and an open, welcoming right hand; readable without motion.
    tube([[-0.13, 0.84, 0], [-0.185, 0.69, 0.015], [-0.185, 0.57, 0.04]], 0.036, shirt);
    tube([[-0.185, 0.57, 0.04], [-0.18, 0.46, 0.06]], 0.025, skin);
    ellipsoid([0.035, 0.05, 0.03], [-0.18, 0.44, 0.06], skin);
    tube([[0.13, 0.84, 0], [0.22, 0.73, 0.03], [0.3, 0.75, 0.075]], 0.036, shirt);
    tube([[0.3, 0.75, 0.075], [0.4, 0.82, 0.105]], 0.025, skin);
    const palm = ellipsoid([0.035, 0.063, 0.025], [0.415, 0.865, 0.108], skin);
    palm.rotation.z = -0.2;
    ellipsoid([0.018, 0.031, 0.021], [0.374, 0.855, 0.11], skin).rotation.z = 0.5;
  }
  return group;
}
