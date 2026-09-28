import { replaceIslandResources } from './map-utilities.js';
import { prepareResourceSet, buildPlacementContext, VERBOSE_LOGGING, tileClassFromId, tileClassLabel, buildBlueNoiseWindows, MAX_DENSITY, DENSITY_TARGET, placeResourcesWithBlueNoise } from './resource-placement-common.js';
export { getTileClass, isCoastalAdjacentToLand, tileClassIdFromValidBiome } from './resource-placement-common.js';
import { profileScope } from '../scripts/profiling.js';

function generateResources(iWidth, iHeight, minMarineResourceTypesOverride = 3) {
  const gatherResourceDataScope = new profileScope("generateResources Resource Data");
  const resourcesHashes = ResourceBuilder.getGeneratedMapResources(minMarineResourceTypesOverride);
  console.log("Resources considered for generation in the current age:");
  for (const resourceHash of resourcesHashes) {
    const resourceInfo = GameInfo.Resources.lookup(resourceHash);
    console.log(`  ${resourceInfo?.Name}, class: ${resourceInfo?.ResourceClassType}, hash: ${resourceHash}`);
  }
  const resourceSet = prepareResourceSet(resourcesHashes);
  gatherResourceDataScope.end();
  const gatherMapDataScope = new profileScope("generateResources Map Data");
  const ctx = buildPlacementContext(iWidth, iHeight);
  const { maxPlayerRegion, nonOceanTileCount } = ctx;
  if (VERBOSE_LOGGING) {
    console.log("Tile counts by classification:");
    const logStrings = [];
    for (let key = 0; key < ctx.groupCount.length; key++) {
      const count = ctx.groupCount[key];
      const adjacentToLandCount = ctx.groupAdjCount[key];
      if (count === 0) continue;
      const adjSuffix = adjacentToLandCount > 0 ? ` (${adjacentToLandCount} adj-to-land)` : "";
      const tileClass = tileClassFromId(ctx.groupRawId[key]);
      logStrings.push(`  ${tileClassLabel(tileClass)}: ${count}${adjSuffix}`);
    }
    logStrings.sort();
    logStrings.forEach((s) => console.log(s));
  }
  console.log(`Landmass regions: player 1..${maxPlayerRegion}, (${maxPlayerRegion} player landmasses)`);
  gatherMapDataScope.end();
  const calculateDensityScope = new profileScope("generateResources Density Calculation");
  const blueNoisePlan = buildBlueNoiseWindows(ctx, resourceSet, {
    densityTarget: DENSITY_TARGET,
    maxDensity: MAX_DENSITY
  });
  if (VERBOSE_LOGGING) {
    console.log("Eligible tile counts per active resource:");
    for (const typeIdx of resourceSet.activeResourceIndices) {
      const eligible = blueNoisePlan.metrics.resourceEligibleTileCounts[typeIdx];
      if (eligible <= 0) continue;
      const resName = GameInfo.Resources[typeIdx]?.ResourceType ?? `Unknown(${typeIdx})`;
      console.log(`  ${resName}: ${eligible} eligible tiles`);
    }
    console.log(
      `Resource density calculation (${nonOceanTileCount} non-ocean tiles, densityTarget=${DENSITY_TARGET}):`
    );
    for (const typeIdx of resourceSet.activeResourceIndices) {
      const def = GameInfo.Resources[typeIdx];
      if (!def) continue;
      const desired = blueNoisePlan.metrics.resourceDesiredCount[typeIdx];
      const weight = resourceSet.resourceWeight[typeIdx];
      const eligible = blueNoisePlan.metrics.resourceEligibleTileCounts[typeIdx];
      const minimum = def.MinimumPerLandmass > 0 ? def.MinimumPerLandmass : 0;
      console.log(
        `  ${def.ResourceType}: desired=${desired.toFixed(2)}, weight=${weight.toFixed(2)}, min=${minimum}, eligible=${eligible}`
      );
    }
  }
  calculateDensityScope.end();
  const placementScope = new profileScope("generateResources Placement");
  const seed = GameplayMap.getRandomSeed();
  const offsetX = seed & 127;
  const offsetY = seed >>> 7 & 127;
  placeResourcesWithBlueNoise(ctx, resourceSet, blueNoisePlan, { offsetX, offsetY });
  placementScope.end();
  const replacementScope = new profileScope("generateResources Replacement");
  const definition = GameInfo.Ages.lookup(Game.age);
  if (definition) {
    const mapType = Configuration.getMapValue("Name");
    for (const option of GameInfo.MapIslandBehavior) {
      if (option.MapType != mapType || option.AgeType != definition.AgeType) continue;
      const resourceClassCounts = /* @__PURE__ */ new Map();
      for (let iY = iHeight - 1; iY >= 0; iY--) {
        for (let iX = 0; iX < iWidth; iX++) {
          if (!GameplayMap.hasPlotTag(iX, iY, PlotTags.PLOT_TAG_ISLAND)) continue;
          const resourceAtLocation = GameplayMap.getResourceType(iX, iY);
          if (resourceAtLocation != ResourceTypes.NO_RESOURCE) {
            const resourceDef = GameInfo.Resources.lookup(resourceAtLocation);
            const classType = resourceDef?.ResourceClassType ?? "Unknown";
            resourceClassCounts.set(classType, (resourceClassCounts.get(classType) ?? 0) + 1);
          }
        }
      }
      console.log(`Island resource counts before replacement:`);
      for (const [classType, count] of resourceClassCounts) {
        console.log(`  ${classType}: ${count}`);
      }
      resourceClassCounts.clear();
      replaceIslandResources(iWidth, iHeight, option.ResourceClassType);
      for (let iY = iHeight - 1; iY >= 0; iY--) {
        for (let iX = 0; iX < iWidth; iX++) {
          if (!GameplayMap.hasPlotTag(iX, iY, PlotTags.PLOT_TAG_ISLAND)) continue;
          const resourceAtLocation = GameplayMap.getResourceType(iX, iY);
          if (resourceAtLocation != ResourceTypes.NO_RESOURCE) {
            const resourceDef = GameInfo.Resources.lookup(resourceAtLocation);
            const classType = resourceDef?.ResourceClassType ?? "Unknown";
            resourceClassCounts.set(classType, (resourceClassCounts.get(classType) ?? 0) + 1);
          }
        }
      }
      console.log(`Island resource counts after replacement:`);
      for (const [classType, count] of resourceClassCounts) {
        console.log(`  ${classType}: ${count}`);
      }
    }
  }
  replacementScope.end();
}

export { generateResources, tileClassLabel };
//# sourceMappingURL=resource-generator.js.map
