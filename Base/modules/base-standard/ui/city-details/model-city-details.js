import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import { formatStringArrayAsNewLineText } from '../../../core/ui/utilities/utilities-core-textprovider.js';
import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';

const UpdateCityDetailsEventName = "update-city-details";
class UpdateCityDetailsEvent extends CustomEvent {
  constructor() {
    super(UpdateCityDetailsEventName, { bubbles: false });
  }
}
class CityDetailsModel {
  name = "";
  isTown = false;
  specialistPerTile = 0;
  currentCitizens = 0;
  urbanPopulation = 0;
  ruralPopulation = 0;
  specialistCount = 0;
  turnsToNextCitizen = 0;
  currentTownFocus = "";
  hasTownFocus = false;
  happinessPerTurn = 0;
  hasUnrest = false;
  foodPerTurn = 0;
  foodToGrow = 0;
  foodCurrent = 0;
  foodExported = 0;
  foodExportPotential = 0;
  buildings = [];
  improvements = [];
  wonders = [];
  constructibleCounts = /* @__PURE__ */ new Map();
  warehouseCounts = /* @__PURE__ */ new Map();
  yields = [];
  isBeingRazed = false;
  getTurnsUntilRazed = -1;
  treasureFleetText = "";
  connectedSettlements = [];
  connectedSettlementFood = [];
  nonExportingProjects = [];
  onUpdate;
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  constructor() {
    this.updateGate.call("constructor");
    engine.on("CitySelectionChanged", this.onCitySelectionChanged, this);
    engine.on("CityGrowthModeChanged", this.onCityGrowthModeChanged, this);
    engine.on("CityPopulationChanged", this.onCityPopulationchanged, this);
  }
  onCityPopulationchanged() {
    this.updateGate.call("onCityPopulationChanged");
  }
  onCitySelectionChanged() {
    this.updateGate.call("onCitySelectionChanged");
  }
  onCityGrowthModeChanged() {
    this.updateGate.call("onCityGrowthModeChanged");
  }
  reset() {
    this.specialistPerTile = 0;
    this.currentCitizens = 0;
    this.urbanPopulation = 0;
    this.ruralPopulation = 0;
    this.specialistCount = 0;
    this.turnsToNextCitizen = 0;
    this.happinessPerTurn = 0;
    this.foodPerTurn = 0;
    this.foodToGrow = 0;
    this.foodCurrent = 0;
    this.foodExported = 0;
    this.foodExportPotential = 0;
    this.buildings = [];
    this.improvements = [];
    this.wonders = [];
    this.connectedSettlements = [];
    this.connectedSettlementFood = [];
    if (this.onUpdate) {
      this.onUpdate(this);
    }
    window.dispatchEvent(new UpdateCityDetailsEvent());
  }
  // Add a yields hierarchy to the top level yield data.
  addYieldsToHierarchy(yields, topYieldData, yieldInfo) {
    let childTotal = 0;
    if (yields) {
      if (yields.base) {
        if (yields.base.type == GameValueStepTypes.ADDITION) {
          if (yields.base.steps && yields.base.steps.length > 0) {
            childTotal += yields.value;
            const yieldData = {
              name: Locale.stylize(yields.description),
              value: yields.value,
              valueType: yields.valueDisplayType,
              tooltip: yields.tooltip,
              children: []
            };
            this.addYieldSteps(yieldData, yields.base.steps, yieldInfo);
            if (yields.modifier && yields.modifier.description) {
              this.addYieldsToHierarchy(yields.modifier, yieldData, yieldInfo);
            }
            topYieldData.children.push(yieldData);
          }
        } else {
          if (yields.base.description) {
            childTotal += yields.value;
            const yieldData = {
              name: Locale.stylize(yields.description),
              value: yields.value,
              valueType: yields.valueDisplayType,
              tooltip: yields.tooltip,
              children: []
            };
            this.addYieldsToHierarchy(yields.base, yieldData, yieldInfo);
            if (yields.modifier && yields.modifier.description) {
              this.addYieldsToHierarchy(yields.modifier, yieldData, yieldInfo);
            }
            topYieldData.children.push(yieldData);
          }
        }
      } else if (yields.steps) {
        if (yields.steps.length > 0) {
          childTotal += yields.value;
          const yieldData = {
            name: Locale.stylize(yields.description),
            value: yields.value,
            valueType: yields.valueDisplayType,
            tooltip: yields.tooltip,
            children: []
          };
          this.addYieldSteps(yieldData, yields.steps, yieldInfo);
          topYieldData.children.push(yieldData);
        }
      } else {
        childTotal += yields.value;
        const yieldData = {
          name: Locale.stylize(yields.description),
          value: yields.value,
          valueType: yields.valueDisplayType,
          tooltip: yields.tooltip,
          children: []
        };
        topYieldData.children.push(yieldData);
      }
    }
    return childTotal;
  }
  // Add the income hierarchy to the top level yield display
  addIncomeHierarchy(cityYields, yieldIndex, topYieldData, yieldInfo) {
    const yieldRootPath = [CityYieldNodes.INCOME];
    const yieldPathChildNodes = [
      CityYieldNodes.BUILDING_YIELDS,
      CityYieldNodes.IMPROVEMENT_YIELDS,
      CityYieldNodes.YIELD_FROM_RESOURCES,
      CityYieldNodes.YIELD_FROM_TRADE,
      CityYieldNodes.YIELD_FROM_DEMAND_FOR_TRADE,
      CityYieldNodes.YIELD_FROM_PROJECTS,
      CityYieldNodes.YIELD_FROM_GREAT_WORKS,
      CityYieldNodes.YIELD_FROM_CONNECTED_TOWNS,
      CityYieldNodes.YIELD_FROM_SURPLUS_HAPPINESS,
      CityYieldNodes.PRODUCTION_CONVERSION_PROJECT,
      CityYieldNodes.CITY_EFFECTS_YIELDS,
      CityYieldNodes.ACTIVE_CIV_TRADITIONS
    ];
    let childTotal = 0;
    for (const childNode of yieldPathChildNodes) {
      const yieldPath = yieldRootPath.concat(childNode);
      const yields = cityYields.getYieldsForNode(yieldIndex, yieldPath, true);
      childTotal += this.addYieldsToHierarchy(yields, topYieldData, yieldInfo);
    }
    const incomeNode = cityYields.getYieldSummaryForNode(yieldIndex, yieldRootPath);
    if (incomeNode) {
      if (incomeNode.base) {
        if (childTotal < incomeNode.base.value) {
          const otherYieldData = {
            name: Locale.compose("LOC_GLOBAL_YIELDS_OTHER"),
            value: incomeNode.base.value - childTotal,
            children: []
          };
          topYieldData.children.push(otherYieldData);
        }
        if (incomeNode.modifier) {
          if (incomeNode.modifier.value !== 0) {
            const adjustment = incomeNode.base.value * incomeNode.modifier.value / 100;
            if (adjustment !== 0) {
              const otherYieldData = {
                name: Locale.compose(
                  adjustment > 0 ? "LOC_YIELD_BONUS_NAME" : "LOC_YIELD_PENALTY_NAME"
                ),
                value: adjustment,
                children: []
              };
              const yieldPath = yieldRootPath.concat(CityYieldNodes.INCOME_MODIFIERS);
              const yieldModifiers = cityYields.getYieldsForNode(yieldIndex, yieldPath, true);
              if (yieldModifiers && yieldModifiers.base && yieldModifiers.base.steps) {
                this.addYieldSteps(
                  otherYieldData,
                  yieldModifiers.base.steps,
                  yieldInfo,
                  GameValueDisplayTypes.PERCENTAGE
                );
              }
              topYieldData.children.push(otherYieldData);
            }
          }
        }
      }
    }
  }
  // Add the deductions hierarchy to the top level yield display
  addDeductionsHierarchy(cityYields, yieldIndex, topYieldData, yieldInfo) {
    const rootPath = [CityYieldNodes.MINUS_DEDUCTIONS];
    const rootPrefixPath = [CityYieldNodes.MINUS_DEDUCTIONS, CityYieldNodes.DEDUCTIONS];
    const deductionNode = cityYields.getYieldSummaryForNode(yieldIndex, rootPath);
    if (deductionNode && deductionNode.value != 0) {
      const deductionYieldData = {
        name: Locale.compose("LOC_ATTR_YIELD_DEDUCTIONS"),
        // Overriding the name to be simpler
        value: deductionNode.value,
        children: []
      };
      const pathChildNodes = [
        CityYieldNodes.BUILDING_MAINTENANCE,
        CityYieldNodes.HAPPINESS_UPKEEP,
        CityYieldNodes.MAINTENANCE_FROM_WORKERS
      ];
      for (const childNode of pathChildNodes) {
        const yieldPath = rootPrefixPath.concat(childNode);
        const yields = cityYields.getYieldsForNode(yieldIndex, yieldPath, true);
        this.addYieldsToHierarchy(yields, deductionYieldData, yieldInfo);
      }
      topYieldData.children.push(deductionYieldData);
    }
  }
  updateGate = new UpdateGate(() => {
    const selectedCityID = UI.Player.getHeadSelectedCity();
    if (!selectedCityID || ComponentID.isInvalid(selectedCityID)) {
      this.reset();
      return;
    }
    const city = Cities.get(selectedCityID);
    if (!city) {
      console.error(`model-city-details: Failed to get city for ID ${selectedCityID}`);
      return;
    }
    const cityResources = city.Resources;
    if (!cityResources) {
      console.error(`model-city-details: Failed to get city.Resources for ID ${selectedCityID}`);
      return;
    }
    this.name = city.name;
    this.isTown = city.isTown;
    this.currentCitizens = city.population;
    this.urbanPopulation = city.urbanPopulation;
    this.ruralPopulation = city.ruralPopulation;
    this.specialistCount = city.Workers ? city.Workers.getNumWorkers(false) : 0;
    const cityYields = city.Yields;
    if (!cityYields) {
      console.error(`model-city-details: Failed to get city.Yields for ID ${selectedCityID}`);
      return;
    }
    this.foodPerTurn = cityYields.getNetYield(YieldTypes.YIELD_FOOD);
    const cityGrowth = city.Growth;
    if (cityGrowth) {
      this.turnsToNextCitizen = cityGrowth.turnsUntilGrowth;
      this.foodToGrow = cityGrowth.getNextGrowthFoodThreshold().value;
      this.foodCurrent = cityGrowth.currentFood;
      if (this.isTown && cityGrowth.growthType != GrowthTypes.EXPAND) {
        const projectType = cityGrowth.projectType;
        const projectInfo = GameInfo.Projects.lookup(projectType);
        this.currentTownFocus = projectInfo?.ProjectType ?? "";
        this.hasTownFocus = true;
      } else {
        this.hasTownFocus = false;
      }
    }
    const cityHappiness = city.Happiness;
    if (cityHappiness) {
      this.happinessPerTurn = cityHappiness.netHappinessPerTurn;
      this.hasUnrest = cityHappiness.hasUnrest;
    }
    const cityWorkers = city.Workers;
    if (cityWorkers) {
      this.specialistPerTile = cityWorkers.getCityWorkerCap();
    }
    const constructibles = city.Constructibles;
    if (!constructibles) {
      console.error(`model-city-details: Failed to get city.Constructibles for ID ${city.id}`);
      return;
    }
    this.buildings = [];
    this.improvements = [];
    this.wonders = [];
    this.constructibleCounts.clear();
    this.warehouseCounts.clear();
    for (const constructibleID of constructibles.getIds()) {
      const constructible = Constructibles.getByComponentID(constructibleID);
      if (!constructible) {
        return;
      }
      const constructibleDefinition = GameInfo.Constructibles.lookup(constructible.type);
      if (!constructibleDefinition) {
        return;
      }
      const count = this.constructibleCounts.get(constructibleDefinition.Name) || 0;
      this.constructibleCounts.set(constructibleDefinition.Name, count + 1);
      const constructibleData = {
        id: constructibleID,
        location: constructible.location,
        type: constructibleDefinition.ConstructibleType,
        name: constructibleDefinition.Name,
        damaged: constructible.damaged,
        icon: constructibleDefinition.ConstructibleType,
        iconContext: constructibleDefinition.ConstructibleClass
      };
      const maintenances = constructibles.getMaintenance(constructibleDefinition.ConstructibleType);
      for (const index in maintenances) {
        const maintenanceValue = maintenances[index];
        if (maintenanceValue > 0) {
          if (!constructibleData.maintenanceMap) {
            constructibleData.maintenanceMap = /* @__PURE__ */ new Map();
          }
          const yieldDefinition = GameInfo.Yields[index];
          const maintenanceYieldData = {
            name: yieldDefinition.Name,
            value: -maintenanceValue,
            icon: yieldDefinition.YieldType,
            iconContext: "YIELD"
          };
          constructibleData.maintenanceMap.set(yieldDefinition.YieldType, maintenanceYieldData);
        }
      }
      switch (constructibleDefinition.ConstructibleClass) {
        case "BUILDING":
          let districtData = this.buildings.find((data) => {
            return data.location.x == constructible.location.x && data.location.y == constructible.location.y;
          });
          if (districtData) {
            districtData.constructibleData.push(constructibleData);
            this.updateUniqueQuarterData(districtData);
          } else {
            districtData = {
              location: constructible.location,
              constructibleData: [constructibleData]
            };
            this.updateUniqueQuarterData(districtData);
            this.buildings.push(districtData);
          }
          break;
        case "IMPROVEMENT":
          this.improvements.push(constructibleData);
          const warehouseImprovementDefinition = GameInfo.Constructibles.lookup(
            Districts.getFreeConstructible(constructible.location, city.owner)
          );
          if (warehouseImprovementDefinition) {
            const warehouseImprovementType = warehouseImprovementDefinition.ConstructibleType;
            const warehouseImprovementName = warehouseImprovementDefinition.Name;
            const ImprovementType = constructibleDefinition.ConstructibleType;
            const improvementName = constructibleDefinition.Name;
            if (!this.warehouseCounts.has(warehouseImprovementName)) {
              this.warehouseCounts.set(warehouseImprovementName, {
                name: warehouseImprovementName,
                icon: warehouseImprovementType,
                total: 0,
                breakdown: /* @__PURE__ */ new Map()
              });
            }
            const warehouseEntry = this.warehouseCounts.get(warehouseImprovementName);
            if (!warehouseEntry || !warehouseEntry.breakdown) {
              console.error(`model-city-details: warehouse entry was just created but does not exist?`);
              break;
            }
            warehouseEntry.total += 1;
            if (!warehouseEntry.breakdown.has(improvementName)) {
              warehouseEntry.breakdown.set(improvementName, {
                name: improvementName,
                icon: ImprovementType,
                total: 0
              });
            }
            const warehouseSubEntry = warehouseEntry.breakdown.get(improvementName);
            if (!warehouseSubEntry) {
              console.error(
                `model-city-details: warehouse breakdown was just created but does not exist?`
              );
              break;
            }
            warehouseSubEntry.total += 1;
          } else {
            console.error(
              `model-city-details: basic improvment type not found for plot ${constructible.location}!`
            );
          }
          break;
        case "WONDER":
          this.wonders.push(constructibleData);
          break;
        default:
          console.error(
            `model-city-details: Failed to add ${constructibleDefinition.Name} of class ${constructibleDefinition.ConstructibleClass} to constructible lists!`
          );
      }
    }
    this.improvements.sort((a, b) => {
      const freqA = this.constructibleCounts.get(a.name) || 0;
      const freqB = this.constructibleCounts.get(b.name) || 0;
      if (freqB !== freqA) {
        return freqB - freqA;
      }
      if (a.name != b.name) {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    this.yields = [];
    for (let yieldIndex = 0; yieldIndex < GameInfo.Yields.length; yieldIndex++) {
      const yieldInfo = GameInfo.Yields[yieldIndex];
      if (yieldInfo) {
        const topLevelValue = cityYields.getNetYield(yieldInfo.YieldType);
        const topYieldData = {
          name: Locale.plainText(yieldInfo.Name),
          value: topLevelValue,
          icon: yieldInfo.YieldType,
          iconContext: "YIELD",
          children: []
        };
        this.addIncomeHierarchy(cityYields, yieldIndex, topYieldData, yieldInfo);
        this.addDeductionsHierarchy(cityYields, yieldIndex, topYieldData, yieldInfo);
        this.yields.push(topYieldData);
      }
    }
    this.isBeingRazed = city.isBeingRazed;
    this.getTurnsUntilRazed = city.getTurnsUntilRazed;
    this.treasureFleetText = "";
    if (Game.age == Game.getHash("AGE_EXPLORATION") && city.isDistantLands) {
      const result = cityResources.canStartTreasureFleet();
      if (!result.Success) {
        if (result.FailureReasons) {
          const failureString = formatStringArrayAsNewLineText(result.FailureReasons);
          this.treasureFleetText += failureString;
        }
      } else {
        const turnsTillNextTreasureFleet = cityResources.getTurnsUntilTreasureGenerated();
        this.treasureFleetText = Locale.compose(
          "LOC_UI_CITY_DETAILS_NEXT_TREASURE_FLEET_TURNS",
          turnsTillNextTreasureFleet
        );
      }
    }
    this.nonExportingProjects = [];
    GameInfo.Project_Units.forEach((row) => {
      if (!this.nonExportingProjects.includes(row.ProjectType)) {
        this.nonExportingProjects.push(row.ProjectType);
      }
    });
    this.buildConnectionData(city);
    this.connectedSettlementFood = [];
    const sendingFoodData = this.buildSendingFoodData(city);
    if (sendingFoodData) {
      if (city.isTown) {
        this.connectedSettlementFood.push({ name: city.name, amount: this.foodPerTurn });
        for (const cityData of sendingFoodData) {
          for (const townData of cityData.data) {
            if (ComponentID.isMatch(townData.town.id, city.id)) {
              this.connectedSettlementFood.push({ name: cityData.city.name, amount: -townData.amount });
              this.foodPerTurn = 0;
            }
          }
        }
      } else {
        let foodFromSelectedCity = this.foodPerTurn;
        const dataForCity = sendingFoodData.find((value) => {
          return ComponentID.isMatch(value.city.id, city.id);
        });
        if (dataForCity) {
          for (const townData of dataForCity.data) {
            this.connectedSettlementFood.push({ name: townData.town.name, amount: townData.amount });
            foodFromSelectedCity -= townData.amount;
          }
        }
        if (foodFromSelectedCity > 0) {
          this.connectedSettlementFood.unshift({ name: city.name, amount: foodFromSelectedCity });
        }
      }
    }
    this.onUpdate?.(this);
    window.dispatchEvent(new UpdateCityDetailsEvent());
  });
  buildConnectionData(selectedSettlement) {
    this.connectedSettlements = [];
    this.foodExported = selectedSettlement.isTown && selectedSettlement.Growth?.growthType === GrowthTypes.PROJECT && !this.nonExportingProjects.includes(this.currentTownFocus) ? selectedSettlement.getSentFoodPerCity() : 0;
    this.foodExportPotential = selectedSettlement.getSentFoodPerCity();
    const ownerSettlements = Players.get(selectedSettlement.owner)?.Cities?.getCities();
    if (!ownerSettlements) {
      console.error("model-city-details: buildConnectionData() - Failed to get ownerSettlements");
      return;
    }
    const connectedSettlements = selectedSettlement.getConnectedCities();
    for (const settlementID of connectedSettlements) {
      const settlement = Cities.get(settlementID);
      if (!settlement) continue;
      const settlementGrowth = settlement.Growth;
      if (!settlementGrowth) continue;
      const growthType = settlementGrowth.growthType;
      const projectType = settlementGrowth.projectType;
      const projectInfo = GameInfo.Projects.lookup(projectType);
      const isSendingFood = settlement.isTown && growthType === GrowthTypes.PROJECT && projectInfo && !this.nonExportingProjects.includes(projectInfo.ProjectType);
      const connectionData = {
        id: settlementID,
        name: settlement.name,
        isTown: settlement.isTown,
        projectName: projectInfo?.Name,
        projectType: projectInfo?.ProjectType,
        projectSendsFood: !this.nonExportingProjects.includes(projectInfo?.ProjectType ?? ""),
        foodExport: isSendingFood ? settlement.getSentFoodPerCity() : 0,
        foodExportPotential: settlement.getSentFoodPerCity()
      };
      this.connectedSettlements.push(connectionData);
    }
    this.connectedSettlements.sort((a, b) => {
      if (a.isTown !== b.isTown) {
        const aMatch = a.isTown === selectedSettlement.isTown ? 1 : 0;
        const bMatch = b.isTown === selectedSettlement.isTown ? 1 : 0;
        return aMatch - bMatch;
      }
      return b.foodExport - a.foodExport;
    });
  }
  buildSendingFoodData(selectedSettlement) {
    const sendingFoodData = [];
    const ownerSettlements = Players.get(selectedSettlement.owner)?.Cities?.getCities();
    if (!ownerSettlements) {
      console.error("model-city-details: buildSendingFoodData() - Failed to get ownerSettlements");
      return;
    }
    for (const town of ownerSettlements) {
      const projectType = town?.Growth?.projectType ?? "";
      const projectInfo = GameInfo.Projects.lookup(projectType);
      if (town.isTown && town.Growth?.growthType == GrowthTypes.PROJECT && !this.nonExportingProjects.includes(projectInfo?.ProjectType ?? "")) {
        const connectedToTown = town.getConnectedCities();
        const foodForEachCity = town.getSentFoodPerCity();
        for (const connectedSettlement of connectedToTown) {
          const city = Cities.get(connectedSettlement);
          if (city && !city.isTown) {
            const existingData = sendingFoodData.find((value) => {
              return ComponentID.isMatch(value.city.id, city.id);
            });
            if (existingData) {
              existingData.data.push({ town, amount: foodForEachCity });
            } else {
              sendingFoodData.push({ city, data: [{ town, amount: foodForEachCity }] });
            }
          }
        }
      }
    }
    return sendingFoodData;
  }
  getValidGreatPeople(uniqueQuarterDefinition) {
    const validUnits = [];
    const playerUnits = Players.Units.get(GameContext.localPlayerID);
    if (!playerUnits) return validUnits;
    GameInfo.GreatPersonClasses.forEach((greatPersonClass) => {
      if (playerUnits.canEverTrain(greatPersonClass.UnitType)) {
        if (greatPersonClass.UniqueQuarterType !== uniqueQuarterDefinition.UniqueQuarterType) return;
        validUnits.push(greatPersonClass.UnitType);
      }
    });
    return validUnits;
  }
  updateUniqueQuarterData(districtData) {
    const district = Districts.getAtLocation(districtData.location);
    if (!district) {
      return;
    }
    const uniqueQuarterType = district.uniqueQuarterType;
    if (uniqueQuarterType != UniqueQuarterTypes.NO_QUARTER) {
      const uniqueQuarterDefinition = GameInfo.UniqueQuarters.lookup(uniqueQuarterType);
      if (!uniqueQuarterDefinition) {
        return;
      }
      districtData.name = Locale.compose(uniqueQuarterDefinition.Name);
      const validGreatPeople = this.getValidGreatPeople(uniqueQuarterDefinition);
      let districtDescription = `{${uniqueQuarterDefinition.Description}}`;
      for (const unitType of validGreatPeople) {
        const greatPersonUnitDef = GameInfo.Units.lookup(unitType);
        if (greatPersonUnitDef) {
          const unitName = greatPersonUnitDef.Description ? `[TIP:${greatPersonUnitDef.Description}]{${greatPersonUnitDef.Name}}[/TIP]` : greatPersonUnitDef.Name;
          districtDescription += `[nn]` + Locale.compose("LOC_UI_PRODUCTION_ALLOWS_TRAINING", unitType, unitName);
        }
      }
      districtData.description = Locale.stylize(districtDescription);
      return;
    } else {
      const player = Players.get(district.owner);
      if (!player) {
        return;
      }
      const recommendedQuarter = player.Advisory?.getUniqueQuarterRecommendation({ districtId: district.id });
      if (recommendedQuarter) {
        if (recommendedQuarter.uniqueQuarterType != UniqueQuarterTypes.NO_QUARTER && recommendedQuarter.buildConstructibleType != ConstructibleTypes.NO_CONSTRUCTIBLE) {
          const uniqueQuarterDefinition = GameInfo.UniqueQuarters.lookup(
            recommendedQuarter.uniqueQuarterType
          );
          if (!uniqueQuarterDefinition) {
            return;
          }
          const buildingDefinition = GameInfo.Constructibles.lookup(
            recommendedQuarter.buildConstructibleType
          );
          if (!buildingDefinition) {
            console.error(
              `model-city-details: Failed to find definition for unique building ${recommendedQuarter.buildConstructibleType}`
            );
            return;
          }
          districtData.name = Locale.compose(uniqueQuarterDefinition.Name);
          districtData.description = Locale.compose(
            "LOC_UI_CITY_DETAILS_UNIQUE_QUARTER_NEEDS",
            buildingDefinition.Name
          );
          return;
        }
      }
    }
    districtData.name = void 0;
    districtData.description = void 0;
    return;
  }
  addYieldSteps(baseYield, steps, yieldDefinition, valueDisplayType = null) {
    for (const step of steps) {
      if (step.description) {
        let tempValue = 0;
        tempValue = step.value;
        const yieldData = {
          name: Locale.stylize(step.description),
          value: tempValue,
          valueType: valueDisplayType ? valueDisplayType : step.valueDisplayType ? step.valueDisplayType : GameValueDisplayTypes.FLAT,
          tooltip: step.tooltip,
          children: []
        };
        this.setYieldAndGetIcon(yieldData, step, yieldDefinition);
        if (step.base) {
          if (step.base.type == GameValueStepTypes.ADDITION) {
            if (step.base.steps && step.base.steps.length > 0) {
              this.addYieldSteps(yieldData, step.base.steps, yieldDefinition);
            }
          } else {
            if (step.base.description) {
              this.addYieldsToHierarchy(step.base, yieldData, yieldDefinition);
            }
          }
          if (step.modifier && step.modifier.description) {
            this.addYieldsToHierarchy(step.modifier, yieldData, yieldDefinition);
          }
        } else if (step.steps && step.steps.length > 0) {
          this.addYieldSteps(yieldData, step.steps, yieldDefinition);
        }
        baseYield.children.push(yieldData);
      } else if (step.steps && step.steps.length > 0) {
        const idsMatch = step.steps.every((subStep) => subStep.id == step.id);
        if (step.steps[0]?.description && idsMatch) {
          const yieldData = {
            name: Locale.stylize(step.steps[0].description),
            value: step.value,
            valueType: step.valueDisplayType,
            tooltip: step.tooltip,
            children: []
          };
          baseYield.children.push(yieldData);
        } else {
          this.addYieldSteps(baseYield, step.steps, yieldDefinition);
        }
      }
    }
  }
  setYieldAndGetIcon(yieldData, step, yieldDefinition) {
    if (!step.context) return;
    if (step.context.type == ComponentIDTypes.PLOT) {
      const contextLocaction = GameplayMap.getLocationFromIndex(step.context.id);
      yieldData.sourceContext = { id: step.context, location: { x: contextLocaction.x, y: contextLocaction.y } };
      return;
    }
    let buildingData = null;
    for (const data of this.buildings) {
      for (const constructibleData of data.constructibleData) {
        if (ComponentID.isMatch(constructibleData.id, step.context)) {
          buildingData = constructibleData;
          break;
        }
        if (buildingData) {
          break;
        }
      }
    }
    if (buildingData) {
      this.addYieldAndGetIconForConstructible(yieldData, buildingData, step, yieldDefinition);
      return;
    }
    const improvementData = this.improvements.find((data) => {
      return ComponentID.isMatch(data.id, step.context);
    });
    if (improvementData) {
      this.addYieldAndGetIconForConstructible(yieldData, improvementData, step, yieldDefinition);
      return;
    }
    const wonderData = this.wonders.find((data) => {
      return ComponentID.isMatch(data.id, step.context);
    });
    if (wonderData) {
      this.addYieldAndGetIconForConstructible(yieldData, wonderData, step, yieldDefinition);
      return;
    }
  }
  addYieldAndGetIconForConstructible(yieldData, constructibleData, step, yieldDefinition) {
    if (!constructibleData.yieldMap) {
      constructibleData.yieldMap = /* @__PURE__ */ new Map();
    }
    const currentValue = constructibleData.yieldMap.get(yieldDefinition.YieldType);
    if (currentValue == void 0) {
      const constructibleYieldData = {
        name: yieldData.name,
        value: step.value,
        icon: yieldDefinition.YieldType,
        iconContext: "YIELD"
      };
      constructibleData.yieldMap.set(yieldDefinition.YieldType, constructibleYieldData);
    } else {
      currentValue.value += step.value;
      constructibleData.yieldMap.set(yieldDefinition.YieldType, currentValue);
    }
    yieldData.icon = constructibleData.icon;
    yieldData.iconContext = constructibleData.iconContext;
    yieldData.sourceContext = { id: constructibleData.id, location: constructibleData.location };
  }
}
const CityDetails = new CityDetailsModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(CityDetails);
  };
  engine.createJSModel("g_CityDetails", CityDetails);
  CityDetails.updateCallback = updateModel;
});

export { UpdateCityDetailsEventName, CityDetails as default };
//# sourceMappingURL=model-city-details.js.map
