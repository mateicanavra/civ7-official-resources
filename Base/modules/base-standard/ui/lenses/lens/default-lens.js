import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

class DefaultLens {
  activeLayers = /* @__PURE__ */ new Set(["fxs-culture-borders-layer", "fxs-operation-target-layer"]);
  allowedLayers = /* @__PURE__ */ new Set(["fxs-hexgrid-layer", "fxs-resource-layer"]);
  /**
   * Do not blend on transition.
   * Users are able to manage which layers to use in the default lens, so stick with those.
   */
  blendEnabledLayersOnTransition = false;
}
LensManager.registerLens("fxs-default-lens", new DefaultLens());
//# sourceMappingURL=default-lens.js.map
