import ActionHandler from '../../../core/ui/input/action-handler.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { C as CityYields } from '../utilities/utilities-city-yields.chunk.js';

class ResourceAllocationModel {
  onUpdate;
  _selectedResource = -1;
  _hasSelectedAssignedResource = false;
  _selectedResourceClass = null;
  selectedCityID = ComponentID.getInvalidID();
  // All resource definitions for this player keyed by resource location value
  allResources = /* @__PURE__ */ new Map();
  isAllResourcesInit = false;
  // All queued resources values mapped to the city ComponentID they should be applied to
  queuedResources = /* @__PURE__ */ new Map();
  _latestResource = null;
  _empireResources = [];
  _uniqueEmpireResources = [];
  _allAvailableResources = [];
  _availableBonusResources = [];
  _availableResources = [];
  _availableFactoryResources = [];
  _treasureResources = [];
  _uniqueTreasureResources = [];
  _availableCities = [];
  _selectedCityResources = null;
  shouldShowSelectedCityResources = false;
  shouldShowEmpireResourcesDetailed = false;
  shouldShowAvailableResources = true;
  _isResourceAssignmentLocked = false;
  updateGate = new UpdateGate(() => {
    this.update();
  });
  constructor() {
    this.updateGate.call("constructor");
    engine.on("ResourceAssigned", this.onResourceAssigned, this);
    engine.on("ResourceUnassigned", this.onResourceUnassigned, this);
    engine.on("ResourceCapChanged", this.onResourceCapChanged, this);
    engine.on("TradeRouteAddedToMap", this.onTradeRouteAddedToMap, this);
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  get playerId() {
    return GameContext.localPlayerID;
  }
  get empireResources() {
    return this._empireResources;
  }
  get uniqueEmpireResources() {
    return this._uniqueEmpireResources;
  }
  get allAvailableResources() {
    return this._allAvailableResources;
  }
  get availableResources() {
    return this._availableResources;
  }
  get availableBonusResources() {
    return this._availableBonusResources;
  }
  get availableFactoryResources() {
    return this._availableFactoryResources;
  }
  get treasureResources() {
    return this._treasureResources;
  }
  get uniqueTreasureResources() {
    return this._uniqueTreasureResources;
  }
  get availableCities() {
    return this._availableCities;
  }
  get selectedCityResources() {
    return this._selectedCityResources;
  }
  get latestResource() {
    return this._latestResource;
  }
  get selectedResource() {
    return this._selectedResource;
  }
  get hasSelectedAssignedResource() {
    return this._hasSelectedAssignedResource;
  }
  get showUnassignResourceSlot() {
    return this._hasSelectedAssignedResource && !ActionHandler.isGamepadActive;
  }
  get selectedResourceClass() {
    return this._selectedResourceClass;
  }
  get isResourceAssignmentLocked() {
    return this._isResourceAssignmentLocked;
  }
  hasSelectedResource() {
    return this._selectedResource != -1;
  }
  hasQueuedResources() {
    return this.queuedResources.size > 0;
  }
  update() {
    if (GameContext.localObserverID == PlayerIds.NO_PLAYER || GameContext.localObserverID == PlayerIds.OBSERVER_ID || Autoplay.isActive) {
      return;
    }
    this._empireResources = [];
    this._uniqueEmpireResources = [];
    this._allAvailableResources = [];
    this._availableBonusResources = [];
    this._availableResources = [];
    this._availableFactoryResources = [];
    this._treasureResources = [];
    this._uniqueTreasureResources = [];
    this._availableCities = [];
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    if (!localPlayer) {
      console.error(`model-resource-allocation: Failed to retrieve PlayerLibrary for Player ${localPlayerID}`);
      return;
    }
    const playerResources = localPlayer.Resources;
    if (!playerResources) {
      console.error(`model-resource-allocation: Failed to retrieve Resources for Player ${localPlayerID}`);
      return;
    }
    this._isResourceAssignmentLocked = playerResources.isRessourceAssignmentLocked();
    let nextAllResources = playerResources.getResources().map((resource) => {
      const resourceDefinition = GameInfo.Resources.lookup(
        resource.uniqueResource.resource
      );
      if (resourceDefinition) {
        return [resource.value, resourceDefinition];
      } else {
        console.error(
          `model-resource-allocation: Failed to find resource definition for location ${resource.value}`
        );
        return;
      }
    });
    nextAllResources = nextAllResources.filter((resource) => !!resource);
    const addedResources = nextAllResources.filter(
      ([value = 0, _resource = {}]) => !this.allResources.has(value)
    );
    const removedResources = Array.from(this.allResources).filter(
      ([value, _resource]) => !nextAllResources.find((resource) => resource?.[0] == value)
    );
    this.allResources.clear();
    if (this.isAllResourcesInit && (addedResources.length || removedResources.length && removedResources.pop()?.[0] == this.latestResource?.value)) {
      const [
        latestResourceValue = 0,
        { BonusResourceSlots = 0, ResourceType = "", Name = "", Tooltip = "" } = {}
      ] = addedResources.pop() ?? [];
      this._latestResource = {
        selected: latestResourceValue == this._selectedResource,
        disabled: false,
        queued: false,
        bonusResourceSlots: BonusResourceSlots,
        type: ResourceType,
        classType: "",
        classTypeIcon: "",
        name: Name,
        origin: "",
        bonus: Tooltip,
        value: latestResourceValue,
        count: 1,
        isInTradeNetwork: true,
        isBeingRazed: false,
        canSpawnTreasureFleet: false
      };
    }
    nextAllResources.forEach(
      (resource) => this.allResources.set(resource[0], resource[1])
    );
    this.isAllResourcesInit = true;
    const playerCities = localPlayer.Cities;
    if (!playerCities) {
      console.error(`model-resource-allocation: Failed to retrieve Cities for Player ${localPlayerID}`);
      return;
    }
    playerCities.getCityIds().forEach((cityID) => {
      const city = Cities.get(cityID);
      if (city) {
        const cityResources = city.Resources;
        const cityTrade = city.Trade;
        if (cityResources && cityTrade) {
          const currentResources = [];
          const visibleResources = [];
          const treasureResources = [];
          const factoryResources = [];
          if (city.Resources) {
            city.Resources.getAssignedResources().forEach((resource) => {
              const resourceDefinition = this.allResources.get(
                resource.value
              );
              let resourceCount = 0;
              city.Resources?.getAssignedResources().forEach((resourceToCount) => {
                const resourceToCountDefinition = this.allResources.get(
                  resourceToCount.value
                );
                if (resourceToCountDefinition) {
                  if (resourceToCountDefinition?.Name === resourceDefinition?.Name) {
                    resourceCount++;
                  }
                }
              });
              if (resourceDefinition) {
                const originCityID = Game.Resources.getOriginCity(resource.value);
                const originCity = Cities.get(originCityID);
                const isInTradeNetwork2 = this.inNetwork(localPlayerID, city);
                let tooltipText = "";
                if (originCity?.name) {
                  tooltipText = Locale.stylize(
                    "{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}[N]{4_Origin}[N][STYLE: text-negative][/STYLE]",
                    resourceDefinition.Name,
                    Locale.compose(
                      "LOC_RESOURCECLASS_TOOLTIP_NAME",
                      Locale.compose("LOC_" + resourceDefinition.ResourceClassType + "_NAME")
                    ),
                    resourceDefinition.Tooltip,
                    Locale.compose("LOC_UI_RESOURCE_ORIGIN", originCity?.name)
                  );
                } else {
                  tooltipText = Locale.stylize(
                    "{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}",
                    resourceDefinition.Name,
                    Locale.compose(
                      "LOC_RESOURCECLASS_TOOLTIP_NAME",
                      Locale.compose("LOC_" + resourceDefinition.ResourceClassType + "_NAME")
                    ),
                    resourceDefinition.Tooltip
                  );
                }
                currentResources.push({
                  selected: resource.value == this._selectedResource && isInTradeNetwork2 && !this._isResourceAssignmentLocked && !city.isBeingRazed,
                  disabled: !!this.selectedResourceClass && resource.value != this.selectedResource,
                  queued: false,
                  bonusResourceSlots: resourceDefinition.BonusResourceSlots,
                  type: resourceDefinition.ResourceType,
                  name: resourceDefinition.Name,
                  classType: resourceDefinition.ResourceClassType,
                  classTypeIcon: UI.getIcon(resourceDefinition.ResourceClassType),
                  origin: originCity?.name ?? "",
                  bonus: tooltipText,
                  value: resource.value,
                  count: resourceCount,
                  isInTradeNetwork: isInTradeNetwork2,
                  isBeingRazed: city.isBeingRazed,
                  canSpawnTreasureFleet: false
                });
                if (Game.age == Game.getHash("AGE_MODERN")) {
                  if (resourceDefinition.ResourceClassType == "RESOURCECLASS_FACTORY") {
                    if (!factoryResources.some(
                      (resourceToFind) => resourceToFind.type === resourceDefinition.ResourceType
                    )) {
                      {
                        factoryResources.push({
                          selected: resource.value == this._selectedResource && isInTradeNetwork2 && !this._isResourceAssignmentLocked && !city.isBeingRazed,
                          disabled: !!this.selectedResourceClass && resource.value != this.selectedResource,
                          queued: false,
                          bonusResourceSlots: resourceDefinition.BonusResourceSlots,
                          type: resourceDefinition.ResourceType,
                          name: resourceDefinition.Name,
                          classType: resourceDefinition.ResourceClassType,
                          classTypeIcon: UI.getIcon(resourceDefinition.ResourceClassType),
                          origin: originCity?.name ?? "",
                          bonus: tooltipText,
                          value: resource.value,
                          count: resourceCount,
                          isInTradeNetwork: isInTradeNetwork2,
                          isBeingRazed: city.isBeingRazed,
                          canSpawnTreasureFleet: false
                        });
                      }
                    }
                  } else if (!visibleResources.some(
                    (resourceToFind) => resourceToFind.type === resourceDefinition.ResourceType
                  )) {
                    visibleResources.push({
                      selected: resource.value == this._selectedResource && isInTradeNetwork2 && !this._isResourceAssignmentLocked && !city.isBeingRazed,
                      disabled: !!this.selectedResourceClass && resource.value != this.selectedResource,
                      queued: false,
                      bonusResourceSlots: resourceDefinition.BonusResourceSlots,
                      type: resourceDefinition.ResourceType,
                      name: resourceDefinition.Name,
                      classType: resourceDefinition.ResourceClassType,
                      classTypeIcon: UI.getIcon(resourceDefinition.ResourceClassType),
                      origin: originCity?.name ?? "",
                      bonus: tooltipText,
                      value: resource.value,
                      count: resourceCount,
                      isInTradeNetwork: isInTradeNetwork2,
                      isBeingRazed: city.isBeingRazed,
                      canSpawnTreasureFleet: false
                    });
                  }
                } else {
                  if (!visibleResources.some(
                    (resourceToFind) => resourceToFind.type === resourceDefinition.ResourceType
                  )) {
                    visibleResources.push({
                      selected: resource.value == this._selectedResource && isInTradeNetwork2 && !this._isResourceAssignmentLocked && !city.isBeingRazed,
                      disabled: !!this.selectedResourceClass && resource.value != this.selectedResource,
                      queued: false,
                      bonusResourceSlots: resourceDefinition.BonusResourceSlots,
                      type: resourceDefinition.ResourceType,
                      name: resourceDefinition.Name,
                      classType: resourceDefinition.ResourceClassType,
                      classTypeIcon: UI.getIcon(resourceDefinition.ResourceClassType),
                      origin: originCity?.name ?? "",
                      bonus: tooltipText,
                      value: resource.value,
                      count: resourceCount,
                      isInTradeNetwork: isInTradeNetwork2,
                      isBeingRazed: city.isBeingRazed,
                      canSpawnTreasureFleet: false
                    });
                  }
                }
              }
            });
          }
          const countAssignedResources = cityResources.getTotalCountAssignedResources();
          const assignedResourcesCap = cityResources.getAssignedResourcesCap();
          const emptySlotsNeeded = assignedResourcesCap - currentResources.length;
          let settlementTypeString = "City";
          let settlementAdditionalInfo = "";
          let hasFactory = false;
          let hasFactorySlot = false;
          let hasTreasureResources = false;
          let countTreasureResources = cityResources.getNumTreasureFleetResources(false);
          let totalTreasureResources = countTreasureResources;
          const iGlobalTurnsUntilTreasureGenerated = cityResources.getGlobalTurnsUntilTreasureGenerated();
          const iTurnsUntilTreasureGenerated = cityResources.getTurnsUntilTreasureGenerated();
          const iAutoTreasureFleetValue = cityResources.getAutoTreasureFleetValue();
          if (iAutoTreasureFleetValue > 0) {
            totalTreasureResources = countTreasureResources + iAutoTreasureFleetValue;
            hasTreasureResources = true;
          }
          const uiCurrentAge = Game.age;
          if (uiCurrentAge == Game.getHash("AGE_ANTIQUITY")) {
            if (city.isCapital) {
              settlementTypeString = "Capital";
            } else if (city.isTown) {
              settlementTypeString = "Town";
            }
          } else if (uiCurrentAge == Game.getHash("AGE_EXPLORATION")) {
            const bTreasureTechPrereqMet = cityResources.isTreasureProgressionTreeNodePrereqMet();
            const bTreasureConstructiblePrereqMet = cityResources.isTreasureConstructiblePrereqMet();
            if (city.isCapital) {
              settlementTypeString = "Capital";
            } else if (city.isTown) {
              settlementTypeString = "Town";
            }
            if (city.isDistantLands) {
              if (!bTreasureTechPrereqMet) {
                settlementAdditionalInfo = settlementAdditionalInfo + "_Needs_Shipbuilding";
              } else if (!bTreasureConstructiblePrereqMet) {
                settlementAdditionalInfo = settlementAdditionalInfo + "_Needs_FishingQuay";
              } else if (totalTreasureResources > 0) {
                settlementAdditionalInfo = settlementAdditionalInfo + "_" + totalTreasureResources.toString() + "_VP_" + iTurnsUntilTreasureGenerated.toString() + "_Turns";
                hasTreasureResources = true;
                cityResources.getLocalResources().forEach((localResource) => {
                  const localResourceDefinition = GameInfo.Resources.lookup(localResource.uniqueResource.resource);
                  if (localResourceDefinition) {
                    const tooltipText = Locale.stylize(
                      "{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}[N]{4_Origin}",
                      localResourceDefinition.Name,
                      Locale.compose(
                        "LOC_RESOURCECLASS_TOOLTIP_NAME",
                        Locale.compose(
                          "LOC_" + localResourceDefinition.ResourceClassType + "_NAME"
                        )
                      ),
                      localResourceDefinition.Tooltip,
                      Locale.compose("LOC_UI_RESOURCE_ORIGIN", city.name)
                    );
                    if (localResourceDefinition.ResourceClassType === "RESOURCECLASS_TREASURE") {
                      treasureResources.push({
                        selected: false,
                        disabled: !!this.selectedResourceClass && localResource.value != this.selectedResource,
                        queued: false,
                        bonusResourceSlots: 0,
                        type: localResourceDefinition.ResourceType,
                        name: localResourceDefinition.Name,
                        classType: "RESOURCECLASS_TREASURE",
                        classTypeIcon: UI.getIcon("RESOURCECLASS_TREASURE"),
                        origin: city.name,
                        bonus: tooltipText,
                        value: localResource.value,
                        count: 1,
                        isInTradeNetwork: true,
                        isBeingRazed: city.isBeingRazed,
                        canSpawnTreasureFleet: false
                      });
                    }
                  }
                });
              }
            }
          } else if (uiCurrentAge == Game.getHash("AGE_MODERN")) {
            if (city.isCapital) {
              settlementTypeString = "Capital";
            } else if (city.isTown) {
              settlementTypeString = "Town";
            }
            const bTreasureConstructiblePrereqMet = cityResources.isTreasureConstructiblePrereqMet();
            const countFactoryResources = cityResources.getNumFactoryResources();
            const factoryResourceType = cityResources.getFactoryResource();
            if (!bTreasureConstructiblePrereqMet) {
              settlementAdditionalInfo = settlementAdditionalInfo + "_No_Factory";
            } else if (countFactoryResources == 0) {
              settlementAdditionalInfo = settlementAdditionalInfo + "_Empty_Factory";
              hasFactory = true;
              if (emptySlotsNeeded > 0) {
                hasFactorySlot = true;
              }
            } else {
              let factoryTypeString = "_UnknownFactory_";
              const resourceInfo = GameInfo.Resources.lookup(factoryResourceType);
              if (resourceInfo != null) {
                factoryTypeString = "_" + Locale.compose(resourceInfo.Name) + "Factory_";
                hasFactory = true;
                hasFactorySlot = false;
              }
              settlementAdditionalInfo = settlementAdditionalInfo + factoryTypeString + countFactoryResources.toString() + "_VP";
            }
          }
          const emptySlots = [];
          for (let i = 0; i < emptySlotsNeeded; i++) {
            emptySlots.push({
              tooltip: "",
              id: city.id
            });
          }
          let settlementIconString = "";
          let settlementTypeName = "";
          switch (settlementTypeString) {
            case "Capital":
              settlementIconString = "res_capital";
              settlementTypeName = "LOC_CAPITAL_SELECT_PROMOTION_" + settlementTypeString.toUpperCase();
              break;
            case "City":
              settlementIconString = "Yield_Cities";
              settlementTypeName = "LOC_CAPITAL_SELECT_PROMOTION_" + settlementTypeString.toUpperCase();
              break;
            case "Town":
              settlementIconString = "Yield_Towns";
              settlementTypeName = "LOC_CAPITAL_SELECT_PROMOTION_NONE";
              break;
            default:
              settlementIconString = "Yield_Cities";
              settlementTypeName = "LOC_CAPITAL_SELECT_PROMOTION_NONE";
              break;
          }
          const yields = CityYields.getCityYieldDetails(cityID);
          const isInTradeNetwork = this.inNetwork(localPlayerID, city);
          const newCityEntry = {
            name: city.name,
            id: city.id,
            currentResources,
            visibleResources,
            treasureResources,
            factoryResources,
            queuedResources: [],
            emptySlots,
            settlementType: settlementTypeString,
            settlementIcon: settlementIconString,
            settlementTypeName,
            settlementAdditionalInfo,
            allocatedResources: countAssignedResources,
            resourceCap: assignedResourcesCap,
            hasTreasureResources,
            treasureVictoryPoints: totalTreasureResources,
            globalTurnsUntilTreasureGenerated: iGlobalTurnsUntilTreasureGenerated,
            turnsUntilTreasureGenerated: Locale.compose(
              "LOC_UI_RESOURCE_TREASURE_TURNS_LEFT",
              iTurnsUntilTreasureGenerated
            ),
            hasFactory,
            hasFactorySlot,
            yields,
            isInTradeNetwork,
            isBeingRazed: city.isBeingRazed
          };
          if (settlementTypeString == "Capital") {
            this._availableCities.unshift(newCityEntry);
          } else {
            this._availableCities.push(newCityEntry);
          }
        }
      }
    });
    this.allResources.forEach((resourceDefinition, resourceValue) => {
      for (let i = 0; i < this._availableCities.length; i++) {
        const cityEntry = this._availableCities[i];
        for (let j = 0; j < cityEntry.currentResources.length; j++) {
          if (cityEntry.currentResources[j].value == resourceValue) {
            return;
          }
        }
      }
      const originCityID = Game.Resources.getOriginCity(resourceValue);
      const originCity = Cities.get(originCityID);
      let isInTradeNetwork = false;
      let isBeingRazed = false;
      if (originCity) {
        isInTradeNetwork = this.inNetwork(localPlayerID, originCity);
        isBeingRazed = originCity.isBeingRazed;
      }
      let tooltipText = "";
      if (originCity?.name) {
        tooltipText = Locale.stylize(
          "{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}[N]{4_Origin}[N][STYLE: text-negative][/STYLE]",
          resourceDefinition.Name,
          Locale.compose(
            "LOC_RESOURCECLASS_TOOLTIP_NAME",
            Locale.compose("LOC_" + resourceDefinition.ResourceClassType + "_NAME")
          ),
          resourceDefinition.Tooltip,
          Locale.compose("LOC_UI_RESOURCE_ORIGIN", originCity?.name)
        );
      } else {
        tooltipText = Locale.stylize(
          "{1_Name: upper}[N]{2_Class}[N]{3_Tooltip}",
          resourceDefinition.Name,
          Locale.compose(
            "LOC_RESOURCECLASS_TOOLTIP_NAME",
            Locale.compose("LOC_" + resourceDefinition.ResourceClassType + "_NAME")
          ),
          resourceDefinition.Tooltip
        );
      }
      const isEmpireResource = resourceDefinition.ResourceClassType == "RESOURCECLASS_EMPIRE";
      const isFactoryResource = resourceDefinition.ResourceClassType == "RESOURCECLASS_FACTORY";
      const isTreasureResource = resourceDefinition.ResourceClassType == "RESOURCECLASS_TREASURE";
      const isBonusResource = resourceDefinition.ResourceClassType == "RESOURCECLASS_BONUS";
      if (!isEmpireResource && !isTreasureResource) {
        let unassignedYieldsTooltip = "";
        GameInfo.Yields.forEach((yieldDefinition) => {
          const unassignedBonus = playerResources.getUnassignedResourceYieldBonus(
            Database.makeHash(yieldDefinition.YieldType)
          );
          if (unassignedBonus > 0) {
            unassignedYieldsTooltip += "[N]" + Locale.compose(
              "LOC_BUILDING_PLACEMENT_YIELD_WITH_ICON",
              unassignedBonus,
              yieldDefinition.IconString,
              yieldDefinition.Name
            );
          }
        });
        if (unassignedYieldsTooltip != "") {
          unassignedYieldsTooltip = Locale.compose("LOC_RESOURCE_UNASSIGNED_BONUSES") + unassignedYieldsTooltip;
          tooltipText = tooltipText + Locale.stylize("[N]" + unassignedYieldsTooltip);
        }
      }
      const location = GameplayMap.getLocationFromIndex(resourceValue);
      const isDistantAndTreasure = isTreasureResource && localPlayer.isDistantLands(location);
      if (isDistantAndTreasure) {
        tooltipText = tooltipText + Locale.stylize("[N]" + Locale.compose("LOC_CAN_CREATE_TREASURE_FLEET"));
      }
      const resourceEntry = {
        selected: resourceValue == this._selectedResource && isInTradeNetwork && !this._isResourceAssignmentLocked && !isBeingRazed,
        disabled: !!this.selectedResourceClass && resourceValue != this.selectedResource,
        queued: false,
        bonusResourceSlots: resourceDefinition.BonusResourceSlots,
        type: resourceDefinition.ResourceType,
        name: resourceDefinition.Name,
        classType: resourceDefinition.ResourceClassType,
        classTypeIcon: isDistantAndTreasure ? UI.getIcon("RESOURCECLASS_TREASURE_FLEET") : UI.getIcon(resourceDefinition.ResourceClassType),
        origin: originCity?.name ?? "",
        bonus: tooltipText,
        value: resourceValue,
        count: 0,
        isInTradeNetwork,
        isBeingRazed,
        canSpawnTreasureFleet: isDistantAndTreasure
      };
      if (!isEmpireResource) {
        this._allAvailableResources.push(resourceEntry);
      }
      if (isEmpireResource) {
        this._empireResources.push(resourceEntry);
      } else if (isFactoryResource && Game.age == Game.getHash("AGE_MODERN")) {
        this._availableFactoryResources.push(resourceEntry);
      } else if (isTreasureResource) {
        this._treasureResources.push(resourceEntry);
      } else if (isBonusResource) {
        this._availableBonusResources.push(resourceEntry);
      } else {
        this._availableResources.push(resourceEntry);
      }
    });
    this.setResourceCount(this._empireResources);
    this._uniqueEmpireResources = this.createUniqueResourceArray(this._empireResources);
    this.setResourceCount(this._treasureResources);
    this._uniqueTreasureResources = this.createUniqueResourceArray(this._treasureResources);
    if (this.shouldShowSelectedCityResources && ComponentID.isValid(this.selectedCityID)) {
      const cityEntry = this._availableCities.find(
        (entry) => ComponentID.isMatch(entry.id, this.selectedCityID)
      );
      if (cityEntry) {
        this._selectedCityResources = cityEntry;
      } else {
        console.error(
          `model-resource-allocation: Failed to find CityEntry for selectedCityResources from ${ComponentID.toString(this.selectedCityID)}`
        );
      }
    }
    this.determineShowAvailableResources();
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
  setResourceCount(resourceArray) {
    for (const resource of resourceArray) {
      const count = resourceArray.filter(
        (resourceToCount) => resourceToCount.type === resource.type && resourceToCount.canSpawnTreasureFleet === resource.canSpawnTreasureFleet
      );
      resource.count = count.length;
    }
  }
  createUniqueResourceArray(resourceArray) {
    const uniqueResourceArray = [];
    for (const resource of resourceArray) {
      if (!uniqueResourceArray.find(
        (resourceToFind) => resourceToFind.type === resource.type && resourceToFind.canSpawnTreasureFleet === resource.canSpawnTreasureFleet
      )) {
        uniqueResourceArray.push(resource);
      }
    }
    return uniqueResourceArray;
  }
  determineShowAvailableResources() {
    this.shouldShowAvailableResources = this.availableResources.length + this.availableBonusResources.length + this.availableFactoryResources.length > 0 || this._selectedResource != -1;
  }
  clearSelectedResource() {
    this._selectedResource = -1;
    this._hasSelectedAssignedResource = false;
    this._selectedResourceClass = null;
    this.determineShowAvailableResources();
    this.updateGate.call("clearResource");
  }
  selectAvailableResource(selectedResourceValue, selectedResourceClass) {
    const returnToPool = this.selectedResource != -1 && !this._allAvailableResources.some((availableResource) => {
      return this.selectedResource == availableResource.value;
    });
    if (returnToPool) {
      this.unassignResource(this._selectedResource);
    } else {
      this.selectResource(selectedResourceValue, selectedResourceClass);
    }
  }
  selectAssignedResource(selectedResourceValue, selectedResourceClass) {
    this._hasSelectedAssignedResource = true;
    this.selectResource(selectedResourceValue, selectedResourceClass);
  }
  selectResource(selectedResourceValue, selectedResourceClass) {
    if (this._selectedResource == selectedResourceValue) {
      this.clearSelectedResource();
    } else {
      this._selectedResource = selectedResourceValue;
      this._selectedResourceClass = selectedResourceClass;
    }
    this.updateGate.call("selectResource");
  }
  focusCity(selectedCityID) {
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    if (!localPlayer) {
      console.error(
        `model-resource-allocation: Failed to retrieve PlayerLibrary for Player ${localPlayerID} when selecting a city.`
      );
      return;
    }
    const playerCities = localPlayer.Cities;
    if (!playerCities) {
      console.error(
        `model-resource-allocation: Failed to retrieve Cities for Player ${localPlayerID} when selecting a city.`
      );
      return;
    }
    const cityID = playerCities.getCityIds().find((cityComponentID) => cityComponentID.id == selectedCityID);
    if (!cityID) {
      console.error(
        `model-resource-allocation: Failed to find city ${selectedCityID} in playerCities.getCityIds()`
      );
      return;
    }
    this.selectedCityID = cityID;
    UI.Player.lookAtID(cityID);
  }
  selectCity(selectedCityID) {
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    if (!localPlayer) {
      console.error(
        `model-resource-allocation: Failed to retrieve PlayerLibrary for Player ${localPlayerID} when selecting a city.`
      );
      return;
    }
    const playerCities = localPlayer.Cities;
    if (!playerCities) {
      console.error(
        `model-resource-allocation: Failed to retrieve Cities for Player ${localPlayerID} when selecting a city.`
      );
      return;
    }
    const cityID = playerCities.getCityIds().find((cityComponentID) => cityComponentID.id == selectedCityID);
    if (!cityID) {
      console.error(
        `model-resource-allocation: Failed to find city ${selectedCityID} in playerCities.getCityIds()`
      );
      return;
    }
    this.selectedCityID = cityID;
    UI.Player.lookAtID(cityID);
    if (this.hasSelectedResource()) {
      const location = GameplayMap.getLocationFromIndex(this._selectedResource);
      const args = { Location: location, City: cityID.id };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.ASSIGN_RESOURCE,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.ASSIGN_RESOURCE,
          args
        );
      }
      this.clearSelectedResource();
    }
    this.updateGate.call("selectCity");
  }
  updateResources() {
    this.updateGate.call("updateResources");
  }
  toggleMoreInfo() {
    this.shouldShowSelectedCityResources = !this.shouldShowSelectedCityResources;
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
  toggleEmpireResourceDetails() {
    this.shouldShowEmpireResourcesDetailed = !this.shouldShowEmpireResourcesDetailed;
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
  canMakeResourceAssignmentRequest(cityIdData) {
    const cityEntry = this._availableCities.find((entry) => entry.id.id == cityIdData);
    if (this.hasSelectedResource()) {
      const location = GameplayMap.getLocationFromIndex(this._selectedResource);
      const args = { Location: location, City: cityEntry?.id.id };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.ASSIGN_RESOURCE,
        args,
        false
      );
      return result.Success;
    }
    return false;
  }
  unassignResource(selectedResourceValue) {
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    if (!localPlayer) {
      console.error(
        `model-resource-allocation: Failed to retrieve PlayerLibrary for Player ${localPlayerID} when unassigning a resource.`
      );
      return;
    }
    const location = GameplayMap.getLocationFromIndex(selectedResourceValue);
    let cityID = ComponentID.getInvalidID();
    this.availableCities.forEach((cityEntry) => {
      cityEntry.currentResources.forEach((resourceEntry) => {
        if (resourceEntry.value == selectedResourceValue) {
          cityID = cityEntry.id;
        }
      });
    });
    if (ComponentID.isInvalid(cityID)) {
      console.error(
        `model-resource-allocation: Failed to retrieve City for from location of an assigned resource when unassigning a resource.`
      );
      return;
    }
    const args = { Location: location, City: cityID.id, Action: PlayerOperationParameters.Deactivate };
    const result = Game.PlayerOperations.canStart(
      localPlayer.id,
      PlayerOperationTypes.ASSIGN_RESOURCE,
      args,
      false
    );
    if (result.Success) {
      Game.PlayerOperations.sendRequest(localPlayer.id, PlayerOperationTypes.ASSIGN_RESOURCE, args);
    }
    this.clearSelectedResource();
  }
  isEntrySupportSelectingResource(entry) {
    switch (this._selectedResourceClass) {
      case "RESOURCECLASS_FACTORY":
        return entry.hasFactory;
      case "RESOURCECLASS_CITY":
        return entry.settlementType != "Town";
      default:
        return true;
    }
  }
  isCityEntryDisabled(entryEntryId) {
    const cityEntry = this._availableCities.find((entry) => entry.id.id == entryEntryId);
    if (!cityEntry) {
      return true;
    }
    const isSelectedResourceAlreadyAssignedToCity = cityEntry.currentResources.some(
      ({ value }) => value == this._selectedResource
    );
    const isAllocatedRessourcesFull = cityEntry.emptySlots.length == 0;
    return this.hasSelectedResource() && (isSelectedResourceAlreadyAssignedToCity || isAllocatedRessourcesFull || !this.isEntrySupportSelectingResource(cityEntry));
  }
  onResourceAssigned(_event) {
    this.updateGate.call("onResourceAssigned");
  }
  onResourceUnassigned(_event) {
    this.updateGate.call("onResourceUnassigned");
  }
  onResourceCapChanged() {
    this.updateGate.call("onResourceCapChanged");
  }
  onTradeRouteAddedToMap() {
    this.updateGate.call("onTradeRouteAddedToMap");
  }
  inNetwork(playerID, city) {
    if (playerID != city.owner) {
      return true;
    }
    if (city.Trade) {
      return city.Trade.isInTradeNetwork();
    }
    return false;
  }
}
const ResourceAllocation = new ResourceAllocationModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(ResourceAllocation);
  };
  engine.createJSModel("g_ResourceAllocationModel", ResourceAllocation);
  ResourceAllocation.updateCallback = updateModel;
});

export { ResourceAllocation as R };
//# sourceMappingURL=model-resource-allocation.chunk.js.map
