import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { LUTCubeResult } from 'three/examples/jsm/loaders/LUTCubeLoader';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { Theme } from './index';

export default class ProcessingHelper {
  theme: Theme;
  camera: THREE.Camera;
  composer: EffectComposer;
  gui: GUI;
  lutPass: LUTPass;
  bloomPass: UnrealBloomPass;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;

  bloomComposer: EffectComposer;
  finalComposer: EffectComposer;

  lutParams = {
    enabled: true,
    lut: {
      [Theme.SF]: 'Bourbon 64.CUBE',
      [Theme.Tokyo]: 'Contrail 35.CUBE',
      [Theme.Space]: 'Teigen 28.CUBE',
    },
    intensity: { [Theme.SF]: 0.5, [Theme.Tokyo]: 0.8, [Theme.Space]: 1 },
    use2DLut: false,
  };

  bloomParams = {
    [Theme.Space]: {
      threshold: 0.10,
      strength: .6,
      radius: 0.15,
    },
    [Theme.Tokyo]: {
      threshold: 0,
      strength: 2,
      radius: 1,
    },
    [Theme.SF]: {
      threshold: 0,
      strength: 0,
      radius: 0,
    },
  };

  lutMap: Record<string, any> = {
    // 'Arabica 12.CUBE': null,
    // 'Ava 614.CUBE': null,
    // 'Azrael 93.CUBE': null,
    'Bourbon 64.CUBE': null,
    // 'Byers 11.CUBE': null,
    // 'Chemical 168.CUBE': null,
    // 'Clayton 33.CUBE': null,
    // 'Clouseau 54.CUBE': null,
    // 'Cobi 3.CUBE': null,
    'Contrail 35.CUBE': null,
    // 'Cubicle 99.CUBE': null,
    // 'Django 25.CUBE': null,
    // 'Domingo 145.CUBE': null,
    // 'Faded 47.CUBE': null,
    // 'Folger 50.CUBE': null,
    // 'Fusion 88.CUBE': null,
    // 'Hyla 68.CUBE': null,
    // 'Korben 214.CUBE': null,
    // 'Lenox 340.CUBE': null,
    // 'Lucky 64.CUBE': null,
    // 'McKinnon 75.CUBE': null,
    // 'Milo 5.CUBE': null,
    // 'Neon 770.CUBE': null,
    // 'Paladin 1875.CUBE': null,
    // 'Pasadena 21.CUBE': null,
    // 'Pitaya 15.CUBE': null,
    // 'Reeve 38.CUBE': null,
    // 'Remy 24.CUBE': null,
    // 'Sprocket 231.CUBE': null,
    'Teigen 28.CUBE': null,
    // 'Trent 18.CUBE': null,
    // 'Tweed 71.CUBE': null,
    // 'Vireo 37.CUBE': null,
    // 'Zed 32.CUBE': null,
    // 'Zeke 39.CUBE': null,
    // 'Presetpro-Cinematic.3dl': null,
  };

  constructor(
    theme: Theme,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    gui: GUI
  ) {
    this.theme = theme;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.gui = gui;
  }

  /**
   * Load only the LUT being used for this scene
   */
  private loadLUT = async () => {
    const lutName = this.lutParams.lut[this.theme];
    const loader = new LUTCubeLoader();
    this.lutMap[lutName] = await loader.loadAsync(`/three/LUTs/${lutName}`);
  };

  /**
   * Load ALL of the LUTs - good for experimenting with GUI
   */
  private loadLUTs = async () => {
    let count = 0;
    const total = Object.keys(this.lutMap).length;

    return new Promise<void>((res, rej) => {
      Object.keys(this.lutMap).forEach((name) => {
        if (/\.CUBE$/i.test(name)) {
          new LUTCubeLoader()
            .loadAsync('/three/LUTs/' + name)
            .then((result: any) => {
              this.lutMap[name] = result;
              count++;
              if (count >= total - 1) {
                res();
              }
            });
        }
      });
    });
  };

  private addLUTControls = () => {
    this.gui.add(this.lutParams, 'enabled');
    // this.gui.add(this.lutParams.lut, this.theme, Object.keys(this.lutMap));
    this.gui.add(this.lutParams.intensity, this.theme, 0, 2, 0.1);
  };

  updateLUT = () => {
    const lutName = this.lutParams.lut[this.theme];
    const intensity = this.lutParams.intensity[this.theme];
    this.lutPass.enabled =
      this.lutParams.enabled && Boolean(this.lutMap[lutName]);
    this.lutPass.intensity = intensity;
    if (this.lutMap[lutName]) {
      const lut = this.lutMap[lutName];
      this.lutPass.lut = lut.texture3D;
    }
  };

  initComposers = async (): Promise<[EffectComposer, EffectComposer]> => {
    const renderScene = new RenderPass(this.scene, this.camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = this.bloomParams[this.theme].threshold;
    bloomPass.strength = this.bloomParams[this.theme].strength;
    bloomPass.radius = this.bloomParams[this.theme].radius;
    this.gui.add(bloomPass, 'threshold', 0, 1);
    this.gui.add(bloomPass, 'strength', 0, 3);
    this.gui.add(bloomPass, 'radius', 0, 3);

    const bloomComposer = new EffectComposer(this.renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        defines: {},
      }),
      'baseTexture'
    );
    finalPass.needsSwap = true;

    this.lutPass = new LUTPass({});
    await this.loadLUT();
    this.addLUTControls();
    this.updateLUT();

    const finalComposer = new EffectComposer(this.renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);
    finalComposer.addPass(this.lutPass);

    return [bloomComposer, finalComposer];
  };

  addToneMappingControl = (renderFn: () => void) => {
    this.gui.add(this.renderer, 'toneMappingExposure', 0, 5);
    const toneMappingOptions: Record<string, any> = {
      None: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
      Custom: THREE.CustomToneMapping,
    };
    this.gui
      .add(this.renderer, 'toneMapping', Object.keys(toneMappingOptions))
      .onChange(function (val: any) {
        this.renderer.toneMapping = toneMappingOptions[val as any];
        renderFn();
      });
  };
}
