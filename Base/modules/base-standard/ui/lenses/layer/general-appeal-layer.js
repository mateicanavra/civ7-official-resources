import LensManager from '../../../../core/ui/lenses/lens-manager.js';
import { HexToFloat4 } from '../../../../core/ui/utilities/utilities-color.js';
import { getGlobalParamNumber } from '../../../../core/ui/utilities/utilities-data.js';
import { OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.js';

const NATURAL_WONDER_COLOR = HexToFloat4(2101501, 0.8);
const BREATHTAKING_COLOR = HexToFloat4(8192, 0.9);
const CHARMING_COLOR = HexToFloat4(1400329, 0.85);
const AVERAGE_COLOR = HexToFloat4(10191233, 0.7);
const ToggleGeneralAppealPanelEventName = "raise-general-appeal-panel";
class ToggleGeneralAppealPanelEvent extends CustomEvent {
  constructor(enabled) {
    super(ToggleGeneralAppealPanelEventName, { bubbles: true, cancelable: true, detail: { enabled } });
  }
}
class GeneralAppealLensLayer {
  generalAppealOverlayGroup = WorldUI.createOverlayGroup(
    "GeneralAppealOverlayGroup",
    OVERLAY_PRIORITY.HEX_GRID
  );
  generalAppealOverlay = this.generalAppealOverlayGroup.addPlotOverlay();
  naturalWonderPlots = [];
  breathtakingPlots = [];
  charmingPlots = [];
  averagePlots = [];
  clearOverlay() {
    this.generalAppealOverlayGroup.clearAll();
    this.generalAppealOverlay.clear();
    this.naturalWonderPlots = [];
    this.breathtakingPlots = [];
    this.charmingPlots = [];
    this.averagePlots = [];
  }
  initLayer() {
  }
  applyLayer() {
    this.clearOverlay();
    const breathtakingThreshold = getGlobalParamNumber("APPEAL_FOR_DOUBLE_HAPPINESS_TILE_YIELD");
    const charmingThreshold = getGlobalParamNumber("APPEAL_FOR_HAPPINESS_TILE_YIELD");
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const isHidden = GameplayMap.getRevealedState(GameContext.localPlayerID, x, y) == RevealedStates.HIDDEN;
        if (isHidden) {
          continue;
        }
        if (GameplayMap.isNaturalWonder(x, y)) {
          this.naturalWonderPlots.push({ x, y });
        } else {
          const appeal = GameplayMap.getAppeal(x, y);
          if (appeal >= breathtakingThreshold) {
            this.breathtakingPlots.push({ x, y });
          } else if (appeal >= charmingThreshold) {
            this.charmingPlots.push({ x, y });
          } else if (!GameplayMap.isWater(x, y)) {
            this.averagePlots.push({ x, y });
          }
        }
      }
    }
    this.generalAppealOverlay.addPlots(this.naturalWonderPlots, { fillColor: NATURAL_WONDER_COLOR });
    this.generalAppealOverlay.addPlots(this.breathtakingPlots, { fillColor: BREATHTAKING_COLOR });
    this.generalAppealOverlay.addPlots(this.charmingPlots, { fillColor: CHARMING_COLOR });
    this.generalAppealOverlay.addPlots(this.averagePlots, { fillColor: AVERAGE_COLOR });
    window.dispatchEvent(new ToggleGeneralAppealPanelEvent(true));
  }
  removeLayer() {
    window.dispatchEvent(new ToggleGeneralAppealPanelEvent(false));
    this.clearOverlay();
  }
}
LensManager.registerLensLayer("fxs-general-appeal-layer", new GeneralAppealLensLayer());

export { GeneralAppealLensLayer, ToggleGeneralAppealPanelEvent, ToggleGeneralAppealPanelEventName };
//# sourceMappingURL=general-appeal-layer.js.map
