import { assignAdvancedStartRegions } from './assign-advanced-start-region.js';
import { PlayerRegion, assignStartPositionsFromTiles } from './assign-starting-plots.js';
import { generateDiscoveries } from './discovery-generator.js';
import { generateLakes, addHills, buildRainfallMap } from './elevation-terrain-generator.js';
import { designateBiomes, addFeatures } from './feature-biome-generator.js';
import { dumpContinents, dumpTerrain, dumpElevation, dumpRainfall, dumpBiomes, dumpFeatures, dumpResources } from './map-debug-helpers.js';
import { g_FlatTerrain, g_CoastTerrain, g_OceanTerrain, g_HillTerrain, g_MountainTerrain, g_VolcanoFeature, g_NavigableRiverTerrain, g_PolarWaterRows } from './map-globals.js';
import { replaceIslandResources } from './map-utilities.js';
import { addNaturalWonders } from './natural-wonder-generator.js';
import { generateResources } from './resource-generator.js';
import { generateSnow, dumpPermanentSnow } from './snow-generator.js';
import { TerrainType } from '../scripts/voronoi-types.js';
import { VoronoiPangaea } from '../scripts/voronoi_maps/pangaea.js';

console.log("Generating using script pangaea-voronoi.ts");
function requestMapData(initParams) {
  console.log(initParams.width);
  console.log(initParams.height);
  console.log(initParams.topLatitude);
  console.log(initParams.bottomLatitude);
  console.log(initParams.wrapX);
  console.log(initParams.wrapY);
  console.log(initParams.mapSize);
  engine.call("SetMapInitData", initParams);
}
function generateMap() {
  console.log("Generating a map!");
  console.log(`Age - ${GameInfo.Ages.lookup(Game.age).AgeType}`);
  const iWidth = GameplayMap.getGridWidth();
  const iHeight = GameplayMap.getGridHeight();
  const uiMapSize = GameplayMap.getMapSize();
  const mapInfo = GameInfo.Maps.lookup(uiMapSize);
  if (mapInfo == null) return;
  const iNumNaturalWonders = mapInfo.NumNaturalWonders;
  const iTilesPerLake = mapInfo.LakeGenerationFrequency;
  const iTotalPlayers = Players.getAliveMajorIds().length;
  const startTime = Date.now();
  const voronoiMap = new VoronoiPangaea();
  const seaLevelType = Configuration.getMapValue("SeaLevel");
  console.log(`Sea Level - ${seaLevelType}`);
  switch (seaLevelType) {
    case "SEA_LEVEL_LOW":
      voronoiMap.setSelectedVariantKey("Sea Level", "Low");
      break;
    case "SEA_LEVEL_HIGH":
      voronoiMap.setSelectedVariantKey("Sea Level", "High");
      break;
  }
  voronoiMap.init({ x: iWidth, y: iHeight });
  voronoiMap.setPrimaryMapSetting(["totalPlayers"], iTotalPlayers);
  voronoiMap.simulate();
  const tiles = voronoiMap.getHexTiles().getTiles();
  for (let y = 0; y < tiles.length; ++y) {
    for (let x = 0; x < tiles[y].length; ++x) {
      const tile = tiles[y][x];
      if (tile.playerLandmassId === 0) {
        TerrainBuilder.addPlotTag(x, y, PlotTags.PLOT_TAG_ISLAND);
      }
      TerrainBuilder.setLandmassRegionId(x, y, tile.playerLandmassId);
      const type = (() => {
        switch (tile.terrainType) {
          case TerrainType.Flat:
            return g_FlatTerrain;
          case TerrainType.Mountainous:
          case TerrainType.Volcano:
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
      TerrainBuilder.setTerrainType(x, y, type);
      if (tile.terrainType === TerrainType.Volcano) {
        TerrainBuilder.setFeatureType(x, y, {
          Feature: g_VolcanoFeature,
          Direction: -1,
          Elevation: 0
        });
      }
    }
  }
  const endTime = Date.now();
  console.log(`Initial Voronoi map generation took ${endTime - startTime} ms`);
  TerrainBuilder.validateAndFixTerrain();
  AreaBuilder.recalculateAreas();
  TerrainBuilder.stampContinents();
  generateLakes(iWidth, iHeight, iTilesPerLake);
  AreaBuilder.recalculateAreas();
  TerrainBuilder.buildElevation();
  addHills(iWidth, iHeight);
  buildRainfallMap(iWidth, iHeight);
  TerrainBuilder.modelRivers(5, 15, g_NavigableRiverTerrain);
  TerrainBuilder.validateAndFixTerrain();
  TerrainBuilder.defineNamedRivers();
  designateBiomes(iWidth, iHeight);
  addNaturalWonders(iWidth, iHeight, iNumNaturalWonders);
  TerrainBuilder.addFloodplains(4, 10);
  addFeatures(iWidth, iHeight);
  TerrainBuilder.validateAndFixTerrain();
  AreaBuilder.recalculateAreas();
  TerrainBuilder.storeWaterData();
  generateSnow(iWidth, iHeight);
  dumpContinents(iWidth, iHeight);
  dumpTerrain(iWidth, iHeight);
  dumpElevation(iWidth, iHeight);
  dumpRainfall(iWidth, iHeight);
  dumpBiomes(iWidth, iHeight);
  dumpFeatures(iWidth, iHeight);
  dumpPermanentSnow(iWidth, iHeight);
  generateResources(iWidth, iHeight);
  let startPositions = [];
  voronoiMap.createMajorPlayerAreas(
    (tile) => StartPositioner.getPlotFertilityForCoord(tile.coord.x, tile.coord.y)
  );
  const playerRegions = Array.from({ length: iTotalPlayers }, () => new PlayerRegion());
  playerRegions.forEach((region, index) => {
    region.regionId = index;
  });
  for (const row of tiles) {
    for (const tile of row) {
      if (tile.landmassId == 1 && tile.majorPlayerRegionId >= 0) {
        playerRegions[tile.majorPlayerRegionId].tiles.push({ x: tile.coord.x, y: tile.coord.y });
      }
    }
  }
  startPositions = assignStartPositionsFromTiles(playerRegions);
  replaceIslandResources(iWidth, iHeight, "RESOURCECLASS_TREASURE");
  generateDiscoveries(iWidth, iHeight, startPositions, g_PolarWaterRows);
  dumpResources(iWidth, iHeight);
  FertilityBuilder.recalculate();
  assignAdvancedStartRegions();
}
engine.on("RequestMapInitData", requestMapData);
engine.on("GenerateMap", generateMap);
console.log("Loaded pangaea-voronoi.ts");
//# sourceMappingURL=pangaea-voronoi.js.map
