import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

import { Theme } from '@three';


export interface Options {
  theme: Theme;
  envMap: THREE.Texture;
  onComplete(): void;
  gui: GUI;
}

export default abstract class MeshBuilder {
  theme: Theme;
  envMap: THREE.Texture;
  gui: GUI;
  loadingManager: THREE.LoadingManager;
  onComplete: () => void;

  loadersComplete = false;
  meshRenderComplete = false;
  meshRenderCount = 0;
  EXPECTED_MESH_RENDERS = 1;

  constructor(options: Options) {
    this.theme = options.theme;
    this.envMap = options.envMap;
    this.onComplete = options.onComplete;
    this.gui = options.gui;

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

  onAfterRender = (self: MeshBuilder) =>
    function (): void {
      self.meshRenderCount++;
      if (self.meshRenderCount >= self.EXPECTED_MESH_RENDERS) {
        self.meshRenderComplete = true;
        self.checkLoaded();
      }
      this.onAfterRender = () => {};
    };

  abstract createMesh: () => Promise<THREE.Object3D[]>;

  abstract renderUpdate: (time: number) => void;
}

