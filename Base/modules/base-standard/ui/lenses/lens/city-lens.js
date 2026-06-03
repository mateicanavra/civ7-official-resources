import LensManager from '../../../../core/ui/lenses/lens-manager.js';

class CityLens {
  activeLayers = /* @__PURE__ */ new Set([
    "fxs-hexgrid-layer",
    "fxs-resource-layer",
    "fxs-yields-layer",
    "fxs-city-borders-layer"
  ]);
  allowedLayers = /* @__PURE__ */ new Set(["fxs-appeal-layer"]);
}
LensManager.registerLens("fxs-city-lens", new CityLens());
//# sourceMappingURL=city-lens.js.map
