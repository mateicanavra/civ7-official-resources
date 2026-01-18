import { assignAdvancedStartRegions } from './assign-advanced-start-region.js';
import { PlayerRegion, assignStartPositionsFromTiles } from './assign-starting-plots.js';
import { generateDiscoveries } from './discovery-generator.js';
import { generateLakes, addHills, buildRainfallMap } from './elevation-terrain-generator.js';
import { designateBiomes, addFeatures } from './feature-biome-generator.js';
import { dumpContinents, dumpTerrain, dumpElevation, dumpRainfall, dumpBiomes, dumpFeatures, dumpResources } from './map-debug-helpers.js';
import { g_PolarWaterRows, g_FlatTerrain, g_MountainTerrain, g_HillTerrain, g_VolcanoFeature, g_OceanTerrain, g_CoastTerrain, g_NavigableRiverTerrain } from './map-globals.js';
import { replaceIslandResources } from './map-utilities.js';
import { addNaturalWonders } from './natural-wonder-generator.js';
import { generateResources } from './resource-generator.js';
import { generateSnow, dumpPermanentSnow } from './snow-generator.js';
import { kdTree, TerrainType } from '../scripts/kd-tree.js';
import { VoronoiPangaea } from '../scripts/voronoi_maps/pangaea.js';
import { RuleAvoidEdge } from '../scripts/voronoi_rules/avoid-edge.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/voronoi.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/rbtree.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/vertex.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/edge.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/cell.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/diagram.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/halfedge.js';
import '../../core/scripts/MathHelpers.js';
import '../scripts/random-pcg-32.js';
import '../scripts/voronoi_generators/map-generator.js';
import '../scripts/voronoi_maps/map-common.js';
import '../scripts/voronoi-builder.js';
import '../scripts/voronoi-hex.js';
import '../scripts/heap.js';
import '../scripts/voronoi_generators/continent-generator.js';
import '../scripts/quadtree.js';
import '../scripts/voronoi_rules/near-other-region.js';
import '../../core/scripts/external/TypeScript-Voronoi-master/src/site.js';
import '../scripts/voronoi_rules/rules-base.js';
import '../scripts/voronoi-region.js';
import '../scripts/voronoi_rules/avoid-other-regions.js';
import '../scripts/voronoi_rules/cell-area.js';
import '../scripts/voronoi_rules/near-map-center.js';
import '../scripts/voronoi_rules/near-neighbor.js';
import '../scripts/voronoi_rules/near-plate-boundary.js';
import '../scripts/voronoi_rules/near-region-seed.js';
import '../scripts/voronoi_rules/neighbors-in-region.js';
import '../scripts/voronoi_rules/prefer-latitude.js';

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
  voronoiMap.init(mapInfo.$index);
  const rules = voronoiMap.getGenerator().getRules();
  for (const value of Object.values(rules)) {
    for (const rule of value) {
      if (rule.name == RuleAvoidEdge.getName()) {
        rule.configValues.poleDistance = g_PolarWaterRows;
      }
    }
  }
  const generatorSettings = voronoiMap.getGenerator().getSettings();
  generatorSettings.landmass[0].playerAreas = iTotalPlayers;
  voronoiMap.simulate();
  const tiles = voronoiMap.getHexTiles().getTiles();
  const landmassKdTree = new kdTree((tile) => tile.pos);
  landmassKdTree.build(tiles.flatMap((row) => row.filter((tile) => tile.landmassId > 0)));
  for (let y = 0; y < tiles.length; ++y) {
    for (let x = 0; x < tiles[y].length; ++x) {
      const tile = tiles[y][x];
      if (tile.landmassId > 0) {
        TerrainBuilder.setLandmassRegionId(x, y, tile.landmassId);
      }
      if (tile.landmassId === 2) {
        TerrainBuilder.addPlotTag(x, y, PlotTags.PLOT_TAG_ISLAND);
      }
      if (tile.isLand()) {
        const type = tile.terrainType === TerrainType.Flat ? g_FlatTerrain : tile.terrainType === TerrainType.Mountainous || tile.terrainType === TerrainType.Volcano ? g_MountainTerrain : tile.terrainType === TerrainType.Rough ? g_HillTerrain : g_FlatTerrain;
        TerrainBuilder.setTerrainType(x, y, type);
        if (tile.terrainType === TerrainType.Volcano) {
          TerrainBuilder.setFeatureType(x, y, {
            Feature: g_VolcanoFeature,
            Direction: -1,
            Elevation: 0
          });
        }
      } else {
        const type = tile.terrainType === TerrainType.Ocean ? g_OceanTerrain : g_CoastTerrain;
        TerrainBuilder.setTerrainType(x, y, type);
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
    region.landmassId = 0;
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
