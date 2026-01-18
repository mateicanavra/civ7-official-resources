import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

class SettlerLens {
  activeLayers = /* @__PURE__ */ new Set([
    "fxs-appeal-layer",
    "fxs-resource-layer",
    "fxs-random-events-layer",
    "fxs-settlement-recommendations-layer",
    "fxs-yields-layer",
    "fxs-culture-borders-layer"
  ]);
  allowedLayers = /* @__PURE__ */ new Set(["fxs-hexgrid-layer"]);
  hasLegend = true;
}
LensManager.registerLens("fxs-settler-lens", new SettlerLens());
//# sourceMappingURL=settler-lens.js.map
