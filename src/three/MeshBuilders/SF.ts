import * as THREE from 'three';

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

import AbstractMeshBuilder from './Abstract';

export default class SFMeshBuilder extends AbstractMeshBuilder {
  font: Font;
  goldMaterial: THREE.Material;
  starObj: THREE.Object3D;

  EXPECTED_MESH_RENDERS = 1;

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
      '/three/fonts/Bowlby One_Regular.json'
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
    textMesh.onAfterRender = this.onAfterRender(this);
    console.log(this);
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
    this.starObj = starObj;
    return starObj;
  };

  createMesh = async (): Promise<THREE.Object3D[]> => {
    this.goldMaterial = new THREE.MeshStandardMaterial({
      envMap: this.envMap,
      color: 0xffe691,
      roughness: 0,
      metalness: 1,
      emissive: 0xffe691,
      emissiveIntensity: .06,
    });
    this.gui.add(this.goldMaterial, 'emissiveIntensity', 0, .2, .01);

    const textMesh = await this.createTextMesh();
    const starMesh = await this.createStarMesh();

    return [textMesh, starMesh];
  };

  renderUpdate = () => {
    this.starObj.rotation.z -= 0.01;
  }
}
