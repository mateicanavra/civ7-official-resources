import { c as createSignal, o as onMount, d as onCleanup } from '../components/panel.chunk.js';

let engineIsReady = false;
function registerEngineEvent(name, callback) {
  if (engineIsReady) {
    engine.on(name, callback);
    return {
      clear: () => engine.off(name, callback)
    };
  } else {
    let isRegistered = false;
    let isCancelled = false;
    engine.whenReady.then(() => {
      engineIsReady = true;
      if (!isCancelled) {
        engine.on(name, callback);
      }
      isRegistered = true;
    });
    return {
      clear: () => {
        if (isRegistered) {
          engine.off(name, callback);
        } else {
          isCancelled = true;
        }
      }
    };
  }
}
const signalRegistry = /* @__PURE__ */ new Map();
function createEngineEvent(name) {
  let registration = signalRegistry.get(name);
  if (!registration) {
    registration = {
      signal: createSignal(),
      refCount: 0,
      handle: null
    };
  }
  onMount(() => {
    registration.refCount++;
    if (registration.refCount == 1) {
      registration.handle = registerEngineEvent(name, registration.signal[1]);
    }
  });
  onCleanup(() => {
    registration.refCount--;
    if (registration.refCount == 0) {
      registration.handle?.clear();
      registration.handle = null;
    }
  });
  return registration?.signal[0];
}
function cleanObject(object) {
  for (const prop in object) {
    if (object[prop] === void 0) {
      delete object[prop];
    }
  }
  return object;
}

export { createEngineEvent as a, cleanObject as c };
//# sourceMappingURL=game-core-utilities.chunk.js.map
