import * as THREE from 'three';

// @ts-ignore
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
// @ts-ignore
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
// @ts-ignore
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// @ts-ignore
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
// @ts-ignore
import { LUTPass } from 'three/addons/postprocessing/LUTPass.js';
// @ts-ignore
import { LUTCubeLoader } from 'three/addons/loaders/LUTCubeLoader.js';
// @ts-ignore
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// @ts-ignore
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
// @ts-ignore
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// @ts-ignore
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// @ts-ignore
import { AdaptiveToneMappingPass } from 'three/addons/postprocessing/AdaptiveToneMappingPass.js';
// @ts-ignore
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
// @ts-ignore
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
// @ts-ignore
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer: THREE.WebGLRenderer;
let camera: THREE.Camera;
let scene: THREE.Scene;
let textMesh: THREE.Mesh;
let gui: GUI;
let lutPass: LUTPass;
let bokehPass: BokehPass;
let composer: EffectComposer;
let font: any;
let didInit = false;

const params = {
  enabled: true,
  // lut: 'Korben 214.CUBE',
  lut: 'Bourbon 64.CUBE',
  intensity: 0.5,
  use2DLut: false,
  autoRotate: true,
};

const lutMap: any = {
  // 'Arabica 12.CUBE': null,
  // 'Ava 614.CUBE': null, // bright contrast
  // 'Azrael 93.CUBE': null,
  'Bourbon 64.CUBE': null, // classy, warm, bright
  // 'Byers 11.CUBE': null, // pink/purple/contrast
  // 'Chemical 168.CUBE': null, // yellowgreen < good to balance magenta?
  // 'Clayton 33.CUBE': null,
  // 'Clouseau 54.CUBE': null,
  // 'Cobi 3.CUBE': null,
  // 'Contrail 35.CUBE': null, // contrast, p flat
  // 'Cubicle 99.CUBE': null,
  // 'Django 25.CUBE': null,
  // 'Domingo 145.CUBE': null, // darker contrast
  // 'Faded 47.CUBE': null,
  // 'Folger 50.CUBE': null,
  // 'Fusion 88.CUBE': null,
  // 'Hyla 68.CUBE': null, // + pinkish
  // 'Korben 214.CUBE': null, // + similar to bourbon, less bright
  // 'Lenox 340.CUBE': null,
  // 'Lucky 64.CUBE': null, // desaturated a bit
  // 'McKinnon 75.CUBE': null,
  // 'Milo 5.CUBE': null,
  // 'Neon 770.CUBE': null, // < maybe for tokyo
  // 'Paladin 1875.CUBE': null,
  // 'Pasadena 21.CUBE': null,
  // 'Pitaya 15.CUBE': null,
  // 'Reeve 38.CUBE': null,
  // 'Remy 24.CUBE': null,
  // 'Sprocket 231.CUBE': null,
  // 'Teigen 28.CUBE': null,
  // 'Trent 18.CUBE': null,
  // 'Tweed 71.CUBE': null, //
  // 'Vireo 37.CUBE': null,
  // 'Zed 32.CUBE': null,
  // 'Zeke 39.CUBE': null,
  // 'Presetpro-Cinematic.3dl': null
};

const initEnv = (container: HTMLElement) => {
  // const container = document.getElementById('three-container');
  console.log('initEnv');
  gui = new GUI();
  gui.hide();

  // https://attackingpixels.com/tips-tricks-optimizing-three-js-performance/
  // renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer = new THREE.WebGLRenderer({
    // antialias: false,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.1;

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  camera.position.set(0, -10, 380);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  scene.matrixWorldAutoUpdate = true;
  scene.add(camera);

  renderer.setSize(window.innerWidth, window.innerHeight);

  if (container) {
    container.appendChild(renderer.domElement);
  }

  const target = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      encoding: THREE.sRGBEncoding,
    }
  );

  composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(window.devicePixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);

  composer.addPass(new RenderPass(scene, camera));
  loadLUTs();

  lutPass = new LUTPass();
  gui.add(params, 'enabled');
  gui.add(params, 'lut', Object.keys(lutMap));
  gui.add(params, 'intensity').min(0).max(1);
  composer.addPass(lutPass);
};

const loadLUTs = () => {
  Object.keys(lutMap).forEach((name) => {
    if (/\.CUBE$/i.test(name)) {
      new LUTCubeLoader()
        .loadAsync('/three/LUTs/' + name)
        .then((result: any) => {
          lutMap[name] = result;
        });
    }
  });
};

let goldMaterial: THREE.Material;
const TEXT_Z = 0;

const textGeoParams = {
  height: 10,
  bevelEnabled: true,
  bevelSize: 2,
  bevelThickness: 3,
  bevelOffset: 0,
  bevelSegments: 5,
};

const loadFont = async () => {
  const fontLoader = new FontLoader();
  return new Promise((res, rej) => {
    fontLoader
      .loadAsync('/three/Bowlby-One-SC_Regular.json')
      .then((font: any) => {
        res(font);
      });
  });
};

const createHeadlineMesh = () => {
  const headlineTextGeo = new TextGeometry('KYLE FEST', {
    font,
    size: 16,
    ...textGeoParams,
  });
  headlineTextGeo.computeBoundingBox();

  const headlineTextMesh = new THREE.Mesh(headlineTextGeo, goldMaterial);
  headlineTextMesh.position.z = TEXT_Z;
  headlineTextMesh.position.y = 70;

  scene.add(headlineTextMesh);
  headlineTextMesh.geometry.center();

  const yearTextGeo = new TextGeometry('2023', {
    font,
    size: 16,
    ...textGeoParams,
  });
  yearTextGeo.computeBoundingBox();

  const yearTextMesh = new THREE.Mesh(yearTextGeo, goldMaterial);
  yearTextMesh.position.z = TEXT_Z;
  yearTextMesh.position.y = 45;

  scene.add(yearTextMesh);
  yearTextMesh.geometry.center();
};

const createSubheadMesh = async () => {
  const subheadTextGeo = new TextGeometry('APRIL 8 · 2PM', {
    font,
    size: 12,
    ...textGeoParams,
  });
  subheadTextGeo.computeBoundingBox();

  const subheadTextMesh = new THREE.Mesh(subheadTextGeo, goldMaterial);
  subheadTextMesh.position.z = TEXT_Z;
  subheadTextMesh.position.y = 17;

  scene.add(subheadTextMesh);
  subheadTextMesh.geometry.center();
};

const createLocationMesh = async () => {
  const locationText1Geo = new TextGeometry('SOUTHERN', {
    font,
    size: 12,
    ...textGeoParams,
  });
  locationText1Geo.computeBoundingBox();

  const locationText1Mesh = new THREE.Mesh(locationText1Geo, goldMaterial);
  locationText1Mesh.position.z = TEXT_Z;
  locationText1Mesh.position.y = -12;

  scene.add(locationText1Mesh);
  locationText1Mesh.geometry.center();

  const locationText2Geo = new TextGeometry('PACIFIC', {
    font,
    size: 12,
    ...textGeoParams,
  });
  locationText2Geo.computeBoundingBox();

  const locationText2Mesh = new THREE.Mesh(locationText2Geo, goldMaterial);
  locationText2Mesh.position.z = TEXT_Z;
  locationText2Mesh.position.y = -30;

  scene.add(locationText2Mesh);
  locationText2Mesh.geometry.center();

  const locationText3Geo = new TextGeometry('BREWERY', {
    font,
    size: 12,
    ...textGeoParams,
  });
  locationText3Geo.computeBoundingBox();

  const locationText3Mesh = new THREE.Mesh(locationText3Geo, goldMaterial);
  locationText3Mesh.position.z = TEXT_Z;
  locationText3Mesh.position.y = -48;

  scene.add(locationText3Mesh);
  locationText3Mesh.geometry.center();
};

let starMesh: THREE.Mesh;

const createStarMesh = async () => {
  const starGeo = new THREE.ConeGeometry(400, 800, 5);
  starGeo.computeBoundingBox();

  starMesh = new THREE.Mesh(starGeo, goldMaterial);
  starMesh.position.x = 6500;
  starMesh.position.y = -400;
  starMesh.position.z = -7200;
  starMesh.rotation.x = Math.PI;

  gui.add(starMesh.position, 'x', -10000, 10000);
  gui.add(starMesh.position, 'y', -5000, 5000);
  gui.add(starMesh.position, 'z', -10000, 10000);

  scene.add(starMesh);
  starMesh.geometry.center();
};

const createTextMesh = async () => {
  font = await loadFont();

  goldMaterial = new THREE.MeshStandardMaterial({
    envMap: textureCube,
    color: 0xffe691,
    roughness: 0.01,
    metalness: 1,
  });

  createHeadlineMesh();
  createSubheadMesh();
  createLocationMesh();
  createStarMesh();
};


let textureCube: THREE.CubeTexture;

const setSceneBackground = async (
  scene: THREE.Scene,
  onComplete: () => void
) => {
  const loader = new THREE.CubeTextureLoader();
  loader.setPath('three/cube/');

  return new Promise((res, rej) => {
    loader
      .loadAsync(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
      .then((texture) => {
        console.log({ texture });
        textureCube = texture;
        textureCube.encoding = THREE.LinearEncoding;
        scene.background = textureCube;
        res(textureCube);
        onComplete();
      });[]
  });
};

export async function init(
  container: HTMLElement,
  onComplete: () => void
) {
  if (didInit) {
    console.warn('already init three.js!');
    return;
  }
  didInit = true;

  initEnv(container);

  await setSceneBackground(scene, onComplete);
  await createTextMesh();


  gui.add(renderer, 'toneMappingExposure', 0, 5);
  const toneMappingOptions: Record<string, any> = {
    None: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
    Custom: THREE.CustomToneMapping,
  };
  gui
    .add(renderer, 'toneMapping', Object.keys(toneMappingOptions))
    .onChange(function (val: any) {
      renderer.toneMapping = toneMappingOptions[val as any];
      render();
    });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.3;
  gui.add(controls, 'autoRotate');

  renderer.setAnimationLoop((time) => {
    controls.update();
    render();
  });
}

function render() {
  starMesh.rotation.y += 0.01;

  lutPass.enabled = params.enabled && Boolean(lutMap[params.lut]);
  lutPass.intensity = params.intensity;
  if (lutMap[params.lut]) {
    const lut = lutMap[params.lut];
    lutPass.lut = lut.texture3D;
  }

  composer.render();
}
