// src/main.js
import './lib/reset.css';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { loadScenarioCSV } from './lib/parseCsv.js';
import { computeVerticalCharPosition } from './layout/verticalText.js';
import { setupPostEffects } from './postfx/setupPostEffects.js';
import { initPostEffectControl/*, triggerEffect*/ } from './postfx/trigger.js';

// ポストプロセッシング用 EffectComposer
let composer;

// グローバル状態
let font;// フォント自体
let group;// テキストグループ
let scene, camera, renderer;// Three.js シーン、カメラ、レンダラー

const state = {
  targetY: 1,
  scrollSpeed: 0,
  isPointerDown: false,
  pointerY: 0,
  pointerStartY: 0,
};

// 定数
const EASE = 10; // 目標yまでのイージング
const FONT_SIZE = 0.3; // フォントサイズ 基準値
const CHAR_GAP = 0.45; // 文字間隔 基準値
const MAX_SCROLL_SPEED = window.innerHeight / 7; // px/sec (100%)
const USE_POST_EFFECTS = false;
const CAMERA_Z = 5;
const FIXED_CHAR_WIDTH = 0.3;

// デバウンス用
const debouncedResize = debounce(rePosition, 100);

function init() {
  // シーン、カメラ、レンダラー
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = CAMERA_Z;
  document.body.appendChild(renderer.domElement);

  // ポストプロセッシングの設定
  const { composer: localComposer, passes } = setupPostEffects(renderer, scene, camera, USE_POST_EFFECTS);
  composer = localComposer;
  if (USE_POST_EFFECTS) initPostEffectControl(passes);

  // イベントリスナー設定
  window.addEventListener('resize', debouncedResize);
  window.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);
  window.addEventListener('pointerleave', handlePointerUp);
  window.addEventListener('touchmove', e => {e.preventDefault()}, { passive: false }); // タッチデバイスのデフォルト動作を無効化

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
        size: FONT_SIZE,
        height: 0.01,
      });

      // 文字の中心を原点に
      geometry.translate(-FIXED_CHAR_WIDTH / 2, 0, 0);

      // マテリアル
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(geometry, material);

      const { x, y } = computeVerticalCharPosition({ char, index: charIndex, charGap: CHAR_GAP });
      mesh.position.set(x, y, 0);
      group.add(mesh);

      charIndex++;
    });
  });

  group.position.set(0, state.targetY, 0);
  scene.add(group);
}

function animate() {
  requestAnimationFrame(animate);

  updateScrollSpeed();

  if (group) {
    state.targetY += state.scrollSpeed / 900; // フレームあたりの移動量
    const dy = (state.targetY - group.position.y) / EASE;
    group.position.y += dy;
  }

  if (USE_POST_EFFECTS && composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

function updateScrollSpeed() {
  if (!state.isPointerDown) {
    state.scrollSpeed = 0;
    return;
  }

  const height = window.innerHeight;
  const dy = state.pointerY - state.pointerStartY;
  const normalized = dy / (height / 6); // 押し始め位置を中心とする ±1
  const clamped = Math.max(-1, Math.min(1, normalized));

  state.scrollSpeed = clamped * MAX_SCROLL_SPEED; // px/sec
}

function handlePointerDown(e) {
  state.isPointerDown = true;
  state.pointerY = e.clientY;
  state.pointerStartY = e.clientY;
}

function handlePointerMove(e) {
  if (state.isPointerDown) {
    state.pointerY = e.clientY;
  }
}

function handlePointerUp() {
  state.isPointerDown = false;
  state.scrollSpeed = 0;
}

function rePosition() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// debounce 関数を `lib/` などに切り出して共通ユーティリティとして管理すると、他モジュールでも再利用できて保守性が高まります。
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 将来的な SSR や外部フレームワークとの統合を考慮するなら、イベントリスナーのラップや明示的な `start()` 関数のエクスポートも検討できます。
document.addEventListener('DOMContentLoaded', init);
