import * as THREE from 'three';

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass';
import { EffectComposer  } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';


import ProcessingHelper from '@three/processing';

export default class ThreeSF {
  camera: THREE.Camera;
  composer: EffectComposer;
  container: HTMLElement;
  font: any;
  goldMaterial: THREE.Material;
  gui: GUI;
  lutPass: LUTPass;
  onComplete: () => void;
  orbitControls: OrbitControls;
  processingHelper: ProcessingHelper;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  starObj: THREE.Object3D;
  textMesh: THREE.Mesh;
  textureCube: THREE.CubeTexture;

  didInit = false;

  constructor(container: HTMLElement, onComplete: () => void) {
    this.container = container;
    this.onComplete = onComplete;
  }

  initEnv = async () => {
    this.gui = new GUI();
    // gui.hide();

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
    this.camera.position.set(0, -10, 380);
    this.camera.lookAt(0, 0, 0);

    this.scene = new THREE.Scene();
    this.scene.matrixWorldAutoUpdate = true;
    this.scene.add(this.camera);

    this.container.appendChild(this.renderer.domElement);

    this.processingHelper = new ProcessingHelper(
      this.renderer,
      this.scene,
      this.camera,
      this.gui
    );
    this.composer = await this.processingHelper.initComposer();

    this.addOrbitControls();
  };

  addOrbitControls = () => {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.autoRotate = true;
    this.orbitControls.autoRotateSpeed = 1.3;
    this.gui.add(this.orbitControls, 'autoRotate');
  }

  loadFont = async () => {
    const fontLoader = new FontLoader();
    return new Promise((res, rej) => {
      fontLoader
        .loadAsync('/three/Bowlby-One-SC_Regular.json')
        .then((font: any) => {
          res(font);
        });
    });
  };

  createTextGeo = (
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

  createTextMesh = async () => {
    this.font = await this.loadFont();

    const geometries = [];
    geometries.push(this.createTextGeo('KYLE FEST', 16, 70));
    geometries.push(this.createTextGeo('2023', 16, 45));
    geometries.push(this.createTextGeo('APRIL 8 · 2PM', 12, 17));
    geometries.push(this.createTextGeo('SOUTHERN', 12, -12));
    geometries.push(this.createTextGeo('PACIFIC', 12, -30));
    geometries.push(this.createTextGeo('BREWERY', 12, -48));

    const merged = mergeBufferGeometries(geometries);
    const textMesh = new THREE.Mesh(merged, this.goldMaterial);

    this.scene.add(textMesh);
  };

  createStarMesh = async () => {
    const loader = new OBJLoader();
    this.starObj = await loader.loadAsync('/three/estrellica.obj');
    this.starObj.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.material = this.goldMaterial;
      }
    });
    this.starObj.scale.set(30, 30, 30);

    this.starObj.position.x = 6500;
    this.starObj.position.y = -500;
    this.starObj.position.z = -7000;

    this.gui.add(this.starObj.position, 'x', -10000, 10000);
    this.gui.add(this.starObj.position, 'y', -5000, 5000);
    this.gui.add(this.starObj.position, 'z', -10000, 10000);

    this.starObj.rotateX(Math.PI / 2);

    this.scene.add(this.starObj);
  };

  createMesh = async () => {
    this.goldMaterial = new THREE.MeshStandardMaterial({
      envMap: this.textureCube,
      color: 0xffe691,
      roughness: 0.01,
      metalness: 1,
    });

    await this.createTextMesh();
    await this.createStarMesh();
  };

  setSceneBackground = async () => {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath('three/cube/');

    return new Promise((res, rej) => {
      loader
        .loadAsync(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
        .then((texture) => {
          this.textureCube = texture;
          this.textureCube.encoding = THREE.LinearEncoding;
          this.scene.background = this.textureCube;
          res(this.textureCube);
          this.onComplete();
        });
      [];
    });
  };

  init = async () => {
    if (this.didInit) {
      console.warn('already init three.js!');
      return;
    }
    this.didInit = true;

    await this.initEnv();
    await this.setSceneBackground();
    await this.createMesh();

    this.renderer.setAnimationLoop(this.render);
  };

  render = () => {
    this.starObj.rotation.z -= 0.01;
    this.orbitControls.update();
    this.processingHelper.updateLUT();
    this.composer.render();
  };
}
