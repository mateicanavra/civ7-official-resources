import LensManager from '../../../../core/ui/lenses/lens-manager.js';

class GeneralAppealLens {
  activeLayers = /* @__PURE__ */ new Set(["fxs-general-appeal-layer"]);
  allowedLayers = /* @__PURE__ */ new Set([
    "fxs-hexgrid-layer",
    "fxs-resource-layer",
    "fxs-culture-borders-layer",
    "fxs-yields-layer"
  ]);
  hasLegend = true;
}
LensManager.registerLens("fxs-general-appeal-lens", new GeneralAppealLens());
//# sourceMappingURL=general-appeal-lens.js.map
