import { g_LandmassFractal, g_CenterExponent, g_IgnoreStartSectorPctFromCtr, g_FlatTerrain, g_OceanTerrain } from './map-globals.js';
import { getTileId, tileClassIdFromValidBiome } from './resource-placement-common.js';
import { RandomImpl } from '../scripts/random-pcg-32.js';

function needHumanNearEquator() {
  const uiMapSize = GameplayMap.getMapSize();
  const mapInfo = GameInfo.Maps.lookup(uiMapSize);
  let iPlayerCount = 0;
  if (mapInfo) iPlayerCount = mapInfo.PlayersLandmass1 + mapInfo.PlayersLandmass2;
  for (let iPlay = 0; iPlay < iPlayerCount; iPlay++) {
    if (Players.getEverAlive()[iPlay] && Players.getEverAlive()[iPlay].isHuman) {
      const uiCivType = Players.getEverAlive()[iPlay].civilizationType;
      const uiLeaderType = Players.getEverAlive()[iPlay].leaderType;
      for (let startBiomeIdx = 0; startBiomeIdx < GameInfo.StartBiasBiomes.length; startBiomeIdx++) {
        const civString = GameInfo.StartBiasBiomes[startBiomeIdx]?.CivilizationType;
        const ldrString = GameInfo.StartBiasBiomes[startBiomeIdx]?.LeaderType;
        let civHash = 0;
        let ldrHash = 0;
        if (civString != null && GameInfo.Civilizations.lookup(civString) != null) {
          const civObj = GameInfo.Civilizations.lookup(civString);
          if (civObj) {
            civHash = civObj.$hash;
          }
        }
        if (ldrString != null && GameInfo.Leaders.lookup(ldrString) != null) {
          const ldrObj = GameInfo.Leaders.lookup(ldrString);
          if (ldrObj) {
            ldrHash = ldrObj.$hash;
          }
        }
        if (civHash == uiCivType || ldrHash == uiLeaderType) {
          const szBiome = GameInfo.StartBiasBiomes[startBiomeIdx].BiomeType;
          console.log(szBiome);
          if (szBiome == "BIOME_TROPICAL") {
            console.log("Human player needing a Tropical start.");
            return true;
          }
        }
      }
    }
  }
  return false;
}
function getDistanceFromContinentCenter(iX, iY, iContinentBottomRow, iContinentTopRow, iWestContinentLeftCol, iWestContinentRightCol, iEastContinentLeftCol, iEastContinentRightCol) {
  let iContinentLeftEdge = iWestContinentLeftCol;
  let iContinentRightEdge = iWestContinentRightCol;
  if (iX >= iEastContinentLeftCol) {
    iContinentLeftEdge = iEastContinentLeftCol;
    iContinentRightEdge = iEastContinentRightCol;
  }
  const iContinentHeight = iContinentTopRow - iContinentBottomRow;
  const iContinentWidth = iContinentRightEdge - iContinentLeftEdge;
  const iContinentCenterX = iContinentLeftEdge + iContinentWidth / 2;
  const iContinentCenterY = iContinentBottomRow + iContinentHeight / 2;
  const iDistance = GameplayMap.getPlotDistance(iX, iY, iContinentCenterX, iContinentCenterY);
  return iDistance;
}
function getMaxDistanceFromContinentCenter(iX, iContinentBottomRow, iContinentTopRow, iWestContinentLeftCol, iWestContinentRightCol, iEastContinentLeftCol, iEastContinentRightCol) {
  let iContinentLeftEdge = iWestContinentLeftCol;
  let iContinentRightEdge = iWestContinentRightCol;
  if (iX >= iEastContinentLeftCol) {
    iContinentLeftEdge = iEastContinentLeftCol;
    iContinentRightEdge = iEastContinentRightCol;
  }
  const iContinentHeight = iContinentTopRow - iContinentBottomRow;
  const iContinentWidth = iContinentRightEdge - iContinentLeftEdge;
  const iContinentCenterX = iContinentLeftEdge + iContinentWidth / 2;
  const iContinentCenterY = iContinentBottomRow + iContinentHeight / 2;
  const iDistance = GameplayMap.getPlotDistance(
    iContinentLeftEdge,
    iContinentBottomRow,
    iContinentCenterX,
    iContinentCenterY
  );
  return iDistance;
}
function getSector(iX, iY, iRows, iCols, iContinentBottomRow, iContinentTopRow, iWestContinentLeftCol, iWestContinentRightCol, iEastContinentLeftCol) {
  let iContinentBase = 0;
  if (iX >= iEastContinentLeftCol) {
    iContinentBase += iRows * iCols;
    iX = iX - iEastContinentLeftCol + iWestContinentLeftCol;
  }
  const iXSector = Math.floor(
    (iX - iWestContinentLeftCol) / ((iWestContinentRightCol - iWestContinentLeftCol) / iCols)
  );
  const iYSector = Math.floor(
    (iY - iContinentBottomRow) / ((iContinentTopRow - iContinentBottomRow) / iRows)
  );
  const iSector = iYSector * iCols + iXSector;
  const iReturnValue = iContinentBase + iSector;
  return iReturnValue;
}
function getSectorRegion(iSector, iRows, iCols, iContinentBottomRow, iContinentTopRow, iWestContinentLeftCol, iWestContinentRightCol, iEastContinentLeftCol) {
  const region = { west: 0, east: 0, south: 0, north: 0, continent: 0 };
  if (iCols == 0) return region;
  const bIsEastContinent = iSector >= iRows * iCols;
  let iSectorAdjust = 0;
  if (bIsEastContinent) {
    iSectorAdjust = iRows * iCols;
  }
  const row = Math.floor((iSector - iSectorAdjust) / iCols);
  const col = Math.floor(iSector - iSectorAdjust - row * iCols);
  const iSectorWidth = (iWestContinentRightCol - iWestContinentLeftCol) / iCols;
  const iSectorHeight = (iContinentTopRow - iContinentBottomRow) / iRows;
  let iXAdjust = iWestContinentLeftCol;
  if (bIsEastContinent) {
    iXAdjust = iEastContinentLeftCol;
  }
  region.west = Math.floor(iXAdjust + iSectorWidth * col);
  region.east = Math.floor(iXAdjust + iSectorWidth * (col + 1));
  region.south = Math.floor(iContinentBottomRow + iSectorHeight * row);
  region.north = Math.floor(iContinentBottomRow + iSectorHeight * (row + 1));
  region.continent = -1;
  return region;
}
function getHeightAdjustingForStartSector(iX, iY, iWaterHeight, iFractalWeight, iCenterWeight, iStartSectorWeight, continent1, continent2, iStartSectorRows, iStartSectorCols, startSectors) {
  let iPlotHeight = FractalBuilder.getHeight(g_LandmassFractal, iX, iY);
  iPlotHeight *= iFractalWeight;
  const iDistanceFromCenter = getDistanceFromContinentCenter(
    iX,
    iY,
    continent1.south,
    continent1.north,
    continent1.west,
    continent1.east,
    continent2.west,
    continent2.east
  );
  const iMaxDistanceFromCenter = getMaxDistanceFromContinentCenter(
    iX,
    continent1.south,
    continent1.north,
    continent1.west,
    continent1.east,
    continent2.west,
    continent2.east
  );
  const iPercentFromCenter = Math.min(100 * iDistanceFromCenter / iMaxDistanceFromCenter, 100);
  iPlotHeight += iCenterWeight * Math.pow(iWaterHeight * (100 - iPercentFromCenter) / 100, g_CenterExponent);
  if (iPercentFromCenter < g_IgnoreStartSectorPctFromCtr) {
    const iSector = getSector(
      iX,
      iY,
      iStartSectorRows,
      iStartSectorCols,
      continent1.south,
      continent1.north,
      continent1.west,
      continent1.east,
      continent2.west
    );
    if (startSectors[iSector]) {
      const sectorCenterX = (continent1.west + continent1.east) / 2;
      const sectorCenterY = (continent1.south + continent1.north) / 2;
      const distanceToSectorCenter = Math.sqrt((iX - sectorCenterX) ** 2 + (iY - sectorCenterY) ** 2);
      const maxSectorRadius = Math.min(continent1.east - continent1.west, continent1.north - continent1.south) / 3;
      const sectorBoostFactor = 1 - Math.pow(Math.min(distanceToSectorCenter / maxSectorRadius, 1), 1.5);
      iPlotHeight += iStartSectorWeight * iWaterHeight * sectorBoostFactor;
      if (iPercentFromCenter < g_IgnoreStartSectorPctFromCtr * 2 / 3) {
        iPlotHeight += iStartSectorWeight * iWaterHeight;
      }
    }
    if (iStartSectorCols > 2 && iStartSectorRows > 2) {
      let iTestSector = iSector;
      if (iTestSector >= iStartSectorRows * iStartSectorCols) {
        iTestSector = iSector - iStartSectorRows * iStartSectorCols;
      }
      if (iTestSector % iStartSectorCols > 0 && iTestSector % iStartSectorCols < iStartSectorCols - 1) {
        if (iTestSector >= iStartSectorCols && iTestSector < iStartSectorRows * iStartSectorCols - iStartSectorCols) {
          iPlotHeight += iCenterWeight * iWaterHeight;
        }
      }
    }
  }
  return iPlotHeight;
}
function createIslands(iWidth, iHeight, continent1, continent2, iSize) {
  FractalBuilder.create(g_LandmassFractal, iWidth, iHeight, iSize, 0);
  const iwater_percent = 50 + iSize * 7;
  const iWaterHeight = FractalBuilder.getHeightFromPercent(g_LandmassFractal, iwater_percent);
  const iBuffer = Math.floor(iWidth / 24);
  const terrain = g_FlatTerrain;
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const iRandom = TerrainBuilder.getRandomNumber(iBuffer, "Random Top/Bottom Edges");
      if (iY >= continent1.south + iRandom && iY <= continent1.north - iRandom && (iX >= continent1.west && iX <= continent1.east || iX >= continent2.west && iX <= continent2.east)) {
        const iPlotHeight = FractalBuilder.getHeight(g_LandmassFractal, iX, iY);
        if (iPlotHeight > iWaterHeight) {
          TerrainBuilder.setTerrainType(iX, iY, terrain);
          TerrainBuilder.setPlotTag(iX, iY, PlotTags.PLOT_TAG_NONE);
          TerrainBuilder.addPlotTag(iX, iY, PlotTags.PLOT_TAG_ISLAND);
        }
      }
    }
  }
}
function applyCoastalErosion(continent, strength, falloff, minRadiusFactor, verticalOnly) {
  console.log(
    `Applying Coastal Erosion with strength ${strength} to continent at (${continent.west}, ${continent.east})`
  );
  const centerX = (continent.west + continent.east) / 2;
  const centerY = (continent.south + continent.north) / 2;
  const maxRadiusY = (continent.north - continent.south) / 2;
  const maxRadius = verticalOnly ? maxRadiusY : Math.min(continent.east - continent.west, continent.north - continent.south) / 2;
  const minRadius = maxRadius * minRadiusFactor;
  const erosionTiles = [];
  for (let iY = continent.south; iY <= continent.north; iY++) {
    for (let iX = continent.west; iX <= continent.east; iX++) {
      const terrain = GameplayMap.getTerrainType(iX, iY);
      if (terrain == g_OceanTerrain) continue;
      let distance = 0;
      if (verticalOnly) {
        distance = Math.abs(iY - (continent.south + continent.north) / 2);
      } else {
        distance = Math.sqrt((iX - centerX) ** 2 + (iY - centerY) ** 2);
      }
      if (distance <= minRadius) continue;
      const erosionFactor = distance > minRadius ? ((distance - minRadius) / (maxRadius - minRadius)) ** falloff : 0;
      const erosionThreshold = distance > minRadius ? strength * erosionFactor : 0;
      const randomChance = TerrainBuilder.getRandomNumber(100, "Coastal Erosion") / 100;
      if (randomChance < erosionThreshold) {
        erosionTiles.push({ x: iX, y: iY });
      }
    }
  }
  const expandedErosion = /* @__PURE__ */ new Set();
  function addErosionTile(x, y) {
    const key = `${x},${y}`;
    if (!expandedErosion.has(key)) {
      expandedErosion.add(key);
      TerrainBuilder.setTerrainType(x, y, g_OceanTerrain);
    }
  }
  for (const tile of erosionTiles) {
    addErosionTile(tile.x, tile.y);
    const expansionChance = TerrainBuilder.getRandomNumber(100, "Erosion Expansion") / 100;
    if (expansionChance < 0.7) {
      const neighbors = [
        { x: tile.x + 1, y: tile.y },
        { x: tile.x - 1, y: tile.y },
        { x: tile.x, y: tile.y + 1 },
        { x: tile.x, y: tile.y - 1 }
      ];
      for (const neighbor of neighbors) {
        if (GameplayMap.getTerrainType(neighbor.x, neighbor.y) !== g_OceanTerrain) {
          addErosionTile(neighbor.x, neighbor.y);
        }
      }
    }
  }
  console.log("Coastal Erosion Applied.");
}
function applyCoastalErosionAdjustingForStartSectors(continent1, continent2, strength, falloff, minRadiusFactor, iStartSectorRows, iStartSectorCols, startSectors) {
  console.log(
    `Applying Coastal Erosion Ajdusting for Start Sectors with strength ${strength} to continent at (${continent1.west}, ${continent1.east})`
  );
  const centerX = (continent1.west + continent1.east) / 2;
  const centerY = (continent1.south + continent1.north) / 2;
  const maxRadius = Math.min(continent1.east - continent1.west, continent1.north - continent1.south) / 2;
  const minRadius = maxRadius * minRadiusFactor;
  const erosionTiles = [];
  for (let iY = continent1.south; iY <= continent1.north; iY++) {
    for (let iX = continent1.west; iX <= continent1.east; iX++) {
      const terrain = GameplayMap.getTerrainType(iX, iY);
      if (terrain == g_OceanTerrain) continue;
      let distance = 0;
      distance = Math.sqrt((iX - centerX) ** 2 + (iY - centerY) ** 2);
      if (distance <= minRadius) continue;
      const erosionFactor = distance > minRadius ? ((distance - minRadius) / (maxRadius - minRadius)) ** falloff : 0;
      let erosionThreshold = distance > minRadius ? strength * erosionFactor : 0;
      const randomChance = TerrainBuilder.getRandomNumber(100, "Coastal Erosion") / 100;
      const iSector = getSector(
        iX,
        iY,
        iStartSectorRows,
        iStartSectorCols,
        continent1.south,
        continent1.north,
        continent1.west,
        continent1.east,
        continent2.west
      );
      if (startSectors[iSector]) {
        if (!isNearContinentCorner(iX, iY, continent1, 0.1)) {
          erosionThreshold = erosionThreshold / 10;
        }
      }
      if (randomChance < erosionThreshold) {
        erosionTiles.push({ x: iX, y: iY });
      }
    }
  }
  function isNearContinentCorner(iX, iY, continent, bufferScale) {
    const continentWidth = continent.east - continent.west;
    const continentHeight = continent.north - continent.south;
    const bufferX = Math.max(2, Math.min(Math.floor(continentWidth * bufferScale), 10));
    const bufferY = Math.max(2, Math.min(Math.floor(continentHeight * bufferScale), 10));
    const topLeft = { x: continent.west, y: continent.north };
    const topRight = { x: continent.east, y: continent.north };
    const bottomLeft = { x: continent.west, y: continent.south };
    const bottomRight = { x: continent.east, y: continent.south };
    function isNearCorner(cornerX, cornerY) {
      return Math.abs(iX - cornerX) <= bufferX && Math.abs(iY - cornerY) <= bufferY;
    }
    return isNearCorner(topLeft.x, topLeft.y) || isNearCorner(topRight.x, topRight.y) || isNearCorner(bottomLeft.x, bottomLeft.y) || isNearCorner(bottomRight.x, bottomRight.y);
  }
  const expandedErosion = /* @__PURE__ */ new Set();
  function addErosionTile(x, y) {
    const key = `${x},${y}`;
    if (!expandedErosion.has(key)) {
      expandedErosion.add(key);
      TerrainBuilder.setTerrainType(x, y, g_OceanTerrain);
    }
  }
  for (const tile of erosionTiles) {
    addErosionTile(tile.x, tile.y);
    const expansionChance = TerrainBuilder.getRandomNumber(100, "Erosion Expansion") / 100;
    if (expansionChance < 0.7) {
      const neighbors = [
        { x: tile.x + 1, y: tile.y },
        { x: tile.x - 1, y: tile.y },
        { x: tile.x, y: tile.y + 1 },
        { x: tile.x, y: tile.y - 1 }
      ];
      for (const neighbor of neighbors) {
        if (GameplayMap.getTerrainType(neighbor.x, neighbor.y) !== g_OceanTerrain) {
          addErosionTile(neighbor.x, neighbor.y);
        }
      }
    }
  }
  console.log("Coastal Erosion Applied.");
}
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = TerrainBuilder.getRandomNumber(currentIndex, "Array Shuffle");
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
function getContinentEdgeHeightBump(iX, iY) {
  if (GameplayMap.findSecondContinent(iX, iY, 1)) {
    return 100;
  } else if (GameplayMap.findSecondContinent(iX, iY, 2)) {
    return 40;
  } else if (GameplayMap.findSecondContinent(iX, iY, 3)) {
    return 20;
  }
  return 0;
}
function getDistanceToClosestStart(iX, iY, numFoundEarlier, startPositions) {
  let minDistance = 32768;
  for (let iStart = 0; iStart < numFoundEarlier; iStart++) {
    const startPlotIndex = startPositions[iStart];
    const iStartX = startPlotIndex % GameplayMap.getGridWidth();
    const iStartY = Math.floor(startPlotIndex / GameplayMap.getGridWidth());
    const distance = GameplayMap.getPlotDistance(iX, iY, iStartX, iStartY);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  return minDistance;
}
function isAdjacentToNaturalWonder(iX, iY) {
  for (let iDirection = 0; iDirection < DirectionTypes.NUM_DIRECTION_TYPES; iDirection++) {
    const iIndex = GameplayMap.getIndexFromXY(iX, iY);
    const iLocation = GameplayMap.getLocationFromIndex(iIndex);
    const iAdjacentX = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).x;
    const iAdjacentY = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).y;
    if (GameplayMap.isNaturalWonder(iAdjacentX, iAdjacentY)) {
      return true;
    }
  }
  return false;
}
function isCliff(iX, iY) {
  for (let iDirection = 0; iDirection < DirectionTypes.NUM_DIRECTION_TYPES; iDirection++) {
    if (GameplayMap.isCliffCrossing(iX, iY, iDirection) == false) {
      return true;
    }
  }
  return false;
}
function isOceanAccess(iX, iY) {
  for (let iDirection = 0; iDirection < DirectionTypes.NUM_DIRECTION_TYPES; iDirection++) {
    const iIndex = GameplayMap.getIndexFromXY(iX, iY);
    const iLocation = GameplayMap.getLocationFromIndex(iIndex);
    const iAdjacentX = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).x;
    const iAdjacentY = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).y;
    const iAdjacentIndex = GameplayMap.getIndexFromXY(iAdjacentX, iAdjacentY);
    if (GameplayMap.getRiverType(iAdjacentX, iAdjacentY) == RiverTypes.RIVER_NAVIGABLE && MapRivers.isRiverConnectedToOcean(iAdjacentIndex)) {
      return true;
    }
    if (GameplayMap.getAreaId(iAdjacentX, iAdjacentY) > -1 && GameplayMap.getAreaIsWater(iAdjacentX, iAdjacentY) && AreaBuilder.isAreaConnectedToOcean(GameplayMap.getAreaId(iAdjacentX, iAdjacentY))) {
      return true;
    }
  }
  return false;
}
function removeRuralDistrict(iX, iY) {
  const districtID = MapCities.getDistrict(iX, iY);
  if (districtID != null) {
    const cityID = MapCities.getCity(iX, iY);
    if (cityID != null) {
      const city = Cities.get(cityID);
      if (city != null) {
        if (city.location.x != iX || city.location.y != iY) {
          console.log("Removed district at (" + iX + ", " + iY + ")");
          city.Districts?.removeDistrict(districtID);
        }
      }
    }
  }
}
function placeRuralDistrict(iX, iY) {
  const cityID = MapCities.getCity(iX, iY);
  if (cityID != null) {
    const city = Cities.get(cityID);
    if (city != null) {
      if (city.location.x != iX || city.location.y != iY) {
        console.log("Placed district at (" + iX + ", " + iY + ")");
        city.Growth?.claimPlot({ x: iX, y: iY });
      }
    }
  }
}
function replaceIslandResources(iWidth, iHeight, zResourceClassType) {
  const candidates = [];
  let existingCount = 0;
  for (let y = 0; y < iHeight; y++) {
    for (let x = 0; x < iWidth; x++) {
      if (!GameplayMap.hasPlotTag(x, y, PlotTags.PLOT_TAG_ISLAND)) continue;
      const r = GameplayMap.getResourceType(x, y);
      if (r === ResourceTypes.NO_RESOURCE) continue;
      const def = GameInfo.Resources.lookup(r);
      if (!def) continue;
      if (def.ResourceClassType === zResourceClassType) {
        existingCount++;
        continue;
      }
      candidates.push({ x, y, resourceIdx: r, tid: getTileId(x, y) });
    }
  }
  const eligibleByTid = /* @__PURE__ */ new Map();
  for (const rvb of GameInfo.Resource_ValidBiomes) {
    const def = GameInfo.Resources.find((r) => r.ResourceType === rvb.ResourceType);
    if (!def || !def.Tradeable || def.ResourceClassType !== zResourceClassType) continue;
    const weight = rvb.Weight ?? def.Weight;
    if (weight <= 0) continue;
    const tid = tileClassIdFromValidBiome(rvb);
    if (tid === void 0) continue;
    if (!eligibleByTid.has(tid)) {
      eligibleByTid.set(tid, []);
    }
    eligibleByTid.get(tid).push({ resourceIdx: def.$index, weight });
  }
  let replaced = 0;
  let noneEligible = 0;
  let noneCanHave = 0;
  const validResources = [];
  for (const candidate of candidates) {
    const options = eligibleByTid.get(candidate.tid);
    if (!options) {
      noneEligible++;
      continue;
    }
    validResources.length = 0;
    let totalWeight = 0;
    for (const option of options) {
      if (ResourceBuilder.canHaveResource(candidate.x, candidate.y, option.resourceIdx, true)) {
        validResources.push(option);
        totalWeight += option.weight;
      }
    }
    if (validResources.length === 0) {
      noneCanHave++;
      continue;
    }
    let chosen = validResources[0].resourceIdx;
    if (validResources.length > 1) {
      const roll = RandomImpl.fRand("Island Resource Replacement Pick") * totalWeight;
      let cumulativeWeight = 0;
      for (let k = 0; k < validResources.length; k++) {
        cumulativeWeight += validResources[k].weight;
        if (roll < cumulativeWeight) {
          chosen = validResources[k].resourceIdx;
          break;
        }
      }
    }
    removeRuralDistrict(candidate.x, candidate.y);
    ResourceBuilder.setResourceType(candidate.x, candidate.y, ResourceTypes.NO_RESOURCE);
    ResourceBuilder.setResourceType(candidate.x, candidate.y, chosen);
    placeRuralDistrict(candidate.x, candidate.y);
    replaced++;
  }
  console.log(
    `replaceIslandResources(): Existing=${existingCount}, Candidates=${candidates.length}, Replaced=${replaced}, No eligible replacement=${noneEligible}, Denied by canHaveResource()=${noneCanHave}`
  );
}
function isAdjacentToLand(iX, iY) {
  if (GameplayMap.hasPlotTag(iX, iY, PlotTags.PLOT_TAG_ISLAND)) {
    return true;
  } else {
    for (let iDirection = 0; iDirection < DirectionTypes.NUM_DIRECTION_TYPES; iDirection++) {
      const iIndex = GameplayMap.getIndexFromXY(iX, iY);
      const iLocation = GameplayMap.getLocationFromIndex(iIndex);
      const iAdjacentX = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).x;
      const iAdjacentY = GameplayMap.getAdjacentPlotLocation(iLocation, iDirection).y;
      if (GameplayMap.hasPlotTag(iAdjacentX, iAdjacentY, PlotTags.PLOT_TAG_ISLAND)) {
        return true;
      }
    }
  }
  return false;
}
function shiftTerrain(iWidth, iHeight) {
  let shift_x = 0;
  let shift_y = 0;
  shift_x = determineXShift(iWidth, iHeight);
  shift_y = determineYShift(iWidth, iHeight);
  console.log("shift_x: " + shift_x);
  console.log("shift_y: ", shift_y);
  shiftPlotTypesBy(iWidth, iHeight, shift_x, shift_y);
}
function shiftPlotTypesBy(iWidth, iHeight, xshift, yshift) {
  if (xshift > 0 || yshift > 0) {
    const iTempTerrainArray = Array(iWidth).fill(g_OceanTerrain).map((_) => Array(iHeight));
    for (let iX = 0; iX < iWidth; iX++) {
      for (let iY = 0; iY < iHeight; iY++) {
        iTempTerrainArray[iX][iY] = GameplayMap.getTerrainType(iX, iY);
      }
    }
    for (let iDestX = 0; iDestX < iWidth; iDestX++) {
      for (let iDestY = 0; iDestY < iHeight; iDestY++) {
        const iSourceX = (iDestX + xshift) % iWidth;
        const iSourceY = (iDestY + yshift) % iHeight;
        const iTerrain = iTempTerrainArray[iSourceX][iSourceY];
        TerrainBuilder.setTerrainType(iDestX, iDestY, iTerrain);
      }
    }
  }
}
function determineXShift(iWidth, iHeight) {
  const waterTotals = [];
  for (let iX = 0; iX < iWidth; iX++) {
    let colWaterCount = 0;
    for (let iY = 0; iY < iHeight; iY++) {
      if (GameplayMap.getTerrainType(iX, iY) == g_OceanTerrain) {
        colWaterCount = colWaterCount + 1;
      }
    }
    waterTotals.push(colWaterCount);
  }
  const columnGroups = [];
  const groupRadius = Math.floor(iWidth / 10);
  for (let columnIndex = 0; columnIndex < iWidth; columnIndex++) {
    let currentGroupTotal = 0;
    for (let currentCol = columnIndex - groupRadius; currentCol <= columnIndex + groupRadius; currentCol++) {
      const currentIdx = (currentCol + iWidth) % iWidth;
      currentGroupTotal = currentGroupTotal + waterTotals[currentIdx];
    }
    columnGroups.push(currentGroupTotal);
  }
  let bestValue = 0;
  let bestGroup = 0;
  for (let columnIndex = 0; columnIndex < iWidth; columnIndex++) {
    if (columnGroups[columnIndex] > bestValue) {
      bestValue = columnGroups[columnIndex];
      bestGroup = columnIndex;
    }
  }
  const x_shift = bestGroup;
  return x_shift;
}
function determineYShift(iWidth, iHeight) {
  const waterTotals = [];
  for (let iY = 0; iY < iHeight; iY++) {
    let rowWaterCount = 0;
    for (let iX = 0; iX < iWidth; iX++) {
      if (GameplayMap.getTerrainType(iX, iY) == g_OceanTerrain) {
        rowWaterCount = rowWaterCount + 1;
      }
    }
    waterTotals.push(rowWaterCount);
  }
  const rowGroups = [];
  const groupRadius = Math.floor(iHeight / 15);
  for (let rowIndex = 0; rowIndex < iHeight; rowIndex++) {
    let currentGroupTotal = 0;
    for (let currentRow = rowIndex - groupRadius; currentRow <= rowIndex + groupRadius; currentRow++) {
      const currentIdx = (currentRow + iHeight) % iHeight;
      currentGroupTotal = currentGroupTotal + waterTotals[currentIdx];
    }
    rowGroups.push(currentGroupTotal);
  }
  let bestValue = 0;
  let bestGroup = 0;
  for (let rowIndex = 0; rowIndex < iHeight; rowIndex++) {
    if (rowGroups[rowIndex] > bestValue) {
      bestValue = rowGroups[rowIndex];
      bestGroup = rowIndex;
    }
  }
  const y_shift = bestGroup;
  return y_shift;
}
function createOrganicLandmasses(iWidth, iHeight, continent1, continent2, iFractalGrain, iWaterPercent, iLargestContinentPercent) {
  let bLargeEnoughFound = false;
  while (!bLargeEnoughFound) {
    let iFlags = 0;
    iFlags = 1;
    iFlags += 2;
    FractalBuilder.create(g_LandmassFractal, iWidth, iHeight, iFractalGrain, iFlags);
    const iWaterHeight = FractalBuilder.getHeightFromPercent(g_LandmassFractal, iWaterPercent);
    for (let iY = 0; iY < iHeight; iY++) {
      for (let iX = 0; iX < iWidth; iX++) {
        let terrain = g_OceanTerrain;
        const iPlotHeight = FractalBuilder.getHeight(g_LandmassFractal, iX, iY);
        if (iPlotHeight >= iWaterHeight) {
          terrain = g_FlatTerrain;
        }
        TerrainBuilder.setTerrainType(iX, iY, terrain);
      }
    }
    shiftTerrain(iWidth, iHeight);
    let iTilesChoppedInGutter = 0;
    for (let iY = 0; iY < iHeight; iY++) {
      for (let iX = 0; iX < iWidth; iX++) {
        if (GameplayMap.getTerrainType(iX, iY) != g_OceanTerrain) {
          if (iY < continent1.south || iY >= continent1.north) {
            TerrainBuilder.setTerrainType(iX, iY, g_OceanTerrain);
          } else if (iY == continent1.south || iY == continent1.north - 1) {
            if (TerrainBuilder.getRandomNumber(2, "Feather hard edges") == 0) {
              TerrainBuilder.setTerrainType(iX, iY, g_OceanTerrain);
            }
          }
          if (iX < continent1.west || iX > continent2.east - 1) {
            TerrainBuilder.setTerrainType(iX, iY, g_OceanTerrain);
          } else if (iX == continent1.west || iX == continent2.east - 1) {
            if (TerrainBuilder.getRandomNumber(2, "Feather hard edges") == 0) {
              TerrainBuilder.setTerrainType(iX, iY, g_OceanTerrain);
            }
          }
          if (iX > continent1.east - 1 && iX < continent2.west) {
            iTilesChoppedInGutter = iTilesChoppedInGutter + 1;
            TerrainBuilder.setTerrainType(iX, iY, g_OceanTerrain);
          } else if (iX == continent1.east - 1 || iX == continent2.west) {
            if (TerrainBuilder.getRandomNumber(2, "Feather hard edges") == 0) {
              TerrainBuilder.setTerrainType(iX, iY, g_OceanTerrain);
            }
          }
        }
      }
    }
    console.log("Tiles in Center Gutter:" + iTilesChoppedInGutter);
    const iMaxTilesToChop = iHeight * (continent2.west - continent1.east) / 2;
    console.log("Max Tiles to Chop: " + iMaxTilesToChop);
    if (iTilesChoppedInGutter >= iMaxTilesToChop) {
      console.log("Fail. Too many tiles lost in center gutter");
    } else {
      AreaBuilder.recalculateAreas();
      const iAreaID = AreaBuilder.findBiggestArea(false);
      const iPlotCount = AreaBuilder.getPlotCount(iAreaID);
      console.log("Plots in Largest Landmass:" + iPlotCount);
      const iPlotsNeeded = iWidth * iHeight * iLargestContinentPercent / 100;
      console.log("Plots Needed:" + iPlotsNeeded);
      if (iPlotCount >= iPlotsNeeded) {
        console.log("Useable continent found");
        bLargeEnoughFound = true;
      }
    }
  }
}
function clearContinent(continent) {
  for (let iY = continent.south; iY <= continent.north; iY++) {
    for (let iX = continent.west; iX <= continent.east; iX++) {
      const terrain = g_OceanTerrain;
      TerrainBuilder.setTerrainType(iX, iY, terrain);
    }
  }
}
function markLandmassRegionId(continent, id) {
  for (let iY = continent.south; iY <= continent.north; iY++) {
    for (let iX = continent.west; iX <= continent.east; iX++) {
      if (GameplayMap.getTerrainType(iX, iY) != g_OceanTerrain) {
        TerrainBuilder.setLandmassRegionId(iX, iY, id);
      }
    }
  }
}

export { applyCoastalErosion, applyCoastalErosionAdjustingForStartSectors, clearContinent, createIslands, createOrganicLandmasses, determineXShift, determineYShift, getContinentEdgeHeightBump, getDistanceFromContinentCenter, getDistanceToClosestStart, getHeightAdjustingForStartSector, getMaxDistanceFromContinentCenter, getSector, getSectorRegion, isAdjacentToLand, isAdjacentToNaturalWonder, isCliff, isOceanAccess, markLandmassRegionId, needHumanNearEquator, placeRuralDistrict, removeRuralDistrict, replaceIslandResources, shiftPlotTypesBy, shiftTerrain, shuffle };
//# sourceMappingURL=map-utilities.js.map
