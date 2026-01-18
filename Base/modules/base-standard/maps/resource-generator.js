import { getMinimumResourcePlacementModifier, replaceIslandResources, shuffle } from './map-utilities.js';
import './map-globals.js';

function generateResources(iWidth, iHeight, minMarineResourceTypesOverride = 3) {
  const resourceWeight = new Array(GameInfo.Resources.length);
  const resourceRunningWeight = new Array(GameInfo.Resources.length);
  const importantResourceRegionalCount = /* @__PURE__ */ new Map();
  const getImportantResourceCounts = (landmassId) => {
    if (!importantResourceRegionalCount.has(landmassId)) {
      importantResourceRegionalCount.set(landmassId, new Array(GameInfo.Resources.length).fill(0));
    }
    return importantResourceRegionalCount.get(landmassId);
  };
  const resourcesPlacedCount = new Array(GameInfo.Resources.length);
  let minimumResourcePlacementModifier = getMinimumResourcePlacementModifier();
  if (minimumResourcePlacementModifier == void 0) {
    minimumResourcePlacementModifier = 0;
  }
  for (let resourceIdx = 0; resourceIdx < GameInfo.Resources.length; resourceIdx++) {
    resourceWeight[resourceIdx] = 0;
    resourceRunningWeight[resourceIdx] = 0;
    resourcesPlacedCount[resourceIdx] = 0;
  }
  class ResourceLandmass {
    typeIdx = 0;
    landmassId = 0;
  }
  const aResourceTypes = [];
  const resources = ResourceBuilder.getGeneratedMapResources(minMarineResourceTypesOverride);
  for (let ridx = 0; ridx < resources.length; ++ridx) {
    const resourceInfo = GameInfo.Resources.lookup(resources[ridx]);
    if (resourceInfo && resourceInfo.Tradeable) {
      resourceWeight[resourceInfo.$index] = resourceInfo.Weight;
      const landmassId = ResourceBuilder.getResourceLandmass(resourceInfo.$index);
      aResourceTypes.push({ typeIdx: resourceInfo.$index, landmassId });
    }
  }
  const seed = GameplayMap.getRandomSeed();
  const avgDistanceBetweenPoints = 3;
  const normalizedRangeSmoothing = 2;
  const poisson = TerrainBuilder.generatePoissonMap(seed, avgDistanceBetweenPoints, normalizedRangeSmoothing);
  for (let iY = iHeight - 1; iY >= 0; iY--) {
    for (let iX = 0; iX < iWidth; iX++) {
      const landmassRegionId = GameplayMap.getLandmassRegionId(iX, iY);
      const index = iY * iWidth + iX;
      if (poisson[index] >= 1) {
        const resources2 = [];
        aResourceTypes.forEach((resourceLandmass) => {
          const assignedLandmass = resourceLandmass.landmassId;
          const allowedOnLandmass = assignedLandmass == LandmassRegion.LANDMASS_REGION_ANY || assignedLandmass != LandmassRegion.LANDMASS_REGION_NONE && landmassRegionId != LandmassRegion.LANDMASS_REGION_DEFAULT && assignedLandmass % landmassRegionId == 0;
          if (allowedOnLandmass && canHaveFlowerPlot(iX, iY, resourceLandmass.typeIdx)) {
            resources2.push(resourceLandmass.typeIdx);
          }
        });
        if (resources2.length > 0) {
          let resourceChosen = ResourceTypes.NO_RESOURCE;
          let resourceChosenIndex = 0;
          for (let iI = 0; iI < resources2.length; iI++) {
            if (resourceChosen == ResourceTypes.NO_RESOURCE) {
              resourceChosen = resources2[iI];
              resourceChosenIndex = resources2[iI];
            } else {
              if (GameplayMap.isNavigableRiver(iX, iY)) {
                if (ResourceBuilder.isResourceIgnoringWeightForRiverPlacement(resources2[iI])) {
                  resourceChosen = resources2[iI];
                  resourceChosenIndex = resources2[iI];
                  break;
                }
              } else {
                if (resourceRunningWeight[resources2[iI]] > resourceRunningWeight[resourceChosenIndex]) {
                  resourceChosen = resources2[iI];
                  resourceChosenIndex = resources2[iI];
                } else if (resourceRunningWeight[resources2[iI]] == resourceRunningWeight[resourceChosenIndex]) {
                  const iRoll = TerrainBuilder.getRandomNumber(2, "Resource Scatter");
                  if (iRoll >= 1) {
                    resourceChosen = resources2[iI];
                    resourceChosenIndex = resources2[iI];
                  }
                }
              }
            }
          }
          if (resourceChosen != ResourceTypes.NO_RESOURCE) {
            const iResourcePlotIndex = getFlowerPlot(iX, iY, resourceChosen);
            if (iResourcePlotIndex != -1) {
              const iLocation = GameplayMap.getLocationFromIndex(iResourcePlotIndex);
              const iResourceX = iLocation.x;
              const iResourceY = iLocation.y;
              ResourceBuilder.setResourceType(iResourceX, iResourceY, resourceChosen);
              resourceRunningWeight[resourceChosenIndex] -= resourceWeight[resourceChosenIndex];
              resourcesPlacedCount[resourceChosenIndex]++;
              getImportantResourceCounts(landmassRegionId)[resourceChosenIndex]++;
            } else {
              console.log("Resource Index Failure");
            }
          } else {
            console.log("Resource Type Failure");
          }
        }
      }
    }
  }
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const landmassRegionId = GameplayMap.getLandmassRegionId(iX, iY);
      const resourceAtLocation = GameplayMap.getResourceType(iX, iY);
      if (resourceAtLocation == ResourceTypes.NO_RESOURCE) {
        const resourcesEligible = [];
        for (let i = 0; i < resourcesPlacedCount.length; ++i) {
          const resourceToPlace = GameInfo.Resources.lookup(i);
          if (resourceToPlace) {
            const assignedLandmass = ResourceBuilder.getResourceLandmass(i);
            const allowedOnLandmass = landmassRegionId != LandmassRegion.LANDMASS_REGION_DEFAULT && (assignedLandmass == LandmassRegion.LANDMASS_REGION_ANY || assignedLandmass != LandmassRegion.LANDMASS_REGION_NONE && assignedLandmass % landmassRegionId == 0);
            if (allowedOnLandmass) {
              const minimumPerLandMass = resourceToPlace.MinimumPerHemisphere > 0 ? resourceToPlace.MinimumPerHemisphere + minimumResourcePlacementModifier : 0;
              if (getImportantResourceCounts(landmassRegionId)[i] < minimumPerLandMass && ResourceBuilder.isResourceRequiredForAge(i, Game.age) && ResourceBuilder.canHaveResource(iX, iY, i, false)) {
                let hasAdjResource = false;
                for (let iDirection = 0; iDirection < DirectionTypes.NUM_DIRECTION_TYPES; iDirection++) {
                  const iIndex = GameplayMap.getIndexFromXY(iX, iY);
                  const iLocation = GameplayMap.getLocationFromIndex(iIndex);
                  const iAdjacentX = GameplayMap.getAdjacentPlotLocation(
                    iLocation,
                    iDirection
                  ).x;
                  const iAdjacentY = GameplayMap.getAdjacentPlotLocation(
                    iLocation,
                    iDirection
                  ).y;
                  if (GameplayMap.getResourceType(iAdjacentX, iAdjacentY) != ResourceTypes.NO_RESOURCE) {
                    hasAdjResource = true;
                    break;
                  }
                }
                if (!hasAdjResource) {
                  resourcesEligible.push(i);
                }
              }
            }
          }
        }
        let resourceChosenIndex = -1;
        if (resourcesEligible.length > 0) {
          let resourceChosen = ResourceTypes.NO_RESOURCE;
          for (let iI = 0; iI < resourcesEligible.length; iI++) {
            if (resourceChosen == ResourceTypes.NO_RESOURCE) {
              resourceChosen = resourcesEligible[iI];
              resourceChosenIndex = resourcesEligible[iI];
            } else {
              if (resourceRunningWeight[resourcesEligible[iI]] > resourceRunningWeight[resourceChosenIndex]) {
                resourceChosen = resourcesEligible[iI];
                resourceChosenIndex = resourcesEligible[iI];
              } else if (resourceRunningWeight[resourcesEligible[iI]] == resourceRunningWeight[resourceChosenIndex]) {
                const iRoll = TerrainBuilder.getRandomNumber(2, "Resource Scatter");
                if (iRoll >= 1) {
                  resourceChosen = resourcesEligible[iI];
                  resourceChosenIndex = resourcesEligible[iI];
                }
              }
            }
          }
        }
        if (resourceChosenIndex > -1) {
          ResourceBuilder.setResourceType(iX, iY, resourceChosenIndex);
          resourceRunningWeight[resourceChosenIndex] -= resourceWeight[resourceChosenIndex];
          const name = GameInfo.Resources.lookup(resourceChosenIndex)?.Name;
          console.log("Force Placed " + Locale.compose(name) + " at (" + iX + ", " + iY + ")");
          getImportantResourceCounts(landmassRegionId)[resourceChosenIndex]++;
          break;
        }
      }
    }
  }
  const definition = GameInfo.Ages.lookup(Game.age);
  if (definition) {
    const mapType = Configuration.getMapValue("Name");
    for (const option of GameInfo.MapIslandBehavior) {
      if (option.MapType === mapType) {
        replaceIslandResources(iWidth, iHeight, option.ResourceClassType);
      }
    }
  }
}
function canHaveFlowerPlot(iX, iY, resourceType) {
  if (ResourceBuilder.canHaveResource(iX, iY, resourceType, false)) {
    return true;
  }
  for (let iDirection = 0; iDirection < DirectionTypes.NUM_DIRECTION_TYPES; iDirection++) {
    const iIndex = GameplayMap.getIndexFromXY(iX, iY);
    const iLocation = GameplayMap.getLocationFromIndex(iIndex);
    const iAdjacentX = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).x;
    const iAdjacentY = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).y;
    if (ResourceBuilder.canHaveResource(iAdjacentX, iAdjacentY, resourceType, false)) {
      return true;
    }
  }
  return false;
}
function getFlowerPlot(iX, iY, resourceType) {
  if (ResourceBuilder.canHaveResource(iX, iY, resourceType, false)) {
    return GameplayMap.getIndexFromXY(iX, iY);
  }
  const resourcePlotIndexes = [];
  for (let iDirection = 0; iDirection < DirectionTypes.NUM_DIRECTION_TYPES; iDirection++) {
    const iIndex = GameplayMap.getIndexFromXY(iX, iY);
    const iLocation = GameplayMap.getLocationFromIndex(iIndex);
    const iAdjacentX = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).x;
    const iAdjacentY = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).y;
    const iAdjacentIndex = GameplayMap.getIndexFromXY(iAdjacentX, iAdjacentY);
    if (ResourceBuilder.canHaveResource(iAdjacentX, iAdjacentY, resourceType, false)) {
      resourcePlotIndexes.push(iAdjacentIndex);
    }
  }
  if (resourcePlotIndexes.length > 0) {
    return shuffle(resourcePlotIndexes)[0];
  } else {
    return -1;
  }
}

export { canHaveFlowerPlot, generateResources, getFlowerPlot };
//# sourceMappingURL=resource-generator.js.map
