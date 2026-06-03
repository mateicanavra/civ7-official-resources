import LensManager from '../../../../core/ui/lenses/lens-manager.js';
import { TutorialLevel } from '../../tutorial/tutorial-item.js';

class FounderLens {
  constructor() {
    const isTutorial = Configuration.getUser().tutorialLevel === TutorialLevel.TutorialOn;
    this.skipCachingEnabledLayers = !isTutorial;
    if (!isTutorial) {
      this.activeLayers.add("fxs-settlement-recommendations-layer");
    }
  }
  activeLayers = /* @__PURE__ */ new Set([]);
  allowedLayers = /* @__PURE__ */ new Set(["fxs-hexgrid-layer", "fxs-resource-layer", "fxs-yields-layer"]);
  skipCachingEnabledLayers = true;
}
LensManager.registerLens("fxs-founder-lens", new FounderLens());

export { FounderLens };
//# sourceMappingURL=founder-lens.js.map
