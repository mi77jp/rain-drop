// src/postfx/trigger.js

let passes = {};
let timeouts = {};

export function initPostEffectControl(registeredPasses) {
  passes = registeredPasses;
}

export function triggerEffect(name, duration = 300) {
  const pass = passes[name];
  if (!pass) return;

  clearTimeout(timeouts[name]);

  pass.enabled = true;
  if (name === 'glitch') {
    pass.goWild = true;
    pass.curF = 0;
  }

  timeouts[name] = setTimeout(() => {
    pass.enabled = false;
    if (name === 'glitch') pass.goWild = false;
  }, duration);
}
