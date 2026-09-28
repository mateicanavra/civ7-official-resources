import { createSignal, onMount, onCleanup } from '../../vendor/solid-js/dist/solid.js';

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
let debugWidgetUpdatedEventHandle = null;
let debugWidgetEventRefCount = 0;
const widgetRegistry = /* @__PURE__ */ new Map();
function handleDebugWidgetUpdated(id, value) {
  const entry = widgetRegistry.get(id);
  if (entry) {
    entry.setter(value);
  }
}
function createSignalFromExistingDebugWidget(id) {
  let entry = widgetRegistry.get(id);
  if (entry == null) {
    const [getter, setter] = createSignal(UI.Debug.getWidgetValue(id));
    entry = { getter, setter };
    widgetRegistry.set(id, entry);
  }
  onMount(() => {
    debugWidgetEventRefCount++;
    if (debugWidgetEventRefCount == 1) {
      debugWidgetUpdatedEventHandle = registerEngineEvent("DebugWidgetUpdated", handleDebugWidgetUpdated);
    }
  });
  onCleanup(() => {
    debugWidgetEventRefCount--;
    if (debugWidgetEventRefCount == 0) {
      debugWidgetUpdatedEventHandle?.clear();
      debugWidgetUpdatedEventHandle = null;
    }
  });
  return entry.getter;
}
function createSignalFromDebugWidget(widget) {
  onMount(() => {
    UI.Debug.registerWidget(widget);
    onCleanup(() => {
      UI.Debug.deleteWidget(widget.id);
    });
  });
  return createSignalFromExistingDebugWidget(widget.id);
}

export { createSignalFromDebugWidget, createSignalFromExistingDebugWidget };
//# sourceMappingURL=debug-widgets.js.map
