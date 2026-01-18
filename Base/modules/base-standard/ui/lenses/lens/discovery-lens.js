import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

class DiscoveryLens {
  activeLayers = /* @__PURE__ */ new Set([
    "fxs-discovery-layer",
    "fxs-culture-borders-layer",
    "fxs-operation-target-layer"
  ]);
  allowedLayers = /* @__PURE__ */ new Set(["fxs-hexgrid-layer", "fxs-resource-layer", "fxs-yields-layer"]);
  ignoreEnabledLayers = true;
}
LensManager.registerLens("fxs-discovery-lens", new DiscoveryLens());
//# sourceMappingURL=discovery-lens.js.map
