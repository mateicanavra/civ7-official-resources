import { PlotCursorUpdatedEventName } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { BuildingPlacementManager } from '../building-placement/building-placement-manager.js';
import { UpdatePlacementCityBannerEvent } from '../placement-city-banner/placement-city-banner.js';
import PlotWorkersManager, { PlotWorkersHoveredPlotChangedEventName } from '../plot-workers/plot-workers-manager.js';
import { C as CityYields } from '../utilities/utilities-city-yields.chunk.js';
import { YieldBarEntryStyle } from '../yield-bar-base/yield-bar-base.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';

var PlacePopulationSelectionState = /* @__PURE__ */ ((PlacePopulationSelectionState2) => {
  PlacePopulationSelectionState2[PlacePopulationSelectionState2["NONE"] = 0] = "NONE";
  PlacePopulationSelectionState2[PlacePopulationSelectionState2["ADD_IMPROVEMENT"] = 1] = "ADD_IMPROVEMENT";
  PlacePopulationSelectionState2[PlacePopulationSelectionState2["ADD_SPECIALIST"] = 2] = "ADD_SPECIALIST";
  return PlacePopulationSelectionState2;
})(PlacePopulationSelectionState || {});
const PlacePopulationSelectionChangedEventName = "place-population-selection-changed";
class PlacePopulationSelectionChangedEvent extends CustomEvent {
  constructor(state) {
    super(PlacePopulationSelectionChangedEventName, { bubbles: false, cancelable: true, detail: { state } });
  }
}
class PlacePopulationModel {
  cityName = "";
  cityYields = [];
  isTown = false;
  isResettling = false;
  hasUnlockedSpecialist = false;
  hoveredPlotIndex = void 0;
  hasHoveredWorkerPlot = false;
  numSpecialistsMessage = "";
  canAddSpecialistMessage = "";
  slotsAvailableMessage = "";
  bonusGrantedMessage = "";
  growthTitle = "";
  growthDescription = "";
  beforeSpecialistSlotStatus = [];
  afterSpecialistSlotStatus = [];
  alreadyHasSpecialists = false;
  showBeforeSpecialistBonus = true;
  beforeSpecialistBonus = [];
  showAfterSpecialistBonus = true;
  afterSpecialistBonus = [];
  showBeforeSpecialistMaintenance = true;
  beforeSpecialistMaintenance = [];
  showAfterSpecialistMaintenance = true;
  afterSpecialistMaintenance = [];
  showChangeSpecialistMaintenance = true;
  changeSpecialistMaintenance = [];
  constructibleToBeBuiltOnExpand;
  addImprovementType = "";
  addImprovementText = "";
  currentYieldTotals = [];
  currentYieldTotalsJSONd = "";
  afterYieldTotalsJSONd = "";
  afterYieldDeltasJSONd = "";
  afterBonuses = [];
  showExpandedView = false;
  _selectionState = 0 /* NONE */;
  get selectionState() {
    return this._selectionState;
  }
  set selectionState(state) {
    if (state != this._selectionState) {
      this._selectionState = state;
      window.dispatchEvent(new PlacePopulationSelectionChangedEvent(this.selectionState));
    }
  }
  expandPlots = [];
  ExpandPlotDataUpdatedEvent = new LiteEvent();
  _cityWorkerCap = 0;
  get cityWorkerCap() {
    return this._cityWorkerCap;
  }
  hoveredPlotWorkerIndex = null;
  hoveredPlotWorkerPlacementInfo = void 0;
  plotCursorCoordsUpdatedListener = this.onPlotCursorCoordsUpdated.bind(this);
  constructor() {
    engine.whenReady.then(() => {
      window.addEventListener(PlotWorkersHoveredPlotChangedEventName, this.onWorkersHoveredPlotChanged);
      window.addEventListener(PlotCursorUpdatedEventName, this.plotCursorCoordsUpdatedListener);
      engine.on("WorkerAdded", this.onWorkerAdded);
    });
  }
  _OnUpdate;
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  updateExpandPlots(id) {
    this.expandPlots = [];
    const result = Game.CityCommands.canStart(id, CityCommandTypes.EXPAND, {}, false);
    if (!result.Plots) {
      console.trace("model-place-population: updateExpandPlots() no plots available");
      return;
    }
    for (const [index, plotIndex] of result.Plots.entries()) {
      if (!result.ConstructibleTypes) {
        console.error(
          `model-place-population: Failed to get ConstructibleTypes results for plotIndex ${plotIndex}`
        );
        return;
      }
      const constructibleType = result.ConstructibleTypes[index];
      this.expandPlots.push({
        plotIndex,
        constructibleType
      });
    }
    this.isResettling = false;
    this.ExpandPlotDataUpdatedEvent.trigger(this.expandPlots);
  }
  updateExpandPlotsForResettle(id) {
    this.expandPlots = [];
    const result = Game.UnitCommands.canStart(id, UnitCommandTypes.RESETTLE, {}, false);
    if (!result.Plots) {
      console.error(
        "model-place-population: updateExpandPlotsForResettle() failed to get any Plots for Resettle command"
      );
      return;
    }
    for (const [index, plotIndex] of result.Plots.entries()) {
      if (!result.ConstructibleTypes) {
        console.error(
          `model-place-population: Failed to get ConstructibleTypes results for plotIndex ${plotIndex}`
        );
        return;
      }
      const constructibleType = result.ConstructibleTypes[index];
      this.expandPlots.push({
        plotIndex,
        constructibleType
      });
    }
    this.isResettling = true;
    this.ExpandPlotDataUpdatedEvent.trigger(this.expandPlots);
  }
  getExpandPlots() {
    return this.expandPlots;
  }
  getExpandPlotsIndexes() {
    const expandPlotIndexes = [];
    this.expandPlots.forEach((data) => {
      expandPlotIndexes.push(data.plotIndex);
    });
    return expandPlotIndexes;
  }
  getExpandConstructibleForPlot(plotIndex) {
    const expandPlotData = this.expandPlots.find((data) => {
      return data.plotIndex == plotIndex;
    });
    if (expandPlotData) {
      return expandPlotData.constructibleType;
    } else {
      console.error(
        `model-place-population: getExpandConstructibleForPlot failed to find constructibleType for plotIndex ${plotIndex}`
      );
      return void 0;
    }
  }
  updateGate = new UpdateGate(() => {
    this.update();
  });
  update() {
    if (InterfaceMode.getCurrent() != "INTERFACEMODE_ACQUIRE_TILE") {
      return;
    }
    let cityID = ComponentID.getInvalidID();
    const acquireTileParameters = InterfaceMode.getParameters();
    if (acquireTileParameters.CityID && acquireTileParameters.CityID.id != void 0 && acquireTileParameters.CityID.owner != void 0 && acquireTileParameters.CityID.type != void 0) {
      cityID = acquireTileParameters.CityID;
    }
    if (ComponentID.isInvalid(cityID)) {
      console.error(`model-place-population: Failed to get city ComponentID from INTERFACEMODE_ACQUIRE_TILE!`);
      return;
    }
    const city = Cities.get(cityID);
    if (!city) {
      console.error(`model-place-population: updateGate - failed to find valid CityID for plot ${cityID}`);
      return;
    }
    const cityYields = city.Yields;
    if (!cityYields) {
      console.warn(
        `model-place-population: Failed to get the CityYields for cityID ${cityID} provided by BuildingPlacementManager.`
      );
      return;
    }
    const cityWorkers = city.Workers;
    if (!cityWorkers) {
      console.error(`model-place-population: updateGate - failed to find valid city workers for city ${cityID}`);
      return;
    }
    window.dispatchEvent(new UpdatePlacementCityBannerEvent(city.name));
    this.cityName = city.name;
    this.isTown = city.isTown;
    this.cityYields = CityYields.getCityYieldDetails(cityID);
    this._cityWorkerCap = cityWorkers.getCityWorkerCap();
    this.hasUnlockedSpecialist = this._cityWorkerCap > 0 ? true : false;
    this.growthTitle = this.isTown ? "LOC_UI_TOWN_GROWTH_TITLE" : "LOC_UI_CITY_GROWTH_TITLE";
    this.growthDescription = this.isTown ? Locale.compose("LOC_UI_TOWN_GROWTH_DESCRIPTION") : Locale.compose("LOC_UI_CITY_GROWTH_DESCRIPTION");
    this.selectionState = 0 /* NONE */;
    if (this.hoveredPlotWorkerIndex != null && !this.isTown && !this.isResettling && this.hasUnlockedSpecialist) {
      this.hasHoveredWorkerPlot = true;
      this.hoveredPlotWorkerPlacementInfo = PlotWorkersManager.allWorkerPlots.find(
        (info) => info.PlotIndex == this.hoveredPlotWorkerIndex
      );
      if (!this.hoveredPlotWorkerPlacementInfo) {
        console.error(
          `model-place-population: updateGate - no WorkerPlacementInfo for plot ${this.hoveredPlotWorkerIndex}`
        );
        return;
      }
      const currentYieldBarData = [];
      const yields = cityYields.getYields();
      if (!yields) {
        console.error("model-place-population: update failed to get cityYields.getYields");
        return;
      }
      for (const [index, attribute] of yields.entries()) {
        const yieldDefinition = GameInfo.Yields[index];
        if (yieldDefinition) {
          currentYieldBarData.push({
            type: yieldDefinition.YieldType,
            value: attribute.value,
            style: YieldBarEntryStyle.NONE
          });
        }
      }
      this.currentYieldTotals = currentYieldBarData;
      this.currentYieldTotalsJSONd = JSON.stringify(this.currentYieldTotals);
      this.showBeforeSpecialistBonus = false;
      this.beforeSpecialistBonus = [];
      this.showAfterSpecialistBonus = false;
      this.afterSpecialistBonus = [];
      const bonusChanges = [];
      for (let i = 0; i < GameInfo.Yields.length; i++) {
        const yieldDefinition = GameInfo.Yields[i];
        const currentValue = this.hoveredPlotWorkerPlacementInfo.CurrentYields[i];
        const nextValue = this.hoveredPlotWorkerPlacementInfo.NextYields[i];
        const changeValue = nextValue - currentValue;
        bonusChanges.push(changeValue);
        if (currentValue > 0) {
          this.showBeforeSpecialistBonus = true;
          this.beforeSpecialistBonus.push(
            Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_BONUS",
              "text-positive",
              currentValue,
              yieldDefinition.YieldType
            )
          );
        }
        if (nextValue > 0) {
          this.showAfterSpecialistBonus = true;
          this.afterSpecialistBonus.push(
            Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_BONUS",
              "text-positive",
              nextValue,
              yieldDefinition.YieldType
            )
          );
        }
      }
      const adjacencyYieldBarData = [];
      const adjacencyChanges = [];
      for (let i = 0; i < GameInfo.Yields.length; i++) {
        const yieldDefinition = GameInfo.Yields[i];
        let adjacencyChange = bonusChanges[i];
        if (yieldDefinition.YieldType == "YIELD_SCIENCE" || yieldDefinition.YieldType == "YIELD_CULTURE") {
          adjacencyChange -= 2;
        }
        adjacencyChanges.push(adjacencyChange);
        adjacencyYieldBarData.push({
          type: yieldDefinition.YieldType,
          value: adjacencyChange,
          style: adjacencyChange > 0 ? YieldBarEntryStyle.GAIN : YieldBarEntryStyle.NONE
        });
      }
      this.showBeforeSpecialistMaintenance = false;
      this.beforeSpecialistMaintenance = [];
      this.showAfterSpecialistMaintenance = false;
      this.afterSpecialistMaintenance = [];
      this.showChangeSpecialistMaintenance = false;
      this.changeSpecialistMaintenance = [];
      const maintenanceChanges = [];
      for (let i = 0; i < GameInfo.Yields.length; i++) {
        const yieldDefinition = GameInfo.Yields[i];
        const currentValue = this.hoveredPlotWorkerPlacementInfo.CurrentMaintenance[i];
        const nextValue = this.hoveredPlotWorkerPlacementInfo.NextMaintenance[i];
        const changeValue = nextValue - currentValue;
        maintenanceChanges.push(changeValue);
        if (currentValue > 0) {
          this.showBeforeSpecialistMaintenance = true;
          this.beforeSpecialistMaintenance.push(
            Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_BONUS",
              "text-negative",
              -currentValue,
              yieldDefinition.YieldType
            )
          );
        }
        if (nextValue > 0) {
          this.showAfterSpecialistMaintenance = true;
          this.afterSpecialistMaintenance.push(
            Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_BONUS",
              "text-negative",
              -nextValue,
              yieldDefinition.YieldType
            )
          );
        }
        if (changeValue > 0) {
          this.showChangeSpecialistMaintenance = true;
          this.changeSpecialistMaintenance.push(
            Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_BONUS",
              "text-negative",
              -changeValue,
              yieldDefinition.YieldType
            )
          );
        }
      }
      const overallChange = [];
      for (let i = 0; i < GameInfo.Yields.length; i++) {
        overallChange.push(bonusChanges[i] - maintenanceChanges[i]);
      }
      const afterYieldBarData = [];
      const afterYieldBarDeltas = [];
      for (let i = 0; i < this.currentYieldTotals.length; i++) {
        const currentData = this.currentYieldTotals[i];
        const afterValue = currentData.value + overallChange[i];
        let afterStyle = YieldBarEntryStyle.NONE;
        if (overallChange[i] > 0) {
          afterStyle = YieldBarEntryStyle.GAIN;
        } else if (overallChange[i] < 0) {
          afterStyle = YieldBarEntryStyle.LOSS;
        }
        afterYieldBarDeltas.push({
          type: currentData.type,
          value: overallChange[i],
          style: afterStyle
        });
        afterYieldBarData.push({
          type: currentData.type,
          value: afterValue,
          style: afterStyle
        });
      }
      this.afterYieldTotalsJSONd = JSON.stringify(afterYieldBarData);
      this.afterYieldDeltasJSONd = JSON.stringify(afterYieldBarDeltas);
      this.numSpecialistsMessage = Locale.compose(
        "LOC_UI_ACQUIRE_TILE_NUM_SPECIALISTS",
        this.hoveredPlotWorkerPlacementInfo.NumWorkers
      );
      this.canAddSpecialistMessage = this.hoveredPlotWorkerPlacementInfo.IsBlocked ? Locale.compose("LOC_UI_ACQUIRE_TILE_CANNOT_ADD_SPECIALISTS") : Locale.compose("LOC_UI_ACQUIRE_TILE_CAN_ADD_SPECIALISTS");
      this.slotsAvailableMessage = Locale.compose(
        "LOC_UI_ACQUIRE_TILE_SPECIALIST_SLOTS_AVAILABLE",
        this._cityWorkerCap - cityWorkers.getNumWorkersAtPlot(this.hoveredPlotWorkerIndex)
      );
      this.beforeSpecialistSlotStatus = [];
      this.afterSpecialistSlotStatus = [];
      for (let i = 0; i < this._cityWorkerCap; i++) {
        if (i < this.hoveredPlotWorkerPlacementInfo.NumWorkers) {
          this.beforeSpecialistSlotStatus.push(true);
          this.afterSpecialistSlotStatus.push(true);
        } else {
          if (i == this.hoveredPlotWorkerPlacementInfo.NumWorkers) {
            this.afterSpecialistSlotStatus.push(true);
          } else {
            this.afterSpecialistSlotStatus.push(false);
          }
          this.beforeSpecialistSlotStatus.push(false);
        }
      }
      this.alreadyHasSpecialists = this.hoveredPlotWorkerPlacementInfo.NumWorkers > 0;
      this.selectionState = 2 /* ADD_SPECIALIST */;
    } else {
      this.hasHoveredWorkerPlot = false;
      this.numSpecialistsMessage = "";
      this.alreadyHasSpecialists = false;
    }
    if (this.constructibleToBeBuiltOnExpand && this.hoveredPlotIndex) {
      const constructibleDefinition = GameInfo.Constructibles.lookup(this.constructibleToBeBuiltOnExpand);
      if (constructibleDefinition) {
        this.addImprovementType = constructibleDefinition.ConstructibleType;
        this.addImprovementText = Locale.compose(
          "LOC_BUILDING_PLACEMENT_RECIEVE_IMPROVEMENT",
          constructibleDefinition.Name
        );
        const placementData = BuildingPlacementManager.getImprovementYieldChanges(
          constructibleDefinition.$hash,
          this.hoveredPlotIndex
        );
        if (!placementData) {
          console.error(
            `model-place-population: getImprovementYieldChanges failed to find data for: ${constructibleDefinition.ConstructibleType}`
          );
          return;
        }
        this.afterBonuses = BuildingPlacementManager.getYieldBonusBreakdownFromPlacementData(placementData);
        const currentYieldBarData = [];
        const yields = cityYields.getYields();
        if (!yields) {
          console.error("model-place-population: update failed to get cityYields.getYields");
        }
        if (placementData && yields) {
          for (const [index, attribute] of yields.entries()) {
            const yieldDefinition = GameInfo.Yields[index];
            if (yieldDefinition) {
              currentYieldBarData.push({
                type: yieldDefinition.YieldType,
                value: attribute.value,
                style: YieldBarEntryStyle.NONE
              });
            }
          }
          this.currentYieldTotals = currentYieldBarData;
          this.currentYieldTotalsJSONd = JSON.stringify(this.currentYieldTotals);
          const afterImprovementBarData = [];
          const afterImprovementBarDeltas = [];
          for (let i = 0; i < currentYieldBarData.length; i++) {
            const yieldDefinition = GameInfo.Yields[i];
            const afterChange = currentYieldBarData[i].value + placementData.yieldChanges[i];
            afterImprovementBarDeltas.push({
              type: yieldDefinition.YieldType,
              value: placementData.yieldChanges[i],
              style: placementData.yieldChanges[i] > 0 ? YieldBarEntryStyle.GAIN : YieldBarEntryStyle.NONE
            });
            afterImprovementBarData.push({
              type: yieldDefinition.YieldType,
              value: afterChange,
              style: placementData.yieldChanges[i] > 0 ? YieldBarEntryStyle.GAIN : YieldBarEntryStyle.NONE
            });
          }
          this.afterYieldTotalsJSONd = JSON.stringify(afterImprovementBarData);
          this.afterYieldDeltasJSONd = JSON.stringify(afterImprovementBarDeltas);
        }
      }
      this.selectionState = 1 /* ADD_IMPROVEMENT */;
    } else {
      this.addImprovementText = "";
    }
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  }
  onWorkersHoveredPlotChanged = () => {
    this.hoveredPlotWorkerIndex = PlotWorkersManager.hoveredPlotIndex;
    this.updateGate.call("onWorkersHoveredPlotChanged");
  };
  onWorkerAdded = () => {
    this.updateGate.call("onWorkerAdded");
  };
  onPlotCursorCoordsUpdated(event) {
    if (event.detail.plotCoords) {
      const plotIndex = GameplayMap.getIndexFromLocation(event.detail.plotCoords);
      const plotData = this.expandPlots.find((data) => {
        return plotIndex == data.plotIndex;
      });
      if (plotData) {
        this.constructibleToBeBuiltOnExpand = this.getExpandConstructibleForPlot(plotIndex);
        this.hoveredPlotIndex = plotIndex;
        return;
      }
    }
    this.hoveredPlotIndex = void 0;
    this.constructibleToBeBuiltOnExpand = void 0;
  }
}
const PlacePopulation = new PlacePopulationModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(PlacePopulation);
  };
  engine.createJSModel("g_PlacePopulation", PlacePopulation);
  PlacePopulation.updateCallback = updateModel;
});

export { PlacePopulation, PlacePopulationSelectionChangedEvent, PlacePopulationSelectionChangedEventName, PlacePopulationSelectionState };
//# sourceMappingURL=model-place-population.js.map
