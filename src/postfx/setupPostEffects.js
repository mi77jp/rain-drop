// src/postfx/setupPostEffects.js
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

export function setupPostEffects(renderer, scene, camera, useEffects = true) {
  if (!useEffects) return { composer: null, passes: {} };

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const passes = {
    glitch: new GlitchPass(),
    bloom: new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85),
    rgbShift: new ShaderPass(RGBShiftShader),
  };

  Object.values(passes).forEach((pass) => {
    pass.enabled = false;
    composer.addPass(pass);
  });

  return { composer, passes };
}
