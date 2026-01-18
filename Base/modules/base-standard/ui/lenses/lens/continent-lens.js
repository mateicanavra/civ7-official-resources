import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

class ContinentLens {
  activeLayers = /* @__PURE__ */ new Set([
    "fxs-continent-layer",
    "fxs-hexgrid-layer",
    "fxs-culture-borders-layer",
    "fxs-resource-layer"
  ]);
  allowedLayers = /* @__PURE__ */ new Set([]);
  hasLegend = true;
}
LensManager.registerLens("fxs-continent-lens", new ContinentLens());
//# sourceMappingURL=continent-lens.js.map
