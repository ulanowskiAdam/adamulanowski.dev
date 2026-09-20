import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export class PortraitScene {
  private renderer?: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  private readonly sculpture = new THREE.Group();
  private readonly orbit = new THREE.Group();
  private readonly textures = new Set<THREE.Texture>();
  private environment?: THREE.WebGLRenderTarget;
  private resize?: ResizeObserver;
  private visibility?: IntersectionObserver;
  private readonly motion = matchMedia('(prefers-reduced-motion: reduce)');
  private frame = 0;
  private visible = false;
  private destroyed = false;
  private animated = !this.motion.matches;
  private x = 0;
  private y = 0;
  private time = 0;
  private previous = 0;
  constructor(
    private readonly host: HTMLElement,
    private readonly failed: () => void,
    private readonly motionChanged: (value: boolean) => void,
  ) {}
  async init(): Promise<boolean> {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.domElement.style.cssText =
      'position:absolute;inset:0;display:block;width:100%;height:100%';
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.renderer.domElement.addEventListener('webglcontextlost', this.lost);
    this.host.append(this.renderer.domElement);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, 0.04);
    this.scene.environment = this.environment.texture;
    room.dispose();
    pmrem.dispose();
    this.camera.position.set(0, 0.35, 7.7);
    this.camera.lookAt(0, -0.05, 0);
    this.scene.add(new THREE.HemisphereLight(0xf2efe5, 0x192510, 2));
    const rim = new THREE.DirectionalLight(0xd3ff48, 5);
    rim.position.set(-3, 2, 1);
    this.scene.add(rim);
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(3, 4, 5);
    this.scene.add(key);
    const graphite = new THREE.MeshStandardMaterial({
      color: 0x252b23,
      metalness: 0.8,
      roughness: 0.26,
    });
    const metal = new THREE.MeshStandardMaterial({
      color: 0x56604f,
      metalness: 1,
      roughness: 0.35,
      envMapIntensity: 0.6,
    });
    const lime = new THREE.MeshBasicMaterial({
      color: 0xd3ff48,
      toneMapped: false,
    });
    const add = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      parent: THREE.Object3D,
      x = 0,
      y = 0,
      z = 0,
    ) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      parent.add(m);
      return m;
    };
    // A dark machined portrait monolith with visible layered depth.
    add(new RoundedBoxGeometry(2.02, 2.52, 0.22, 3, 0.055), graphite, this.sculpture);
    const back = add(
      new RoundedBoxGeometry(2.12, 2.62, 0.055, 3, 0.07),
      metal,
      this.sculpture,
      0.065,
      0.03,
      -0.16,
    );
    back.rotation.z = -0.025;
    add(new THREE.BoxGeometry(0.025, 2.35, 0.035), lime, this.sculpture, -1.02, 0, 0.04);
    const texture = await new THREE.TextureLoader().loadAsync('/images/adam-ulanowski-dark.webp');
    if (this.destroyed) {
      texture.dispose();
      return false;
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.add(texture);
    add(
      new THREE.PlaneGeometry(1.9, 2.375),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
      this.sculpture,
      0,
      0,
      0.115,
    );
    this.sculpture.position.y = 0.22;
    this.scene.add(this.sculpture);
    // Low concentric plinth, bright inset and a thin architectural orbit.
    add(new THREE.CylinderGeometry(1.58, 1.7, 0.16, 64), graphite, this.scene, 0, -1.47, 0);
    add(new THREE.CylinderGeometry(1.46, 1.46, 0.02, 64), graphite, this.scene, 0, -1.375, 0);
    const footRing = add(
      new THREE.TorusGeometry(1.54, 0.012, 8, 96),
      lime,
      this.scene,
      0,
      -1.375,
      0,
    );
    footRing.rotation.x = Math.PI / 2;
    const arch = add(
      new THREE.TorusGeometry(1.8, 0.022, 8, 96, Math.PI * 1.55),
      metal,
      this.scene,
      0,
      0.1,
      -0.45,
    );
    arch.rotation.set(0.25, 0.5, -0.65);
    const arc = add(
      new THREE.TorusGeometry(1.86, 0.012, 6, 80, Math.PI * 0.6),
      lime,
      this.scene,
      0,
      0.1,
      -0.45,
    );
    arc.rotation.set(0.25, 0.5, 1.8);
    add(new THREE.IcosahedronGeometry(0.21, 0), metal, this.orbit, 1.5, 0.65, 0.15);
    const cube = add(
      new RoundedBoxGeometry(0.26, 0.26, 0.26, 2, 0.03),
      lime,
      this.orbit,
      -1.45,
      -0.3,
      0.35,
    );
    cube.rotation.set(0.5, 0.5, 0.2);
    this.scene.add(this.orbit);
    // Subtle spatial grid beneath the sculpture.
    const grid = new THREE.GridHelper(7, 22, 0x435330, 0x242c21);
    grid.position.y = -1.57;
    this.scene.add(grid);
    this.resize = new ResizeObserver(this.fit);
    this.resize.observe(this.host);
    this.visibility = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.sync();
    });
    this.visibility.observe(this.host);
    document.addEventListener('visibilitychange', this.sync);
    this.motion.addEventListener('change', this.preference);
    this.motionChanged(this.animated);
    this.fit();
    return true;
  }
  point(x: number, y: number) {
    this.x = THREE.MathUtils.clamp(x, -1, 1);
    this.y = THREE.MathUtils.clamp(y, -1, 1);
    this.render();
  }
  turn(direction: number) {
    this.point(this.x + direction * 0.4, 0);
  }
  setAnimated(value: boolean) {
    this.animated = value;
    this.motionChanged(value);
    this.sync();
  }
  private readonly preference = () => this.setAnimated(!this.motion.matches);
  private readonly lost = (event: Event) => {
    event.preventDefault();
    this.failed();
    this.destroy();
  };
  private readonly fit = () => {
    if (!this.renderer || this.destroyed) return;
    const { width, height } = this.host.getBoundingClientRect();
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.render();
  };
  private render() {
    if (!this.renderer || this.destroyed) return;
    this.sculpture.rotation.set(-this.y * 0.12, -0.18 + this.x * 0.35, 0.015);
    this.sculpture.position.y = 0.22 + (this.animated ? Math.sin(this.time) * 0.05 : 0);
    this.orbit.rotation.y = Math.sin(this.time * 0.45) * 0.35;
    this.orbit.position.y = Math.sin(this.time * 0.7) * 0.08;
    this.renderer.render(this.scene, this.camera);
  }
  private readonly tick = (now: number) => {
    this.frame = 0;
    this.time += this.previous ? Math.min((now - this.previous) / 1000, 0.05) : 0;
    this.previous = now;
    this.render();
    if (!this.destroyed && this.visible && !document.hidden && this.animated)
      this.frame = requestAnimationFrame(this.tick);
  };
  private readonly sync = () => {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.previous = 0;
    if (!this.destroyed && this.visible && !document.hidden && this.animated)
      this.frame = requestAnimationFrame(this.tick);
    else this.render();
  };
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.frame);
    this.resize?.disconnect();
    this.visibility?.disconnect();
    document.removeEventListener('visibilitychange', this.sync);
    this.motion.removeEventListener('change', this.preference);
    const materials = new Set<THREE.Material>();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) =>
          materials.add(m),
        );
      }
    });
    materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.environment?.dispose();
    if (this.renderer) {
      this.renderer.domElement.removeEventListener('webglcontextlost', this.lost);
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }
}
