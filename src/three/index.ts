import * as THREE from 'three';

import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

import ProcessingHelper from '@three/ProcessingHelper';
import { Vector3 } from 'three';

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

export default class ThreeSF {
  isTokyo: boolean;
  camera: THREE.Camera;
  bloomComposer: EffectComposer;
  finalComposer: EffectComposer;
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
  bloomLayer: THREE.Layers;
  didInit = false;

  constructor(
    isTokyo: boolean,
    container: HTMLElement,
    onComplete: () => void
  ) {
    this.isTokyo = isTokyo;
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

    if (this.isTokyo) {
      this.camera.position.set(0, -100, 380);
      this.bloomLayer = new THREE.Layers();
      this.bloomLayer.set(1);
    } else {
      this.camera.position.set(0, -10, 380);
    }
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

    this.addOrbitControls();
  };

  addOrbitControls = () => {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.autoRotate = true;
    this.orbitControls.autoRotateSpeed = 1.3;
    this.gui.add(this.orbitControls, 'autoRotate');
  };

  loadFont = async () => {
    const fontLoader = new FontLoader();
    return new Promise((res, rej) => {
      fontLoader
        .loadAsync('/three/fonts/Bowlby-One-SC_Regular.json')
        .then((font: any) => {
          res(font);
        });
    });
  };

  createTextGeo = (text: string, size: number, posY: number): TextGeometry => {
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

  createKaraokeText = async () => {
    const loader = new FontLoader();
    const font = await loader.loadAsync(
      'three/fonts/Rounded Mplus 1c Medium_Regular.json'
    );

    const textGeo = new TextGeometry('カラオケ!', {
      font,
      size: SIGN_1.FONT,
      height: 2,
      curveSegments: 1,
      bevelEnabled: false,
      bevelSize: 2,
      bevelThickness: 3,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    textGeo.computeBoundingBox();
    textGeo.center();
    textGeo.translate(
      SIGN_1.TEXT_OFFSET,
      SIGN_1.TRANSLATE_Y,
      SIGN_1.DEPTH / 2 + 2
    );

    const material = new THREE.MeshBasicMaterial({
      color: 0xff57c4,
    });
    const textMesh = new THREE.Mesh(textGeo, material);
    this.scene.add(textMesh);
    textMesh.layers.enable(1);
  };

  createMicrophone = async () => {
    const svgGroup = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: 0xff57c4,
    });
    const loader = new SVGLoader();
    const svg = await loader.loadAsync('/three/microphone.svg');

    svg.paths.forEach((path, i) => {
      const shapes = path.toShapes(false);
      shapes.forEach((shape, j) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 30,
          bevelEnabled: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        svgGroup.add(mesh);
      });
    });

    svgGroup.rotation.z = Math.PI;
    svgGroup.rotation.y = Math.PI;
    svgGroup.scale.set(SIGN_1.SVG, SIGN_1.SVG, SIGN_1.SVG);

    var box = new THREE.Box3().setFromObject(svgGroup);
    var center = box.getCenter(new Vector3());
    svgGroup.position.x = -center.x - SIGN_1.SVG_OFFSET;
    svgGroup.position.y = -center.y + SIGN_1.TRANSLATE_Y;
    svgGroup.position.z = SIGN_1.DEPTH / 2 + 2;

    this.scene.add(svgGroup);
    svgGroup.traverse((obj) => {
      obj.layers.enable(1);
    });
  };

  createPandoraText = async () => {
    const loader = new FontLoader();
    const font = await loader.loadAsync('three/fonts/Yellowtail_Regular.json');

    const textGeo = new TextGeometry('6PM · Pandora', {
      font,
      size: SIGN_2.FONT,
      height: 2,
      curveSegments: 1,
      bevelEnabled: false,
      bevelSize: 2,
      bevelThickness: 3,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    textGeo.computeBoundingBox();
    textGeo.center();
    textGeo.translate(0, SIGN_2.TRANSLATE_Y, SIGN_2.DEPTH / 2 + 2);

    const material = new THREE.MeshBasicMaterial({
      color: 0xff57c4,
    });
    const textMesh = new THREE.Mesh(textGeo, material);
    this.scene.add(textMesh);
    textMesh.layers.enable(1);
  };

  createBackingMesh = () => {
    const geo = new THREE.BoxGeometry(
      SIGN_1.WIDTH,
      SIGN_1.HEIGHT,
      SIGN_1.DEPTH
    );
    const material = new THREE.MeshStandardMaterial({
      envMap: this.textureCube,
      envMapIntensity: 4,
      color: 0x000000,
      metalness: 0,
      roughness: 0,
    });
    const backingMesh = new THREE.Mesh(geo, material);
    backingMesh.position.y = SIGN_1.TRANSLATE_Y;
    this.scene.add(backingMesh);
  };

  createBackingMesh2 = () => {
    const geo = new THREE.BoxGeometry(
      SIGN_2.WIDTH,
      SIGN_2.HEIGHT,
      SIGN_2.DEPTH
    );
    const material = new THREE.MeshStandardMaterial({
      envMap: this.textureCube,
      envMapIntensity: 4,
      color: 0x000000,
      metalness: 0,
      roughness: 0,
    });
    const backingMesh = new THREE.Mesh(geo, material);
    backingMesh.position.y = SIGN_2.TRANSLATE_Y;
    this.scene.add(backingMesh);
  };

  createMesh = async () => {
    this.goldMaterial = new THREE.MeshStandardMaterial({
      envMap: this.textureCube,
      color: 0xffe691,
      roughness: 0.01,
      metalness: 1,
    });

    if (this.isTokyo) {
      await this.createBackingMesh();
      await this.createKaraokeText();
      await this.createMicrophone();
      await this.createPandoraText();
      await this.createBackingMesh2();
    } else {
      await this.createTextMesh();
      await this.createStarMesh();
    }
  };

  setSceneBackground = async () => {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath(`three/cube/${this.isTokyo ? 'tokyo' : 'sf'}/`);

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

    const [bloomComposer, finalComposer] =
      await this.processingHelper.initComposers(this.isTokyo);
    this.bloomComposer = bloomComposer;
    this.finalComposer = finalComposer;
    this.darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });

    this.scene.traverse((obj: any) => {
      if (obj.material) {
        obj.material.dispose();
      }
    });

    this.renderer.setAnimationLoop(this.render);
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
    if (!this.isTokyo) {
      this.starObj.rotation.z -= 0.01;
    } else {
      this.scene.background = null;
      this.scene.traverse(this.darkenNonBloomed);
      this.bloomComposer.render();
    }

    this.orbitControls.update();
    this.processingHelper.updateLUT(this.isTokyo);
    this.scene.background = this.textureCube;
    this.scene.traverse(this.restoreMaterial);
    this.finalComposer.render();
  };
}
