import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import { O as OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.chunk.js';

var BorderStyleTypes = /* @__PURE__ */ ((BorderStyleTypes2) => {
  BorderStyleTypes2["Closed"] = "CultureBorder_Closed";
  BorderStyleTypes2["CityStateClosed"] = "CultureBorder_CityState_Closed";
  BorderStyleTypes2["CityStateOpen"] = "CultureBorder_CityState_Open";
  return BorderStyleTypes2;
})(BorderStyleTypes || {});
const independentPrimaryColor = 4281545523;
const independentSecondaryColor = 4291624959;
const defaultStyle = {
  style: "CultureBorder_CityState_Open" /* CityStateOpen */,
  primaryColor: independentPrimaryColor,
  secondaryColor: independentSecondaryColor
};
const thicknessZoomMultiplier = 3;
class CultureBordersLayer {
  cultureOverlayGroup = WorldUI.createOverlayGroup(
    "CultureBorderOverlayGroup",
    OVERLAY_PRIORITY.CULTURE_BORDER
  );
  cultureBorderOverlay = this.cultureOverlayGroup.addBorderOverlay(defaultStyle);
  lastZoomLevel = -1;
  /**
   * @implements ILensLayer
   */
  initLayer() {
    const alivePlayers = Players.getAlive();
    alivePlayers.forEach((player) => {
      const plotsForPlayer = player.isIndependent ? this.findPlotsForIndependent(player) : this.findPlotsForPlayerOrCityState(player);
      const primary = UI.Player.getPrimaryColorValueAsHex(player.id);
      const secondary = UI.Player.getSecondaryColorValueAsHex(player.id);
      const borderStyle = {
        style: "CultureBorder_Closed" /* Closed */,
        primaryColor: primary,
        secondaryColor: secondary
      };
      if (player.isIndependent) {
        borderStyle.style = "CultureBorder_CityState_Open" /* CityStateOpen */;
        borderStyle.primaryColor = independentPrimaryColor;
        borderStyle.secondaryColor = independentSecondaryColor;
      } else if (!player.isMajor) {
        borderStyle.style = "CultureBorder_CityState_Closed" /* CityStateClosed */;
      }
      this.cultureBorderOverlay.setGroupStyle(player.id, borderStyle);
      if (plotsForPlayer.length > 0) {
        this.cultureBorderOverlay.setPlotGroups(plotsForPlayer, player.id);
      }
    });
    this.cultureOverlayGroup.setVisible(false);
    engine.on("CameraChanged", this.onCameraChanged);
    engine.on("PlotOwnershipChanged", this.onPlotOwnershipChanged);
  }
  /**
   * @implements ILensLayer
   */
  applyLayer() {
    this.cultureOverlayGroup.setVisible(true);
  }
  /**
   * @implements ILensLayer
   */
  removeLayer() {
    this.cultureOverlayGroup.setVisible(false);
  }
  findPlotsForPlayerOrCityState(player) {
    let plotIndexes = [];
    const playerCities = player.Cities?.getCities();
    if (!playerCities) {
      console.error(`city-borders-layer: initLayer() failed to find cities for PlayerID ${player.id}`);
      return plotIndexes;
    }
    playerCities.forEach((city) => {
      const cityPlots = city.getPurchasedPlots();
      plotIndexes = plotIndexes.concat(cityPlots);
    });
    return plotIndexes;
  }
  findPlotsForIndependent(player) {
    let plotIndexes = [];
    player.Constructibles?.getConstructibles().forEach((construct) => {
      const constructDef = GameInfo.Constructibles.lookup(construct.type);
      if (constructDef) {
        if (constructDef.ConstructibleType == "IMPROVEMENT_VILLAGE" || constructDef.ConstructibleType == "IMPROVEMENT_ENCAMPMENT") {
          const villagePlotIndex = GameplayMap.getIndexFromLocation(construct.location);
          plotIndexes = plotIndexes.concat(villagePlotIndex);
          const adjacentPlotDirection = [
            DirectionTypes.DIRECTION_NORTHEAST,
            DirectionTypes.DIRECTION_EAST,
            DirectionTypes.DIRECTION_SOUTHEAST,
            DirectionTypes.DIRECTION_SOUTHWEST,
            DirectionTypes.DIRECTION_WEST,
            DirectionTypes.DIRECTION_NORTHWEST
          ];
          for (let directionIndex = 0; directionIndex < adjacentPlotDirection.length; directionIndex++) {
            const plot = GameplayMap.getAdjacentPlotLocation(
              construct.location,
              adjacentPlotDirection[directionIndex]
            );
            const owner = GameplayMap.getOwner(plot.x, plot.y);
            if (owner == player.id) {
              plotIndexes = plotIndexes.concat(GameplayMap.getIndexFromLocation(plot));
            }
          }
        }
      }
    });
    return plotIndexes;
  }
  onPlotOwnershipChanged = (data) => {
    const plotIndex = GameplayMap.getIndexFromLocation(data.location);
    if (data.priorOwner != PlayerIds.NO_PLAYER) {
      this.cultureBorderOverlay.clearPlotGroups(plotIndex);
    }
    if (data.owner != PlayerIds.NO_PLAYER) {
      this.cultureBorderOverlay.setPlotGroups(plotIndex, data.owner);
    }
  };
  onCameraChanged = (camera) => {
    if (this.lastZoomLevel != camera.zoomLevel) {
      this.lastZoomLevel = camera.zoomLevel;
      this.cultureBorderOverlay?.setThicknessScale(camera.zoomLevel * thicknessZoomMultiplier);
    }
  };
}
LensManager.registerLensLayer("fxs-culture-borders-layer", new CultureBordersLayer());
//# sourceMappingURL=culture-borders-layer.js.map
