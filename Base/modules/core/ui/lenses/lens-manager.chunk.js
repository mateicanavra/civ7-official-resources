const LensLayerEnabledEventName = "lens-event-layer-enabled";
const LensLayerDisabledEventName = "lens-event-layer-disabled";
class LensLayerEvent extends CustomEvent {
  constructor(name, layer) {
    super(name, {
      bubbles: false,
      cancelable: false,
      detail: { layer }
    });
  }
}
const LensActivationEventName = "lens-event-active-lens";
class LensActivationEvent extends CustomEvent {
  constructor(prevLens, activeLens, hasLegend) {
    super(LensActivationEventName, {
      detail: {
        activeLens,
        prevLens,
        hasLegend
      }
    });
  }
}
class LensManagerSingleton {
  showDebugInfo = false;
  lenses = /* @__PURE__ */ new Map();
  layers = /* @__PURE__ */ new Map();
  activeLens;
  enabledLayers = /* @__PURE__ */ new Set();
  registerLens(lensType, lens) {
    if (this.lenses.has(lensType)) {
      console.error(`lens-manager: Attempted to add duplicate lens type: ${lensType}`);
      return;
    }
    this.lenses.set(lensType, lens);
  }
  registerLensLayer(layerType, layer) {
    if (this.layers.has(layerType)) {
      console.error(`lens-manager: Attempted to add duplicate layer type: ${layerType}`);
      return;
    }
    layer.initLayer();
    this.layers.set(layerType, layer);
    const lens = this.activeLens ? this.lenses.get(this.activeLens) : void 0;
    if (lens) {
      if (lens.activeLayers.has(layerType)) {
        this.enableLayer(layerType);
      }
    } else if (this.showDebugInfo) {
      console.log(`lens-manager: Failed to find '${this.activeLens}' during registerLensLayer.`);
    }
    if (this.getLayerOption(layerType) != layerType) {
      const enable = UI.getOption("user", "Gameplay", LensManager.getLayerOption(layerType));
      if (enable && !lens?.activeLayers.has(layerType)) {
        this.enableLayer(layerType);
      } else if (!enable && lens?.activeLayers.has(layerType)) {
        this.disableLayer(layerType);
      }
    }
  }
  getActiveLens() {
    if (this.activeLens === void 0) {
      console.error(`lens-manager: No active lens has been set yet`);
    }
    return this.activeLens;
  }
  setActiveLens(type) {
    if (type === this.activeLens) {
      return true;
    }
    const lens = this.lenses.get(type);
    if (lens == void 0) {
      console.error(`lens-manager: Failed to find lens for type ${type}`);
      return false;
    }
    if (this.activeLens !== void 0) {
      const prevLens = this.lenses.get(this.activeLens);
      if (prevLens != void 0) {
        if (!prevLens.ignoreEnabledLayers) {
          prevLens.lastEnabledLayers = new Set(this.enabledLayers);
        }
      }
    }
    const prevLensString = this.activeLens;
    this.activeLens = type;
    if (this.showDebugInfo) {
      console.info(`lens-manager: Leaving '${prevLensString}' lens.`);
      console.info(`lens-manager: Entering '${this.activeLens}' lens.`);
    }
    const nextLensLayers = lens.lastEnabledLayers ?? lens.activeLayers;
    const nextAllowedLayers = lens.allowedLayers;
    const canBlend = lens.blendEnabledLayersOnTransition !== false || lens.lastEnabledLayers == null;
    for (const layerType of this.enabledLayers) {
      const layer = this.layers.get(layerType);
      if (layer == void 0) {
        console.error(`lens-manager: Failed to find '${layerType}' while trying to disable inactive layers`);
        continue;
      }
      if (!nextLensLayers.has(layerType) && (!canBlend || !nextAllowedLayers.has(layerType))) {
        this.disableLayer(layerType);
      }
    }
    this.enableLayers(nextLensLayers);
    const hasLegend = lens?.hasLegend ?? false;
    window.dispatchEvent(new LensActivationEvent(prevLensString, this.activeLens, hasLegend));
    return true;
  }
  enableLayers(layerTypes) {
    for (const layerType of layerTypes) {
      this.enableLayer(layerType);
    }
  }
  enableLayer(layerType) {
    const layer = this.layers.get(layerType);
    if (layer == void 0) {
      console.error(`lens-manager: enableLayer failed to find lens layer for type '${layerType}'`);
      return false;
    }
    if (this.showDebugInfo && this.enabledLayers.has(layerType)) {
      console.info(`lens-manager: Lens layer '${layerType}' is already enabled!`);
      return false;
    }
    if (this.showDebugInfo) {
      console.info(`lens-manager: Enabling '${layerType}' layer`);
    }
    this.enabledLayers.add(layerType);
    layer.applyLayer();
    window.dispatchEvent(new LensLayerEvent(LensLayerEnabledEventName, layerType));
    return true;
  }
  disableLayer(layerType) {
    const layer = this.layers.get(layerType);
    if (layer == void 0) {
      console.error(`lens-manager: disableLayer failed to find lens layer for type '${layerType}'`);
      return false;
    }
    if (this.enabledLayers.has(layerType) == false) {
      console.warn(`lens-manager: Lens layer '${layerType}' is already disabled!`);
      return false;
    }
    if (this.showDebugInfo) {
      console.info(`lens-manager: Disabling '${layerType}' layer`);
    }
    this.enabledLayers.delete(layerType);
    layer.removeLayer();
    window.dispatchEvent(new LensLayerEvent(LensLayerDisabledEventName, layerType));
    return true;
  }
  getLayerOption(layerType) {
    const layer = this.layers.get(layerType);
    if (layer == void 0) {
      console.error(`lens-manager: enableLayer failed to find lens layer for type '${layerType}'`);
      return "";
    }
    if (typeof layer.getOptionName !== "undefined") {
      return layer.getOptionName();
    }
    return layerType;
  }
  /**
   * toggleLayer toggles a layer on or off
   *
   * @param layerType The name of layer to toggle
   * @param force If true, forces the layer to be enabled. If false, forces the layer to be disabled. If undefined, toggles the layer.
   *
   * @returns true if the layer was toggled, false if the layer was already in the desired state
   */
  toggleLayer(layerType, force = void 0) {
    const layer = this.layers.get(layerType);
    if (layer == void 0) {
      console.error(`lens-manager: toggleLayer failed to find lens layer for type '${layerType}'`);
      return false;
    }
    const enable = force ?? !this.enabledLayers.has(layerType);
    if (enable) {
      return this.enableLayer(layerType);
    } else {
      return this.disableLayer(layerType);
    }
  }
  isLayerEnabled(layerType) {
    const layer = this.layers.get(layerType);
    if (layer == void 0) {
      console.error(`lens-manager: isLayerEnabled failed to find lens layer for type '${layerType}'`);
      return false;
    }
    return this.enabledLayers.has(layerType);
  }
}
const LensManager = new LensManagerSingleton();

export { LensManager as L, LensActivationEventName as a, LensLayerEnabledEventName as b, LensLayerDisabledEventName as c };
//# sourceMappingURL=lens-manager.chunk.js.map
