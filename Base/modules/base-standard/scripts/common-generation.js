import { addHills, buildRainfallMap } from '../maps/elevation-terrain-generator.js';
import { designateBiomes, addFeatures } from '../maps/feature-biome-generator.js';
import { dumpContinents, dumpTerrain, dumpElevation, dumpRainfall, dumpBiomes, dumpFeatures, dumpResources } from '../maps/map-debug-helpers.js';
import { g_NavigableRiverTerrain } from '../maps/map-globals.js';
import { addNaturalWonders } from '../maps/natural-wonder-generator.js';
import { generateResources } from '../maps/resource-generator.js';
import { generateSnow, dumpPermanentSnow } from '../maps/snow-generator.js';
import { profileScope, profileFunction } from './profiling.js';

var GenerationPhases = /* @__PURE__ */ ((GenerationPhases2) => {
  GenerationPhases2[GenerationPhases2["Lakes"] = 1] = "Lakes";
  GenerationPhases2[GenerationPhases2["Elevation"] = 2] = "Elevation";
  GenerationPhases2[GenerationPhases2["Hills"] = 4] = "Hills";
  GenerationPhases2[GenerationPhases2["Rainfall"] = 8] = "Rainfall";
  GenerationPhases2[GenerationPhases2["Rivers"] = 16] = "Rivers";
  GenerationPhases2[GenerationPhases2["Biomes"] = 32] = "Biomes";
  GenerationPhases2[GenerationPhases2["NaturalWonders"] = 64] = "NaturalWonders";
  GenerationPhases2[GenerationPhases2["FloodPlains"] = 128] = "FloodPlains";
  GenerationPhases2[GenerationPhases2["Features"] = 256] = "Features";
  GenerationPhases2[GenerationPhases2["Snow"] = 512] = "Snow";
  GenerationPhases2[GenerationPhases2["Resources"] = 1024] = "Resources";
  GenerationPhases2[GenerationPhases2["All"] = 2047] = "All";
  return GenerationPhases2;
})(GenerationPhases || {});
async function generateMapFeatures(hexMap, phases = 2047 /* All */) {
  const generateMapFeaturesScope = new profileScope("Generate Features");
  const iWidth = GameplayMap.getGridWidth();
  const iHeight = GameplayMap.getGridHeight();
  const uiMapSize = GameplayMap.getMapSize();
  const mapInfo = GameInfo.Maps.lookup(uiMapSize);
  if (mapInfo == null) return;
  const iNumNaturalWonders = mapInfo.NumNaturalWonders;
  if (phases & 1 /* Lakes */) {
    profileFunction("generateLakes", () => hexMap.GenerateLakes());
    hexMap.writeToTerrainBuilder();
  }
  profileFunction("TerrainBuilder.validateAndFixTerrain", () => TerrainBuilder.validateAndFixTerrain());
  profileFunction("AreaBuilder.recalculateAreas", () => AreaBuilder.recalculateAreas());
  profileFunction("TerrainBuilder.stampContinents", () => TerrainBuilder.stampContinents());
  profileFunction("AreaBuilder.recalculateAreas", () => AreaBuilder.recalculateAreas());
  profileFunction("TerrainBuilder.buildElevation", () => TerrainBuilder.buildElevation());
  profileFunction("addHills", () => addHills(iWidth, iHeight));
  profileFunction("buildRainfallMap", () => buildRainfallMap(iWidth, iHeight));
  profileFunction(
    "TerrainBuilder.modelRivers",
    () => TerrainBuilder.modelRivers(5, 15, g_NavigableRiverTerrain)
  );
  profileFunction("TerrainBuilder.validateAndFixTerrain", () => TerrainBuilder.validateAndFixTerrain());
  profileFunction("TerrainBuilder.defineNamedRivers", () => TerrainBuilder.defineNamedRivers());
  profileFunction("designateBiomes", () => designateBiomes(iWidth, iHeight));
  profileFunction("addNaturalWonders", () => addNaturalWonders(iWidth, iHeight, iNumNaturalWonders));
  profileFunction("TerrainBuilder.addFloodplains", () => TerrainBuilder.addFloodplains(4, 10));
  profileFunction("addFeatures", () => addFeatures(iWidth, iHeight));
  profileFunction("TerrainBuilder.validateAndFixTerrain", () => TerrainBuilder.validateAndFixTerrain());
  profileFunction("AreaBuilder.recalculateAreas", () => AreaBuilder.recalculateAreas());
  profileFunction("TerrainBuilder.storeWaterData", () => TerrainBuilder.storeWaterData());
  profileFunction("generateSnow", () => generateSnow(iWidth, iHeight));
  dumpContinents(iWidth, iHeight);
  dumpTerrain(iWidth, iHeight);
  dumpElevation(iWidth, iHeight);
  dumpRainfall(iWidth, iHeight);
  dumpBiomes(iWidth, iHeight);
  dumpFeatures(iWidth, iHeight);
  dumpPermanentSnow(iWidth, iHeight);
  profileFunction("generateResources", () => generateResources(iWidth, iHeight));
  dumpResources(iWidth, iHeight);
  generateMapFeaturesScope.end();
}

export { GenerationPhases, generateMapFeatures };
//# sourceMappingURL=common-generation.js.map
