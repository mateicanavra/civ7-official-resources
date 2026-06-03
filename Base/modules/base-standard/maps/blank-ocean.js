import { g_OceanTerrain } from './map-globals.js';

function requestMapData(initParams) {
  engine.call("SetMapInitData", initParams);
}
function generateMap() {
  console.log("Generating blank ocean map");
  const iWidth = GameplayMap.getGridWidth();
  const iHeight = GameplayMap.getGridHeight();
  for (let y = 0; y < iHeight; y++) {
    for (let x = 0; x < iWidth; x++) {
      TerrainBuilder.setTerrainType(x, y, g_OceanTerrain);
    }
  }
}
engine.on("RequestMapInitData", requestMapData);
engine.on("GenerateMap", generateMap);
console.log("Loaded blank-ocean.ts");
//# sourceMappingURL=blank-ocean.js.map
