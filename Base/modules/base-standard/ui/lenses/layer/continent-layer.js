import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import PlotIconsManager from '../../../../core/ui/plot-icons/plot-icons-manager.js';
import { O as OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.chunk.js';

const availableStyle = {
  style: "CultureBorder_Closed",
  primaryColor: 4294967295,
  secondaryColor: 16777215
};
const ownedStyle = {
  style: "CultureBorder_CityState_Closed",
  primaryColor: 4294967295,
  secondaryColor: 11184810
};
const CONTINENT_COLORS = [
  1291966711,
  // 0x4d -> ~0.3 alpha
  1293058559,
  1506607213,
  // 0x59 -> ~0.35 alpha
  1291893581,
  1724731392,
  // 0x66 -> 0.4 alpha
  1291911372
];
const ToggleContinentPanelEventName = "raise-continent-panel";
class ToggleContinentPanelEvent extends CustomEvent {
  constructor(enabled) {
    super(ToggleContinentPanelEventName, { bubbles: true, cancelable: true, detail: { enabled } });
  }
}
class ContinentLensLayer {
  static instance = new ContinentLensLayer();
  continentOverlayGroup = WorldUI.createOverlayGroup(
    "ContinentOverlayGroup",
    OVERLAY_PRIORITY.CONTINENT_LENS
  );
  continentOverlay = this.continentOverlayGroup.addPlotOverlay();
  // TODO unless they need to overlap, combine BorderOverlays into one with different group styles
  resourceOverlay = this.continentOverlayGroup.addBorderOverlay(availableStyle);
  unavailableResourceOverlay = this.continentOverlayGroup.addBorderOverlay(ownedStyle);
  ownedResourceOverlay = this.continentOverlayGroup.addBorderOverlay(ownedStyle);
  textOverlay = this.continentOverlayGroup.addSpriteOverlay();
  continentCoords = [];
  treasureCoords = [];
  naturalWonderCoords = [];
  get isExplorationAge() {
    return Game.age == Game.getHash("AGE_EXPLORATION");
  }
  get isModernAge() {
    return Game.age == Game.getHash("AGE_MODERN");
  }
  clearOverlay() {
    this.continentOverlayGroup.clearAll();
    this.continentOverlay.clear();
    this.resourceOverlay.clear();
    this.unavailableResourceOverlay.clear();
  }
  // Note: copied from tooltips with minor changes, consider moving elsewhere
  getContinentName(continentType) {
    if (continentType != -1) {
      const continent = GameInfo.Continents.lookup(continentType);
      if (continent == null) {
        console.error("Error retrieving continent name for lens!");
        return Locale.compose("LOC_TERM_NONE");
      } else {
        return Locale.compose(continent.Description ? continent.Description : "LOC_TERM_NONE");
      }
    } else {
      return Locale.compose("LOC_TERM_NONE");
    }
  }
  get continentsList() {
    return this.continentCoords;
  }
  initLayer() {
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.error(`continent-layer: Failed to find local player!`);
      return;
    }
    let nextColorIndex = 0;
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const plotCoord = { x, y };
        let inMap = false;
        const currentContinent = GameplayMap.getContinentType(plotCoord.x, plotCoord.y);
        if (GameplayMap.isNaturalWonder(plotCoord.x, plotCoord.y) && currentContinent == -1) {
          this.naturalWonderCoords.push(plotCoord);
        }
        if (currentContinent == -1) {
          continue;
        }
        for (const continentPlotList of this.continentCoords) {
          if (continentPlotList.continent == currentContinent) {
            continentPlotList.plotList.push(plotCoord);
            inMap = true;
          }
        }
        if (!inMap) {
          this.continentCoords.push({
            continent: currentContinent,
            plotList: [plotCoord],
            availableResources: 0,
            totalResources: 0,
            isDistant: true,
            color: CONTINENT_COLORS[nextColorIndex]
          });
          nextColorIndex++;
          if (nextColorIndex >= CONTINENT_COLORS.length) {
            console.error(
              "continent-layer: nextColorIndex greater than number of colors in CONTINENT_COLORS"
            );
          }
        }
        if (this.isExplorationAge) {
          const resource = GameplayMap.getResourceType(plotCoord.x, plotCoord.y);
          if (resource) {
            const resourceDef = GameInfo.Resources.lookup(resource);
            if (resourceDef && resourceDef.ResourceClassType == "RESOURCECLASS_TREASURE") {
              this.treasureCoords.push({ plotCoord, resourceDef });
            }
          }
          if (!player.isDistantLands(plotCoord)) {
            const continent = this.continentCoords.find((continent2) => {
              return continent2.continent == currentContinent;
            });
            if (continent) {
              continent.isDistant = false;
            }
          }
        }
      }
    }
  }
  applyLayer() {
    this.clearOverlay();
    for (const continentPlotList of this.continentCoords) {
      continentPlotList.availableResources = 0;
      continentPlotList.totalResources = 0;
      const revealedPlots = [];
      for (let coord = 0; coord < continentPlotList.plotList.length; coord++) {
        const revealedState = GameplayMap.getRevealedState(
          GameContext.localPlayerID,
          continentPlotList.plotList[coord].x,
          continentPlotList.plotList[coord].y
        );
        if (revealedState != RevealedStates.HIDDEN) {
          revealedPlots.push(continentPlotList.plotList[coord]);
        }
      }
      for (let coord = 0; coord < this.naturalWonderCoords.length; coord++) {
        const revealedState = GameplayMap.getRevealedState(
          GameContext.localPlayerID,
          this.naturalWonderCoords[coord].x,
          this.naturalWonderCoords[coord].y
        );
        if (revealedState != RevealedStates.HIDDEN) {
          revealedPlots.push(this.naturalWonderCoords[coord]);
        }
      }
      if (this.isExplorationAge) {
        const unavailablePlots = [];
        const availablePlots = [];
        const ownedPlots = [];
        for (const plotToResource of this.treasureCoords) {
          if (continentPlotList.plotList.find((plotCoord) => {
            return plotCoord == plotToResource.plotCoord;
          })) {
            const revealedState = GameplayMap.getRevealedState(
              GameContext.localPlayerID,
              plotToResource.plotCoord.x,
              plotToResource.plotCoord.y
            );
            if (revealedState != RevealedStates.HIDDEN) {
              const ownerID = GameplayMap.getOwner(
                plotToResource.plotCoord.x,
                plotToResource.plotCoord.y
              );
              if (ownerID == -1) {
                availablePlots.push(plotToResource.plotCoord);
                continentPlotList.availableResources++;
              } else if (ownerID == GameContext.localPlayerID) {
                ownedPlots.push(plotToResource.plotCoord);
              } else {
                unavailablePlots.push(plotToResource.plotCoord);
              }
              continentPlotList.totalResources++;
            }
          }
        }
        this.ownedResourceOverlay.setPlotGroups(ownedPlots, 2);
        this.unavailableResourceOverlay.setPlotGroups(unavailablePlots, 0);
        this.resourceOverlay.setPlotGroups(availablePlots, 1);
      } else if (this.isModernAge) {
        const ruinsPlots = [];
        const researchPlots = [];
        const naturalWonderPlots = [];
        const researchNum = Players.get(GameContext.localPlayerID)?.Culture?.getNumAgesAvailableToResearch(
          continentPlotList.continent
        ) ?? 0;
        continentPlotList.totalResources = Players.get(GameContext.localPlayerID)?.Culture?.getContinentRuralRuinCount(
          continentPlotList.continent
        ) ?? 0;
        const player = Players.get(GameContext.localPlayerID);
        if (player) {
          const playerStats = player.Stats;
          if (playerStats) {
            for (const plotCoordinate of revealedPlots) {
              const constructibles = MapConstructibles.getHiddenFilteredConstructibles(
                plotCoordinate.x,
                plotCoordinate.y
              );
              constructibles.forEach((item) => {
                const instance = Constructibles.getByComponentID(item);
                if (instance) {
                  const info = GameInfo.Constructibles.lookup(instance.type);
                  if (info) {
                    if (info.ConstructibleType == "IMPROVEMENT_RUINS") {
                      ruinsPlots.push(plotCoordinate);
                      continentPlotList.availableResources++;
                      PlotIconsManager.addPlotIcon(
                        "plot-icon-archeology",
                        plotCoordinate,
                        /* @__PURE__ */ new Map([["archeology", "IMPROVEMENT_RUINS"]])
                      );
                    }
                    if (info.ConstructibleType == "BUILDING_MUSEUM" && instance.complete && !instance.damaged && researchNum > 0) {
                      researchPlots.push(plotCoordinate);
                      PlotIconsManager.addPlotIcon(
                        "plot-icon-archeology",
                        plotCoordinate,
                        /* @__PURE__ */ new Map([["archeology", "BUILDING_MUSEUM"]])
                      );
                    }
                    if ((info.ConstructibleType == "BUILDING_UNIVERSITY" || info.ConstructibleType == "BUILDING_UNIVERSITY_MO") && instance.complete && !instance.damaged && researchNum > 0) {
                      researchPlots.push(plotCoordinate);
                      PlotIconsManager.addPlotIcon(
                        "plot-icon-archeology",
                        plotCoordinate,
                        /* @__PURE__ */ new Map([["archeology", "BUILDING_UNIVERSITY"]])
                      );
                    }
                  }
                }
              });
              if (GameplayMap.isNaturalWonder(plotCoordinate.x, plotCoordinate.y)) {
                if (playerStats.hasNaturalWonderArtifact(
                  GameplayMap.getFeatureType(plotCoordinate.x, plotCoordinate.y)
                )) {
                  naturalWonderPlots.push(plotCoordinate);
                  PlotIconsManager.addPlotIcon(
                    "plot-icon-archeology",
                    plotCoordinate,
                    /* @__PURE__ */ new Map([["archeology", "NATURAL_WONDER"]])
                  );
                }
              }
            }
          }
        }
        this.resourceOverlay.setPlotGroups(ruinsPlots, 1);
        this.resourceOverlay.setPlotGroups(researchPlots, 0);
        this.resourceOverlay.setPlotGroups(naturalWonderPlots, 2);
      }
      if (revealedPlots.length > 0) {
        this.continentOverlay.addPlots(revealedPlots, { fillColor: continentPlotList.color });
        const continentName = this.getContinentName(continentPlotList.continent);
        this.textOverlay.addRegionText(continentName, revealedPlots, 60, 8, {
          fonts: TITLE_FONTS,
          fontSize: 20
        });
      }
    }
    window.dispatchEvent(new ToggleContinentPanelEvent(true));
  }
  removeLayer() {
    window.dispatchEvent(new ToggleContinentPanelEvent(false));
    this.clearOverlay();
    PlotIconsManager.removePlotIcons("plot-icon-archeology");
  }
}
LensManager.registerLensLayer("fxs-continent-layer", ContinentLensLayer.instance);

export { CONTINENT_COLORS, ContinentLensLayer, ToggleContinentPanelEvent, ToggleContinentPanelEventName };
//# sourceMappingURL=continent-layer.js.map
