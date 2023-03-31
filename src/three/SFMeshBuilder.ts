import * as THREE from 'three';

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

interface Options {
  envMap: THREE.Texture;
  onComplete(): void;
}

interface MeshResult {
  textMesh: THREE.Mesh;
  starMesh: THREE.Group;
}

export default class SFMeshBuilder {
  envMap: THREE.Texture;
  font: Font;
  goldMaterial: THREE.Material;
  loadingManager: THREE.LoadingManager;
  onComplete: () => void;

  loadersComplete = false;
  meshRenderComplete = false;

  constructor({ envMap, onComplete }: Options) {
    this.envMap = envMap;
    this.onComplete = onComplete;

    this.loadingManager = new THREE.LoadingManager(() => {
      this.loadersComplete = true;
      this.checkLoaded();
    });
  }

  checkLoaded = () => {
    if (this.loadersComplete && this.meshRenderComplete) {
      this.onComplete();
    }
  };

  private createSFTextGeo = (
    text: string,
    size: number,
    posY: number
  ): TextGeometry => {
    const textGeo = new TextGeometry(text, {
      font: this.font,
      size,
      height: 10,
      bevelEnabled: true,
      bevelSize: 2,
      bevelThickness: 3,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    textGeo.computeBoundingBox();
    textGeo.center();
    textGeo.translate(0, posY, 0);

    return textGeo;
  };

  private createTextMesh = async (): Promise<THREE.Mesh> => {
    const fontLoader = new FontLoader(this.loadingManager);
    this.font = await fontLoader.loadAsync(
      '/three/fonts/Bowlby-One-SC_Regular.json'
    );

    const geometries = [];
    geometries.push(this.createSFTextGeo('KYLE FEST', 16, 70));
    geometries.push(this.createSFTextGeo('2023', 16, 45));
    geometries.push(this.createSFTextGeo('APRIL 8 · 2PM', 12, 17));
    geometries.push(this.createSFTextGeo('SOUTHERN', 12, -12));
    geometries.push(this.createSFTextGeo('PACIFIC', 12, -30));
    geometries.push(this.createSFTextGeo('BREWERY', 12, -48));

    const merged = mergeBufferGeometries(geometries);
    const textMesh = new THREE.Mesh(merged, this.goldMaterial);
    textMesh.onAfterRender = () => {
      this.meshRenderComplete = true;
      this.checkLoaded();
      textMesh.onAfterRender = () => {};
    };
    return textMesh;
  };

  private createStarMesh = async (): Promise<THREE.Group> => {
    const loader = new OBJLoader(this.loadingManager);
    const starObj = await loader.loadAsync('/three/estrellica.obj');
    starObj.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.material = this.goldMaterial;
      }
    });
    starObj.scale.set(30, 30, 30);
    starObj.position.x = 6500;
    starObj.position.y = -500;
    starObj.position.z = -7000;
    starObj.rotateX(Math.PI / 2);
    return starObj;
  };

  createMesh = async (): Promise<MeshResult> => {
    this.goldMaterial = new THREE.MeshStandardMaterial({
      envMap: this.envMap,
      color: 0xffe691,
      roughness: 0.01,
      metalness: 1,
    });

    const textMesh = await this.createTextMesh();
    const starMesh = await this.createStarMesh();

    return { textMesh, starMesh };
  };
}
