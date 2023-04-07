import { getDatabase, ref, get } from 'firebase/database';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader';

import { triangleWave } from '@helpers/triangleWave';
import AbstractMeshBuilder from './Abstract';

export default class SpaceMeshBuilder extends AbstractMeshBuilder {
  font: Font;
  material: THREE.MeshPhongMaterial;
  meshes: THREE.Mesh[] = [];
  params = { wobble: true };
  lineup: string[] = [];

  EXPECTED_MESH_RENDERS = 10;

  private createTextMesh = (
    text: string,
    size: number,
    posX: number,
    posY: number
  ) => {
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
    textGeo.translate(posX, posY, 0);
    const mesh = new THREE.Mesh(textGeo, this.material);
    mesh.onAfterRender = this.onAfterRender(this);
    mesh.layers.enable(1);

    return mesh;
  };

  fetchLineup = async (): Promise<string[]> => {
    const db = getDatabase();
    const dbRef = ref(db);

    let lineup = [];
    try {
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        lineup = snapshot.val();
        console.log({ lineup });
      } else {
        console.log('No data available');
      }
    } catch {
      (error: any) => {
        console.error(error);
      };
    }
    return lineup;
  };

  createMesh = async (): Promise<THREE.Object3D[]> => {
    const fontLoader = new FontLoader(this.loadingManager);
    this.font = await fontLoader.loadAsync(
      '/three/fonts/Bowlby One_Regular.json'
    );

    this.material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      envMap: this.envMap,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
    });
    this.gui.add(this.material, 'opacity', 0, 1);
    this.gui.add(this.material, 'emissiveIntensity', 0, 2);

    this.meshes.push(this.createTextMesh('AFTERS', 20, 0, 120));
    this.meshes.push(this.createTextMesh('1963 McAllister #5', 16, 0, 80));
    this.meshes.push(this.createTextMesh('featuring:', 14, 0, 50));
    const lineup = await this.fetchLineup();
    lineup
      .sort(() => Math.random() - 0.5)
      .forEach((act, i) => {
        const posX = i % 2 == 0 ? -60 : 60;
        const posY = 20 - (i / 2) * 30;
        this.meshes.push(this.createTextMesh(act, 12, posX, posY));
      });
    this.gui.add(this.params, 'wobble');

    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = 1;
    this.gui.add(ambientLight, 'intensity', 0, 10);

    return [...this.meshes, ambientLight];
  };

  renderUpdate = (time: number) => {
    if (!this.params.wobble) {
      return;
    }

    this.meshes.forEach((mesh, i) => {
      const t1 = time + i * 683;
      const x = t1 / 2000;
      const p = 2;
      const a = p / 2;
      mesh.position.x = triangleWave(x, p, a);
      mesh.position.y = triangleWave(x + 20, p, a);
      mesh.position.z = triangleWave(x + 100, p, a);

      const t2 = time + i * 12523;
      const y = t2 / 20000;
      const q = Math.PI / 4;
      const b = 0;
      mesh.rotation.x = triangleWave(y, q, b);
      mesh.rotation.y = triangleWave(y + 0.1, q, b);
      mesh.rotation.z = triangleWave(y + 0.2, q, b);
    });
  };
}
