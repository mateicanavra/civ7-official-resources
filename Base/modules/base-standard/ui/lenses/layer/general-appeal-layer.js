import { ContextManager } from '../../../../core/ui/context-manager/context-manager.js';
import LensManager from '../../../../core/ui/lenses/lens-manager.js';
import { HexToFloat4 } from '../../../../core/ui/utilities/utilities-color.js';
import { getGlobalParamNumber } from '../../../../core/ui/utilities/utilities-data.js';
import { HideMiniMapEvent } from '../../mini-map/panel-mini-map.js';
import { OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.js';

function toABGR(rgbHex, alpha) {
  const a = alpha <= 1 ? Math.round(alpha * 255) : alpha;
  const r = rgbHex >> 16 & 255;
  const g = rgbHex >> 8 & 255;
  const b = rgbHex & 255;
  return (a << 24 | b << 16 | g << 8 | r) >>> 0;
}
const NATURAL_WONDER_COLOR = HexToFloat4(2101501, 0.8);
const BREATHTAKING_COLOR = HexToFloat4(8192, 0.9);
const CHARMING_COLOR = toABGR(9484055, 0.9);
const AVERAGE_COLOR = HexToFloat4(10191233, 0.7);
const ToggleGeneralAppealPanelEventName = "raise-general-appeal-panel";
class ToggleGeneralAppealPanelEvent extends CustomEvent {
  constructor(enabled) {
    super(ToggleGeneralAppealPanelEventName, { bubbles: true, cancelable: true, detail: { enabled } });
  }
}
const ToggleGeneralAppealNumbersEventName = "raise-general-appeal-numbers";
class ToggleGeneralAppealNumbersEvent extends CustomEvent {
  constructor(enabled) {
    super(ToggleGeneralAppealNumbersEventName, { bubbles: true, cancelable: true, detail: { enabled } });
  }
}
class GeneralAppealLensLayer {
  generalAppealOverlayGroup = WorldUI.createOverlayGroup(
    "GeneralAppealOverlayGroup",
    OVERLAY_PRIORITY.HEX_GRID
  );
  appealSpriteGrid = WorldUI.createSpriteGrid("GeneralAppeal_SpriteGroup", true);
  generalAppealOverlay = this.generalAppealOverlayGroup.addPlotOverlay();
  naturalWonderPlots = [];
  breathtakingPlots = [];
  charmingPlots = [];
  averagePlots = [];
  offset = { x: 0, y: -18, z: 0 };
  fontData = { fonts: ["TitleFont"], fontSize: 6, faceCamera: true };
  backing = "unit_support-shadow";
  onToggleAppealNumbersListener = this.onToggleAppealNumbers.bind(this);
  clearOverlay() {
    this.generalAppealOverlayGroup.clearAll();
    this.generalAppealOverlay.clear();
    this.appealSpriteGrid.clear();
    this.appealSpriteGrid.setVisible(false);
    this.naturalWonderPlots = [];
    this.breathtakingPlots = [];
    this.charmingPlots = [];
    this.averagePlots = [];
  }
  onToggleAppealNumbers(event) {
    this.appealSpriteGrid.setVisible(event.detail.enabled);
  }
  initLayer() {
  }
  applyLayer() {
    this.clearOverlay();
    window.addEventListener(ToggleGeneralAppealNumbersEventName, this.onToggleAppealNumbersListener);
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
        const appeal = GameplayMap.getAppeal(x, y);
        const plotIndex = GameplayMap.getIndexFromXY(x, y);
        if (!GameplayMap.isWater(x, y) || GameplayMap.isNaturalWonder(x, y)) {
          this.appealSpriteGrid.addSprite(plotIndex, this.backing, this.offset, { scale: 1, alpha: 0.66 });
          this.appealSpriteGrid.addText(plotIndex, appeal.toString(), this.offset, this.fontData);
        }
        if (GameplayMap.isNaturalWonder(x, y)) {
          this.naturalWonderPlots.push({ x, y });
        } else {
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
    window.dispatchEvent(new HideMiniMapEvent(true));
    ContextManager.push("panel-general-appeal-legend", { singleton: true });
    window.dispatchEvent(new ToggleGeneralAppealPanelEvent(true));
  }
  removeLayer() {
    window.dispatchEvent(new HideMiniMapEvent(false));
    ContextManager.pop("panel-general-appeal-legend");
    window.dispatchEvent(new ToggleGeneralAppealPanelEvent(false));
    window.removeEventListener(ToggleGeneralAppealNumbersEventName, this.onToggleAppealNumbersListener);
    this.clearOverlay();
  }
}
LensManager.registerLensLayer("fxs-general-appeal-layer", new GeneralAppealLensLayer());

export { GeneralAppealLensLayer, ToggleGeneralAppealNumbersEvent, ToggleGeneralAppealNumbersEventName, ToggleGeneralAppealPanelEvent, ToggleGeneralAppealPanelEventName };
//# sourceMappingURL=general-appeal-layer.js.map
