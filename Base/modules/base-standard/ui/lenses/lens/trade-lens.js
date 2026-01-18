import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

class TradeLens {
  activeLayers = /* @__PURE__ */ new Set([
    "fxs-hexgrid-layer",
    "fxs-resource-layer",
    "fxs-culture-borders-layer",
    "fxs-trade-layer"
  ]);
  allowedLayers = /* @__PURE__ */ new Set([]);
  hasLegend = true;
}
LensManager.registerLens("fxs-trade-lens", new TradeLens());
//# sourceMappingURL=trade-lens.js.map
