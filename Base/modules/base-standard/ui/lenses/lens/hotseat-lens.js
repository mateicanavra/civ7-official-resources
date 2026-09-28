import LensManager from '../../../../core/ui/lenses/lens-manager.js';

class HotseatLens {
  activeLayers = /* @__PURE__ */ new Set([]);
  allowedLayers = /* @__PURE__ */ new Set([]);
}
LensManager.registerLens("fxs-hotseat-lens", new HotseatLens());
//# sourceMappingURL=hotseat-lens.js.map
