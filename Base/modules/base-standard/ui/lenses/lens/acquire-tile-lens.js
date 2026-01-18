import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

class AcquireTileLens {
  activeLayers = /* @__PURE__ */ new Set([
    "fxs-hexgrid-layer",
    "fxs-resource-layer",
    "fxs-worker-yields-layer",
    "fxs-city-borders-layer",
    "fxs-city-growth-improvements-layer"
  ]);
  allowedLayers = /* @__PURE__ */ new Set();
}
LensManager.registerLens("fxs-acquire-tile-lens", new AcquireTileLens());
//# sourceMappingURL=acquire-tile-lens.js.map
