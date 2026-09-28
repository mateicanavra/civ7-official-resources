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
  GenerationPhases2[GenerationPhases2["Continents"] = 2] = "Continents";
  GenerationPhases2[GenerationPhases2["Elevation"] = 4] = "Elevation";
  GenerationPhases2[GenerationPhases2["Hills"] = 8] = "Hills";
  GenerationPhases2[GenerationPhases2["Rainfall"] = 16] = "Rainfall";
  GenerationPhases2[GenerationPhases2["Rivers"] = 32] = "Rivers";
  GenerationPhases2[GenerationPhases2["Biomes"] = 64] = "Biomes";
  GenerationPhases2[GenerationPhases2["NaturalWonders"] = 128] = "NaturalWonders";
  GenerationPhases2[GenerationPhases2["FloodPlains"] = 256] = "FloodPlains";
  GenerationPhases2[GenerationPhases2["Features"] = 512] = "Features";
  GenerationPhases2[GenerationPhases2["Snow"] = 1024] = "Snow";
  GenerationPhases2[GenerationPhases2["Resources"] = 2048] = "Resources";
  GenerationPhases2[GenerationPhases2["WriteToTerrainBuilder"] = 4096] = "WriteToTerrainBuilder";
  GenerationPhases2[GenerationPhases2["All"] = 4294967295] = "All";
  return GenerationPhases2;
})(GenerationPhases || {});
class GenerationContext {
  phases = 4294967295 /* All */;
  // River aesthetics settings
  bRunAestheticRiverValidation = true;
  largeRiverPercent = 25;
  minNavRiverLength = 2;
  minUpstreamMinorRivers = 2;
}
async function generateMapFeatures(hexMap, context = new GenerationContext()) {
  const generateMapFeaturesScope = new profileScope("Generate Features");
  const iWidth = GameplayMap.getGridWidth();
  const iHeight = GameplayMap.getGridHeight();
  const uiMapSize = GameplayMap.getMapSize();
  const mapInfo = GameInfo.Maps.lookup(uiMapSize);
  if (mapInfo == null) return;
  const iNumNaturalWonders = mapInfo.NumNaturalWonders;
  if (context.phases & 1 /* Lakes */) {
    profileFunction("generateLakes", () => hexMap.GenerateLakes());
  }
  if (context.phases & 4096 /* WriteToTerrainBuilder */) {
    hexMap.writeToTerrainBuilder();
  }
  profileFunction("TerrainBuilder.validateAndFixTerrain", () => TerrainBuilder.validateAndFixTerrain());
  profileFunction("AreaBuilder.recalculateAreas", () => AreaBuilder.recalculateAreas());
  if (context.phases & 2 /* Continents */) {
    profileFunction("TerrainBuilder.stampContinents", () => TerrainBuilder.stampContinents());
  }
  profileFunction("AreaBuilder.recalculateAreas", () => AreaBuilder.recalculateAreas());
  if (context.phases & 4 /* Elevation */) {
    profileFunction("TerrainBuilder.buildElevation", () => TerrainBuilder.buildElevation());
  }
  if (context.phases & 8 /* Hills */) {
    profileFunction("addHills", () => addHills(iWidth, iHeight));
  }
  if (context.phases & 16 /* Rainfall */) {
    profileFunction("buildRainfallMap", () => buildRainfallMap(iWidth, iHeight));
  }
  if (context.phases & 32 /* Rivers */) {
    profileFunction(
      "TerrainBuilder.modelRivers",
      () => TerrainBuilder.modelRivers(5, 15, g_NavigableRiverTerrain)
    );
  } else {
    profileFunction(
      "TerrainBuilder.finalizeRivers",
      () => TerrainBuilder.finalizeRivers(
        context.bRunAestheticRiverValidation,
        context.largeRiverPercent,
        context.minNavRiverLength,
        context.minUpstreamMinorRivers
      )
    );
  }
  if (context.phases & 64 /* Biomes */) {
    profileFunction("designateBiomes", () => designateBiomes(iWidth, iHeight));
  }
  if (context.phases & 128 /* NaturalWonders */) {
    profileFunction("addNaturalWonders", () => addNaturalWonders(iWidth, iHeight, iNumNaturalWonders));
  }
  if (context.phases & 256 /* FloodPlains */) {
    profileFunction("TerrainBuilder.addFloodplains", () => TerrainBuilder.addFloodplains(4, 10));
  }
  if (context.phases & 512 /* Features */) {
    profileFunction("addFeatures", () => addFeatures(iWidth, iHeight));
  }
  profileFunction("TerrainBuilder.validateAndFixTerrain", () => TerrainBuilder.validateAndFixTerrain());
  profileFunction("AreaBuilder.recalculateAreas", () => AreaBuilder.recalculateAreas());
  profileFunction("TerrainBuilder.storeWaterData", () => TerrainBuilder.storeWaterData());
  if (context.phases & 1024 /* Snow */) {
    profileFunction("generateSnow", () => generateSnow(iWidth, iHeight));
  }
  if (context.phases & 2048 /* Resources */) {
    profileFunction("generateResources", () => generateResources(iWidth, iHeight));
  }
  dumpContinents(iWidth, iHeight);
  dumpTerrain(iWidth, iHeight);
  dumpElevation(iWidth, iHeight);
  dumpRainfall(iWidth, iHeight);
  dumpBiomes(iWidth, iHeight);
  dumpFeatures(iWidth, iHeight);
  dumpPermanentSnow(iWidth, iHeight);
  dumpResources(iWidth, iHeight);
  generateMapFeaturesScope.end();
}

export { GenerationContext, GenerationPhases, generateMapFeatures };
//# sourceMappingURL=common-generation.js.map
