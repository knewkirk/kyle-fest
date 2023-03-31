import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import ProcessingHelper from '@three/ProcessingHelper';
import SFMeshBuilder from '@three/SFMeshBuilder';
import TokyoMeshBuilder from '@three/TokyoMeshBuilder';

export enum Theme {
  SF = 'SF',
  Tokyo = 'Tokyo',
  Space = 'Space',
}

export default class Three {
  theme: Theme;
  camera: THREE.Camera;
  bloomComposer: EffectComposer;
  finalComposer: EffectComposer;
  container: HTMLElement;
  gui: GUI;
  lutPass: LUTPass;
  onComplete: () => void;
  orbitControls: OrbitControls;
  processingHelper: ProcessingHelper;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  starMesh: THREE.Object3D;
  textureCube: THREE.CubeTexture;
  bloomLayer: THREE.Layers;
  didInit = false;

  constructor(
    theme: Theme,
    container: HTMLElement,
    onComplete: () => void
  ) {
    this.theme = theme;
    this.container = container;
    this.onComplete = onComplete;
  }

  initEnv = async () => {
    this.gui = new GUI();
    this.gui.hide();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    if (this.theme === Theme.Tokyo) {
      this.camera.position.x = 100;
      this.camera.position.y = -100;
      this.camera.position.z = 380;
      this.bloomLayer = new THREE.Layers();
      this.bloomLayer.set(1);
    } else {
      this.camera.position.x = 100;
      this.camera.position.y = -10;
      this.camera.position.z = 380;
    }
    this.camera.lookAt(0, 0, 0);

    this.scene = new THREE.Scene();
    this.scene.matrixWorldAutoUpdate = true;
    this.scene.add(this.camera);

    this.container.appendChild(this.renderer.domElement);

    this.processingHelper = new ProcessingHelper(
      this.theme,
      this.renderer,
      this.scene,
      this.camera,
      this.gui
    );

    this.addOrbitControls();
  };

  cleanup = () => {
    this.gui.destroy();
    delete this.gui;
  };

  addOrbitControls = () => {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.autoRotate = true;
    this.orbitControls.autoRotateSpeed = 0.5;
    this.gui.add(this.orbitControls, 'autoRotate');
    this.gui.add(this.orbitControls, 'autoRotateSpeed', 0, 1, 0.1);
  };

  createSFMesh = async () => {
    const meshBuilder = new SFMeshBuilder({
      envMap: this.textureCube,
      onComplete: this.onComplete,
    });
    const { textMesh, starMesh } = await meshBuilder.createMesh();
    this.scene.add(textMesh, starMesh);
    this.starMesh = starMesh;
  };

  createTokyoMesh = async () => {
    const meshBuilder = new TokyoMeshBuilder({
      envMap: this.textureCube,
      onComplete: this.onComplete,
    });
    const meshes = await meshBuilder.createMesh();
    this.scene.add(...meshes);
  };

  setSceneBackground = async () => {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath(
      `three/cube/${this.theme.toLowerCase()}/`
    );

    this.textureCube = await loader.loadAsync([
      'px.jpg',
      'nx.jpg',
      'py.jpg',
      'ny.jpg',
      'pz.jpg',
      'nz.jpg',
    ]);
    this.textureCube.encoding = THREE.LinearEncoding;

    this.scene.background = this.textureCube;
    return this.textureCube;
  };

  init = async () => {
    if (this.didInit) {
      console.warn('already init three.js!');
      return;
    }
    this.didInit = true;

    await this.initEnv();
    await this.setSceneBackground();

    if (this.theme === Theme.Space) {
    } else if (this.theme === Theme.Tokyo) {
      await this.createTokyoMesh();
    } else {
      await this.createSFMesh();
    }

    const [bloomComposer, finalComposer] =
      await this.processingHelper.initComposers();
    this.bloomComposer = bloomComposer;
    this.finalComposer = finalComposer;
    this.darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });

    this.scene.traverse((obj: any) => {
      if (obj.material) {
        obj.material.dispose();
      }
    });

    this.renderer.setAnimationLoop(this.render);

    if (this.theme === Theme.Space) {
      setTimeout(() => {
        this.onComplete();
      }, 1000);
    }
  };

  materials: any = {};
  darkMaterial: any;

  darkenNonBloomed = (obj: any) => {
    if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
      this.materials[obj.uuid] = obj.material;
      obj.material = this.darkMaterial;
    }
  };

  restoreMaterial = (obj: any) => {
    if (this.materials[obj.uuid]) {
      obj.material = this.materials[obj.uuid];
      delete this.materials[obj.uuid];
    }
  };

  render = () => {
    if (this.theme === Theme.SF && this.starMesh) {
      this.starMesh.rotation.z -= 0.01;
    } else {
      this.scene.background = null;
      this.scene.traverse(this.darkenNonBloomed);
      this.bloomComposer.render();
    }

    this.orbitControls.update();
    this.processingHelper.updateLUT(this.theme);
    this.scene.background = this.textureCube;
    this.scene.traverse(this.restoreMaterial);
    this.finalComposer.render();
  };
}
