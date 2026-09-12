import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AddonId } from './configurator.store';
import { AddonSceneBuilder, BuiltScene, ScenePrimitivesContract } from './scene-types';

// Solid relief symbols: no glass overlays, alpha sorting or animated shared materials.
// Body front: z=.07, screen front: z=.105, symbol back: z=.13.
const FACE = 0.13;
type Point = [number, number];

function setup(p: ScenePrimitivesContract) {
  const group = new THREE.Group();
  const accent = p.roleMaterial('accent');
  const dark = p.roleMaterial('dark');
  const light = p.roleMaterial('light');
  [accent, dark, light].forEach((m) => {
    m.roughness = 0.65;
    m.metalness = 0;
    m.clearcoat = 0;
    m.envMapIntensity = 0.2;
  });
  accent.emissiveIntensity = 0.08;
  p.moduleBase(group);
  return { group, accent, dark, light };
}

function relief(
  p: ScenePrimitivesContract,
  group: THREE.Group,
  points: Point[],
  material: THREE.Material,
  z = FACE,
): THREE.Mesh {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  shape.closePath();
  return p.add(
    group,
    new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false }),
    material,
    [0, 0, z],
    false,
  );
}

function stroke(
  p: ScenePrimitivesContract,
  group: THREE.Group,
  points: Point[],
  material: THREE.Material,
  z = FACE + 0.02,
  radius = 0.022,
): void {
  points
    .slice(1)
    .forEach(([x, y], i) => p.link(group, [...points[i], z], [x, y, z], radius, material));
}

function check(
  p: ScenePrimitivesContract,
  group: THREE.Group,
  x: number,
  y: number,
  size: number,
  material: THREE.Material,
  z = FACE + 0.05,
): void {
  stroke(
    p,
    group,
    [
      [x - size * 0.45, y],
      [x - size * 0.1, y - size * 0.3],
      [x + size * 0.5, y + size * 0.38],
    ],
    material,
    z,
    size * 0.1,
  );
}

function slab(
  p: ScenePrimitivesContract,
  group: THREE.Group,
  w: number,
  h: number,
  depth: number,
  pos: THREE.Vector3Tuple,
  material: THREE.Material,
  radius = 0.045,
): THREE.Mesh {
  const s = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2,
    r = Math.min(radius, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return p.add(
    group,
    new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 }),
    material,
    pos,
    false,
  );
}

function phone(p: ScenePrimitivesContract) {
  const model = setup(p);
  const { group, dark, light } = model;
  slab(p, group, 0.61, 0.94, 0.14, [0, 0.06, -0.07], dark, 0.08);
  slab(p, group, 0.51, 0.76, 0.02, [0, 0.06, 0.085], light);
  slab(p, group, 0.16, 0.035, 0.02, [0, 0.48, 0.08], light, 0.015);
  slab(p, group, 0.16, 0.025, 0.02, [0, -0.35, 0.08], light, 0.01);
  p.box(group, [0.025, 0.13, 0.06], [0.315, 0.24, 0], dark, false);
  return model;
}

function calendar(p: ScenePrimitivesContract, returning = false): BuiltScene {
  const { group, accent, dark, light } = setup(p);
  slab(p, group, 0.84, 0.77, 0.14, [0, 0.03, -0.07], light);
  slab(p, group, 0.84, 0.17, 0.035, [0, 0.33, 0.085], accent);
  [-0.24, 0.24].forEach((x) => slab(p, group, 0.055, 0.19, 0.05, [x, 0.415, 0.13], dark, 0.025));
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 3; col++) {
      const x = -0.25 + col * 0.25,
        y = 0.1 - row * 0.23;
      slab(
        p,
        group,
        0.17,
        0.16,
        0.025,
        [x, y, FACE],
        col === 1 && row === 1 ? accent : dark,
        0.015,
      );
    }
  check(p, group, 0, -0.13, 0.13, dark, 0.185);
  if (returning) {
    // A directional return arrow on the calendar, not a decorative orbit.
    slab(p, group, 0.45, 0.26, 0.025, [0.15, 0.08, 0.18], light);
    stroke(
      p,
      group,
      [
        [0.32, 0.02],
        [0.32, 0.15],
        [-0.02, 0.15],
      ],
      dark,
      0.23,
    );
    relief(
      p,
      group,
      [
        [-0.09, 0.15],
        [0.02, 0.24],
        [0.02, 0.06],
      ],
      dark,
      0.22,
    );
  }
  return { group };
}

function reminders(p: ScenePrimitivesContract): BuiltScene {
  const { group, dark, accent } = phone(p);
  const bell = new THREE.Group();
  group.add(bell);
  relief(
    p,
    bell,
    [
      [-0.19, -0.07],
      [-0.13, 0.02],
      [-0.12, 0.18],
      [-0.08, 0.25],
      [-0.025, 0.28],
      [-0.025, 0.32],
      [0.025, 0.32],
      [0.025, 0.28],
      [0.08, 0.25],
      [0.12, 0.18],
      [0.13, 0.02],
      [0.19, -0.07],
    ],
    dark,
  );
  slab(p, bell, 0.08, 0.05, 0.025, [0, -0.12, FACE], dark, 0.025);
  slab(p, group, 0.3, 0.065, 0.025, [0, -0.235, FACE], accent, 0.025);
  return {
    group,
    animate: ({ time, reducedMotion }) => {
      bell.rotation.z = reducedMotion ? 0 : Math.sin(time * 3) * 0.035;
    },
  };
}

function assistant(p: ScenePrimitivesContract): BuiltScene {
  const { group, accent, dark, light } = setup(p);
  slab(p, group, 0.93, 0.74, 0.14, [0, 0.07, -0.07], dark);
  slab(p, group, 0.83, 0.61, 0.02, [0, 0.07, 0.085], light);
  slab(p, group, 0.52, 0.19, 0.025, [-0.09, 0.23, FACE], dark);
  relief(
    p,
    group,
    [
      [-0.3, 0.17],
      [-0.3, 0.07],
      [-0.16, 0.17],
    ],
    dark,
  );
  slab(p, group, 0.53, 0.19, 0.025, [0.08, -0.07, FACE], accent);
  relief(
    p,
    group,
    [
      [0.3, -0.11],
      [0.3, -0.22],
      [0.15, -0.11],
    ],
    accent,
  );
  stroke(
    p,
    group,
    [
      [-0.25, 0.23],
      [0.07, 0.23],
    ],
    light,
    0.195,
    0.018,
  );
  stroke(
    p,
    group,
    [
      [-0.08, -0.07],
      [0.23, -0.07],
    ],
    dark,
    0.195,
    0.018,
  );
  return { group };
}

function followup(p: ScenePrimitivesContract): BuiltScene {
  const { group, accent, dark, light } = setup(p);
  slab(p, group, 0.88, 0.6, 0.14, [0, 0.02, -0.07], light);
  stroke(
    p,
    group,
    [
      [-0.4, 0.27],
      [0, -0.02],
      [0.4, 0.27],
    ],
    dark,
  );
  slab(p, group, 0.27, 0.25, 0.055, [0.27, -0.19, 0.18], accent);
  check(p, group, 0.27, -0.19, 0.19, dark, 0.27);
  return { group };
}

function clipboard(p: ScenePrimitivesContract, status = false): BuiltScene {
  const { group, accent, dark, light } = setup(p);
  slab(p, group, 0.7, 0.87, 0.14, [0, 0.04, -0.07], dark);
  slab(p, group, 0.59, 0.73, 0.02, [0, 0.02, 0.085], light);
  slab(p, group, 0.27, 0.14, 0.04, [0, 0.43, FACE], accent);
  [0.23, 0.02, -0.19].forEach((y, i) => {
    slab(p, group, 0.12, 0.12, 0.025, [-0.18, y, FACE], status && i < 2 ? accent : dark, 0.012);
    if (status && i < 2) check(p, group, -0.18, y, 0.085, dark, 0.185);
    stroke(
      p,
      group,
      [
        [-0.05, y],
        [0.22, y],
      ],
      dark,
    );
  });
  return { group };
}

function quote(p: ScenePrimitivesContract): BuiltScene {
  const { group, accent, dark, light } = setup(p);
  slab(p, group, 0.68, 0.9, 0.17, [0, 0.04, -0.1], dark);
  slab(p, group, 0.54, 0.21, 0.025, [0, 0.29, 0.09], accent);
  // Seven-segment price display, large enough to read as a calculator at hero scale.
  [-0.15, 0, 0.15].forEach((x) =>
    stroke(
      p,
      group,
      [
        [x - 0.04, 0.34],
        [x + 0.04, 0.34],
        [x + 0.04, 0.24],
      ],
      dark,
      0.16,
      0.013,
    ),
  );
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      slab(
        p,
        group,
        0.12,
        0.12,
        0.04,
        [-0.18 + col * 0.18, 0.06 - row * 0.17, 0.1],
        col === 2 ? accent : light,
        0.016,
      );
  return { group };
}

function workflow(p: ScenePrimitivesContract): BuiltScene {
  const { group, accent, dark, light } = setup(p);
  slab(p, group, 0.88, 0.78, 0.14, [0, 0.05, -0.07], dark);
  slab(p, group, 0.78, 0.68, 0.02, [0, 0.05, 0.085], light);
  [
    [-0.22, 0.25],
    [0.22, 0.25],
    [0.22, -0.16],
  ].forEach(([x, y], i) => slab(p, group, 0.21, 0.22, 0.03, [x, y, FACE], i === 2 ? accent : dark));
  stroke(
    p,
    group,
    [
      [-0.08, 0.25],
      [0.07, 0.25],
    ],
    dark,
  );
  relief(
    p,
    group,
    [
      [0.1, 0.25],
      [0.01, 0.32],
      [0.01, 0.18],
    ],
    dark,
  );
  stroke(
    p,
    group,
    [
      [0.22, 0.1],
      [0.22, 0.01],
    ],
    dark,
  );
  relief(
    p,
    group,
    [
      [0.22, -0.025],
      [0.14, 0.06],
      [0.3, 0.06],
    ],
    dark,
  );
  check(p, group, 0.22, -0.16, 0.15, dark, 0.2);
  return { group };
}

/** Solid ceramic, wood and lime miniatures exclusive to the cafe. */
function cafeModel(p: ScenePrimitivesContract, kind: number): BuiltScene {
  const group = new THREE.Group(),
    cream = p.material(0xeee6d6, 0.72),
    wood = p.material(0x916448, 0.75),
    dark = p.material(0x343c37, 0.7),
    lime = p.material(0xceef50, 0.65),
    gold = p.material(0xd8ae58, 0.38, 0.45);
  const box = (w: number, h: number, d: number, pos: THREE.Vector3Tuple, m: THREE.Material) =>
    p.add(group, new RoundedBoxGeometry(w, h, d, 3, 0.025), m, pos);
  const disc = (x: number, y: number, r: number, m: THREE.Material, z = 0.18) => {
    const o = p.cylinder(group, r, 0.065, [x, y, z], m, 32);
    o.rotation.x = Math.PI / 2;
    return o;
  };
  const ball = (r: number, pos: THREE.Vector3Tuple, m: THREE.Material) =>
    p.add(group, new THREE.SphereGeometry(r, 20, 16), m, pos);
  const stars = (x: number, y: number) => {
    for (let i = 0; i < 4; i++) {
      const points: Point[] = [];
      for (let j = 0; j < 10; j++) {
        const a = Math.PI / 2 + (j * Math.PI) / 5,
          r = j % 2 ? 0.027 : 0.06;
        points.push([x + i * 0.13 + Math.cos(a) * r, y + Math.sin(a) * r]);
      }
      relief(p, group, points, gold, 0.27);
    }
  };
  if (kind === 0) {
    box(0.57, 1.03, 0.14, [0, 0, 0], dark);
    box(0.47, 0.91, 0.035, [0, 0, 0.09], cream);
    box(0.19, 0.05, 0.03, [0, 0.44, 0.115], dark);
    box(0.33, 0.1, 0.04, [0, -0.32, 0.13], lime);
    relief(
      p,
      group,
      [
        [-0.16, 0.17],
        [0.19, 0.17],
        [0.13, -0.04],
        [-0.1, -0.04],
      ],
      gold,
      0.14,
    );
    stroke(
      p,
      group,
      [
        [-0.23, 0.24],
        [-0.17, 0.24],
        [-0.1, -0.1],
        [0.14, -0.1],
      ],
      dark,
      0.2,
      0.016,
    );
    disc(-0.07, -0.16, 0.028, dark, 0.21);
    disc(0.12, -0.16, 0.028, dark, 0.21);
  } else if (kind === 1) {
    p.cylinder(group, 0.29, 0.07, [0, -0.03, 0], cream, 40);
    p.cylinder(group, 0.035, 0.43, [0, -0.28, 0], gold, 20);
    p.cylinder(group, 0.16, 0.04, [0, -0.5, 0], dark, 24);
    for (const x of [-0.46, 0.46]) {
      box(0.24, 0.06, 0.25, [x, -0.25, 0], wood);
      box(0.24, 0.4, 0.065, [x, -0.04, -0.1], wood);
      for (const z of [-0.09, 0.09])
        for (const dx of [-0.08, 0.08])
          p.link(group, [x + dx, -0.25, z], [x + dx * 1.3, -0.52, z * 1.4], 0.018, wood);
    }
    disc(0.1, 0.43, 0.21, wood, 0);
    disc(0.1, 0.43, 0.175, cream, 0.045);
    stroke(
      p,
      group,
      [
        [0.1, 0.56],
        [0.1, 0.43],
        [0.2, 0.38],
      ],
      dark,
      0.1,
      0.017,
    );
    disc(0.44, -0.32, 0.17, lime, 0.28);
    check(p, group, 0.44, -0.32, 0.2, dark, 0.33);
  } else if (kind === 2) {
    box(0.77, 0.29, 0.13, [0.07, 0.29, 0], cream);
    stars(-0.2, 0.29);
    box(0.8, 0.3, 0.13, [-0.1, -0.15, 0.05], lime);
    relief(
      p,
      group,
      [
        [0.12, -0.27],
        [0.29, -0.37],
        [0.26, -0.2],
      ],
      lime,
      0.07,
    );
    stroke(
      p,
      group,
      [
        [-0.4, -0.1],
        [0.18, -0.1],
      ],
      dark,
      0.17,
    );
    stroke(
      p,
      group,
      [
        [-0.4, -0.2],
        [-0.06, -0.2],
      ],
      dark,
      0.17,
    );
    disc(-0.47, 0.3, 0.17, lime, 0.08);
    ball(0.1, [-0.47, 0.32, 0.17], p.material(0xd7a17c, 0.8));
    box(0.17, 0.09, 0.06, [-0.47, 0.2, 0.17], wood);
    disc(0.45, -0.18, 0.18, cream, 0.2);
    box(0.22, 0.14, 0.08, [0.45, -0.18, 0.27], dark);
    disc(0.4, -0.17, 0.022, lime, 0.33);
    disc(0.5, -0.17, 0.022, lime, 0.33);
    p.link(group, [0.45, -0.08, 0.25], [0.45, 0, 0.25], 0.015, gold);
  } else {
    const profile: THREE.Vector2Tuple[] = [
      [0.24, 0],
      [0.25, 0.04],
      [0.18, 0.1],
      [0.16, 0.35],
      [0.1, 0.46],
      [0.04, 0.48],
    ];
    p.add(
      group,
      new THREE.LatheGeometry(
        profile.map((v) => new THREE.Vector2(...v)),
        32,
      ),
      gold,
      [-0.34, -0.29, 0],
    );
    ball(0.065, [-0.34, -0.31, 0], gold);
    ball(0.045, [-0.34, 0.22, 0], gold);
    box(0.56, 0.47, 0.1, [0.3, -0.08, 0.06], cream);
    box(0.58, 0.16, 0.08, [0.3, 0.29, 0.1], cream);
    stars(0.08, 0.29);
    for (const y of [0.04, -0.08, -0.2])
      stroke(
        p,
        group,
        [
          [0.09, y],
          [0.51, y],
        ],
        wood,
        0.16,
        0.015,
      );
    disc(-0.14, 0.23, 0.115, p.material(0xc97873, 0.7), 0.2);
    stroke(
      p,
      group,
      [
        [-0.14, 0.17],
        [-0.14, 0.29],
      ],
      cream,
      0.26,
      0.016,
    );
    stroke(
      p,
      group,
      [
        [-0.2, 0.23],
        [-0.08, 0.23],
      ],
      cream,
      0.26,
      0.016,
    );
  }
  return { group };
}

export const ADDON_SCENE_BUILDERS: Record<AddonId, AddonSceneBuilder> = {
  'gastronomia-zamowienia-online': (p) => cafeModel(p, 0),
  'gastronomia-rezerwacje': (p) => cafeModel(p, 1),
  'gastronomia-asystent-ai': (p) => cafeModel(p, 2),
  'gastronomia-kontakt-po-wizycie': (p) => cafeModel(p, 3),
  'wizyty-rezerwacje': calendar,
  'wizyty-przypomnienia': reminders,
  'wizyty-asystent-ai': assistant,
  'wizyty-powrot-klienta': (p) => calendar(p, true),
  'fachowcy-formularz-zapytania': clipboard,
  'fachowcy-konfigurator-wyceny': quote,
  'fachowcy-status-realizacji': (p) => clipboard(p, true),
  'fachowcy-obsluga-zlecen': workflow,
};
