import LensManager from '../../../../core/ui/lenses/lens-manager.js';

class DiplomacyLens {
  activeLayers = /* @__PURE__ */ new Set([]);
  allowedLayers = /* @__PURE__ */ new Set(["fxs-hexgrid-layer"]);
}
LensManager.registerLens("fxs-diplomacy-lens", new DiplomacyLens());
//# sourceMappingURL=diplomacy-lens.js.map
