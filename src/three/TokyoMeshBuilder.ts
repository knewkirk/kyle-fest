import * as THREE from 'three';

import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader';

interface Options {
  envMap: THREE.Texture;
  onComplete(): void;
}

interface MeshResult {
  textMesh: THREE.Mesh;
  starMesh: THREE.Group;
}

const SIGN_1 = {
  TRANSLATE_Y: 50,
  WIDTH: 160,
  HEIGHT: 40,
  DEPTH: 14,
  FONT: 19,
  SVG: 0.045,
  TEXT_OFFSET: 14,
  SVG_OFFSET: 59,
};

const SIGN_2 = {
  TRANSLATE_Y: 0,
  WIDTH: 145,
  HEIGHT: 35,
  DEPTH: 14,
  FONT: 16,
};

const MESH_RENDERS_EXPECTED = 3;

export default class TokyoMeshBuilder {

  envMap: THREE.Texture;
  glowMaterial: THREE.Material;
  glossMaterial: THREE.Material;
  loadingManager: THREE.LoadingManager;
  onComplete: () => void;

  loadersComplete = false;
  meshRenderCount = 0;

  constructor({
    envMap,
    onComplete,
  }: Options) {
    this.envMap = envMap;
    this.onComplete = onComplete;

    this.loadingManager = new THREE.LoadingManager(() => {
      this.loadersComplete = true;
      this.checkLoaded();
    });
  }

  checkLoaded = () => {
    if (this.loadersComplete && this.meshRenderCount >= MESH_RENDERS_EXPECTED) {
      this.onComplete();
    }
  };

  onAfterRender = (self: TokyoMeshBuilder) => function(): void {
    self.meshRenderCount++;
    self.checkLoaded();
    this.onAfterRender = () => {};
  }

  private createKaraokeText = async () => {
    const loader = new FontLoader(this.loadingManager);
    const font = await loader.loadAsync(
      'three/fonts/Rounded Mplus 1c Medium_Regular.json'
    );

    const textGeo = new TextGeometry('カラオケ!', {
      font,
      size: SIGN_1.FONT,
      height: 2,
    });
    textGeo.computeBoundingBox();
    textGeo.center();
    textGeo.translate(
      SIGN_1.TEXT_OFFSET,
      SIGN_1.TRANSLATE_Y,
      SIGN_1.DEPTH / 2 + 2
    );

    const textMesh = new THREE.Mesh(textGeo, this.glowMaterial);
    textMesh.onAfterRender = this.onAfterRender(this);
    textMesh.layers.enable(1);
    return textMesh;
  };

  private createMicrophone = async (): Promise<THREE.Group> => {
    const svgGroup = new THREE.Group();
    const loader = new SVGLoader(this.loadingManager);
    const svg = await loader.loadAsync('/three/microphone.svg');

    svg.paths.forEach((path, i) => {
      const shapes = path.toShapes(false);
      shapes.forEach((shape, j) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 50,
          bevelEnabled: false,
        });
        const mesh = new THREE.Mesh(geometry, this.glowMaterial);
        mesh.onAfterRender = this.onAfterRender(this);
        svgGroup.add(mesh);
      });
    });

    svgGroup.rotation.z = Math.PI;
    svgGroup.rotation.y = Math.PI;
    svgGroup.scale.set(SIGN_1.SVG, SIGN_1.SVG, SIGN_1.SVG);

    var box = new THREE.Box3().setFromObject(svgGroup);
    var center = box.getCenter(new THREE.Vector3());
    svgGroup.position.x = -center.x - SIGN_1.SVG_OFFSET;
    svgGroup.position.y = -center.y + SIGN_1.TRANSLATE_Y;
    svgGroup.position.z = SIGN_1.DEPTH / 2 + 2;
    svgGroup.traverse((obj) => {
      obj.layers.enable(1);
    });
    return svgGroup;
  };

  private createPandoraText = async (): Promise<THREE.Mesh> => {
    const loader = new FontLoader(this.loadingManager);
    const font = await loader.loadAsync('three/fonts/Yellowtail_Regular.json');

    const textGeo = new TextGeometry('6PM · Pandora', {
      font,
      size: SIGN_2.FONT,
      height: 2,
    });
    textGeo.computeBoundingBox();
    textGeo.center();
    textGeo.translate(0, SIGN_2.TRANSLATE_Y, SIGN_2.DEPTH / 2 + 2);

    const textMesh = new THREE.Mesh(textGeo, this.glowMaterial);
    textMesh.onAfterRender = this.onAfterRender(this);
    textMesh.layers.enable(1);
    return textMesh;
  };

  private createBackingMesh = (): THREE.Mesh => {
    const geo = new THREE.BoxGeometry(
      SIGN_1.WIDTH,
      SIGN_1.HEIGHT,
      SIGN_1.DEPTH
    );
    const backingMesh = new THREE.Mesh(geo, this.glossMaterial);
    backingMesh.position.y = SIGN_1.TRANSLATE_Y;
    return backingMesh;
  };

  private createBackingMesh2 = (): THREE.Mesh => {
    const geo = new THREE.BoxGeometry(
      SIGN_2.WIDTH,
      SIGN_2.HEIGHT,
      SIGN_2.DEPTH
    );
    const backingMesh = new THREE.Mesh(geo, this.glossMaterial);
    backingMesh.position.y = SIGN_2.TRANSLATE_Y;
    return backingMesh;
  };

  createMesh = async (): Promise<(THREE.Mesh | THREE.Group)[]> => {
    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff57c4,
    });
    this.glossMaterial = new THREE.MeshStandardMaterial({
      envMap: this.envMap,
      envMapIntensity: 4,
      color: 0x000000,
      metalness: 0,
      roughness: 0,
    });

    return Promise.all([
      this.createBackingMesh(),
      this.createBackingMesh2(),
      this.createKaraokeText(),
      this.createMicrophone(),
      this.createPandoraText(),
    ]);
  };
}
