import * as THREE from 'three';
import { ScenePrimitivesContract, SceneRole } from './scene-types';

export class ScenePrimitives implements ScenePrimitivesContract {
  material(color: number, roughness = 0.5, metalness = 0): THREE.MeshPhysicalMaterial {
    const material = new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat: metalness > 0.3 ? 0.16 : 0 });
    this.rememberOpacity(material);
    return material;
  }

  roleMaterial(role: SceneRole, transparent = false): THREE.MeshPhysicalMaterial {
    const colors: Record<SceneRole, number> = { primary: 0x435149, accent: 0xcfff47, dark: 0x111613, light: 0xe8eee9 };
    const material = new THREE.MeshPhysicalMaterial({
      color: colors[role],
      roughness: role === 'dark' ? 0.56 : 0.3,
      metalness: role === 'accent' ? 0.34 : 0.12,
      clearcoat: role === 'accent' ? 0.38 : 0.08,
      transparent,
      opacity: transparent ? 0.84 : 1,
    });
    material.userData['role'] = role;
    this.rememberOpacity(material);
    return material;
  }

  glass(): THREE.MeshPhysicalMaterial {
    const material = new THREE.MeshPhysicalMaterial({ color: 0x82d6c0, transparent: true, opacity: 0.24, transmission: 0.74, roughness: 0.08, metalness: 0.06, thickness: 0.18 });
    this.rememberOpacity(material);
    material.depthWrite = false;
    return material;
  }

  add(group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, position: THREE.Vector3Tuple, shadows = true): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = shadows;
    mesh.receiveShadow = shadows;
    group.add(mesh);
    return mesh;
  }

  box(group: THREE.Group, size: THREE.Vector3Tuple, position: THREE.Vector3Tuple, material: THREE.Material, shadows = true): THREE.Mesh {
    return this.add(group, new THREE.BoxGeometry(...size), material, position, shadows);
  }

  cylinder(group: THREE.Group, radius: number, height: number, position: THREE.Vector3Tuple, material: THREE.Material, segments = 16, shadows = true): THREE.Mesh {
    return this.add(group, new THREE.CylinderGeometry(radius, radius, height, segments), material, position, shadows);
  }

  sphere(group: THREE.Group, radius: number, position: THREE.Vector3Tuple, material: THREE.Material, shadows = false): THREE.Mesh {
    return this.add(group, new THREE.SphereGeometry(radius, 12, 8), material, position, shadows);
  }

  torus(group: THREE.Group, radius: number, tube: number, position: THREE.Vector3Tuple, material: THREE.Material): THREE.Mesh {
    const mesh = this.add(group, new THREE.TorusGeometry(radius, tube, 8, 24), material, position, false);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }

  link(group: THREE.Group, from: THREE.Vector3Tuple, to: THREE.Vector3Tuple, radius: number, material: THREE.Material): THREE.Mesh {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const mesh = this.add(group, new THREE.CylinderGeometry(radius, radius, direction.length(), 8), material, [0, 0, 0], false);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  }

  person(group: THREE.Group, position: THREE.Vector3Tuple, shirt: THREE.Material, dark: THREE.Material): THREE.Group {
    const person = new THREE.Group();
    person.position.set(...position);
    group.add(person);
    const skin = this.material(0xd29a72, 0.7);
    const hair = this.material(0x241c19, 0.82);
    this.sphere(person, 0.14, [0, 0.68, 0], skin);
    this.sphere(person, 0.145, [0, 0.72, 0], hair);
    this.cylinder(person, 0.16, 0.42, [0, 0.34, 0], shirt, 12);
    [-0.1, 0.1].forEach((x) => this.box(person, [0.1, 0.34, 0.12], [x, 0.02, 0], dark));
    return person;
  }

  screen(group: THREE.Group, position: THREE.Vector3Tuple, size: THREE.Vector2Tuple = [0.42, 0.56]): THREE.Group {
    const screen = new THREE.Group();
    screen.position.set(...position);
    group.add(screen);
    this.box(screen, [size[0], size[1], 0.055], [0, 0, 0], this.roleMaterial('dark'), false);
    // Opaque display, with its front at .032; existing content starts at .036.
    this.box(screen, [size[0] - 0.06, size[1] - 0.09, 0.008], [0, 0.01, 0.028], this.roleMaterial('primary'), false);
    return screen;
  }

  moduleBase(group: THREE.Group): THREE.Mesh {
    const base = this.box(group, [1, 0.07, 0.53], [0, -0.48, 0], this.roleMaterial('dark'), false);
    return base;
  }

  private rememberOpacity(material: THREE.Material): void {
    material.userData['baseOpacity'] = material.opacity;
    material.userData['baseDepthWrite'] = material.depthWrite;
  }
}

export function setGroupOpacity(group: THREE.Group, opacity: number): void {
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      const baseOpacity = material.userData['baseOpacity'] ?? 1;
      const transparent = opacity < 0.999 || baseOpacity < 1;
      if (material.transparent !== transparent) { material.transparent = transparent; material.needsUpdate = true; }
      material.depthWrite = !transparent && (material.userData['baseDepthWrite'] ?? true);
      material.opacity = baseOpacity * opacity;
    });
  });
}

export function disposeGroup(group: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) return;
    geometries.add(object.geometry);
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
