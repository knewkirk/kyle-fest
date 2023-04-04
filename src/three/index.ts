import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import ProcessingHelper from '@three/ProcessingHelper';
import MeshBuilder from '@three/MeshBuilders/Abstract';
import { meshBuilderFactory } from '@three/MeshBuilders/factory';

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
  textureCube: THREE.CubeTexture;
  bloomLayer: THREE.Layers;
  didInit = false;
  meshBuilder: MeshBuilder;

  constructor(theme: Theme, container: HTMLElement, onComplete: () => void) {
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

    this.camera.position.x = 100;
    this.camera.position.y = this.theme === Theme.Tokyo ? -100 : -10;
    this.camera.position.z = 380;
    this.camera.lookAt(0, 0, 0);
    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(1);

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

  setSceneBackground = async () => {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath(`three/cube/${this.theme.toLowerCase()}/`);

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

    this.meshBuilder = meshBuilderFactory({
      theme: this.theme,
      envMap: this.textureCube,
      onComplete: this.onComplete,
      gui: this.gui,
    });
    const mesh = await this.meshBuilder.createMesh();
    this.scene.add(...mesh);

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

  render = (time: number) => {
    this.scene.background = null;
    this.scene.traverse(this.darkenNonBloomed);
    this.bloomComposer.render();
    this.meshBuilder.renderUpdate(time);
    this.orbitControls.update();
    this.processingHelper.updateLUT();
    this.scene.background = this.textureCube;
    this.scene.traverse(this.restoreMaterial);
    this.finalComposer.render();
  };
}
