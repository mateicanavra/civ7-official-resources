import { g_CoastTerrain, g_MarineBiome, g_OceanTerrain } from './map-globals.js';
import { profileScope } from '../scripts/profiling.js';
import { sampleBlueNoise } from '../scripts/utils/blue-noise.js';

const VERBOSE_LOGGING = true;
const NUM_LANDMASS_GROUPS = 2;
const DENSITY_TARGET = 0.15;
const MAX_DENSITY = 0.5;
const ADJACENT_TO_LAND_FLAG = 32768;
const RESOURCE_TYPE_MASK = 32767;
const TERRAIN_BITS = 4;
const BIOME_BITS = 4;
const FEATURE_BITS = 6;
const TERRAIN_MASK = (1 << TERRAIN_BITS) - 1;
const BIOME_MASK = (1 << BIOME_BITS) - 1;
const FEATURE_MASK = (1 << FEATURE_BITS) - 1;
const TERRAIN_SHIFT = BIOME_BITS + FEATURE_BITS;
const BIOME_SHIFT = FEATURE_BITS;
const FEATURE_SHIFT = 0;
const TILE_CLASS_ID_BITS = TERRAIN_BITS + BIOME_BITS + FEATURE_BITS;
const TILE_CLASS_ID_MAX = 1 << TILE_CLASS_ID_BITS;
const tileGroupBits = 8;
const tileIndexMax = (1 << tileGroupBits) - 1;
const tileIdToIndex = new Uint8Array(TILE_CLASS_ID_MAX);
let numTileGroups = 0;
for (const validBiome of GameInfo.Resource_ValidBiomes) {
  const rawId = tileClassIdFromValidBiome(validBiome);
  if (rawId === void 0) continue;
  if (tileIdToIndex[rawId] !== 0) continue;
  numTileGroups++;
  if (numTileGroups > tileIndexMax) {
    throw new Error(
      `Resource_ValidBiomes has too many unique tile-group tuples (${numTileGroups} >= ${tileIndexMax})`
    );
  }
  tileIdToIndex[rawId] = numTileGroups;
}
const NUM_TILE_GROUPS = numTileGroups + 1;
function getDenseTileGroupId(rawTileId) {
  return tileIdToIndex[rawTileId];
}
function getTileClassId(terrain, biome, feature) {
  return (terrain & TERRAIN_MASK) << TERRAIN_SHIFT | (biome & BIOME_MASK) << BIOME_SHIFT | (feature & FEATURE_MASK) << FEATURE_SHIFT;
}
function getLandmassTileClassGroupId(denseId, extra) {
  return denseId | (extra & 15) << tileGroupBits;
}
function getTileClass(x, y) {
  return {
    terrain: GameplayMap.getTerrainType(x, y),
    biome: GameplayMap.getBiomeType(x, y),
    feature: GameplayMap.getFeatureType(x, y)
  };
}
function getTileId(x, y) {
  const terrain = GameplayMap.getTerrainType(x, y);
  const biome = GameplayMap.getBiomeType(x, y);
  const feature = GameplayMap.getFeatureType(x, y);
  return getTileClassId(terrain, biome, feature);
}
function tileClassFromId(tileId) {
  return {
    terrain: tileId >> TERRAIN_SHIFT & TERRAIN_MASK,
    biome: tileId >> BIOME_SHIFT & BIOME_MASK,
    feature: tileId >> FEATURE_SHIFT & FEATURE_MASK
  };
}
function isCoastalAdjacentToLand(x, y, tc) {
  return tc.terrain === g_CoastTerrain && tc.biome === g_MarineBiome && GameplayMap.isAdjacentToLand(x, y);
}
function tileClassIdFromValidBiome(validBiome) {
  const terrainDef = GameInfo.Terrains.find((t) => t.TerrainType === validBiome.TerrainType);
  const biomeDef = GameInfo.Biomes.find((b) => b.BiomeType === validBiome.BiomeType);
  if (!terrainDef || !biomeDef) return void 0;
  let feature;
  if (validBiome.FeatureType) {
    const featureDef = GameInfo.Features.find((f) => f.FeatureType === validBiome.FeatureType);
    if (!featureDef) return void 0;
    feature = featureDef.$index;
  } else {
    feature = FeatureTypes.NO_FEATURE;
  }
  return getTileClassId(terrainDef.$index, biomeDef.$index, feature);
}
function tileClassLabel(tc) {
  const terrainName = GameInfo.Terrains[tc.terrain]?.TerrainType ?? `Unknown(${tc.terrain})`;
  const biomeName = GameInfo.Biomes[tc.biome]?.BiomeType ?? `Unknown(${tc.biome})`;
  let featureName;
  if (tc.feature === FeatureTypes.NO_FEATURE) {
    featureName = "NO_FEATURE";
  } else {
    featureName = GameInfo.Features[tc.feature]?.FeatureType ?? "";
  }
  return `${terrainName}/${biomeName}/${featureName}`;
}
function isResourceAllowedOnLandmass(assignedLandmass, regionId, numGroups) {
  if (assignedLandmass === LandmassRegion.LANDMASS_REGION_ANY || assignedLandmass === LandmassRegion.LANDMASS_REGION_DEFAULT || regionId === 0)
    return true;
  if (assignedLandmass === LandmassRegion.LANDMASS_REGION_NONE) return false;
  const regionGroup = (regionId - 1) % numGroups + 1;
  return assignedLandmass === regionGroup;
}
const MAX_LANDMASS_REGIONS = 16;
const LANDMASS_BIT_SHIFT = 4;
function buildPlacementContext(iWidth, iHeight) {
  const totalTiles = iWidth * iHeight;
  const tileIdCache = new Uint16Array(totalTiles);
  const regionIdCache = new Uint8Array(totalTiles);
  const adjToLandCache = new Uint8Array(totalTiles);
  let maxPlayerRegion = 0;
  let nonOceanTileCount = 0;
  const groupCount = new Uint16Array(NUM_TILE_GROUPS);
  const groupAdjCount = new Uint16Array(NUM_TILE_GROUPS);
  const groupRawId = new Uint16Array(NUM_TILE_GROUPS);
  const regionCount = new Uint16Array(NUM_TILE_GROUPS * MAX_LANDMASS_REGIONS);
  const regionAdjCount = new Uint16Array(NUM_TILE_GROUPS * MAX_LANDMASS_REGIONS);
  const mapScanScope = new profileScope("buildPlacementContext Map Scan");
  for (let y = 0; y < iHeight; y++) {
    for (let x = 0; x < iWidth; x++) {
      const idx = y * iWidth + x;
      const terrain = GameplayMap.getTerrainType(x, y);
      const biome = GameplayMap.getBiomeType(x, y);
      const feature = GameplayMap.getFeatureType(x, y);
      const rawId = getTileClassId(terrain, biome, feature);
      const id = tileIdToIndex[rawId];
      if (terrain !== g_OceanTerrain) nonOceanTileCount++;
      const adjToLand = terrain === g_CoastTerrain && biome === g_MarineBiome && GameplayMap.isAdjacentToLand(x, y);
      let regionId = GameplayMap.getLandmassRegionId(x, y);
      if (regionId == LandmassRegion.LANDMASS_REGION_NONE) {
        regionId = 0;
      }
      tileIdCache[idx] = id;
      regionIdCache[idx] = regionId;
      adjToLandCache[idx] = adjToLand ? 1 : 0;
      if (groupCount[id] === 0) {
        groupRawId[id] = rawId;
      }
      groupCount[id]++;
      if (adjToLand) groupAdjCount[id]++;
      if (regionId > maxPlayerRegion) maxPlayerRegion = regionId;
      const rcKey = id << LANDMASS_BIT_SHIFT | regionId;
      regionCount[rcKey]++;
      if (adjToLand) regionAdjCount[rcKey]++;
    }
  }
  mapScanScope.end();
  const landmassEligibleScope = new profileScope("buildPlacementContext Landmass Eligibility");
  const landmassEligible = /* @__PURE__ */ new Map();
  for (let r = 0; r <= maxPlayerRegion; r++) {
    for (let i = 0; i < groupCount.length; ++i) {
      if (groupCount[i] === 0) continue;
      const tileId = i;
      const rcKey = tileId << LANDMASS_BIT_SHIFT | r;
      const rcCount = regionCount[rcKey];
      if (rcCount === 0) continue;
      const rcAdj = regionAdjCount[rcKey];
      for (let group = 1; group <= NUM_LANDMASS_GROUPS; group++) {
        if (r > 0 && !isResourceAllowedOnLandmass(group, r, NUM_LANDMASS_GROUPS)) continue;
        const hKey = getLandmassTileClassGroupId(tileId, group);
        const existing = landmassEligible.get(hKey);
        if (existing) {
          existing.count += rcCount;
          existing.adj += rcAdj;
        } else {
          landmassEligible.set(hKey, { count: rcCount, adj: rcAdj });
        }
      }
    }
  }
  landmassEligibleScope.end();
  return {
    iWidth,
    iHeight,
    groupCount,
    groupAdjCount,
    groupRawId,
    tileIdCache,
    regionIdCache,
    adjToLandCache,
    maxPlayerRegion,
    nonOceanTileCount,
    regionCount,
    regionAdjCount,
    landmassEligible
  };
}
function prepareResourceSet(candidateHashes, include) {
  const resourceWeight = new Float32Array(GameInfo.Resources.length);
  const activeResources = [];
  for (const r of candidateHashes) {
    const info = GameInfo.Resources.lookup(r);
    if (!info || !info.Tradeable) continue;
    if (include && !include(info)) continue;
    resourceWeight[info.$index] = info.Weight;
    activeResources.push({ typeIdx: info.$index, landmassId: 0 });
  }
  const landmassResources = activeResources.filter((r) => GameInfo.Resources[r.typeIdx]?.LandmassUnique);
  for (let i = landmassResources.length - 1; i > 0; i--) {
    const j = TerrainBuilder.getRandomNumber(i + 1, "Landmass Shuffle");
    [landmassResources[i], landmassResources[j]] = [landmassResources[j], landmassResources[i]];
  }
  for (let i = 0; i < landmassResources.length; i++) {
    landmassResources[i].landmassId = i % NUM_LANDMASS_GROUPS + 1;
  }
  return buildResourceSet(activeResources, resourceWeight);
}
function buildResourceSet(activeResources, resourceWeight) {
  const numResources = GameInfo.Resources.length;
  const resourceAssignedLandmass = new Uint8Array(numResources);
  const activeResourceIndices = new Uint16Array(activeResources.length);
  const typeStrings = /* @__PURE__ */ new Set();
  for (let i = 0; i < activeResources.length; i++) {
    const r = activeResources[i];
    resourceAssignedLandmass[r.typeIdx] = r.landmassId;
    activeResourceIndices[i] = r.typeIdx;
    const def = GameInfo.Resources[r.typeIdx];
    if (def) typeStrings.add(def.ResourceType);
  }
  const resolvedValidBiomes = [];
  for (const validBiome of GameInfo.Resource_ValidBiomes) {
    if (!typeStrings.has(validBiome.ResourceType)) continue;
    const resourceDef = GameInfo.Resources.find((r) => r.ResourceType === validBiome.ResourceType);
    if (!resourceDef) continue;
    const rawId = tileClassIdFromValidBiome(validBiome);
    if (rawId === void 0) continue;
    const tileGroupId = tileIdToIndex[rawId];
    const weight = validBiome.Weight ?? resourceWeight[resourceDef.$index];
    resolvedValidBiomes.push({
      tileGroupId,
      resourceIdx: resourceDef.$index,
      adjacentToLand: resourceDef.AdjacentToLand,
      weight
    });
  }
  return { activeResourceIndices, resourceWeight, resourceAssignedLandmass, resolvedValidBiomes };
}
function buildBlueNoiseWindows(ctx, set, config) {
  const BLUE_NOISE_RANGE = 65536;
  const { densityTarget, maxDensity } = config;
  const resourceEligibleTileCounts = new Uint32Array(GameInfo.Resources.length);
  const resourceEligiblePerLandmass = new Uint32Array(GameInfo.Resources.length * ctx.maxPlayerRegion);
  const tileGroupResources = /* @__PURE__ */ new Map();
  for (const entry of set.resolvedValidBiomes) {
    const groupCount = ctx.groupCount[entry.tileGroupId];
    if (groupCount === 0) continue;
    const assignedLandmass = set.resourceAssignedLandmass[entry.resourceIdx];
    let count;
    let adjCount;
    if (assignedLandmass === 0) {
      count = groupCount;
      adjCount = ctx.groupAdjCount[entry.tileGroupId];
    } else {
      const he = ctx.landmassEligible.get(getLandmassTileClassGroupId(entry.tileGroupId, assignedLandmass));
      count = he?.count ?? 0;
      adjCount = he?.adj ?? 0;
    }
    const eligible = entry.adjacentToLand ? adjCount : count;
    resourceEligibleTileCounts[entry.resourceIdx] += eligible;
    for (let regionId = 1; regionId <= ctx.maxPlayerRegion; regionId++) {
      if (!isResourceAllowedOnLandmass(assignedLandmass, regionId, NUM_LANDMASS_GROUPS)) continue;
      const rcKey = entry.tileGroupId << LANDMASS_BIT_SHIFT | regionId;
      const rcCount = ctx.regionCount[rcKey];
      if (rcCount === 0) continue;
      const rcAdj = ctx.regionAdjCount[rcKey];
      const tiles = entry.adjacentToLand ? rcAdj : rcCount;
      resourceEligiblePerLandmass[entry.resourceIdx * ctx.maxPlayerRegion + (regionId - 1)] += tiles;
    }
    const weight = entry.weight;
    if (weight <= 0) continue;
    if (!tileGroupResources.has(entry.tileGroupId)) {
      tileGroupResources.set(entry.tileGroupId, []);
    }
    tileGroupResources.get(entry.tileGroupId).push({
      resourceIdx: entry.resourceIdx,
      weight,
      density: 0,
      windowSize: 0,
      adjacentToLand: entry.adjacentToLand
    });
  }
  if (config.densityByResourceAndGroup) {
    for (const [groupId, resources] of tileGroupResources) {
      for (const r of resources) {
        const key = r.resourceIdx * NUM_TILE_GROUPS + groupId;
        r.density = config.densityByResourceAndGroup[key];
      }
    }
  } else {
    for (const [, resources] of tileGroupResources) {
      for (const r of resources) {
        r.density = densityTarget * (r.weight / resources.length);
      }
    }
  }
  const resourceDesiredCount = new Float32Array(GameInfo.Resources.length);
  for (const [groupId, resources] of tileGroupResources) {
    const groupCount = ctx.groupCount[groupId];
    if (groupCount === 0) continue;
    for (const r of resources) {
      const assignedLandmass = set.resourceAssignedLandmass[r.resourceIdx];
      let effectiveTiles;
      if (assignedLandmass === 0) {
        effectiveTiles = r.adjacentToLand ? ctx.groupAdjCount[groupId] : groupCount;
      } else {
        const he = ctx.landmassEligible.get(getLandmassTileClassGroupId(groupId, assignedLandmass));
        effectiveTiles = r.adjacentToLand ? he?.adj ?? 0 : he?.count ?? 0;
      }
      resourceDesiredCount[r.resourceIdx] += r.density * effectiveTiles;
    }
  }
  const resourceMinimumPerLandmass = new Uint8Array(GameInfo.Resources.length);
  for (const resIdx of set.activeResourceIndices) {
    const def = GameInfo.Resources[resIdx];
    if (!def) continue;
    const minimum = config.effectiveMinimums ? config.effectiveMinimums[def.$index] : def.MinimumPerLandmass;
    if (minimum <= 0) continue;
    resourceMinimumPerLandmass[def.$index] = minimum;
    let numLandmassesEligible = 0;
    for (let r = 1; r <= ctx.maxPlayerRegion; r++) {
      if (resourceEligiblePerLandmass[def.$index * ctx.maxPlayerRegion + (r - 1)] > 0) {
        numLandmassesEligible++;
      }
    }
    if (numLandmassesEligible === 0) continue;
    const effectiveMin = minimum * numLandmassesEligible;
    const desired = resourceDesiredCount[def.$index];
    if (desired >= effectiveMin || desired <= 0) continue;
    resourceDesiredCount[def.$index] = effectiveMin;
    const scaleFactor = effectiveMin / desired;
    for (const [, resources] of tileGroupResources) {
      for (const rr of resources) {
        if (rr.resourceIdx === def.$index) {
          rr.density = rr.density * scaleFactor;
        }
      }
    }
  }
  const windowOffsets = new Uint16Array(NUM_TILE_GROUPS);
  const windowCounts = new Uint8Array(NUM_TILE_GROUPS);
  let totalWindows = 0;
  for (const [key, resources] of tileGroupResources) {
    let cursor = 0;
    let count = 0;
    for (const r of resources) {
      r.windowSize = Math.round(Math.min(r.density, maxDensity) * BLUE_NOISE_RANGE);
      r.windowSize = Math.min(r.windowSize, BLUE_NOISE_RANGE - cursor);
      if (r.windowSize <= 0) continue;
      count++;
      cursor += r.windowSize;
      if (cursor >= BLUE_NOISE_RANGE) break;
    }
    windowOffsets[key] = totalWindows;
    windowCounts[key] = count;
    totalWindows += count;
  }
  const windowTypes = new Uint16Array(totalWindows);
  const windowSizes = new Uint16Array(totalWindows);
  const maxGapSize = new Uint16Array(NUM_TILE_GROUPS);
  for (const [key, resources] of tileGroupResources) {
    let cursor = 0;
    let wi = windowOffsets[key];
    for (const r of resources) {
      if (r.windowSize <= 0) continue;
      windowTypes[wi] = r.resourceIdx | (r.adjacentToLand ? ADJACENT_TO_LAND_FLAG : 0);
      windowSizes[wi] = r.windowSize;
      wi++;
      cursor += r.windowSize;
      if (cursor >= BLUE_NOISE_RANGE) break;
    }
    maxGapSize[key] = windowCounts[key] > 0 ? Math.floor((65535 - cursor) / windowCounts[key]) : 0;
  }
  if (VERBOSE_LOGGING) {
    console.log("Blue noise windows per tile group:");
    for (let key = 0; key < ctx.groupCount.length; key++) {
      const count = windowCounts[key];
      if (count === 0) continue;
      const tileClass = tileClassFromId(ctx.groupRawId[key]);
      const label = tileClassLabel(tileClass);
      const offset = windowOffsets[key];
      for (let i = 0; i < count; i++) {
        const resourceIdx = windowTypes[offset + i] & RESOURCE_TYPE_MASK;
        const size = windowSizes[offset + i];
        const resName = GameInfo.Resources[resourceIdx]?.ResourceType ?? `Unknown(${resourceIdx})`;
        console.log(`  ${label}: ${resName} size=${size}`);
      }
    }
  }
  const windows = {
    types: windowTypes,
    sizes: windowSizes,
    offsets: windowOffsets,
    counts: windowCounts,
    maxGapSize
  };
  const metrics = {
    resourceDesiredCount,
    resourceEligibleTileCounts,
    resourceEligiblePerLandmass,
    resourceMinimumPerLandmass
  };
  return {
    windows,
    metrics
  };
}
function placeResourcesWithBlueNoise(ctx, set, plan, options) {
  const { iWidth, iHeight, tileIdCache, regionIdCache, adjToLandCache, maxPlayerRegion } = ctx;
  const { types: wTypes, sizes: wSizes, offsets: wOffsets, counts: wCounts, maxGapSize: wMaxGapSize } = plan.windows;
  const skipMask = options.skipMask;
  const shouldPlaceResource = options.shouldPlaceResource;
  const onResourcePlaced = options.onResourcePlaced;
  const ox = options.offsetX;
  const oy = options.offsetY;
  const hitCounts = new Uint32Array(GameInfo.Resources.length);
  const regionHits = VERBOSE_LOGGING ? /* @__PURE__ */ new Map() : void 0;
  const numResources = GameInfo.Resources.length;
  const placedPerLandmass = new Uint16Array(numResources * maxPlayerRegion);
  const consideredPerLandmass = new Uint32Array(numResources * maxPlayerRegion);
  const resourceMinimumPerLandmass = plan.metrics.resourceMinimumPerLandmass;
  const forcePlacedHits = VERBOSE_LOGGING ? new Uint8Array(numResources * maxPlayerRegion) : void 0;
  const considered = new Uint32Array(GameInfo.Resources.length);
  const GAP_FACTOR = 0.15;
  const GAIN = 2;
  const M_MAX = 4;
  const MAX_REGION_COUNT = 256;
  const maxMultiplier = new Float32Array(GameInfo.Resources.length).fill(1);
  const minMultiplier = new Float32Array(GameInfo.Resources.length).fill(1);
  let deniedByCanHaveResource = 0;
  const placeResource = (x, y, resourceIdx, regionId, forced = false) => {
    if (shouldPlaceResource?.(x, y, resourceIdx, regionId) === false) return false;
    if (!ResourceBuilder.canHaveResource(x, y, resourceIdx, true)) {
      ++deniedByCanHaveResource;
      return false;
    }
    ResourceBuilder.setResourceType(x, y, resourceIdx);
    hitCounts[resourceIdx]++;
    const k = resourceIdx * maxPlayerRegion + (regionId - 1);
    if (regionId > 0) {
      placedPerLandmass[k]++;
    }
    if (VERBOSE_LOGGING) {
      const rKey = resourceIdx * MAX_REGION_COUNT + regionId;
      regionHits.set(rKey, (regionHits.get(rKey) ?? 0) + 1);
      if (forced && regionId > 0) {
        forcePlacedHits[k]++;
      }
    }
    onResourcePlaced?.(x, y, resourceIdx, regionId);
    return true;
  };
  for (let pass = 0; pass < 4; ++pass) {
    const xStart = pass & 1;
    const yStart = pass >> 1 & 1;
    for (let y = yStart; y < iHeight; y += 2) {
      for (let x = xStart; x < iWidth; x += 2) {
        const idx = y * iWidth + x;
        if (skipMask && skipMask[idx]) continue;
        const tileGroup = tileIdCache[idx];
        const count = wCounts[tileGroup];
        if (count === 0) continue;
        const offset = wOffsets[tileGroup];
        const adjToLand = adjToLandCache[idx] === 1;
        const regionId = regionIdCache[idx];
        const isPlayerLandmass = regionId > 0 && regionId <= maxPlayerRegion;
        let forcePlaceIdx = -1;
        for (let i = 0; i < count; i++) {
          const packed = wTypes[offset + i];
          if (packed & ADJACENT_TO_LAND_FLAG && !adjToLand) continue;
          const resourceIdx = packed & RESOURCE_TYPE_MASK;
          if (!isResourceAllowedOnLandmass(
            set.resourceAssignedLandmass[resourceIdx],
            regionId,
            NUM_LANDMASS_GROUPS
          ))
            continue;
          considered[resourceIdx]++;
          if (isPlayerLandmass) {
            const k = resourceIdx * maxPlayerRegion + (regionId - 1);
            consideredPerLandmass[k]++;
            if (forcePlaceIdx === -1) {
              const min = resourceMinimumPerLandmass[resourceIdx];
              if (min > 0) {
                const placed = placedPerLandmass[k];
                if (placed < min) {
                  const eligibleLandmass = plan.metrics.resourceEligiblePerLandmass[k];
                  if (eligibleLandmass > 0) {
                    const eligibleTotal = plan.metrics.resourceEligibleTileCounts[resourceIdx];
                    const desiredTotal = plan.metrics.resourceDesiredCount[resourceIdx];
                    const naturalRate = desiredTotal / eligibleTotal;
                    const remainingLandmass = eligibleLandmass - consideredPerLandmass[k];
                    const expectedNatural = naturalRate * remainingLandmass;
                    if (placed + expectedNatural < min - 0.5) {
                      forcePlaceIdx = resourceIdx;
                    }
                  }
                }
              }
            }
          }
        }
        if (forcePlaceIdx !== -1) {
          if (placeResource(x, y, forcePlaceIdx, regionId, true)) continue;
        }
        const noiseVal = sampleBlueNoise(x + ox, y + oy);
        const maxGap = wMaxGapSize[tileGroup];
        const gapSize = maxGap * GAP_FACTOR;
        let remaining = noiseVal;
        for (let wi = 0; wi < count; wi++) {
          if (remaining < gapSize) break;
          remaining -= gapSize;
          const wSize = wSizes[offset + wi];
          const packed = wTypes[offset + wi];
          const resourceIdx = packed & RESOURCE_TYPE_MASK;
          let m = 1;
          const desired = plan.metrics.resourceDesiredCount[resourceIdx];
          const totalEligible = plan.metrics.resourceEligibleTileCounts[resourceIdx];
          if (desired > 0 && totalEligible > 0) {
            const expected = desired * considered[resourceIdx] / totalEligible;
            const deficit = expected - hitCounts[resourceIdx];
            m = 1 + GAIN * deficit / desired;
            if (m < 0) m = 0;
            else if (m > M_MAX) m = M_MAX;
            if (VERBOSE_LOGGING) {
              if (m > maxMultiplier[resourceIdx]) maxMultiplier[resourceIdx] = m;
              if (m < minMultiplier[resourceIdx]) minMultiplier[resourceIdx] = m;
            }
          }
          const adjSize = Math.min(wSize * m | 0, wSize + maxGap);
          if (remaining < adjSize) {
            if (packed & ADJACENT_TO_LAND_FLAG && !adjToLand) break;
            if (!isResourceAllowedOnLandmass(
              set.resourceAssignedLandmass[resourceIdx],
              regionId,
              NUM_LANDMASS_GROUPS
            ))
              break;
            placeResource(x, y, resourceIdx, regionId);
            break;
          }
          remaining -= wSize;
        }
      }
    }
  }
  if (VERBOSE_LOGGING) {
    const resourceDesiredCount = plan.metrics.resourceDesiredCount;
    console.log("Blue noise placement results:");
    for (let resourceIdx = 0; resourceIdx < hitCounts.length; resourceIdx++) {
      const hitCount = hitCounts[resourceIdx];
      if (hitCount === 0) continue;
      const resName = GameInfo.Resources[resourceIdx]?.ResourceType ?? `Unknown(${resourceIdx})`;
      const desired = resourceDesiredCount[resourceIdx];
      const desiredLabel = desired !== void 0 ? ` (desired: ${desired.toFixed(2)})` : "";
      const eligibleLabel = ` (eligible: ${plan.metrics.resourceEligibleTileCounts[resourceIdx] ?? 0})`;
      const landmass = set.resourceAssignedLandmass[resourceIdx];
      const landmassLabel = landmass > 0 ? ` [landmass ${landmass}]` : "";
      const regionParts = [];
      if (regionHits) {
        for (let r = 0; r <= maxPlayerRegion; r++) {
          const count = regionHits.get(resourceIdx * MAX_REGION_COUNT + r) ?? 0;
          if (count > 0) regionParts.push(`r${r}=${count}`);
        }
      }
      const regionSuffix = regionParts.length > 0 ? ` regions: (${regionParts.join(", ")})` : "";
      let forcedLabel = "";
      const forceParts = [];
      for (let r = 1; r <= maxPlayerRegion; r++) {
        const count = forcePlacedHits[resourceIdx * maxPlayerRegion + (r - 1)];
        if (count > 0) forceParts.push(`r${r}=${count}`);
      }
      forcedLabel = forceParts.length > 0 ? `
    (force placed for min ${resourceMinimumPerLandmass[resourceIdx]}: ${forceParts.join(", ")})` : "";
      const minmaxMultipliersLabel = ` max/min multipliers: ${maxMultiplier[resourceIdx].toFixed(2)}/${minMultiplier[resourceIdx].toFixed(2)}`;
      console.log(
        `  ${resName}: ${hitCount} hits${desiredLabel}${eligibleLabel}${landmassLabel}${regionSuffix}${minmaxMultipliersLabel}${forcedLabel}`
      );
    }
    console.log(`  Total denied by canHaveResource(): ${deniedByCanHaveResource}`);
    console.log(`Total resource blue noise hits: ${hitCounts.reduce((a, b) => a + b, 0)}`);
  }
}

export { DENSITY_TARGET, MAX_DENSITY, NUM_LANDMASS_GROUPS, NUM_TILE_GROUPS, TILE_CLASS_ID_BITS, TILE_CLASS_ID_MAX, VERBOSE_LOGGING, buildBlueNoiseWindows, buildPlacementContext, buildResourceSet, getDenseTileGroupId, getLandmassTileClassGroupId, getTileClass, getTileClassId, getTileId, isCoastalAdjacentToLand, isResourceAllowedOnLandmass, placeResourcesWithBlueNoise, prepareResourceSet, tileClassFromId, tileClassIdFromValidBiome, tileClassLabel };
//# sourceMappingURL=resource-placement-common.js.map
