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

const SF_LOADERS_COUNT = 2; // font, star, bg, but idk less
const TOKYO_LOADERS_COUNT = 2; // jpn & cursive fonts, mic svg, bg, but idk why less

export default class ThreeSF {
  isTokyo: boolean;
  camera: THREE.Camera;
  bloomComposer: EffectComposer;
  finalComposer: EffectComposer;
  container: HTMLElement;
  font: any;
  goldMaterial: THREE.Material;
  glossMaterial: THREE.Material;
  glowMaterial: THREE.Material;
  gui: GUI;
  sfLoadingManager: THREE.LoadingManager;
  tokyoLoadingManager: THREE.LoadingManager;
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

  sfLoadingCount = 0;
  sfTextRendered = false;
  tokyoLoadingCount = 0;
  tokyoText1Rendered = false;
  tokyoText2Rendered = false;
  tokyoSVGRendered = false;

  constructor(
    isTokyo: boolean,
    container: HTMLElement,
    onComplete: () => void
  ) {
    this.isTokyo = isTokyo;
    this.container = container;
    this.onComplete = onComplete;
  }

  checkSFLoaded = () => {
    if (this.sfLoadingCount >= SF_LOADERS_COUNT && this.sfTextRendered) {
      this.onComplete();
    }
  };
  checkTokyoLoaded = () => {
    if (
      this.tokyoLoadingCount >= TOKYO_LOADERS_COUNT &&
      this.tokyoText1Rendered &&
      this.tokyoText2Rendered &&
      this.tokyoSVGRendered
    ) {
      this.onComplete();
    }
  };

  initEnv = async () => {
    this.sfLoadingManager = new THREE.LoadingManager(() => {
      this.sfLoadingCount++;
      this.checkSFLoaded();
    });
    this.tokyoLoadingManager = new THREE.LoadingManager(() => {
      this.tokyoLoadingCount++;
      this.checkTokyoLoaded();
    });

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

  createSFTextGeo = (
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
    const fontLoader = new FontLoader(this.sfLoadingManager);
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
      this.sfTextRendered = true;
      this.checkSFLoaded();
    };
    this.scene.add(textMesh);
  };

  createStarMesh = async () => {
    const loader = new OBJLoader(this.sfLoadingManager);
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
    this.starObj.rotateX(Math.PI / 2);

    this.scene.add(this.starObj);
  };

  createKaraokeText = async () => {
    const loader = new FontLoader(this.tokyoLoadingManager);
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
    textMesh.onAfterRender = () => {
      this.tokyoText1Rendered = true;
      this.checkTokyoLoaded();
    };

    this.scene.add(textMesh);
    textMesh.layers.enable(1);
  };

  createMicrophone = async () => {
    const svgGroup = new THREE.Group();
    const loader = new SVGLoader(this.tokyoLoadingManager);
    const svg = await loader.loadAsync('/three/microphone.svg');

    svg.paths.forEach((path, i) => {
      const shapes = path.toShapes(false);
      shapes.forEach((shape, j) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 50,
          bevelEnabled: false,
        });
        const mesh = new THREE.Mesh(geometry, this.glowMaterial);
        mesh.onAfterRender = () => {
          this.tokyoSVGRendered = true;
          this.checkTokyoLoaded();
        };
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
    const loader = new FontLoader(this.tokyoLoadingManager);
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
    textMesh.onAfterRender = () => {
      this.tokyoText2Rendered = true;
      this.checkTokyoLoaded();
    };
    this.scene.add(textMesh);
    textMesh.layers.enable(1);
  };

  createBackingMesh = () => {
    const geo = new THREE.BoxGeometry(
      SIGN_1.WIDTH,
      SIGN_1.HEIGHT,
      SIGN_1.DEPTH
    );
    const backingMesh = new THREE.Mesh(geo, this.glossMaterial);
    backingMesh.position.y = SIGN_1.TRANSLATE_Y;
    this.scene.add(backingMesh);
  };

  createBackingMesh2 = () => {
    const geo = new THREE.BoxGeometry(
      SIGN_2.WIDTH,
      SIGN_2.HEIGHT,
      SIGN_2.DEPTH
    );
    const backingMesh = new THREE.Mesh(geo, this.glossMaterial);
    backingMesh.position.y = SIGN_2.TRANSLATE_Y;
    this.scene.add(backingMesh);
  };

  createSFMesh = async () => {
    this.goldMaterial = new THREE.MeshStandardMaterial({
      envMap: this.textureCube,
      color: 0xffe691,
      roughness: 0.01,
      metalness: 1,
    });

    await this.createTextMesh();
    await this.createStarMesh();
  };

  createTokyoMesh = async () => {
    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff57c4,
    });
    this.glossMaterial = new THREE.MeshStandardMaterial({
      envMap: this.textureCube,
      envMapIntensity: 4,
      color: 0x000000,
      metalness: 0,
      roughness: 0,
    });

    await this.createBackingMesh();
    await this.createKaraokeText();
    await this.createMicrophone();
    await this.createPandoraText();
    await this.createBackingMesh2();
  };

  setSceneBackground = async () => {
    const loader = new THREE.CubeTextureLoader(
      this.isTokyo ? this.tokyoLoadingManager : this.sfLoadingManager
    );
    loader.setPath(`three/cube/${this.isTokyo ? 'tokyo' : 'sf'}/`);

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

    if (this.isTokyo) {
      await this.createTokyoMesh();
    } else {
      await this.createSFMesh();
    }

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
