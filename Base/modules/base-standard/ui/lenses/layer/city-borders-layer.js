import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import { C as ComponentID } from '../../../../core/ui/utilities/utilities-component-id.chunk.js';
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
class CityBordersLayer {
  cityOverlayGroup = WorldUI.createOverlayGroup(
    "CityBorderOverlayGroup",
    OVERLAY_PRIORITY.CULTURE_BORDER
  );
  /** Map of border overlays keyed by the PlotIndex of the city */
  borderOverlayMap = /* @__PURE__ */ new Map();
  /** Map of city center plot indexes keyed by plot indexes owned by that city */
  ownedPlotMap = /* @__PURE__ */ new Map();
  lastZoomLevel = -1;
  initLayer() {
    const alivePlayers = Players.getAlive();
    alivePlayers.forEach((player) => {
      if (player.isIndependent) {
        this.initBordersForIndependent(player);
      } else {
        this.initBordersForPlayer(player);
      }
    });
    engine.on("CameraChanged", this.onCameraChanged);
    engine.on("PlotOwnershipChanged", this.onPlotOwnershipChanged);
    this.cityOverlayGroup.setVisible(false);
  }
  getBorderOverlay(plotIndex) {
    const borderOverlay = this.borderOverlayMap.get(plotIndex);
    if (borderOverlay) {
      return borderOverlay;
    }
    const owningPlot = this.ownedPlotMap.get(plotIndex);
    if (owningPlot) {
      const borderOverlay2 = this.borderOverlayMap.get(owningPlot);
      if (borderOverlay2) {
        return borderOverlay2;
      }
    }
    return this.createBorderOverlay(plotIndex);
  }
  createBorderOverlay(plotIndex) {
    const borderOverlay = this.cityOverlayGroup.addBorderOverlay(defaultStyle);
    const plotLocation = GameplayMap.getLocationFromIndex(plotIndex);
    const ownerId = GameplayMap.getOwner(plotLocation.x, plotLocation.y);
    const owner = Players.get(ownerId);
    if (!owner) {
      console.error(
        `city-borders-layer: createBorderOverlay failed to create overlay for plotIndex ${plotIndex}`
      );
      return borderOverlay;
    }
    const primary = UI.Player.getPrimaryColorValueAsHex(owner.id);
    const secondary = UI.Player.getSecondaryColorValueAsHex(owner.id);
    const borderStyle = {
      style: "CultureBorder_Closed" /* Closed */,
      primaryColor: primary,
      secondaryColor: secondary
    };
    if (owner.isIndependent) {
      borderStyle.style = "CultureBorder_CityState_Open" /* CityStateOpen */;
      borderStyle.primaryColor = independentPrimaryColor;
      borderStyle.secondaryColor = independentSecondaryColor;
    } else if (!owner.isMajor) {
      borderStyle.style = "CultureBorder_CityState_Closed" /* CityStateClosed */;
    }
    borderOverlay.setDefaultStyle(borderStyle);
    this.borderOverlayMap.set(plotIndex, borderOverlay);
    return borderOverlay;
  }
  initBordersForPlayer(player) {
    const playerCities = player.Cities?.getCities();
    if (!playerCities) {
      console.error(`city-borders-layer: initLayer() failed to find cities for PlayerID ${player.id}`);
      return;
    }
    playerCities.forEach((city) => {
      const cityPlots = city.getPurchasedPlots();
      if (cityPlots.length > 0) {
        const cityPlotIndex = GameplayMap.getIndexFromLocation(city.location);
        this.ownedPlotMap.set(cityPlotIndex, cityPlotIndex);
        const borderOverlay = this.getBorderOverlay(cityPlotIndex);
        borderOverlay.setPlotGroups(cityPlots, 0);
        cityPlots.forEach((plotIndex) => {
          this.ownedPlotMap.set(plotIndex, cityPlotIndex);
        });
      }
    });
  }
  initBordersForIndependent(player) {
    let villagePlotIndex = -1;
    let plotIndexes = [];
    player.Constructibles?.getConstructibles().forEach((construct) => {
      const constructDef = GameInfo.Constructibles.lookup(construct.type);
      if (constructDef) {
        if (constructDef.ConstructibleType == "IMPROVEMENT_VILLAGE" || constructDef.ConstructibleType == "IMPROVEMENT_ENCAMPMENT") {
          villagePlotIndex = GameplayMap.getIndexFromLocation(construct.location);
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
    if (plotIndexes.length > 0) {
      const borderOverlay = this.getBorderOverlay(villagePlotIndex);
      borderOverlay.setPlotGroups(plotIndexes, 0);
    }
  }
  onPlotOwnershipChanged = (data) => {
    const plotIndex = GameplayMap.getIndexFromLocation(data.location);
    if (data.priorOwner != PlayerIds.NO_PLAYER) {
      const previousOverlay = this.getBorderOverlay(plotIndex);
      previousOverlay.clearPlotGroups(plotIndex);
      this.ownedPlotMap.delete(plotIndex);
    }
    if (data.owner != PlayerIds.NO_PLAYER) {
      this.ownedPlotMap.set(plotIndex, this.findCityCenterIndexForPlotIndex(plotIndex));
      const newOverlay = this.getBorderOverlay(plotIndex);
      newOverlay.setPlotGroups(plotIndex, 0);
    }
  };
  findCityCenterIndexForPlotIndex(plotIndex) {
    const plotCoord = GameplayMap.getLocationFromIndex(plotIndex);
    const owningCityId = GameplayMap.getOwningCityFromXY(plotCoord.x, plotCoord.y);
    if (!owningCityId) {
      return -1;
    }
    const player = Players.get(owningCityId.owner);
    if (!player) {
      console.error(
        `city-borders-layer: findCityCenterIndexForPlotIndex failed to find owning player for plotIndex ${plotIndex}`
      );
      return -1;
    }
    if (player.isIndependent) {
      let villagePlotIndex = -1;
      player.Constructibles?.getConstructibles().forEach((construct) => {
        const constructDef = GameInfo.Constructibles.lookup(construct.type);
        if (constructDef) {
          if (constructDef.ConstructibleType == "IMPROVEMENT_VILLAGE") {
            villagePlotIndex = GameplayMap.getIndexFromLocation(construct.location);
          }
        }
      });
      if (villagePlotIndex == -1) {
        console.error(
          `city-borders-layer: findCityCenterIndexForPlotIndex failed to find villagePlotIndex for plotIndex ${plotIndex}`
        );
      }
      return villagePlotIndex;
    }
    const owningCity = player.Cities?.getCities().find((city) => {
      return ComponentID.isMatch(city.id, owningCityId);
    });
    if (!owningCity) {
      console.error(
        `city-borders-layer: findCityCenterIndexForPlotIndex failed to find owningCity for plotIndex ${plotIndex}`
      );
      return -1;
    }
    return GameplayMap.getIndexFromLocation(owningCity.location);
  }
  onCameraChanged = (camera) => {
    if (this.lastZoomLevel != camera.zoomLevel) {
      this.lastZoomLevel = camera.zoomLevel;
      this.borderOverlayMap.forEach((borderOverlay) => {
        borderOverlay.setThicknessScale(camera.zoomLevel * thicknessZoomMultiplier);
      });
    }
  };
  applyLayer() {
    this.cityOverlayGroup.setVisible(true);
  }
  removeLayer() {
    this.cityOverlayGroup.setVisible(false);
  }
}
LensManager.registerLensLayer("fxs-city-borders-layer", new CityBordersLayer());
//# sourceMappingURL=city-borders-layer.js.map
