import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import LensManager from '../../../../core/ui/lenses/lens-manager.js';
import { HexToFloat4 } from '../../../../core/ui/utilities/utilities-color.js';
import { OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.js';

const SETTLEMENT_BLOCKED_COLOR = HexToFloat4(6883593, 0.6);
const SETTLEMENT_OKAY_COLOR = HexToFloat4(11836968, 0.6);
const SETTLEMENT_GOOD_COLOR = HexToFloat4(2682558, 0.45);
class AppealLensLayer {
  cityAddedToMapListener = () => {
    this.onCityAddedToMap();
  };
  appealOverlayGroup = WorldUI.createOverlayGroup("AppealOverlayGroup", OVERLAY_PRIORITY.SETTLER_LENS);
  appealOverlay = this.appealOverlayGroup.addPlotOverlay();
  blockedPlots = [];
  bestPlots = [];
  okayPlots = [];
  clearOverlay() {
    this.appealOverlayGroup.clearAll();
    this.appealOverlay.clear();
    this.blockedPlots = [];
    this.bestPlots = [];
    this.okayPlots = [];
    engine.off("CityInitialized", this.cityAddedToMapListener);
  }
  initLayer() {
  }
  applyLayer() {
    this.clearOverlay();
    engine.on("CityInitialized", this.cityAddedToMapListener);
    const localPlayer = Players.get(GameContext.localPlayerID);
    const localPlayerDiplomacy = localPlayer?.Diplomacy;
    if (!localPlayerDiplomacy) {
      console.error("appeal-layer: Unable to find local player diplomacy!");
      return;
    }
    const isInPlacementMode = InterfaceMode.isInInterfaceMode("INTERFACEMODE_BONUS_PLACEMENT");
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const plotCoord = { x, y };
        if (isInPlacementMode) {
          if (!GameplayMap.isPlotInAdvancedStartRegion(GameContext.localPlayerID, x, y)) {
            this.blockedPlots.push(plotCoord);
            continue;
          }
        }
        if (!localPlayerDiplomacy.isValidLandClaimLocation(plotCoord, true)) {
          if (GameplayMap.isWater(x, y)) {
            continue;
          }
          this.blockedPlots.push(plotCoord);
          continue;
        }
        if (GameplayMap.isFreshWater(x, y)) {
          this.bestPlots.push(plotCoord);
          continue;
        }
        this.okayPlots.push(plotCoord);
      }
    }
    this.appealOverlay.addPlots(this.blockedPlots, { fillColor: SETTLEMENT_BLOCKED_COLOR });
    this.appealOverlay.addPlots(this.bestPlots, { fillColor: SETTLEMENT_GOOD_COLOR });
    this.appealOverlay.addPlots(this.okayPlots, { fillColor: SETTLEMENT_OKAY_COLOR });
  }
  onCityAddedToMap() {
    this.applyLayer();
  }
  removeLayer() {
    this.clearOverlay();
  }
}
LensManager.registerLensLayer("fxs-appeal-layer", new AppealLensLayer());
//# sourceMappingURL=appeal-layer.js.map
