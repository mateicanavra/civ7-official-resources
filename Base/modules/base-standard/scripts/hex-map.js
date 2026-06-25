import { rotate2, add2 } from '../../core/scripts/MathHelpers.js';
import { g_NavigableRiverTerrain, g_MountainTerrain, g_HillTerrain, g_FlatTerrain, g_CoastTerrain, g_OceanTerrain, g_TundraBiome, g_TropicalBiome, g_PlainsBiome, g_GrasslandBiome, g_DesertBiome, g_MarineBiome, g_VolcanoFeature } from '../maps/map-globals.js';
import { RandomImpl } from './random-pcg-32.js';
import { TerrainType, BiomeType, FeatureType, RegionType, isWater } from './voronoi-types.js';
import { VoronoiUtils } from './voronoi-utils.js';

var SeparationFilterOptions = /* @__PURE__ */ ((SeparationFilterOptions2) => {
  SeparationFilterOptions2[SeparationFilterOptions2["OFF"] = 0] = "OFF";
  SeparationFilterOptions2[SeparationFilterOptions2["DIFFERENT_LANDMASSES"] = 1] = "DIFFERENT_LANDMASSES";
  SeparationFilterOptions2[SeparationFilterOptions2["DIFFERENT_LANDMASS_GROUPS"] = 2] = "DIFFERENT_LANDMASS_GROUPS";
  SeparationFilterOptions2[SeparationFilterOptions2["DIFFERENT_TYPES"] = 4] = "DIFFERENT_TYPES";
  SeparationFilterOptions2[SeparationFilterOptions2["ALL"] = 7] = "ALL";
  return SeparationFilterOptions2;
})(SeparationFilterOptions || {});
var RemoveBridgingLandmassOptions = /* @__PURE__ */ ((RemoveBridgingLandmassOptions2) => {
  RemoveBridgingLandmassOptions2[RemoveBridgingLandmassOptions2["OFF"] = 0] = "OFF";
  RemoveBridgingLandmassOptions2[RemoveBridgingLandmassOptions2["FORCE_COASTS"] = 1] = "FORCE_COASTS";
  RemoveBridgingLandmassOptions2[RemoveBridgingLandmassOptions2["FORCE_OCEANS"] = 2] = "FORCE_OCEANS";
  return RemoveBridgingLandmassOptions2;
})(RemoveBridgingLandmassOptions || {});
class HexValidationSettings {
  polarMargin = 2;
  removeBridgingPlayerLandmasses = 2 /* FORCE_OCEANS */;
  forceCoasts = true;
  removeLakes = true;
  lakeDensityAllowed = 0.03;
  // ratio of land tiles to lake tiles.
  maxLakeSize = 6;
  removeAdjacentVolcanos = true;
  rebuildPlayerLandmasses = true;
}
class VoronoiValidationSettings {
  forceCoasts = 0 /* OFF */;
  forceOceans = 7 /* ALL */;
}
class HexTile {
  pos = { x: 0, y: 0 };
  coord = { x: 0, y: 0 };
  playerLandmassId = -1;
  // used to identify a contiguous land mass where players are allowed to spawn. Used for separating distant and home lands. -1 for unassigned/Ocean, 0 for non-player lands, 1+ for landmasses.
  majorPlayerRegionId = -1;
  // a subdivision of player landmasses to denote a region where a single player may spawn. -1 for unassigned, 0+ for player region ids.
  terrainType = TerrainType.Unknown;
  biomeType = BiomeType.Unknown;
  featureType = FeatureType.None;
  visited = 0;
  // used during map creation and processing.
  isPassable() {
    return this.terrainType !== TerrainType.Ocean && this.terrainType !== TerrainType.Mountainous;
  }
}
class HexTileDesc {
  playerLandmassId = -1;
  terrainType = TerrainType.Unknown;
  biomeType = BiomeType.Unknown;
  featureType = FeatureType.None;
}
var FloodFillResult = /* @__PURE__ */ ((FloodFillResult2) => {
  FloodFillResult2[FloodFillResult2["Include"] = 0] = "Include";
  FloodFillResult2[FloodFillResult2["Exclude"] = 1] = "Exclude";
  FloodFillResult2[FloodFillResult2["Halt"] = 2] = "Halt";
  return FloodFillResult2;
})(FloodFillResult || {});
class HexMapStats {
  oceanTileCount = 0;
  totalCoastCount = 0;
  totalLandCount = 0;
  playerLandmasses = [];
  nonPlayerLand = { land: 0, coast: 0, playerLandmassId: -1 };
  log() {
    console.log(`Ocean tiles: ${this.oceanTileCount}`);
    console.log(`Total coast tiles: ${this.totalCoastCount}`);
    console.log(`Total land tiles: ${this.totalLandCount}`);
    console.log(`Non-player lands: ${this.nonPlayerLand.land} land tiles, ${this.nonPlayerLand.coast} coast tiles`);
    for (let i = 0; i < this.playerLandmasses.length; ++i) {
      const landmass = this.playerLandmasses[i];
      console.log(`Player landmass ${i}: ${landmass.land} land tiles, ${landmass.coast} coast tiles`);
    }
  }
}
const lakeSettingsSchema = {
  label: "Lake Settings",
  children: {
    lakeDensity: {
      label: "Lake Density",
      description: "The ratio of land tiles to lake tiles.",
      default: 0.04,
      min: 0,
      max: 1,
      step: 1e-3
    },
    meanSize: {
      label: "Mean Size",
      description: "The mean size of lakes in number of tiles.",
      default: 3.8,
      min: 1,
      max: 20,
      step: 0.1
    },
    stdDevBelow: {
      label: "Standard Deviation Below",
      description: "The standard deviation below the mean size for lake generation.",
      default: 1.8,
      min: 0,
      max: 10,
      step: 0.1
    },
    stdDevAbove: {
      label: "Standard Deviation Above",
      description: "The standard deviation above the mean size for lake generation.",
      default: 0.8,
      min: 0,
      max: 10,
      step: 0.1
    },
    clumpiness: {
      label: "Clumpiness",
      description: "How much lakes should clump together. 0 is no clumping, positive values cause lake tiles to clump together more, negative values cause lakes to be stringy.",
      default: -1,
      min: -5,
      max: 5,
      step: 0.1
    }
  }
};
const hexMapSchema = {
  label: "Hex Generation Settings",
  children: {
    lakeSettings: lakeSettingsSchema
  }
};
function buildDefaultHexSettings(schema) {
  const out = {};
  for (const [key, node] of Object.entries(schema)) {
    if ("children" in node) {
      out[key] = buildDefaultHexSettings(node.children);
    } else {
      out[key] = node.default;
    }
  }
  return out;
}
function getDefaultHexSettings() {
  return buildDefaultHexSettings(hexMapSchema.children);
}
class HexMap {
  m_tiles = [];
  m_wrappedXIndices = [];
  // Saves lots of % calls
  m_xOffset = 0;
  m_yOffset = 0;
  m_validationSettings = new HexValidationSettings();
  m_lakeTiles = 0;
  m_settings = getDefaultHexSettings();
  getSettings() {
    return this.m_settings;
  }
  setSettings(settings) {
    this.m_settings = settings;
  }
  setValidationSettings(validationSettings) {
    this.m_validationSettings = validationSettings;
  }
  buildWrappedIndices(xCount) {
    if (this.m_wrappedXIndices.length != xCount * 3) {
      this.m_wrappedXIndices = Array.from({ length: xCount * 3 }, (_, index) => index % xCount);
    }
  }
  getSettingsSchema() {
    return hexMapSchema;
  }
  initFromRegionCells(width, height, tree, landmassRegions, playerRegionCallback, voronoiValidationSettings, dominantCells) {
    this.buildWrappedIndices(width);
    const offsetPoint = { x: 0.736 * 0.5, y: 0 };
    const offsetPoints = [{ x: 0, y: 0 }];
    for (let i = 0; i < 6; ++i) {
      offsetPoints.push(rotate2(offsetPoint, i * Math.PI / 3));
    }
    class VoronoiHexTile {
      landmassId = -1;
      playerLandmassId = -1;
      terrainType = TerrainType.Unknown;
      biomeType = BiomeType.Unknown;
      featureType = FeatureType.None;
      landmassGroupId = -1;
      regionType = RegionType.None;
    }
    const voronoiHexTiles = new Array(height);
    const yOffset = 0.325;
    const halfSqrt3 = Math.sqrt(3) * 0.5;
    for (let y = 0; y < height; ++y) {
      voronoiHexTiles[y] = new Array(width);
      const xOffset = y % 2 == 0 ? 0 : Math.sqrt(3) * 0.25;
      for (let x = 0; x < width; ++x) {
        const getRegionCellKey = (cell) => {
          return `${cell.terrainType},${cell.featureType}`;
        };
        const centerPos = { x: xOffset + x * halfSqrt3, y: yOffset + y * 0.75 };
        const regionCells = /* @__PURE__ */ new Map();
        for (const offsetPos of offsetPoints) {
          const samplePos = add2(offsetPos, centerPos);
          const regionCell = tree.search(samplePos)?.data;
          if (regionCell) {
            const regionCellKey = getRegionCellKey(regionCell);
            const entry = regionCells.get(regionCellKey);
            if (entry) {
              entry[0]++;
            } else {
              regionCells.set(regionCellKey, [1, regionCell]);
            }
          }
        }
        let dominantCell = null;
        let maxCount = 0;
        for (const [_key, [count, cell]] of regionCells) {
          if (count > maxCount) {
            dominantCell = cell;
            maxCount = count;
          }
        }
        const voronoiTile = new VoronoiHexTile();
        if (dominantCell) {
          voronoiTile.landmassId = dominantCell.landmassId;
          voronoiTile.playerLandmassId = playerRegionCallback(dominantCell);
          voronoiTile.terrainType = dominantCell.terrainType;
          voronoiTile.biomeType = dominantCell.biomeType;
          voronoiTile.featureType = dominantCell.featureType;
          voronoiTile.landmassGroupId = landmassRegions[dominantCell.landmassId].groupId;
          voronoiTile.regionType = landmassRegions[dominantCell.landmassId].type;
          if (dominantCells) {
            (dominantCells[x] ??= [])[y] = dominantCell;
          }
        } else {
          console.error("No region cell found for hex at " + x + "," + y);
        }
        voronoiHexTiles[y][x] = voronoiTile;
      }
    }
    const shouldSeparateByFilter = (tile, neighbor, filter) => {
      return (filter & 1 /* DIFFERENT_LANDMASSES */) !== 0 && neighbor.landmassId !== tile.landmassId || (filter & 2 /* DIFFERENT_LANDMASS_GROUPS */) !== 0 && neighbor.landmassGroupId !== tile.landmassGroupId || (filter & 4 /* DIFFERENT_TYPES */) !== 0 && neighbor.regionType !== tile.regionType;
    };
    const applyTerrainSeparation = (filter, targetTerrain, shouldProcessTile) => {
      if (filter === 0 /* OFF */) {
        return;
      }
      for (let y = 0; y < voronoiHexTiles.length; ++y) {
        for (let x = 0; x < voronoiHexTiles[y].length; ++x) {
          const tile = voronoiHexTiles[y][x];
          if (!shouldProcessTile(tile.terrainType)) {
            continue;
          }
          if (this.anyNeighborOfArr(
            x,
            y,
            voronoiHexTiles,
            (neighbor) => neighbor !== void 0 && shouldProcessTile(neighbor.terrainType) && shouldSeparateByFilter(tile, neighbor, filter)
          )) {
            tile.terrainType = targetTerrain;
          }
        }
      }
    };
    console.log("Applying terrain separation for coasts...");
    applyTerrainSeparation(
      voronoiValidationSettings?.forceCoasts ?? 0 /* OFF */,
      TerrainType.Coast,
      (terrainType) => terrainType !== TerrainType.Ocean && terrainType !== TerrainType.Coast
    );
    console.log("Applying terrain separation for oceans...");
    applyTerrainSeparation(
      voronoiValidationSettings?.forceOceans ?? 0 /* OFF */,
      TerrainType.Ocean,
      (terrainType) => terrainType !== TerrainType.Ocean
    );
    this.initFromTiles(width, height, (x, y, _centerPos) => voronoiHexTiles[y][x]);
  }
  initFromTiles(xCount, yCount, getTile) {
    this.buildWrappedIndices(xCount);
    this.m_tiles = new Array(yCount);
    const yOffset = 0.325;
    for (let y = 0; y < yCount; ++y) {
      const xOffset = y % 2 == 0 ? 0 : Math.sqrt(3) * 0.25;
      this.m_tiles[y] = new Array(xCount);
      for (let x = 0; x < xCount; ++x) {
        const centerPos = { x: xOffset + x * Math.sqrt(3) * 0.5, y: yOffset + y * 0.75 };
        const tileDesc = getTile(x, y, centerPos);
        const tile = new HexTile();
        tile.coord = { x, y };
        tile.pos = centerPos;
        Object.assign(tile, tileDesc);
        this.m_tiles[y][x] = tile;
      }
    }
  }
  initFromTerrainBuilder() {
    const iWidth = GameplayMap.getGridWidth();
    const iHeight = GameplayMap.getGridHeight();
    this.buildWrappedIndices(iWidth);
    const convertTerrainType = (terrainType) => {
      switch (terrainType) {
        case g_OceanTerrain:
          return TerrainType.Ocean;
        case g_CoastTerrain:
          return TerrainType.Coast;
        case g_FlatTerrain:
          return TerrainType.Flat;
        case g_HillTerrain:
          return TerrainType.Rough;
        case g_MountainTerrain:
          return TerrainType.Mountainous;
        case g_NavigableRiverTerrain:
          return TerrainType.NavRiver;
      }
      return TerrainType.Unknown;
    };
    const convertBiomeType = (biomeType) => {
      switch (biomeType) {
        case g_MarineBiome:
          return BiomeType.Ocean;
        case g_DesertBiome:
          return BiomeType.Desert;
        case g_GrasslandBiome:
          return BiomeType.Grassland;
        case g_PlainsBiome:
          return BiomeType.Plains;
        case g_TropicalBiome:
          return BiomeType.Tropical;
        case g_TundraBiome:
          return BiomeType.Tundra;
      }
      return BiomeType.Unknown;
    };
    const convertFeatureType = (featureType) => {
      switch (featureType) {
        case g_VolcanoFeature:
          return FeatureType.Volcano;
      }
      return FeatureType.None;
    };
    this.initFromTiles(iWidth, iHeight, (x, y, _pos) => {
      const hexTileDesc = new HexTileDesc();
      hexTileDesc.playerLandmassId = GameplayMap.getLandmassRegionId(x, y);
      hexTileDesc.terrainType = convertTerrainType(GameplayMap.getTerrainType(x, y));
      hexTileDesc.biomeType = convertBiomeType(GameplayMap.getBiomeType(x, y));
      hexTileDesc.featureType = convertFeatureType(GameplayMap.getFeatureType(x, y));
      return hexTileDesc;
    });
  }
  writeToTerrainBuilder() {
    for (let y = 0; y < this.m_tiles.length; ++y) {
      for (let x = 0; x < this.m_tiles[y].length; ++x) {
        const tile = this.m_tiles[y][x];
        if (tile.playerLandmassId === 0) {
          TerrainBuilder.addPlotTag(x, y, PlotTags.PLOT_TAG_ISLAND);
          TerrainBuilder.setLandmassRegionId(x, y, 0);
        } else {
          TerrainBuilder.setLandmassRegionId(x, y, tile.playerLandmassId);
        }
        const terrainType = (() => {
          switch (tile.terrainType) {
            case TerrainType.Flat:
              return g_FlatTerrain;
            case TerrainType.Mountainous:
              return g_MountainTerrain;
            case TerrainType.Rough:
              return g_HillTerrain;
            case TerrainType.Ocean:
              return g_OceanTerrain;
            case TerrainType.Coast:
              return g_CoastTerrain;
            default:
              return g_FlatTerrain;
          }
        })();
        TerrainBuilder.setTerrainType(x, y, terrainType);
        if (tile.featureType === FeatureType.Volcano) {
          TerrainBuilder.setFeatureType(x, y, {
            Feature: g_VolcanoFeature,
            Direction: -1,
            Elevation: 0
          });
        }
      }
    }
    this.getMapStats().log();
  }
  consolePrintMap(tiles) {
    for (let y = tiles.length - 1; y >= 0; --y) {
      let line = "";
      for (const tile of tiles[y]) {
        line += tile.terrainType === TerrainType.Ocean ? "." : tile.terrainType === TerrainType.Coast ? "~" : tile.terrainType.toString();
      }
      console.log(line);
    }
  }
  EvenRowDeltas = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
  ];
  OddRowDeltas = [
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 0],
    [0, -1]
  ];
  forNeighbors(x, y, sourceArray, callback) {
    const deltas = y % 2 === 0 ? this.EvenRowDeltas : this.OddRowDeltas;
    for (const [dx, dy] of deltas) {
      const ny = y + dy;
      if (ny < 0 || ny >= sourceArray.length) continue;
      const nx = x + dx + sourceArray[0].length;
      const neighbor = sourceArray[ny][this.m_wrappedXIndices[nx]];
      if (neighbor) {
        callback(neighbor);
      }
    }
  }
  getNeighborsOfArr(neighbors, x, y, sourceArr) {
    this.forNeighbors(x, y, sourceArr, (neighbor) => {
      neighbors.push(neighbor);
    });
  }
  getNeighborsOfArrFiltered(neighbors, x, y, sourceArr, condition) {
    this.forNeighbors(x, y, sourceArr, (neighbor) => {
      if (condition(neighbor)) {
        neighbors.push(neighbor);
      }
    });
  }
  appendNeighbors(tile, list, condition) {
    this.getNeighborsOfArrFiltered(list, tile.coord.x, tile.coord.y, this.m_tiles, condition);
  }
  anyNeighborOfArr(x, y, sourceArr, condition) {
    const deltas = y % 2 === 0 ? this.EvenRowDeltas : this.OddRowDeltas;
    for (const [dx, dy] of deltas) {
      const ny = y + dy;
      if (ny < 0 || ny >= sourceArr.length) continue;
      const nx = x + dx + sourceArr[0].length;
      const neighbor = sourceArr[ny][this.m_wrappedXIndices[nx]];
      if (neighbor && condition(neighbor)) {
        return true;
      }
    }
    return false;
  }
  anyNeighbor(tile, condition) {
    return this.anyNeighborOfArr(tile.coord.x, tile.coord.y, this.m_tiles, condition);
  }
  forAllTiles(callback) {
    for (const row of this.m_tiles) {
      for (const tile of row) {
        callback(tile);
      }
    }
  }
  // #######################
  // Validation
  // #######################
  validate() {
    if (this.m_validationSettings.polarMargin > 0) {
      this.validatePoles(this.m_validationSettings.polarMargin);
    }
    if (this.m_validationSettings.removeBridgingPlayerLandmasses != 0 /* OFF */) {
      this.removeBridgingPlayerLandmasses(this.m_validationSettings.removeBridgingPlayerLandmasses);
    }
    if (this.m_validationSettings.forceCoasts) {
      this.validateCoasts();
    }
    if (this.m_validationSettings.removeLakes) {
      this.removeLakes();
    }
    if (this.m_validationSettings.removeAdjacentVolcanos) {
      this.removeAdjacentVolcanoes();
    }
    if (this.m_validationSettings.rebuildPlayerLandmasses) {
      this.rebuildPlayerLandmasses();
    }
  }
  getMapStats() {
    const stats = new HexMapStats();
    for (const tile of this.m_tiles.flat()) {
      if (tile.terrainType === TerrainType.Ocean) {
        stats.oceanTileCount++;
      } else {
        const tileCount = tile.playerLandmassId <= 0 ? stats.nonPlayerLand : stats.playerLandmasses[tile.playerLandmassId - 1] ??= {
          land: 0,
          coast: 0,
          playerLandmassId: tile.playerLandmassId
        };
        if (tile.terrainType === TerrainType.Coast) {
          tileCount.coast++;
          stats.totalCoastCount++;
        } else {
          tileCount.land++;
          stats.totalLandCount++;
        }
      }
    }
    return stats;
  }
  validatePoles(marginSize) {
    for (let y = 0; y < marginSize; ++y) {
      for (const tile of this.m_tiles[y]) {
        tile.terrainType = TerrainType.Ocean;
        tile.playerLandmassId = -1;
      }
    }
    for (let y = this.m_tiles.length - marginSize; y < this.m_tiles.length; ++y) {
      for (const tile of this.m_tiles[y]) {
        tile.terrainType = TerrainType.Ocean;
        tile.playerLandmassId = -1;
      }
    }
  }
  validateCoasts() {
    this.forAllTiles((tile) => {
      if (tile.terrainType !== TerrainType.Ocean && tile.terrainType !== TerrainType.Coast) {
        this.forNeighbors(tile.coord.x, tile.coord.y, this.m_tiles, (neighbor) => {
          if (neighbor && neighbor.terrainType === TerrainType.Ocean) {
            neighbor.terrainType = TerrainType.Coast;
            neighbor.playerLandmassId = tile.playerLandmassId;
          }
        });
      }
    });
  }
  removeLakes() {
    const lakes = [];
    let totalLakeTiles = 0;
    let totalLandTiles = 0;
    this.forAllTiles((tile) => {
      if (tile.terrainType !== TerrainType.Ocean && tile.terrainType !== TerrainType.Coast) {
        ++totalLandTiles;
      } else if (tile.terrainType === TerrainType.Coast && !tile.visited) {
        let foundOcean = false;
        let playerLandmassId = 0;
        const lakeTiles = [];
        this.floodFill(tile, (tile2) => {
          if (tile2.terrainType === TerrainType.Coast) {
            lakeTiles.push(tile2);
            return 0 /* Include */;
          } else if (tile2.terrainType === TerrainType.Ocean) {
            foundOcean = true;
          } else if (tile2.terrainType === TerrainType.Flat) {
            playerLandmassId = tile2.playerLandmassId;
          }
          return 1 /* Exclude */;
        });
        if (!foundOcean) {
          lakes.push({ tiles: lakeTiles, landmassId: playerLandmassId });
          totalLakeTiles += lakeTiles.length;
        }
      }
    });
    this.clearVisited();
    const lakeRatio = totalLakeTiles / totalLandTiles;
    console.log(
      `Found ${lakes.length} lakes with a total of ${totalLakeTiles} tiles. Ratio is ${(lakeRatio * 100).toFixed(2)}%.`
    );
    lakes.sort((a, b) => b.tiles.length - a.tiles.length);
    for (const lake of lakes) {
      const ratioIfRemoved = (totalLakeTiles - lake.tiles.length) / totalLandTiles;
      if (ratioIfRemoved > this.m_validationSettings.lakeDensityAllowed || lake.tiles.length > this.m_validationSettings.maxLakeSize) {
        for (const tile of lake.tiles) {
          tile.terrainType = TerrainType.Flat;
          tile.playerLandmassId = lake.landmassId;
        }
        totalLakeTiles -= lake.tiles.length;
      }
    }
    console.log(
      `After removal, total lake tiles: ${totalLakeTiles}, ratio: ${(totalLakeTiles / totalLandTiles * 100).toFixed(2)}%.`
    );
    this.m_lakeTiles = totalLakeTiles;
  }
  removeAdjacentVolcanoes() {
    this.forAllTiles((tile) => {
      if (tile.featureType === FeatureType.Volcano) {
        this.forNeighbors(tile.coord.x, tile.coord.y, this.m_tiles, (neighbor) => {
          if (neighbor?.featureType === FeatureType.Volcano) {
            tile.featureType = FeatureType.None;
          }
        });
      }
    });
  }
  // #######################
  // Additional Generation
  // #######################
  GenerateLakes() {
    const s_validSeed = 1;
    const s_considered = 2;
    const s_lake = 3;
    const lakeSeedTiles = [];
    let totalFlatTiles = 0;
    this.forAllTiles((tile) => {
      if (tile.terrainType === TerrainType.Flat) {
        ++totalFlatTiles;
        if (!this.anyNeighbor(
          tile,
          (neighbor) => neighbor.terrainType === TerrainType.Ocean || neighbor.terrainType === TerrainType.Coast
        )) {
          lakeSeedTiles.push(tile);
          tile.visited = s_validSeed;
        }
      }
    });
    const lakeSettings = this.m_settings["lakeSettings"];
    const targetLakeTileCount = Math.round(totalFlatTiles * lakeSettings.lakeDensity);
    let lakesAdded = 0;
    let lakeTilesAdded = 0;
    while (this.m_lakeTiles < targetLakeTileCount && lakeSeedTiles.length > 0) {
      const seedIndex = RandomImpl.getRandomNumber(lakeSeedTiles.length, "Random Lake Seed");
      const seedTile = VoronoiUtils.swapAndPop(lakeSeedTiles, seedIndex);
      if (seedTile.visited !== s_validSeed) {
        continue;
      }
      const lakeSize = RandomImpl.randomNormal2(
        lakeSettings.meanSize,
        lakeSettings.stdDevBelow,
        lakeSettings.stdDevAbove,
        "Random Lake Size"
      );
      const totalSize = VoronoiUtils.clamp(Math.round(lakeSize), 0, 20);
      const considerTiles = [seedTile];
      seedTile.visited = s_considered;
      const popWeightedLakeTile = (clumpiness) => {
        if (considerTiles.length == 1) {
          return considerTiles.pop();
        }
        const weights = considerTiles.map((t) => {
          let lakeNeighborCount = 0;
          this.forNeighbors(t.coord.x, t.coord.y, this.m_tiles, (neighbor) => {
            if (neighbor.visited === s_lake) lakeNeighborCount++;
          });
          return Math.pow(lakeNeighborCount, clumpiness);
        });
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let roll = RandomImpl.getRandomNumber(1e3, "Lake Clump Weight") / 1e3 * totalWeight;
        for (let i = 0; i < weights.length; i++) {
          roll -= weights[i];
          if (roll <= 0) {
            return VoronoiUtils.swapAndPop(considerTiles, i);
          }
        }
        return considerTiles.pop();
      };
      let size = 0;
      while (totalSize > size && considerTiles.length > 0 && this.m_lakeTiles < targetLakeTileCount) {
        const tile = popWeightedLakeTile(lakeSettings.clumpiness);
        tile.visited = s_lake;
        tile.terrainType = TerrainType.Coast;
        console.log(`Adding lake tile at ${tile.coord.x},${tile.coord.y} on landmass ${tile.playerLandmassId}`);
        this.m_lakeTiles++;
        size++;
        let idx = considerTiles.length;
        this.appendNeighbors(tile, considerTiles, (neighbor) => neighbor.visited === s_validSeed);
        for (idx; idx < considerTiles.length; ++idx) {
          considerTiles[idx].visited = s_considered;
        }
      }
      ++lakesAdded;
      lakeTilesAdded += size;
    }
    console.log(`Added ${lakesAdded} lakes with a total of ${lakeTilesAdded} tiles.`);
    this.clearVisited();
  }
  // #######################
  // Player region generation and landmass separation
  // #######################
  removeBridgingPlayerLandmasses(option) {
    this.forAllTiles((tile) => {
      let checkTile = tile.terrainType !== TerrainType.Ocean;
      if (option === 1 /* FORCE_COASTS */) {
        checkTile = checkTile && tile.terrainType !== TerrainType.Coast;
      }
      if (checkTile) {
        if (this.anyNeighborOfArr(
          tile.coord.x,
          tile.coord.y,
          this.m_tiles,
          (neighbor) => neighbor && neighbor.playerLandmassId !== tile.playerLandmassId && neighbor.playerLandmassId !== -1
        )) {
          tile.terrainType = option === 2 /* FORCE_OCEANS */ ? TerrainType.Ocean : TerrainType.Coast;
          if (tile.terrainType === TerrainType.Ocean) {
            tile.playerLandmassId = -1;
          }
        }
      }
    });
  }
  rebuildPlayerLandmasses() {
    let nextPlayerLandmassId = 1;
    this.forAllTiles((tile) => {
      if (tile.terrainType !== TerrainType.Ocean && tile.playerLandmassId > 0 && !tile.visited) {
        this.floodFill(tile, (tile2) => {
          if (tile2.terrainType === TerrainType.Ocean) {
            return 1 /* Exclude */;
          } else {
            tile2.playerLandmassId = nextPlayerLandmassId;
            return 0 /* Include */;
          }
        });
        nextPlayerLandmassId++;
      }
    });
    this.clearVisited();
  }
  offset(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    const xOffset = x - this.m_xOffset;
    const yOffset = y - this.m_yOffset;
    if (xOffset == 0 && yOffset == 0) {
      return;
    }
    const height = this.m_tiles.length;
    const width = height > 0 ? this.m_tiles[0].length : 0;
    const offsetTiles = new Array(height);
    for (let y2 = 0; y2 < height; ++y2) {
      offsetTiles[y2] = new Array(width);
    }
    this.forAllTiles((tile) => {
      const xOffsetCoord = xOffset + tile.coord.x;
      const yOffsetCoord = yOffset + tile.coord.y;
      tile.coord.x = (xOffsetCoord % width + width) % width;
      tile.coord.y = (yOffsetCoord % height + height) % height;
      const xTileOffset = tile.coord.y % 2 == 0 ? 0 : Math.sqrt(3) * 0.25;
      tile.pos = { x: xTileOffset + tile.coord.x * Math.sqrt(3) * 0.5, y: 0.325 + tile.coord.y * 0.75 };
      offsetTiles[tile.coord.y][tile.coord.x] = tile;
    });
    this.m_tiles = offsetTiles;
    this.m_xOffset = (x % width + width) % width;
    this.m_yOffset = (y % height + height) % height;
  }
  getOffsetX() {
    return this.m_xOffset;
  }
  getOffsetY() {
    return this.m_yOffset;
  }
  alignToBestMeridian() {
    const height = this.m_tiles.length;
    const width = height > 0 ? this.m_tiles[0].length : 0;
    const scoreColumn = (xPos) => {
      let score = 0;
      for (const row of this.m_tiles) {
        const leftPos = (xPos - 1 + width) % width;
        score += isWater(row[xPos].terrainType) || isWater(row[leftPos].terrainType) ? 1 : 0;
      }
      return score;
    };
    let bestScore = 0;
    let bestColumn = 0;
    for (let x = 0; x < width; ++x) {
      const score = scoreColumn(x);
      if (score > bestScore) {
        bestColumn = x;
        bestScore = score;
      }
    }
    this.offset(this.m_xOffset - bestColumn, this.m_yOffset);
  }
  floodFill(initialTile, considerCallback) {
    initialTile.visited = 1;
    if (considerCallback(initialTile) == 1 /* Exclude */) {
      return [];
    }
    const considerationList = [initialTile];
    const returnList = [];
    while (considerationList.length > 0) {
      const tile = considerationList.pop();
      returnList.push(tile);
      this.forNeighbors(tile.coord.x, tile.coord.y, this.m_tiles, (neighbor) => {
        if (neighbor && !neighbor.visited) {
          neighbor.visited = 1;
          const result = considerCallback(neighbor);
          switch (result) {
            case 0 /* Include */:
              considerationList.push(neighbor);
              break;
            case 2 /* Halt */:
              return returnList;
          }
        }
      });
    }
    return returnList;
  }
  clearVisited() {
    for (const row of this.m_tiles) {
      for (const tile of row) {
        tile.visited = 0;
      }
    }
  }
  getTiles() {
    return this.m_tiles;
  }
}

export { FloodFillResult, HexMap, HexMapStats, HexTile, HexTileDesc, HexValidationSettings, RemoveBridgingLandmassOptions, SeparationFilterOptions, VoronoiValidationSettings, getDefaultHexSettings, hexMapSchema, lakeSettingsSchema };
//# sourceMappingURL=hex-map.js.map
