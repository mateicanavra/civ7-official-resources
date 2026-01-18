import { c as composeConstructibleDescription } from '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { BuildingPlacementSelectedPlotChangedEventName, BuildingPlacementConstructibleChangedEventName, BuildingPlacementManager } from '../building-placement/building-placement-manager.js';
import { C as ConstructibleHasTagType } from '../utilities/utilities-tags.chunk.js';
import { YieldBarEntryStyle } from '../yield-bar-base/yield-bar-base.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

var ConstructibleIcons = /* @__PURE__ */ ((ConstructibleIcons2) => {
  ConstructibleIcons2["EMPTY"] = "BUILDING_OPEN";
  ConstructibleIcons2["ADD"] = "BUILDING_ADD";
  ConstructibleIcons2["WARNING"] = "BUILDING_WARNING";
  return ConstructibleIcons2;
})(ConstructibleIcons || {});
var TileTypeConversion = /* @__PURE__ */ ((TileTypeConversion2) => {
  TileTypeConversion2[TileTypeConversion2["UNIMPROVED_TO_IMPROVEMENT"] = 0] = "UNIMPROVED_TO_IMPROVEMENT";
  TileTypeConversion2[TileTypeConversion2["UNIMPROVED_TO_DISTRICT"] = 1] = "UNIMPROVED_TO_DISTRICT";
  TileTypeConversion2[TileTypeConversion2["IMPROVEMENT_TO_DISTRICT"] = 2] = "IMPROVEMENT_TO_DISTRICT";
  TileTypeConversion2[TileTypeConversion2["DISTRICT_TO_QUARTER"] = 3] = "DISTRICT_TO_QUARTER";
  TileTypeConversion2[TileTypeConversion2["DISTRICT_TO_UNIQUE_QUARTER"] = 4] = "DISTRICT_TO_UNIQUE_QUARTER";
  TileTypeConversion2[TileTypeConversion2["IMPROVEMENT_TO_IMPROVEMENT"] = 5] = "IMPROVEMENT_TO_IMPROVEMENT";
  TileTypeConversion2[TileTypeConversion2["NONE"] = 6] = "NONE";
  return TileTypeConversion2;
})(TileTypeConversion || {});
class PlaceBuildingModelV2 {
  hasSelectedPlot = false;
  isExpanded = false;
  cityName = "";
  headerText = "";
  isRepairing = false;
  showExpandedView = false;
  selectedConstructibleInfo = {
    name: "",
    type: "BUILDING_OPEN" /* EMPTY */,
    shouldShow: true,
    details: [],
    showPlacementIcon: false,
    showRepairIcon: false,
    collectionIndex: -1
  };
  selectPlotMessage = "";
  firstConstructibleSlot = {
    name: "",
    type: "BUILDING_OPEN" /* EMPTY */,
    shouldShow: true,
    details: [],
    showPlacementIcon: false,
    showRepairIcon: false,
    collectionIndex: -1
  };
  secondConstructibleSlot = {
    name: "",
    type: "BUILDING_OPEN" /* EMPTY */,
    shouldShow: true,
    details: [],
    showPlacementIcon: false,
    showRepairIcon: false,
    collectionIndex: -1
  };
  afterFirstConstructibleSlot = {
    name: "",
    type: "BUILDING_OPEN" /* EMPTY */,
    shouldShow: true,
    details: [],
    showPlacementIcon: false,
    showRepairIcon: false,
    collectionIndex: -1
  };
  afterSecondConstructibleSlot = {
    name: "",
    type: "BUILDING_OPEN" /* EMPTY */,
    shouldShow: true,
    details: [],
    showPlacementIcon: false,
    showRepairIcon: false,
    collectionIndex: -1
  };
  shouldShowOverbuild = false;
  overbuildText = "";
  overbuildConstructibleSlot = {
    name: "",
    type: "BUILDING_OPEN" /* EMPTY */,
    shouldShow: true,
    details: [],
    showPlacementIcon: false,
    showRepairIcon: false,
    collectionIndex: -1
  };
  shouldShowUniqueQuarterText = false;
  uniqueQuarterText = "";
  uniqueQuarterWarning = "";
  shouldShowAdjacencyBonuses = false;
  adjacencyBonuses = [];
  placementHeaderText = "";
  tileConversionText = "";
  selectedPlotIndex = null;
  currentYieldTotals = [];
  currentYieldTotalsJSONd = "";
  afterYieldTotals = [];
  afterYieldTotalsJSONd = "";
  afterYieldDeltas = [];
  afterYieldDeltasJSONd = "";
  adjacencyYieldTotals = [];
  adjacencyYieldTotalsJSONd = "";
  beforeBonuses = [];
  beforeBonusesEmpty = true;
  beforeBreakdownEmpty = true;
  afterBonuses = [];
  afterBonusesEmpty = true;
  afterBreakdownEmpty = true;
  beforeTileType = "LOC_DISTRICT_UNIMPROVED_NAME";
  beforeTileIcon = "CITY_UNIMPROVED";
  afterTileType = "LOC_DISTRICT_UNIMPROVED_NAME";
  afterTileIcon = "CITY_UNIMPROVED";
  showBeforeMaintenance = false;
  beforeMaintenance = [];
  showAfterMaintenance = false;
  afterMaintenance = [];
  constructor() {
    engine.whenReady.then(() => {
      window.addEventListener(BuildingPlacementSelectedPlotChangedEventName, this.onSelectedPlotChanged);
      window.addEventListener(BuildingPlacementConstructibleChangedEventName, this.onConstructibleChanged);
    });
  }
  _OnUpdate;
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    const constructibleDef = BuildingPlacementManager.currentConstructible;
    if (!constructibleDef) {
      console.warn(
        "model-place-building: Tried to update but BuildingPlacementManager does not have a valid constructible."
      );
      return;
    }
    const cityID = BuildingPlacementManager.cityID;
    if (!cityID) {
      console.warn(
        "model-place-building: Tried to update but BuildingPlacementManager does not have a valid cityID."
      );
      return;
    }
    const city = Cities.get(cityID);
    if (!city) {
      console.warn(
        `model-place-building: Failed to get the city for cityID ${cityID} provided by BuildingPlacementManager.`
      );
      return;
    }
    const cityYields = city.Yields;
    if (!cityYields) {
      console.warn(
        `model-place-building: Failed to get the CityYields for cityID ${cityID} provided by BuildingPlacementManager.`
      );
      return;
    }
    const cityConstructibles = city.Constructibles;
    if (!cityConstructibles) {
      console.warn(
        `model-place-building: Failed to get the cityConstructibles for cityID ${cityID} provided by BuildingPlacementManager.`
      );
      return;
    }
    const currentYieldBarData = [];
    const yields = cityYields.getYields();
    if (!yields) {
      console.error("model-place-building-v2: update failed to get cityYields.getYields");
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
    let uniqueQuarterPlotIndex = -1;
    let uniqueQuarterDefinition = null;
    for (const uniqueDistrictDef of GameInfo.UniqueQuarters) {
      if (constructibleDef.ConstructibleType == uniqueDistrictDef.BuildingType1 || constructibleDef.ConstructibleType == uniqueDistrictDef.BuildingType2) {
        uniqueQuarterDefinition = uniqueDistrictDef;
        uniqueQuarterPlotIndex = BuildingPlacementManager.findExistingUniqueBuilding(uniqueDistrictDef);
      }
    }
    const isUniqueImprovement = ConstructibleHasTagType(constructibleDef.ConstructibleType, "UNIQUE_IMPROVEMENT");
    const isFulltileConstructible = isUniqueImprovement || constructibleDef.ConstructibleClass == "WONDER" || ConstructibleHasTagType(constructibleDef.ConstructibleType, "FULL_TILE");
    const showUrbanWarning = !isFulltileConstructible;
    this.cityName = city.name;
    this.isRepairing = BuildingPlacementManager.isRepairing;
    this.firstConstructibleSlot.shouldShow = true;
    this.firstConstructibleSlot.showRepairIcon = false;
    this.secondConstructibleSlot.shouldShow = true;
    this.secondConstructibleSlot.showRepairIcon = false;
    this.overbuildConstructibleSlot.shouldShow = true;
    this.overbuildConstructibleSlot.showRepairIcon = false;
    this.selectedConstructibleInfo.name = constructibleDef.Name;
    this.selectedConstructibleInfo.type = constructibleDef.ConstructibleType;
    this.headerText = constructibleDef.Name;
    const selectedMaintenances = cityConstructibles.getMaintenance(constructibleDef.ConstructibleType);
    this.afterMaintenance = [];
    this.showAfterMaintenance = false;
    this.beforeMaintenance = [];
    this.showBeforeMaintenance = false;
    for (const index in selectedMaintenances) {
      const maintenanceValue = selectedMaintenances[index];
      if (maintenanceValue > 0) {
        const yieldDefinition = GameInfo.Yields[index];
        this.afterMaintenance.push(
          Locale.stylize(
            "LOC_UI_PRODUCTION_MAINTENANCE_NEGATIVE_VALUE",
            maintenanceValue,
            yieldDefinition.YieldType
          )
        );
      }
    }
    this.showAfterMaintenance = this.afterMaintenance.length > 0;
    if (this.selectedPlotIndex != null) {
      this.hasSelectedPlot = true;
      let conversionType = 6 /* NONE */;
      this.headerText = Locale.compose("LOC_BUILDING_PLACEMENT_PLACEING_CONSTRUCTIBLE", constructibleDef.Name);
      this.selectedConstructibleInfo.details = [];
      const totalYieldChanges = BuildingPlacementManager.getTotalYieldChanges(this.selectedPlotIndex);
      for (const change of totalYieldChanges) {
        this.selectedConstructibleInfo.details.push(
          Locale.stylize("LOC_BUILDING_PLACEMENT_YIELD", change.yieldChange, change.text)
        );
      }
      const newYieldTotals = [];
      const newYieldDeltas = [];
      for (const yieldDefinition of GameInfo.Yields) {
        const current = this.currentYieldTotals.find((entry) => {
          return entry.type == yieldDefinition.YieldType;
        });
        const currentValue = current ? current.value : 0;
        const change = totalYieldChanges.find((changeInfo) => {
          return changeInfo.yieldType == yieldDefinition.YieldType;
        });
        const changeValue = change ? change.yieldChange : 0;
        let style = YieldBarEntryStyle.NONE;
        if (changeValue > 0) {
          style = YieldBarEntryStyle.GAIN;
        } else if (changeValue < 0) {
          style = YieldBarEntryStyle.LOSS;
        }
        newYieldDeltas.push({
          type: yieldDefinition.YieldType,
          value: changeValue,
          style
        });
        newYieldTotals.push({
          type: yieldDefinition.YieldType,
          value: currentValue + changeValue,
          style
        });
      }
      this.afterYieldTotals = newYieldTotals;
      this.afterYieldDeltas = newYieldDeltas;
      if (this.selectedConstructibleInfo.details.length == 0) {
        this.selectedConstructibleInfo.details.push(
          composeConstructibleDescription(constructibleDef.ConstructibleType, city)
        );
      }
      const overbuildConstructibleID = BuildingPlacementManager.getOverbuildConstructibleID(
        this.selectedPlotIndex
      );
      this.shouldShowOverbuild = false;
      const selectedDistrict = Districts.getAtLocation(GameplayMap.getLocationFromIndex(this.selectedPlotIndex));
      if (selectedDistrict) {
        const constructibles = selectedDistrict.getConstructibleIds().filter((constructibleID) => {
          const constructible = Constructibles.getByComponentID(constructibleID);
          if (!constructible) {
            console.error(
              `model-place-building: updateGate - no constructible found for component id ${constructibleID}`
            );
            return false;
          }
          const constructibleDefinition = GameInfo.Constructibles.lookup(constructible.type);
          if (!constructibleDefinition) {
            console.error(
              `model-place-building: updateGate - no constructible definition found for component id ${constructibleID}`
            );
            return false;
          }
          if (constructibleDefinition.ExistingDistrictOnly) {
            return false;
          }
          return true;
        });
        if (constructibles[0]) {
          this.firstConstructibleSlot = this.getConstructibleInfoByComponentID(constructibles[0]);
          this.afterFirstConstructibleSlot.type = this.firstConstructibleSlot.type;
          if (this.isRepairing && this.firstConstructibleSlot.type == this.selectedConstructibleInfo.type) {
            this.placementHeaderText = Locale.compose(
              "LOC_UI_CITY_VIEW_REPAIR",
              this.firstConstructibleSlot.name
            );
            this.firstConstructibleSlot.showRepairIcon = true;
            this.firstConstructibleSlot.showPlacementIcon = false;
          } else if (this.firstConstructibleSlot.collectionIndex == overbuildConstructibleID) {
            if (constructibles[1]) {
              const secondConstructible = Constructibles.getByComponentID(constructibles[1]);
              if (secondConstructible) {
                const secondConstructibleDefinition = GameInfo.Constructibles.lookup(
                  secondConstructible.type
                );
                if (secondConstructibleDefinition) {
                  conversionType = this.willBecomeQuarter(
                    secondConstructibleDefinition.ConstructibleType
                  ) ? 3 /* DISTRICT_TO_QUARTER */ : 6 /* NONE */;
                }
              }
            }
            this.firstConstructibleSlot.showPlacementIcon = false;
            this.shouldShowOverbuild = true;
            this.overbuildConstructibleSlot = this.firstConstructibleSlot;
            this.overbuildText = Locale.stylize(
              "LOC_BUILDING_PLACEMENT_WILL_OVERBUILD",
              this.selectedConstructibleInfo.name,
              this.overbuildConstructibleSlot.name
            );
            this.placementHeaderText = Locale.compose(
              "LOC_UI_CITY_VIEW_PLACE_OVER",
              this.overbuildConstructibleSlot.name
            );
            this.afterFirstConstructibleSlot.type = this.selectedConstructibleInfo.type;
          } else {
            this.firstConstructibleSlot.showPlacementIcon = false;
          }
        }
        if (constructibles[1]) {
          this.secondConstructibleSlot = this.getConstructibleInfoByComponentID(constructibles[1]);
          this.afterSecondConstructibleSlot.type = this.secondConstructibleSlot.type;
          if (this.isRepairing && this.secondConstructibleSlot.type == this.selectedConstructibleInfo.type) {
            this.placementHeaderText = Locale.compose(
              "LOC_UI_CITY_VIEW_REPAIR",
              this.secondConstructibleSlot.name
            );
            this.secondConstructibleSlot.showRepairIcon = true;
            this.secondConstructibleSlot.showPlacementIcon = false;
          } else if (this.secondConstructibleSlot.collectionIndex == overbuildConstructibleID) {
            conversionType = this.willBecomeQuarter(this.firstConstructibleSlot.type) ? 3 /* DISTRICT_TO_QUARTER */ : 6 /* NONE */;
            this.secondConstructibleSlot.showPlacementIcon = false;
            this.shouldShowOverbuild = true;
            this.overbuildConstructibleSlot = this.secondConstructibleSlot;
            this.overbuildText = Locale.stylize(
              "LOC_BUILDING_PLACEMENT_WILL_OVERBUILD",
              this.selectedConstructibleInfo.name,
              this.secondConstructibleSlot.name
            );
            this.placementHeaderText = Locale.compose(
              "LOC_UI_CITY_VIEW_PLACE_OVER",
              this.overbuildConstructibleSlot.name
            );
            this.afterSecondConstructibleSlot.type = this.selectedConstructibleInfo.type;
          } else {
            this.secondConstructibleSlot.showPlacementIcon = false;
          }
        } else {
          if (selectedDistrict.isUrbanCore) {
            conversionType = this.willBecomeQuarter(this.firstConstructibleSlot.type) ? 3 /* DISTRICT_TO_QUARTER */ : 6 /* NONE */;
            this.secondConstructibleSlot.type = "BUILDING_OPEN" /* EMPTY */;
            this.firstConstructibleSlot.showPlacementIcon = false;
            this.secondConstructibleSlot.showPlacementIcon = false;
            this.placementHeaderText = Locale.compose("LOC_UI_CITY_VIEW_PLACE_HERE");
            if (isFulltileConstructible) {
              this.afterFirstConstructibleSlot.type = this.selectedConstructibleInfo.type;
              this.afterSecondConstructibleSlot.type = "BUILDING_OPEN" /* EMPTY */;
            } else {
              this.afterFirstConstructibleSlot.type = this.firstConstructibleSlot.type;
              this.afterSecondConstructibleSlot.type = this.selectedConstructibleInfo.type;
            }
          } else {
            this.secondConstructibleSlot.type = "BUILDING_ADD" /* ADD */;
            this.firstConstructibleSlot.showPlacementIcon = false;
            this.secondConstructibleSlot.showPlacementIcon = false;
            if (isUniqueImprovement) {
              conversionType = 5 /* IMPROVEMENT_TO_IMPROVEMENT */;
            } else {
              conversionType = 2 /* IMPROVEMENT_TO_DISTRICT */;
            }
            this.overbuildConstructibleSlot = this.firstConstructibleSlot;
            if (this.isRepairing) {
              this.placementHeaderText = Locale.compose(
                "LOC_UI_CITY_VIEW_REPAIR",
                this.firstConstructibleSlot.name
              );
              this.firstConstructibleSlot.showRepairIcon = true;
              this.firstConstructibleSlot.showPlacementIcon = false;
              this.secondConstructibleSlot.shouldShow = false;
              this.shouldShowOverbuild = false;
            } else {
              this.overbuildText = Locale.stylize(
                "LOC_BUILDING_PLACEMENT_WILL_REPLACE",
                this.selectedConstructibleInfo.name,
                this.firstConstructibleSlot.name
              );
              const convertWarning = Locale.compose(
                "LOC_UI_CITY_VIEW_CONVERT_FROM_URBAN_WARNING"
              );
              const placeOver = Locale.compose(
                "LOC_UI_CITY_VIEW_PLACE_OVER",
                this.overbuildConstructibleSlot.name
              );
              this.placementHeaderText = showUrbanWarning ? convertWarning : placeOver;
              this.secondConstructibleSlot.shouldShow = false;
              this.shouldShowOverbuild = true;
            }
            this.afterFirstConstructibleSlot.type = this.selectedConstructibleInfo.type;
            this.afterSecondConstructibleSlot.type = "BUILDING_OPEN" /* EMPTY */;
          }
        }
        if (this.shouldShowOverbuild) {
          const selectedMaintenances2 = cityConstructibles.getMaintenance(
            this.overbuildConstructibleSlot.type
          );
          this.beforeMaintenance = [];
          for (const index in selectedMaintenances2) {
            const maintenanceValue = selectedMaintenances2[index];
            if (maintenanceValue > 0) {
              const yieldDefinition = GameInfo.Yields[index];
              this.beforeMaintenance.push(
                Locale.stylize(
                  "LOC_UI_PRODUCTION_MAINTENANCE_NEGATIVE_VALUE",
                  maintenanceValue,
                  yieldDefinition.YieldType
                )
              );
            }
          }
          this.showBeforeMaintenance = this.beforeMaintenance.length > 0;
        }
      } else {
        this.firstConstructibleSlot.type = "BUILDING_OPEN" /* EMPTY */;
        this.firstConstructibleSlot.showPlacementIcon = false;
        this.secondConstructibleSlot.type = "BUILDING_OPEN" /* EMPTY */;
        this.secondConstructibleSlot.showPlacementIcon = false;
        const convertWarning = Locale.compose("LOC_UI_CITY_VIEW_CONVERT_FROM_URBAN_WARNING");
        const placeOver = Locale.compose(
          "LOC_UI_CITY_VIEW_PLACE_OVER",
          this.overbuildConstructibleSlot.name
        );
        this.placementHeaderText = showUrbanWarning ? convertWarning : placeOver;
        this.afterFirstConstructibleSlot.type = this.selectedConstructibleInfo.type;
        this.afterSecondConstructibleSlot.type = "BUILDING_OPEN" /* EMPTY */;
        this.showBeforeMaintenance = false;
        conversionType = 1 /* UNIMPROVED_TO_DISTRICT */;
      }
      this.afterSecondConstructibleSlot.shouldShow = isFulltileConstructible ? false : true;
      if (uniqueQuarterDefinition != null && this.selectedPlotIndex == uniqueQuarterPlotIndex) {
        this.placementHeaderText = Locale.compose(uniqueQuarterDefinition.Name);
        this.shouldShowUniqueQuarterText = true;
        this.uniqueQuarterText = Locale.compose(
          "LOC_UI_CITY_VIEW_UNIQUE_QUARTER_WILL_COMPLETE",
          this.selectedConstructibleInfo.name,
          uniqueQuarterDefinition.Name
        );
        this.uniqueQuarterWarning = "";
        conversionType = 4 /* DISTRICT_TO_UNIQUE_QUARTER */;
      } else if (uniqueQuarterDefinition != null && uniqueQuarterPlotIndex != -1) {
        this.shouldShowUniqueQuarterText = true;
        this.uniqueQuarterText = "";
        this.uniqueQuarterWarning = Locale.compose(
          "LOC_UI_CITY_VIEW_UNIQUE_QUARTER_CANT_COMPLETE",
          uniqueQuarterDefinition.Name
        );
      } else {
        this.shouldShowUniqueQuarterText = false;
      }
      this.adjacencyBonuses = [];
      const adjacencyData = BuildingPlacementManager.getAdjacencyYieldChanges(this.selectedPlotIndex);
      adjacencyData?.forEach((data) => {
        this.adjacencyBonuses.push(Locale.stylize("LOC_BUILDING_PLACEMENT_YIELD", data.yieldChange, data.text));
      });
      this.shouldShowAdjacencyBonuses = this.adjacencyBonuses.length > 0;
      const adjacencyYieldEntries = [];
      for (const yieldDefinition of GameInfo.Yields) {
        let adjacencyTotal = 0;
        for (const data of adjacencyData) {
          if (data.yieldType == yieldDefinition.YieldType) {
            adjacencyTotal += data.yieldChange;
          }
        }
        let style = YieldBarEntryStyle.NONE;
        if (adjacencyTotal > 0) {
          style = YieldBarEntryStyle.GAIN;
        } else if (adjacencyTotal < 0) {
          style = YieldBarEntryStyle.LOSS;
        }
        adjacencyYieldEntries.push({
          type: yieldDefinition.YieldType,
          value: adjacencyTotal,
          style
        });
      }
      this.adjacencyYieldTotals = adjacencyYieldEntries;
      this.currentYieldTotalsJSONd = JSON.stringify(this.currentYieldTotals);
      this.afterYieldTotalsJSONd = JSON.stringify(this.afterYieldTotals);
      this.afterYieldDeltasJSONd = JSON.stringify(this.afterYieldDeltas);
      this.adjacencyYieldTotalsJSONd = JSON.stringify(this.adjacencyYieldTotals);
      this.beforeBonuses = this.getBeforeYieldBonuses(this.selectedPlotIndex);
      this.beforeBonusesEmpty = this.beforeBonuses.length === 0;
      this.beforeBreakdownEmpty = this.beforeBonusesEmpty && !this.showBeforeMaintenance;
      this.afterBonuses = this.getAfterYieldBonuses(this.selectedPlotIndex);
      this.afterBonusesEmpty = this.afterBonuses.length === 0;
      this.afterBreakdownEmpty = this.afterBonusesEmpty && !this.showAfterMaintenance;
      switch (conversionType) {
        case 1 /* UNIMPROVED_TO_DISTRICT */:
          this.tileConversionText = Locale.compose("LOC_BUILDING_PLACEMENT_UNIMPROVED_TO_DISTRICT");
          this.beforeTileType = "LOC_DISTRICT_UNIMPROVED_NAME";
          this.beforeTileIcon = "CITY_UNIMPROVED";
          this.afterTileType = "LOC_BUILDING_PLACEMENT_DISTRICT";
          this.afterTileIcon = "CITY_URBAN";
          break;
        case 2 /* IMPROVEMENT_TO_DISTRICT */:
          this.tileConversionText = Locale.compose("LOC_BUILDING_PLACEMENT_IMPROVEMENT_TO_DISTRICT");
          this.beforeTileType = "LOC_BUILDING_PLACEMENT_IMPROVEMENT";
          this.beforeTileIcon = "CITY_RURAL";
          this.afterTileType = "LOC_BUILDING_PLACEMENT_DISTRICT";
          this.afterTileIcon = "CITY_URBAN";
          break;
        case 5 /* IMPROVEMENT_TO_IMPROVEMENT */:
          this.tileConversionText = Locale.compose("LOC_BUILDING_PLACEMENT_IMPROVEMENT_TO_DISTRICT");
          this.beforeTileType = "LOC_BUILDING_PLACEMENT_IMPROVEMENT";
          this.beforeTileIcon = "CITY_RURAL";
          this.afterTileType = "LOC_BUILDING_PLACEMENT_IMPROVEMENT";
          this.afterTileIcon = "CITY_RURAL";
          break;
        case 3 /* DISTRICT_TO_QUARTER */:
          this.tileConversionText = Locale.compose("LOC_BUILDING_PLACEMENT_DISTRICT_TO_QUARTER");
          this.beforeTileType = "LOC_BUILDING_PLACEMENT_DISTRICT";
          this.beforeTileIcon = "CITY_URBAN";
          this.afterTileType = "LOC_BUILDING_PLACEMENT_QUARTER";
          this.afterTileIcon = "CITY_URBAN";
          break;
        case 4 /* DISTRICT_TO_UNIQUE_QUARTER */:
          this.tileConversionText = Locale.compose("LOC_BUILDING_PLACEMENT_DISTRICT_TO_UNIQUE_QUARTER");
          this.beforeTileType = "LOC_BUILDING_PLACEMENT_DISTRICT";
          this.beforeTileIcon = "CITY_URBAN";
          this.afterTileType = "LOC_BUILDING_PLACEMENT_UNIQUE_QUARTER";
          this.afterTileIcon = "CITY_URBAN";
          break;
        default:
          this.tileConversionText = "";
          this.beforeTileType = "LOC_BUILDING_PLACEMENT_DISTRICT";
          this.beforeTileIcon = "CITY_URBAN";
          this.afterTileType = "LOC_BUILDING_PLACEMENT_DISTRICT";
          this.afterTileIcon = "CITY_URBAN";
      }
    } else {
      this.selectedConstructibleInfo.details = [];
      this.selectedConstructibleInfo.details.push(
        composeConstructibleDescription(constructibleDef.ConstructibleType, city)
      );
      this.hasSelectedPlot = false;
      this.shouldShowAdjacencyBonuses = false;
      this.shouldShowOverbuild = false;
      this.shouldShowUniqueQuarterText = false;
      this.selectPlotMessage = Locale.compose(
        "LOC_UI_CITY_VIEW_SELECT_A_PLOT",
        this.selectedConstructibleInfo.name
      );
    }
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  });
  willBecomeQuarter(otherConstructibleType) {
    if (ConstructibleHasTagType(otherConstructibleType, "AGELESS")) {
      return true;
    }
    const constructibleDefinition = GameInfo.Constructibles.lookup(otherConstructibleType);
    if (constructibleDefinition) {
      const currentAge = GameInfo.Ages.lookup(Game.age);
      if (!currentAge) {
        console.error(`model-place-building-v2: Failed to get current age for hash ${Game.age}`);
        return false;
      }
      if (constructibleDefinition.Age == currentAge.AgeType) {
        return true;
      }
    }
    return false;
  }
  getBeforeYieldBonuses(plotIndex) {
    const yieldBonuses = [];
    const placementData = BuildingPlacementManager.getPlacementPlotData(plotIndex);
    if (!placementData) {
      return [];
    }
    const addGroupedYieldBonuses = (description, filter, value) => {
      const sourceTypeMap = /* @__PURE__ */ new Map();
      for (const change of placementData.changeDetails) {
        if (filter(change)) {
          const v = value(change);
          if (v == 0) {
            continue;
          }
          const yieldDefinition = GameInfo.Yields.lookup(change.yieldType);
          if (!yieldDefinition) {
            console.error(
              `building-placement-manager: Failed to find yield definition for ${change.yieldType}`
            );
            continue;
          }
          const currentValue = sourceTypeMap.get(yieldDefinition.YieldType);
          if (currentValue) {
            sourceTypeMap.set(yieldDefinition.YieldType, v + currentValue);
          } else {
            sourceTypeMap.set(yieldDefinition.YieldType, v);
          }
        }
      }
      const bonuses = [];
      sourceTypeMap.forEach((value2, key) => {
        if (value2 != 0) {
          bonuses.push(
            Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_BONUS",
              value2 > 0 ? "text-positive" : "text-negative",
              value2,
              key
            )
          );
        }
      });
      if (bonuses.length > 0) {
        yieldBonuses.push({
          description,
          bonuses
        });
      }
    };
    const toAbsValue = (c) => Math.abs(c.change);
    addGroupedYieldBonuses(
      "LOC_BUILDING_PLACEMENT_BASE_YIELD",
      (c) => c.sourceType == YieldSourceTypes.BASE && c.change < 0,
      toAbsValue
    );
    addGroupedYieldBonuses(
      "LOC_BUILDING_PLACEMENT_NATURAL_YIELD",
      (c) => c.sourceType == YieldSourceTypes.NATURAL && c.change < 0,
      toAbsValue
    );
    for (const change of placementData.changeDetails) {
      if (change.sourceType == YieldSourceTypes.ADJACENCY && change.change < 0) {
        const yieldDefinition = GameInfo.Yields.lookup(change.yieldType);
        if (!yieldDefinition) {
          continue;
        }
        yieldBonuses.push({
          description: BuildingPlacementManager.getDirectionDescrption(
            change.sourcePlotIndex,
            change.targetPlotIndex,
            placementData.plotID == change.targetPlotIndex
          ),
          bonuses: [
            Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_BONUS",
              "text-positive",
              Math.abs(change.change),
              yieldDefinition.YieldType
            )
          ]
        });
      }
    }
    addGroupedYieldBonuses(
      "LOC_BUILDING_PLACEMENT_WAREHOUSE_YIELD",
      (c) => c.sourceType == YieldSourceTypes.WAREHOUSE && c.change < 0,
      toAbsValue
    );
    for (const change of placementData.changeDetails) {
      if (change.sourceType != YieldSourceTypes.BASE && change.sourceType != YieldSourceTypes.ADJACENCY && change.sourceType != YieldSourceTypes.WAREHOUSE && change.sourceType != YieldSourceTypes.NATURAL && change.sourceType != YieldSourceTypes.CITY_MODIFIERS && change.change < 0) {
        const yieldDefinition = GameInfo.Yields.lookup(change.yieldType);
        if (!yieldDefinition) {
          continue;
        }
        yieldBonuses.push({
          description: "LOC_BUILDING_PLACEMENT_OTHER_YIELD",
          bonuses: [
            Locale.stylize(
              "LOC_BUILDING_PLACEMENT_YIELD_BONUS",
              "text-positive",
              Math.abs(change.change),
              yieldDefinition.YieldType
            )
          ]
        });
      }
    }
    return yieldBonuses;
  }
  getAfterYieldBonuses(plotIndex) {
    const placementData = BuildingPlacementManager.getPlacementPlotData(plotIndex);
    if (!placementData) {
      return [];
    }
    return BuildingPlacementManager.getYieldBonusBreakdownFromPlacementData(placementData);
  }
  getConstructibleInfoByComponentID(constructibleID) {
    const constructibleInfo = {
      name: "",
      type: "BUILDING_OPEN" /* EMPTY */,
      shouldShow: true,
      details: [],
      showPlacementIcon: false,
      showRepairIcon: false,
      collectionIndex: -1
    };
    const cityID = BuildingPlacementManager.cityID;
    if (!cityID) {
      console.warn(
        "model-place-building: getConstructibleInfoByComponentID(): Tried to update but BuildingPlacementManager does not have a valid cityID."
      );
      return constructibleInfo;
    }
    const city = Cities.get(cityID);
    if (!city) {
      console.warn(
        `model-place-building: getConstructibleInfoByComponentID(): Failed to get the city for cityID ${cityID} provided by BuildingPlacementManager.`
      );
      return constructibleInfo;
    }
    const constructible = Constructibles.getByComponentID(constructibleID);
    if (constructible) {
      const constructibleDefinition = GameInfo.Constructibles.lookup(constructible.type);
      if (constructibleDefinition) {
        constructibleInfo.name = constructibleDefinition.Name;
        constructibleInfo.details.push(
          composeConstructibleDescription(constructibleDefinition.ConstructibleType, city)
        );
        constructibleInfo.type = constructibleDefinition.ConstructibleType;
        constructibleInfo.collectionIndex = constructibleDefinition.$index;
      } else {
        console.error(
          `model-place-building: Failed to get constructible definition for type ${constructible.type}`
        );
      }
    } else {
      console.error(`model-place-building: Failed to get constructible for id ${constructibleID}`);
    }
    return constructibleInfo;
  }
  onSelectedPlotChanged = () => {
    if (this.selectedPlotIndex != BuildingPlacementManager.selectedPlotIndex) {
      this.selectedPlotIndex = BuildingPlacementManager.selectedPlotIndex;
      this.updateGate.call("onSelectedPlotChanged");
    }
  };
  onConstructibleChanged = () => {
    this.updateGate.call("onConstructibleChanged");
  };
}
const PlaceBuildingV2 = new PlaceBuildingModelV2();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(PlaceBuildingV2);
  };
  engine.createJSModel("g_PlaceBuildingV2", PlaceBuildingV2);
  PlaceBuildingV2.updateCallback = updateModel;
});

export { PlaceBuildingV2 };
//# sourceMappingURL=model-place-building-v2.js.map
