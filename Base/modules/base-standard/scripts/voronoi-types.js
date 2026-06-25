var RegionType = /* @__PURE__ */ ((RegionType2) => {
  RegionType2[RegionType2["None"] = 0] = "None";
  RegionType2[RegionType2["Ocean"] = 1] = "Ocean";
  RegionType2[RegionType2["Landmass"] = 2] = "Landmass";
  RegionType2[RegionType2["Island"] = 3] = "Island";
  RegionType2[RegionType2["CoastalIsland"] = 4] = "CoastalIsland";
  RegionType2[RegionType2["_Length"] = 5] = "_Length";
  return RegionType2;
})(RegionType || {});
var TerrainType = /* @__PURE__ */ ((TerrainType2) => {
  TerrainType2[TerrainType2["Unknown"] = 0] = "Unknown";
  TerrainType2[TerrainType2["Ocean"] = 1] = "Ocean";
  TerrainType2[TerrainType2["Coast"] = 2] = "Coast";
  TerrainType2[TerrainType2["Flat"] = 3] = "Flat";
  TerrainType2[TerrainType2["Rough"] = 4] = "Rough";
  TerrainType2[TerrainType2["Mountainous"] = 5] = "Mountainous";
  TerrainType2[TerrainType2["NavRiver"] = 6] = "NavRiver";
  TerrainType2[TerrainType2["_Length"] = 7] = "_Length";
  return TerrainType2;
})(TerrainType || {});
var FeatureType = /* @__PURE__ */ ((FeatureType2) => {
  FeatureType2[FeatureType2["None"] = 0] = "None";
  FeatureType2[FeatureType2["Volcano"] = 1] = "Volcano";
  FeatureType2[FeatureType2["_Length"] = 2] = "_Length";
  return FeatureType2;
})(FeatureType || {});
function isLand(terrainType) {
  return terrainType === 3 /* Flat */ || terrainType === 4 /* Rough */ || terrainType === 5 /* Mountainous */;
}
function isWater(terrainType) {
  return terrainType === 1 /* Ocean */ || terrainType === 2 /* Coast */ || terrainType === 6 /* NavRiver */;
}
var BiomeType = /* @__PURE__ */ ((BiomeType2) => {
  BiomeType2[BiomeType2["Unknown"] = 0] = "Unknown";
  BiomeType2[BiomeType2["Ocean"] = 1] = "Ocean";
  BiomeType2[BiomeType2["Desert"] = 2] = "Desert";
  BiomeType2[BiomeType2["Grassland"] = 3] = "Grassland";
  BiomeType2[BiomeType2["Plains"] = 4] = "Plains";
  BiomeType2[BiomeType2["Tropical"] = 5] = "Tropical";
  BiomeType2[BiomeType2["Tundra"] = 6] = "Tundra";
  BiomeType2[BiomeType2["_Length"] = 7] = "_Length";
  return BiomeType2;
})(BiomeType || {});
var DetailsType = /* @__PURE__ */ ((DetailsType2) => {
  DetailsType2[DetailsType2["None"] = 0] = "None";
  DetailsType2[DetailsType2["MinorRiver"] = 1] = "MinorRiver";
  DetailsType2[DetailsType2["Wet"] = 2] = "Wet";
  DetailsType2[DetailsType2["Vegetated"] = 3] = "Vegetated";
  DetailsType2[DetailsType2["Floodplain"] = 4] = "Floodplain";
  DetailsType2[DetailsType2["Snow"] = 5] = "Snow";
  DetailsType2[DetailsType2["_Length"] = 6] = "_Length";
  return DetailsType2;
})(DetailsType || {});
var VariantOverrideType = /* @__PURE__ */ ((VariantOverrideType2) => {
  VariantOverrideType2[VariantOverrideType2["Replace"] = 0] = "Replace";
  VariantOverrideType2[VariantOverrideType2["Add"] = 1] = "Add";
  VariantOverrideType2[VariantOverrideType2["Multiply"] = 2] = "Multiply";
  return VariantOverrideType2;
})(VariantOverrideType || {});
var MapSize = /* @__PURE__ */ ((MapSize2) => {
  MapSize2[MapSize2["Tiny"] = 0] = "Tiny";
  MapSize2[MapSize2["Small"] = 1] = "Small";
  MapSize2[MapSize2["Standard"] = 2] = "Standard";
  MapSize2[MapSize2["Large"] = 3] = "Large";
  MapSize2[MapSize2["Huge"] = 4] = "Huge";
  return MapSize2;
})(MapSize || {});
const MapDims = {
  [0 /* Tiny */]: { x: 60, y: 38 },
  [1 /* Small */]: { x: 74, y: 46 },
  [2 /* Standard */]: { x: 84, y: 54 },
  [3 /* Large */]: { x: 96, y: 60 },
  [4 /* Huge */]: { x: 106, y: 66 }
};

export { BiomeType, DetailsType, FeatureType, MapDims, MapSize, RegionType, TerrainType, VariantOverrideType, isLand, isWater };
//# sourceMappingURL=voronoi-types.js.map
