import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';

class CinematicLens {
  activeLayers = /* @__PURE__ */ new Set([]);
  allowedLayers = /* @__PURE__ */ new Set([]);
}
LensManager.registerLens("fxs-cinematic-lens", new CinematicLens());
//# sourceMappingURL=cinematic-lens.js.map
