import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';

const BuildingPlacementHoveredPlotChangedEventName = "building-placement-hovered-plot-changed";
class BuildingPlacementHoveredPlotChangedEvent extends CustomEvent {
  constructor() {
    super(BuildingPlacementHoveredPlotChangedEventName, { bubbles: false, cancelable: true });
  }
}
const BuildingPlacementSelectedPlotChangedEventName = "building-placement-selected-plot-changed";
class BuildingPlacementSelectedPlotChangedEvent extends CustomEvent {
  constructor() {
    super(BuildingPlacementSelectedPlotChangedEventName, { bubbles: false, cancelable: true });
  }
}
const BuildingPlacementConstructibleChangedEventName = "building-placement-constructible-changed";
class BuildingPlacementConstructibleChangedEvent extends CustomEvent {
  constructor() {
    super(BuildingPlacementConstructibleChangedEventName, { bubbles: false, cancelable: true });
  }
}
class BuildingPlacementManagerClass {
  static instance = null;
  _cityID = null;
  get cityID() {
    return this._cityID;
  }
  get city() {
    if (this.cityID) {
      const city = Cities.get(this.cityID);
      if (city) {
        return city;
      }
    }
    console.error(`building-placement-manager: Failed to get city for ID ${this.cityID}`);
    return null;
  }
  _currentConstructible = null;
  get currentConstructible() {
    return this._currentConstructible;
  }
  /** Placement data for all possible constructibles */
  _allPlacementData;
  get allPlacementData() {
    return this._allPlacementData;
  }
  set allPlacementData(value) {
    this._allPlacementData = value;
  }
  // Placement data for the currently selected constructible
  selectedPlacementData;
  //Plots that would become unique quarters if a unique quarter building is being placed
  _uniqueQuarterPlots = [];
  get uniqueQuarterPlots() {
    return this._uniqueQuarterPlots;
  }
  //Plots that are already developed and have buildings placed on them
  _urbanPlots = [];
  get urbanPlots() {
    return this._urbanPlots;
  }
  //Plots that have already been developed/improved (i.e. improved through city growth)
  _developedPlots = [];
  get developedPlots() {
    return this._developedPlots;
  }
  //Plots that have not yet been developed
  _expandablePlots = [];
  get expandablePlots() {
    return this._expandablePlots;
  }
  _hoveredPlotIndex = null;
  get hoveredPlotIndex() {
    return this._hoveredPlotIndex;
  }
  set hoveredPlotIndex(plotIndex) {
    if (this._hoveredPlotIndex == plotIndex) {
      return;
    }
    if (plotIndex != null && this.isPlotIndexSelectable(plotIndex)) {
      this._hoveredPlotIndex = plotIndex;
    } else {
      this._hoveredPlotIndex = null;
    }
    window.dispatchEvent(new BuildingPlacementHoveredPlotChangedEvent());
  }
  _selectedPlotIndex = null;
  get selectedPlotIndex() {
    return this._selectedPlotIndex;
  }
  set selectedPlotIndex(plotIndex) {
    const isSelectable = plotIndex != null && this.isPlotIndexSelectable(plotIndex);
    plotIndex = isSelectable ? plotIndex : null;
    if (this._selectedPlotIndex == plotIndex) {
      return;
    }
    this._selectedPlotIndex = plotIndex;
    window.dispatchEvent(new BuildingPlacementSelectedPlotChangedEvent());
  }
  isRepairing = false;
  initializePlacementData(cityID) {
    this._cityID = cityID;
    this.isRepairing = false;
    this.allPlacementData = this.city?.Yields?.calculateAllBuildingsPlacements();
    if (!this.allPlacementData) {
      console.error(`building-placement-manager: calculateAllBuildingsPlacements failed for cityID ${cityID}`);
      return;
    }
  }
  selectPlacementData(cityID, operationResult, constructible) {
    if (!ComponentID.isMatch(cityID, this.cityID)) {
      console.error(
        `building-placement-manager: cityID ${cityID} passed into selectPlacementData does not match cityID used for initializePlacementData ${this.cityID}`
      );
      return;
    }
    if (!this.allPlacementData) {
      console.error(`building-placement-manager: invalid allPlacementData for cityID ${cityID}`);
      return;
    }
    this._currentConstructible = constructible;
    this.isRepairing = operationResult.RepairDamaged;
    const uniqueQuarterPlotIndices = [];
    for (const uniqueDistrictDef of GameInfo.UniqueQuarters) {
      if (constructible.ConstructibleType == uniqueDistrictDef.BuildingType1 || constructible.ConstructibleType == uniqueDistrictDef.BuildingType2) {
        uniqueQuarterPlotIndices.push(BuildingPlacementManager.findExistingUniqueBuilding(uniqueDistrictDef));
      }
    }
    operationResult.Plots?.forEach((plot) => {
      if (uniqueQuarterPlotIndices.includes(plot)) {
        this._uniqueQuarterPlots.push(plot);
      }
      this._urbanPlots.push(plot);
    });
    operationResult.ExpandUrbanPlots?.forEach((p) => {
      const location = GameplayMap.getLocationFromIndex(p);
      const city = MapCities.getCity(location.x, location.y);
      if (city && MapCities.getDistrict(location.x, location.y) != null) {
        this._developedPlots.push(p);
      } else {
        this._expandablePlots.push(p);
      }
    });
    this.selectedPlacementData = this.allPlacementData.buildings.find((buildingData) => {
      return buildingData.constructibleType == constructible.$hash;
    });
    if (!this.selectedPlacementData) {
      console.warn(
        `building-placement-manager: Failed to find type ${constructible.ConstructibleType} in allPlacementData`
      );
    }
    window.dispatchEvent(new BuildingPlacementConstructibleChangedEvent());
  }
  isPlotIndexSelectable(plotIndex) {
    return this.urbanPlots.find((index) => {
      return index == plotIndex;
    }) != void 0 || this.developedPlots.find((index) => {
      return index == plotIndex;
    }) != void 0 || this.expandablePlots.find((index) => {
      return index == plotIndex;
    }) != void 0;
  }
  constructor() {
    if (BuildingPlacementManagerClass.instance) {
      console.error(
        "Only one instance of the BuildingPlacementManagerClass can exist at a time, second attempt to create one."
      );
    }
    BuildingPlacementManagerClass.instance = this;
  }
  getTotalYieldChangesFromPlacementData(placementPlotData, excludeOtherCities) {
    const yieldsCopy = [];
    for (const change of placementPlotData.yieldChanges) {
      yieldsCopy.push(change);
    }
    const yieldChangeInfo = [];
    const cityConstructibles = this.city?.Constructibles;
    if (!cityConstructibles) {
      console.error("building-placement-manager: getTotalYieldChanges() failed to find cityConstructibles");
      return yieldChangeInfo;
    }
    const previousConstructibleDefinition = GameInfo.Constructibles.find((definition) => {
      return definition.$index == placementPlotData.overbuiltConstructibleID;
    });
    if (previousConstructibleDefinition) {
      const previousConstructibleMaintenance = cityConstructibles.getMaintenance(
        previousConstructibleDefinition.ConstructibleType
      );
      for (let i = 0; i < previousConstructibleMaintenance.length; i++) {
        yieldsCopy[i] += previousConstructibleMaintenance[i];
      }
    }
    if (this.currentConstructible) {
      const newConstructibleMaintenance = cityConstructibles.getMaintenance(
        this.currentConstructible.ConstructibleType
      );
      for (let i = 0; i < newConstructibleMaintenance.length; i++) {
        yieldsCopy[i] -= newConstructibleMaintenance[i];
      }
    }
    if (excludeOtherCities && excludeOtherCities == true) {
      for (const change of placementPlotData.changeDetails) {
        if (change.sourceType == YieldSourceTypes.ADJACENCY) {
          const location = GameplayMap.getLocationFromIndex(change.targetPlotIndex);
          const targetCity = MapCities.getCity(location.x, location.y);
          if (!ComponentID.isMatch(targetCity, this._cityID)) {
            const yieldDefinition = GameInfo.Yields.lookup(change.yieldType);
            if (yieldDefinition) {
              yieldsCopy[yieldDefinition.$index] -= change.change;
            }
          }
        }
      }
    }
    GameInfo.Yields.forEach((yieldDefinition, index) => {
      if (yieldsCopy[index] != 0) {
        yieldChangeInfo.push({
          text: Locale.compose(yieldDefinition.Name),
          yieldType: yieldDefinition.YieldType,
          yieldChange: yieldsCopy[index],
          iconURL: UI.getIconURL(yieldDefinition.YieldType, "YIELD")
        });
      }
    });
    return yieldChangeInfo;
  }
  // Calculates total yields for a building placement, including those going to adjacency bonuses in other cities
  getTotalYieldChanges(plotIndex) {
    const placementPlotData = this.getPlacementPlotData(plotIndex);
    if (!placementPlotData) {
      console.error(
        `building-placement-manager: getTotalYieldChanges(): Failed to find PlacementPlotData for plotIndex ${plotIndex}`
      );
      return [];
    }
    return this.getTotalYieldChangesFromPlacementData(placementPlotData);
  }
  // Calculates city yields for a building placement, excluding those going to adjacency bonuses in other cities
  getCityYieldChanges(plotIndex) {
    const placementPlotData = this.getPlacementPlotData(plotIndex);
    if (!placementPlotData) {
      console.error(
        `building-placement-manager: getCityYieldChanges(): Failed to find PlacementPlotData for plotIndex ${plotIndex}`
      );
      return [];
    }
    return this.getTotalYieldChangesFromPlacementData(placementPlotData, true);
  }
  getPrimaryBuildingYields() {
    const result = [];
    if (this.currentConstructible) {
      const yields = this.city?.Yields?.getAllBaseYieldValuesForConstructible(this.currentConstructible.$hash);
      yields?.forEach((value, index) => {
        if (value > 0) {
          const yieldDefinition = GameInfo.Yields.lookup(index);
          if (yieldDefinition) {
            result.push(yieldDefinition.YieldType);
          }
        }
      });
    }
    return result;
  }
  getPlotYieldChanges(plotIndex) {
    const placementPlotData = this.getPlacementPlotData(plotIndex);
    if (!placementPlotData) {
      console.error(
        `building-placement-manager: getPlotYieldChanges(): Failed to find PlacementPlotData for plotIndex ${plotIndex}`
      );
      return;
    }
    const yieldChangeInfo = [];
    placementPlotData.changeDetails.forEach((changeDetails) => {
      switch (changeDetails.sourceType) {
        case YieldSourceTypes.BASE: {
          const yieldDefinition = GameInfo.Yields.lookup(changeDetails.yieldType);
          if (!yieldDefinition) {
            console.error(
              `building-placement-manager: Failed to find yield definition for ${changeDetails.yieldType}`
            );
            break;
          }
          yieldChangeInfo.push({
            text: Locale.compose(yieldDefinition.Name),
            yieldType: yieldDefinition.YieldType,
            yieldChange: changeDetails.change,
            iconURL: UI.getIconURL(yieldDefinition.YieldType, "YIELD")
          });
          break;
        }
      }
    });
    placementPlotData.changeDetails.forEach((changeDetails) => {
      switch (changeDetails.sourceType) {
        case YieldSourceTypes.WORKERS: {
          const yieldDefinition = GameInfo.Yields.lookup(changeDetails.yieldType);
          if (!yieldDefinition) {
            console.error(
              `building-placement-manager: Failed to find yield definition for ${changeDetails.yieldType}`
            );
            break;
          }
          yieldChangeInfo.push({
            text: Locale.compose("LOC_BUILDING_PLACEMENT_YIELD_NAME_FROM_WORKERS", yieldDefinition.Name),
            yieldType: yieldDefinition.YieldType,
            yieldChange: changeDetails.change,
            iconURL: UI.getIconURL(yieldDefinition.YieldType, "YIELD")
          });
          break;
        }
      }
    });
    const warehouseBonuses = /* @__PURE__ */ new Map();
    placementPlotData.changeDetails.forEach((changeDetails) => {
      switch (changeDetails.sourceType) {
        case YieldSourceTypes.WAREHOUSE: {
          const warehouseBonus = warehouseBonuses.get(changeDetails.yieldType);
          if (warehouseBonus) {
            warehouseBonuses.set(changeDetails.yieldType, warehouseBonus + changeDetails.change);
          } else {
            warehouseBonuses.set(changeDetails.yieldType, changeDetails.change);
          }
          break;
        }
      }
    });
    warehouseBonuses.forEach((change, yieldType) => {
      const yieldDefinition = GameInfo.Yields.lookup(yieldType);
      if (!yieldDefinition) {
        console.error(
          `building-placement-manager: Failed to find warehouse bonuses type for type ${yieldType}`
        );
        return;
      }
      yieldChangeInfo.push({
        text: Locale.compose("LOC_BUILDING_PLACEMENT_YIELD_NAME_TO_TILE_FROM_WAREHOUSE", yieldDefinition.Name),
        yieldType: yieldDefinition.YieldType,
        yieldChange: change,
        iconURL: UI.getIconURL(yieldDefinition.YieldType, "YIELD")
      });
    });
    return yieldChangeInfo;
  }
  getAdjacencyYieldChanges(plotIndex) {
    const placementPlotData = this.getPlacementPlotData(plotIndex);
    if (!placementPlotData) {
      console.error(
        `building-placement-manager: getAdjacencyYieldChanges(): Failed to find PlacementPlotData for plotIndex ${plotIndex}`
      );
      return [];
    }
    const yieldChangeInfo = [];
    placementPlotData.changeDetails.forEach((changeDetails) => {
      switch (changeDetails.sourceType) {
        case YieldSourceTypes.ADJACENCY: {
          if (this.city?.Yields && this.city.Yields.extractYieldChangesData(
            placementPlotData.yieldChanges,
            changeDetails.yieldType
          ) > 0) {
            const yieldDefinition = GameInfo.Yields.lookup(changeDetails.yieldType);
            if (!yieldDefinition) {
              console.error(
                `building-placement-manager: Failed to find yield definition for ${changeDetails.yieldType}`
              );
              break;
            }
            if (changeDetails.sourcePlotIndex == plotIndex) {
              yieldChangeInfo.push({
                text: Locale.compose(
                  "LOC_BUILDING_PLACEMENT_YIELD_NAME_TO_OTHER_BUILDINGS",
                  yieldDefinition.Name
                ),
                yieldType: yieldDefinition.YieldType,
                yieldChange: changeDetails.change,
                iconURL: UI.getIconURL(yieldDefinition.YieldType, "YIELD")
              });
              break;
            } else {
              yieldChangeInfo.push({
                text: Locale.compose(
                  "LOC_BUILDING_PLACEMENT_YIELD_NAME_FROM_DIRECTION",
                  yieldDefinition.Name,
                  this.getDirectionString(changeDetails.sourcePlotIndex, plotIndex)
                ),
                yieldType: yieldDefinition.YieldType,
                yieldChange: changeDetails.change,
                iconURL: UI.getIconURL(yieldDefinition.YieldType, "YIELD")
              });
              break;
            }
          }
        }
      }
    });
    return yieldChangeInfo;
  }
  getDirectionString(fromPlot, toPlot) {
    const direction = GameplayMap.getDirectionToPlot(
      GameplayMap.getLocationFromIndex(toPlot),
      GameplayMap.getLocationFromIndex(fromPlot)
    );
    switch (direction) {
      case DirectionTypes.DIRECTION_EAST:
        return "LOC_WORLD_DIRECTION_EAST";
      case DirectionTypes.DIRECTION_NORTHEAST:
        return "LOC_WORLD_DIRECTION_NORTHEAST";
      case DirectionTypes.DIRECTION_NORTHWEST:
        return "LOC_WORLD_DIRECTION_NORTHWEST";
      case DirectionTypes.DIRECTION_SOUTHEAST:
        return "LOC_WORLD_DIRECTION_SOUTHEAST";
      case DirectionTypes.DIRECTION_SOUTHWEST:
        return "LOC_WORLD_DIRECTION_SOUTHWEST";
      case DirectionTypes.DIRECTION_WEST:
        return "LOC_WORLD_DIRECTION_WEST";
    }
    console.error(
      `building-placement-manager: getDirectionString failed to find a direction string from ${fromPlot} to ${toPlot}`
    );
    return "";
  }
  getPlacementPlotData(plotIndex) {
    if (!this.selectedPlacementData) {
      console.error("building-placement-manager: getPlacementPlotData(): Invalid selectedPlacementData");
      return;
    }
    return this.selectedPlacementData.placements.find((plotData) => {
      return plotData.plotID == plotIndex;
    });
  }
  getPlacementChangeDetails(plotIndex, sourceType) {
    if (!this.selectedPlacementData) {
      console.error("building-placement-manager: getPlacementChangeDetails(): Invalid selectedPlacementData");
      return [];
    }
    const placementData = this.selectedPlacementData.placements.find((plotData) => {
      return plotData.plotID == plotIndex;
    });
    if (!placementData) {
      console.error(
        `building-placement-manager: getPlacementChangeDetails(): Failed to find placement data for ${plotIndex}`
      );
      return [];
    }
    let changeDetails = [];
    if (sourceType) {
      for (const details of placementData.changeDetails) {
        if (details.sourceType == sourceType) {
          changeDetails.push(details);
        }
      }
    } else {
      changeDetails = placementData.changeDetails;
    }
    return changeDetails;
  }
  getOverbuildConstructibleID(plotID) {
    if (!this.selectedPlacementData) {
      console.error(
        "building-placement-manager: Tried to call getOverbuildConstructibleID before selectedPlacementData was initialized!"
      );
      return;
    }
    const selectedPlacementData = this.selectedPlacementData.placements.find((plotData) => {
      return plotData.plotID == plotID;
    });
    if (!selectedPlacementData) {
      console.error(
        `building-placement-manager: getOverbuildConstructibleID(): Unable to find plotID ${plotID} in selectedPlacementData`
      );
      return;
    }
    return selectedPlacementData.overbuiltConstructibleID;
  }
  reset() {
    this._cityID = null;
    this._currentConstructible = null;
    this._uniqueQuarterPlots = [];
    this._expandablePlots = [];
    this._urbanPlots = [];
    this._developedPlots = [];
    this.hoveredPlotIndex = null;
    this.selectedPlotIndex = null;
    this.isRepairing = false;
  }
  isValidPlacementPlot(plotIndex) {
    if (BuildingPlacementManager.urbanPlots.find((p) => p == plotIndex) || BuildingPlacementManager.developedPlots.find((p) => p == plotIndex) || BuildingPlacementManager.expandablePlots.find((p) => p == plotIndex)) {
      return true;
    }
    return false;
  }
  findExistingUniqueBuilding(uniqueQuarterDef) {
    if (!this.cityID || ComponentID.isInvalid(this.cityID)) {
      console.error("building-placement-manager - Invalid cityID passed into findExistingUniqueBuilding");
      return -1;
    }
    const city = Cities.get(this.cityID);
    if (!city) {
      console.error(`building-placement-manager - Invalid city found for id ${this.cityID}`);
      return -1;
    }
    const constructibles = city.Constructibles;
    if (!constructibles) {
      console.error(`building-placement-manager - Invalid construcibles found for id ${this.cityID}`);
      return -1;
    }
    const buildQueue = city.BuildQueue;
    if (buildQueue) {
      const buildingType1Position = buildQueue?.getQueuedPositionOfType(uniqueQuarterDef.BuildingType1);
      const buildingType2Position = buildQueue?.getQueuedPositionOfType(uniqueQuarterDef.BuildingType2);
      if (buildingType1Position !== -1 || buildingType2Position !== -1) {
        const queue = buildQueue.getQueue();
        const position = buildingType1Position !== -1 ? buildingType1Position : buildingType2Position;
        const queuedItem = queue[position];
        return GameplayMap.getIndexFromLocation(queuedItem.location);
      }
    }
    for (const constructibleID of constructibles.getIds()) {
      const constructible = Constructibles.getByComponentID(constructibleID);
      if (!constructible) {
        console.error(
          `building-placement-manager - Invalid construcible found for id ${constructibleID.toString()}`
        );
        return -1;
      }
      const constructibleDef = GameInfo.Constructibles.lookup(constructible.type);
      if (!constructibleDef) {
        console.error(
          `building-placement-manager - Invalid constructibleDef found for type ${constructible.type}`
        );
        return -1;
      }
      if (constructibleDef.ConstructibleType == uniqueQuarterDef.BuildingType1 || constructibleDef.ConstructibleType == uniqueQuarterDef.BuildingType2) {
        return GameplayMap.getIndexFromLocation(constructible.location);
      }
    }
    return -1;
  }
  getBestYieldForConstructible(cityID, constructibleDef) {
    if (!ComponentID.isMatch(cityID, this.cityID)) {
      console.error(
        `building-placement-manager: getBestYieldForConstructible() - cityID ${cityID} passed into selectPlacementData does not match cityID used for initializePlacementData ${this.cityID}`
      );
      return [];
    }
    if (!this.allPlacementData) {
      console.error(
        `building-placement-manager: getBestYieldForConstructible() - invalid allPlacementData for cityID ${cityID}`
      );
      return [];
    }
    const constructiblePlacementData = this.allPlacementData.buildings.find((data) => {
      return data.constructibleType == constructibleDef.$hash;
    });
    if (!constructiblePlacementData) {
      console.error(
        `building-placement-manager: getBestYieldForConstructible() - failed to find placement data for type ${constructibleDef.ConstructibleType}`
      );
      return [];
    }
    let bestYieldChanges = [];
    let bestYieldChangesTotal = Number.MIN_SAFE_INTEGER;
    for (const placement of constructiblePlacementData.placements) {
      let yieldChangesTotal = 0;
      for (const change of placement.yieldChanges) {
        yieldChangesTotal += change;
      }
      if (yieldChangesTotal > bestYieldChangesTotal) {
        bestYieldChangesTotal = yieldChangesTotal;
        bestYieldChanges = placement.yieldChanges;
      }
    }
    return bestYieldChanges;
  }
  getImprovementYieldChanges(type, plotIndex) {
    if (!this.allPlacementData) {
      console.error(
        "building-placement-manager.ts: getImprovementYieldChanges did not have allPlacementData initialized"
      );
      return;
    }
    const placementData = this.allPlacementData.buildings.find((data) => {
      return data.constructibleType == type;
    });
    if (!placementData) {
      console.error("building-placement-manager.ts: getImprovementYieldChanges failed to find placement data");
      return;
    }
    const plotData = placementData.placements.find((data) => {
      return data.plotID == plotIndex;
    });
    return plotData;
  }
  canGetWarehouseBonuses(type) {
    for (const adjacency of GameInfo.Constructible_WarehouseYields) {
      if (adjacency.ConstructibleType == type) {
        return true;
      }
    }
    return false;
  }
  getNumberOfWarehouseBonuses(typeHash) {
    if (!this.allPlacementData) {
      console.error(
        "building-placement-manager.ts: getNumberOfWarehouseBonuses did not have allPlacementData initialized"
      );
      return 0;
    }
    const placementData = this.allPlacementData.buildings.find((data) => {
      return data.constructibleType == typeHash;
    });
    if (!placementData) {
      return 0;
    }
    let highestWarehouseCount = 0;
    for (const placement of placementData.placements) {
      let warehouseCount = 0;
      for (const changeDetail of placement.changeDetails) {
        if (changeDetail.sourceType == YieldSourceTypes.WAREHOUSE) {
          warehouseCount++;
        }
      }
      if (warehouseCount > highestWarehouseCount) {
        highestWarehouseCount = warehouseCount;
      }
    }
    return highestWarehouseCount;
  }
  canGetAdjacencyBonuses(type) {
    for (const adjacency of GameInfo.Constructible_Adjacencies) {
      if (adjacency.ConstructibleType == type) {
        return true;
      }
    }
    return false;
  }
  getHighestAdjacencyBonus(typeHash) {
    if (!this.allPlacementData) {
      console.error(
        "building-placement-manager.ts: getHighestAdjacencyBonus did not have allPlacementData initialized"
      );
      return 0;
    }
    const placementData = this.allPlacementData.buildings.find((data) => {
      return data.constructibleType == typeHash;
    });
    if (!placementData) {
      return 0;
    }
    let highestAdjacencyBonus = 0;
    for (const placement of placementData.placements) {
      let adjacencyBonus = 0;
      for (const changeDetail of placement.changeDetails) {
        if (changeDetail.sourceType == YieldSourceTypes.ADJACENCY) {
          adjacencyBonus += changeDetail.change;
        }
      }
      if (adjacencyBonus > highestAdjacencyBonus) {
        highestAdjacencyBonus = adjacencyBonus;
      }
    }
    return highestAdjacencyBonus;
  }
  getYieldBonusBreakdownFromPlacementData(placementData) {
    const yieldBonuses = [];
    const addGroupedYieldBonuses = (sourceTypeOrPred, descriptionOrDescriptionFn, includeNegativeChanges) => {
      const descriptionSourceTypeMap = /* @__PURE__ */ new Map();
      for (const change of placementData.changeDetails) {
        const isMatch = typeof sourceTypeOrPred === "function" ? sourceTypeOrPred(change.sourceType) : change.sourceType === sourceTypeOrPred;
        if (isMatch && (includeNegativeChanges || this.city?.Yields && this.city.Yields.extractYieldChangesData(placementData.yieldChanges, change.yieldType) > 0)) {
          const yieldDefinition = GameInfo.Yields.lookup(change.yieldType);
          if (!yieldDefinition) {
            console.error(
              `building-placement-manager: Failed to find yield definition for ${change.yieldType}`
            );
            continue;
          }
          const description = typeof descriptionOrDescriptionFn === "function" ? descriptionOrDescriptionFn(change) : descriptionOrDescriptionFn;
          let sourceTypeMap = descriptionSourceTypeMap.get(description);
          if (!sourceTypeMap) {
            sourceTypeMap = /* @__PURE__ */ new Map();
            descriptionSourceTypeMap.set(description, sourceTypeMap);
          }
          const currentValue = sourceTypeMap.get(yieldDefinition.YieldType);
          if (currentValue) {
            sourceTypeMap.set(yieldDefinition.YieldType, change.change + currentValue);
          } else {
            sourceTypeMap.set(yieldDefinition.YieldType, change.change);
          }
        }
      }
      descriptionSourceTypeMap.forEach((sourceMap, description) => {
        const bonuses = [];
        sourceMap.forEach((value, key) => {
          if (value != 0) {
            const textClass = value > 0 ? "text-positive" : "text-negative";
            bonuses.push(Locale.stylize("LOC_BUILDING_PLACEMENT_YIELD_BONUS", textClass, value, key));
          }
        });
        if (bonuses.length > 0) {
          yieldBonuses.push({
            description,
            bonuses
          });
        }
      });
    };
    addGroupedYieldBonuses(YieldSourceTypes.BASE, "LOC_BUILDING_PLACEMENT_BASE_YIELD");
    addGroupedYieldBonuses(YieldSourceTypes.ADJACENCY, (change) => {
      return this.getDirectionDescrption(
        change.sourcePlotIndex,
        change.targetPlotIndex,
        placementData.plotID == change.targetPlotIndex
      );
    });
    addGroupedYieldBonuses(YieldSourceTypes.NATURAL, "LOC_BUILDING_PLACEMENT_NATURAL_YIELD");
    addGroupedYieldBonuses(YieldSourceTypes.WAREHOUSE, "LOC_BUILDING_PLACEMENT_WAREHOUSE_YIELD");
    addGroupedYieldBonuses(YieldSourceTypes.CONSTRUCTIBLES, "LOC_BUILDING_PLACEMENT_CONSTRUCTIBLE_YIELD");
    addGroupedYieldBonuses(YieldSourceTypes.WORKERS, "LOC_BUILDING_PLACEMENT_SPECIALIST_YIELD", true);
    addGroupedYieldBonuses(
      YieldSourceTypes.CITY_MODIFIERS,
      (change) => {
        let modifierDescStr = GameEffects.getModifierDefinitionTextKey(change.sourceReference, "Name");
        if (modifierDescStr && modifierDescStr.length != 0) {
          return modifierDescStr;
        }
        modifierDescStr = GameEffects.getModifierDefinitionArgumentString(change.sourceReference, "Tooltip");
        if (modifierDescStr && modifierDescStr.length != 0) {
          return modifierDescStr;
        }
        modifierDescStr = GameEffects.getModifierDefinitionTextKey(change.sourceReference, "Category");
        if (modifierDescStr && modifierDescStr.length != 0) {
          return modifierDescStr;
        }
        return "LOC_BUILDING_PLACEMENT_CITY_MODIFIER_YIELD";
      },
      true
    );
    const isOtherYield = (type) => ![
      YieldSourceTypes.BASE,
      YieldSourceTypes.NATURAL,
      YieldSourceTypes.WAREHOUSE,
      YieldSourceTypes.CONSTRUCTIBLES,
      YieldSourceTypes.ADJACENCY,
      YieldSourceTypes.WORKERS,
      YieldSourceTypes.CITY_MODIFIERS
    ].includes(type);
    addGroupedYieldBonuses(isOtherYield, "LOC_BUILDING_PLACEMENT_OTHER_YIELD");
    return yieldBonuses;
  }
  getDirectionDescrption(sourcePlotIndex, targetPlotIndex, isIncoming) {
    if (isIncoming) {
      return this.getFromDirectionDescrption(sourcePlotIndex, targetPlotIndex);
    } else {
      return this.getToDirectionDescrption(sourcePlotIndex, targetPlotIndex);
    }
  }
  getToDirectionDescrption(sourcePlotIndex, targetPlotIndex) {
    const sourcePlotLocation = GameplayMap.getLocationFromIndex(sourcePlotIndex);
    const targetPlotLocation = GameplayMap.getLocationFromIndex(targetPlotIndex);
    const adjacencyDirection = GameplayMap.getDirectionToPlot(
      sourcePlotLocation,
      targetPlotLocation
    );
    const targetCity = MapCities.getCity(targetPlotLocation.x, targetPlotLocation.y);
    if (!ComponentID.isMatch(targetCity, this._cityID)) {
      return "LOC_BUILDING_PLACEMENT_TO_OTHER_SETTLEMENTS";
    }
    switch (adjacencyDirection) {
      case DirectionTypes.DIRECTION_EAST:
        return "LOC_BUILDING_PLACEMENT_TO_EAST";
      case DirectionTypes.DIRECTION_WEST:
        return "LOC_BUILDING_PLACEMENT_TO_WEST";
      case DirectionTypes.DIRECTION_NORTHEAST:
        return "LOC_BUILDING_PLACEMENT_TO_NORTHEAST";
      case DirectionTypes.DIRECTION_NORTHWEST:
        return "LOC_BUILDING_PLACEMENT_TO_NORTHWEST";
      case DirectionTypes.DIRECTION_SOUTHEAST:
        return "LOC_BUILDING_PLACEMENT_TO_SOUTHEAST";
      case DirectionTypes.DIRECTION_SOUTHWEST:
        return "LOC_BUILDING_PLACEMENT_TO_SOUTHWEST";
    }
    console.error(
      `model-place-building-v2: getToDirectionDescrption failed to find direction string between plot ${sourcePlotIndex} and plot ${targetPlotIndex}`
    );
    return "";
  }
  getFromDirectionDescrption(sourcePlotIndex, targetPlotIndex) {
    const sourcePlotLocation = GameplayMap.getLocationFromIndex(sourcePlotIndex);
    const targetPlotLocation = GameplayMap.getLocationFromIndex(targetPlotIndex);
    const adjacencyDirection = GameplayMap.getDirectionToPlot(
      targetPlotLocation,
      sourcePlotLocation
    );
    switch (adjacencyDirection) {
      case DirectionTypes.DIRECTION_EAST:
        return "LOC_BUILDING_PLACEMENT_FROM_EAST";
      case DirectionTypes.DIRECTION_WEST:
        return "LOC_BUILDING_PLACEMENT_FROM_WEST";
      case DirectionTypes.DIRECTION_NORTHEAST:
        return "LOC_BUILDING_PLACEMENT_FROM_NORTHEAST";
      case DirectionTypes.DIRECTION_NORTHWEST:
        return "LOC_BUILDING_PLACEMENT_FROM_NORTHWEST";
      case DirectionTypes.DIRECTION_SOUTHEAST:
        return "LOC_BUILDING_PLACEMENT_FROM_SOUTHEAST";
      case DirectionTypes.DIRECTION_SOUTHWEST:
        return "LOC_BUILDING_PLACEMENT_FROM_SOUTHWEST";
    }
    console.error(
      `model-place-building-v2: getFromDirectionDescrption failed to find direction string between plot ${sourcePlotIndex} and plot ${targetPlotIndex}`
    );
    return "";
  }
}
const BuildingPlacementManager = new BuildingPlacementManagerClass();

export { BuildingPlacementConstructibleChangedEvent, BuildingPlacementConstructibleChangedEventName, BuildingPlacementHoveredPlotChangedEvent, BuildingPlacementHoveredPlotChangedEventName, BuildingPlacementManager, BuildingPlacementSelectedPlotChangedEvent, BuildingPlacementSelectedPlotChangedEventName };
//# sourceMappingURL=building-placement-manager.js.map
