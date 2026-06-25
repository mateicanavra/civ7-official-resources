import { assignAdvancedStartRegions } from './assign-advanced-start-region.js';
import { assignStartPositionsFromHexMap } from './assign-starting-plots.js';
import { generateDiscoveries } from './discovery-generator.js';
import { g_PolarWaterRows } from './map-globals.js';
import { profileScope } from '../scripts/profiling.js';
import { generateMapFeatures } from '../scripts/common-generation.js';
import { VoronoiContinents } from '../scripts/voronoi_maps/continents.js';

console.log("Generating using script Continents-Voronoi.ts");
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
async function generateMap() {
  console.log("Generating a map!");
  console.log(`Age - ${GameInfo.Ages.lookup(Game.age).AgeType}`);
  const voronoiScope = new profileScope("Continents Voronoi Generation");
  const iWidth = GameplayMap.getGridWidth();
  const iHeight = GameplayMap.getGridHeight();
  const uiMapSize = GameplayMap.getMapSize();
  const mapInfo = GameInfo.Maps.lookup(uiMapSize);
  if (mapInfo == null) return;
  const iTotalPlayers = Players.getAliveMajorIds().length;
  const voronoiMap = new VoronoiContinents();
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
  generateMapFeatures(voronoiMap.getHexTiles());
  const fertilityGetter = (tile) => StartPositioner.getPlotFertilityForCoord(tile.coord.x, tile.coord.y);
  voronoiMap.createMajorPlayerAreas(fertilityGetter);
  const startPositions = assignStartPositionsFromHexMap(voronoiMap.getHexTiles());
  generateDiscoveries(iWidth, iHeight, startPositions, g_PolarWaterRows);
  FertilityBuilder.recalculate();
  assignAdvancedStartRegions();
  voronoiScope.end();
}
engine.on("RequestMapInitData", requestMapData);
engine.on("GenerateMap", generateMap);
//# sourceMappingURL=continents-voronoi.js.map
