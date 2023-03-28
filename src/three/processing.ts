import * as THREE from 'three';
import { LUTCubeResult } from 'three/examples/jsm/loaders/LUTCubeLoader';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader.js';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

export default class ProcessingHelper {
  camera: THREE.Camera;
  composer: EffectComposer;
  gui: GUI;
  lutPass: LUTPass;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;

  lutParams = {
    enabled: true,
    lut: 'Bourbon 64.CUBE',
    intensity: 0.5,
    use2DLut: false,
    autoRotate: true,
  };

  lutMap: Record<string, any> = {
    'Arabica 12.CUBE': null,
    'Ava 614.CUBE': null, // bright contrast
    'Azrael 93.CUBE': null,
    'Bourbon 64.CUBE': null, // ***** classy, warm, bright *****
    'Byers 11.CUBE': null, // pink/purple/contrast
    'Chemical 168.CUBE': null, // yellowgreen < good to balance magenta?
    'Clayton 33.CUBE': null,
    'Clouseau 54.CUBE': null,
    'Cobi 3.CUBE': null,
    'Contrail 35.CUBE': null, // contrast, p flat
    'Cubicle 99.CUBE': null,
    'Django 25.CUBE': null,
    'Domingo 145.CUBE': null, // darker contrast
    'Faded 47.CUBE': null,
    'Folger 50.CUBE': null,
    'Fusion 88.CUBE': null,
    'Hyla 68.CUBE': null, // + pinkish
    'Korben 214.CUBE': null, // + similar to bourbon, less bright
    'Lenox 340.CUBE': null,
    'Lucky 64.CUBE': null, // desaturated a bit
    'McKinnon 75.CUBE': null,
    'Milo 5.CUBE': null,
    'Neon 770.CUBE': null, // < maybe for tokyo
    'Paladin 1875.CUBE': null,
    'Pasadena 21.CUBE': null,
    'Pitaya 15.CUBE': null,
    'Reeve 38.CUBE': null,
    'Remy 24.CUBE': null,
    'Sprocket 231.CUBE': null,
    'Teigen 28.CUBE': null,
    'Trent 18.CUBE': null,
    'Tweed 71.CUBE': null, //
    'Vireo 37.CUBE': null,
    'Zed 32.CUBE': null,
    'Zeke 39.CUBE': null,
    'Presetpro-Cinematic.3dl': null,
  };

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    gui: GUI,
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.gui = gui;
  }

  loadLUT = async (): Promise<LUTCubeResult> => {
    return new Promise((res, rej) => {
      new LUTCubeLoader()
        .loadAsync('/three/LUTs/Bourbon 64.CUBE')
        .then((result: any) => {
          res(result);
        });
    });
  };

  loadLUTs = async () => {
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

  addLUTControls = () => {
    this.gui.add(this.lutParams, 'enabled');
    this.gui.add(this.lutParams, 'lut', Object.keys(this.lutMap));
    this.gui.add(this.lutParams, 'intensity').min(0).max(1);
  };

  updateLUT = () => {
    this.lutPass.enabled =
      this.lutParams.enabled && Boolean(this.lutMap[this.lutParams.lut]);
    this.lutPass.intensity = this.lutParams.intensity;
    if (this.lutMap[this.lutParams.lut]) {
      const lut = this.lutMap[this.lutParams.lut];
      this.lutPass.lut = lut.texture3D;
    }
  };

  initComposer = async (): Promise<EffectComposer> => {
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

    const composer = new EffectComposer(this.renderer, target);
    composer.setPixelRatio(window.devicePixelRatio);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(new RenderPass(this.scene, this.camera));

    this.lutPass = new LUTPass({});
    await this.loadLUTs();
    composer.addPass(this.lutPass);
    this.addLUTControls();
    this.updateLUT();

    this.composer = composer;
    return composer;
  };

  addToneMappingControl = (
    renderFn: () => void
  ) => {
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
