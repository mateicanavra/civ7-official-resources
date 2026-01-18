import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

class BuildingPlacementLens {
  activeLayers = /* @__PURE__ */ new Set([
    "fxs-hexgrid-layer",
    "fxs-resource-layer",
    "fxs-building-placement-layer",
    "fxs-city-borders-layer"
  ]);
  allowedLayers = /* @__PURE__ */ new Set(["fxs-appeal-layer"]);
}
LensManager.registerLens("fxs-building-placement-lens", new BuildingPlacementLens());
//# sourceMappingURL=building-placement-lens.js.map
