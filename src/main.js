import './lib/reset.css';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { loadScenarioCSV } from './lib/parseCsv.js';
import { computeVerticalCharPosition } from './layout/verticalText.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

let composer;


// グローバル変数
let font;
let group;
let targetY = 1;
let scrollSpeed = 0;
let isPointerDown = false;
let pointerY = 0;
let pointerStartY = 0;

const ease = 10;
const fontSize = 0.3;
const charGap = 0.45;
const maxScrollSpeed = window.innerHeight / 10; // px/sec (100%)

// デバウンス用
const debouncedResize = debounce(rePosition, 100);

// シーン、カメラ、レンダラー
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

function init() {
  camera.position.z = 5;
  document.body.appendChild(renderer.domElement);

  const postEffects = {
    glitch: new GlitchPass(),
    bloom: new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85),
    rgbShift: new ShaderPass(RGBShiftShader),
    dotScreen: new ShaderPass(DotScreenShader)
  };
  // DotScreen
  postEffects.dotScreen.uniforms.scale.value = 5;
  postEffects.dotScreen.uniforms.angle.value = Math.PI / 4;

  composer = new EffectComposer(renderer);

  // レンダーパスの追加
  composer.addPass(new RenderPass(scene, camera));
  Object.values(postEffects).forEach((pass) => {
    pass.enabled = false;
    composer.addPass(pass);
  });

  window.triggerEffect = (key, duration = 300) => {
    const pass = postEffects[key];
    if (!pass) return;
    pass.enabled = true;
    setTimeout(() => pass.enabled = false, duration);
  };

  // イベントリスナーの設定
  window.addEventListener('resize', debouncedResize);
  window.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('touchmove', e => {e.preventDefault()}, { passive: false }); // タッチデバイスのデフォルト動作を無効化  
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp)
  window.addEventListener('pointerleave', handlePointerUp);

  // フォントの読み込み
  const loader = new FontLoader();
  loader.load(import.meta.env.BASE_URL + 'fonts/noto-serif-jp-regular.typeface.json', (fontLoaded) => {
    font = fontLoaded;
    loadScenario();
  });

  // アニメーションの開始
  animate();
}

// シナリオの読み込み
function loadScenario() {
  loadScenarioCSV(import.meta.env.BASE_URL + 'data/scenario.csv').then(data => {
    createTextGroup(data);
  });
}

// テキストグループの作成
function createTextGroup(data) {
  group = new THREE.Group();
  let charIndex = 0;

  data.forEach((node) => {
    const chars = node.text.split('');
    chars.forEach((char) => {
      const geometry = new TextGeometry(char, {
        font,
        size: fontSize,
        height: 0.01,
      });

      // 文字の中心を原点に
      const fixedCharWidth = 0.3;
      geometry.translate(-fixedCharWidth / 2, 0, 0);

      // マテリアル
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(geometry, material);

      const { x, y } = computeVerticalCharPosition({ char, index: charIndex, charGap });
      mesh.position.set(x, y, 0);
      group.add(mesh);

      charIndex++;
    });
  });

  group.position.set(0, targetY, 0);
  scene.add(group);
}

function animate() {
  requestAnimationFrame(animate);

  updateScrollSpeed();

  if (group) {
    targetY += scrollSpeed / 900; // フレームあたりの移動量
    const dy = (targetY - group.position.y) / ease;
    group.position.y += dy;
  }

  composer.render();
  //renderer.render(scene, camera);
}

function updateScrollSpeed() {
  if (!isPointerDown) {
    scrollSpeed = 0;
    return;
  }

  const height = window.innerHeight;
  const dy = pointerY - pointerStartY;
  const normalized = dy / (height / 6); // 押し始め位置を中心とする ±1
  const clamped = Math.max(-1, Math.min(1, normalized));

  scrollSpeed = clamped * maxScrollSpeed; // px/sec
}

function handlePointerDown(e) {
  isPointerDown = true;
  pointerY = e.clientY;
  pointerStartY = e.clientY;
}

function handlePointerMove(e) {
  if (isPointerDown) {
    pointerY = e.clientY;
  }
}

function handlePointerUp() {
  isPointerDown = false;
  scrollSpeed = 0;
}

function rePosition() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', init);
