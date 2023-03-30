import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { LUTCubeResult } from 'three/examples/jsm/loaders/LUTCubeLoader';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

export default class ProcessingHelper {
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
    lutSF: 'Bourbon 64.CUBE',
    lutTokyo: 'Contrail 35.CUBE',
    intensitySF: 0.5,
    intensityTokyo: 0.8,
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
    gui: GUI
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
  };

  updateLUT = (isTokyo: boolean) => {
    const lutName = isTokyo ? this.lutParams.lutTokyo : this.lutParams.lutSF;
    const intensity = isTokyo
      ? this.lutParams.intensityTokyo
      : this.lutParams.intensitySF;
    this.lutPass.enabled =
      this.lutParams.enabled && Boolean(this.lutMap[lutName]);
    this.lutPass.intensity = intensity;
    if (this.lutMap[lutName]) {
      const lut = this.lutMap[lutName];
      this.lutPass.lut = lut.texture3D;
    }
  };

  initComposers = async (
    isTokyo: boolean
  ): Promise<[EffectComposer, EffectComposer]> => {
    const renderScene = new RenderPass(this.scene, this.camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 2;
    bloomPass.radius = 1;

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
    await this.loadLUTs();
    this.addLUTControls();
    this.updateLUT(isTokyo);

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
