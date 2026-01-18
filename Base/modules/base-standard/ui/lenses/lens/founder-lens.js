import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import { TutorialLevel } from '../../tutorial/tutorial-item.js';

class FounderLens {
  constructor() {
    const isTutorial = Configuration.getUser().tutorialLevel === TutorialLevel.TutorialOn;
    this.ignoreEnabledLayers = !isTutorial;
    if (!isTutorial) {
      this.activeLayers.add("fxs-settlement-recommendations-layer");
    }
  }
  activeLayers = /* @__PURE__ */ new Set([]);
  allowedLayers = /* @__PURE__ */ new Set(["fxs-resource-layer", "fxs-yields-layer"]);
  ignoreEnabledLayers = true;
}
LensManager.registerLens("fxs-founder-lens", new FounderLens());

export { FounderLens };
//# sourceMappingURL=founder-lens.js.map
