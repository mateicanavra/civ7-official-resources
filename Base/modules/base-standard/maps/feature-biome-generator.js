import { g_PlainsLatitude, g_MarineBiome, g_DesertBiome, g_MountainTerrain, g_TropicalBiome, g_PlainsBiome, g_GrasslandBiome, g_TundraBiome } from './map-globals.js';
import { isAdjacentToNaturalWonder } from './map-utilities.js';

function designateBiomes(iWidth, iHeight) {
  console.log("Biomes");
  let iTotalLandPlots = 0;
  let iTotalLandPlotsAbove = 0;
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const latitude = GameplayMap.getPlotLatitude(iX, iY);
      if (!GameplayMap.isWater(iX, iY)) {
        iTotalLandPlots = iTotalLandPlots + 1;
      }
      if (!GameplayMap.isWater(iX, iY) && g_PlainsLatitude < latitude) {
        iTotalLandPlotsAbove = iTotalLandPlotsAbove + 1;
      }
    }
  }
  let iPlainsLowering = 0;
  let iDesertLowering = 0;
  let iGrassLowering = 0;
  let iTropicalLowering = 0;
  if (Math.round(iTotalLandPlots / 5 * 2 * 0.75) > iTotalLandPlotsAbove) {
    iPlainsLowering += 5;
    iDesertLowering += 4;
    iGrassLowering += 4;
    iTropicalLowering += 2;
    console.log(
      "Less  iTotalLandPlots: " + iTotalLandPlots + " iTotalLandPlotsAbove: " + iTotalLandPlotsAbove
    );
  }
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      if (GameplayMap.isWater(iX, iY)) {
        TerrainBuilder.setBiomeType(iX, iY, g_MarineBiome);
      } else {
        let latitude = GameplayMap.getPlotLatitude(iX, iY);
        if (latitude < 0) latitude = -1 * latitude;
        latitude += Math.round(GameplayMap.getElevation(iX, iY) / 120);
        const rainfall = GameplayMap.getRainfall(iX, iY);
        if (rainfall < 25) {
          TerrainBuilder.setBiomeType(iX, iY, g_DesertBiome);
        } else if (rainfall > 250 && !(GameplayMap.getTerrainType(iX, iY) == g_MountainTerrain)) {
          TerrainBuilder.setBiomeType(iX, iY, g_TropicalBiome);
        } else {
          if (rainfall < 100) {
            latitude += (100 - rainfall) / 10;
          } else if (rainfall > 100) {
            latitude -= (rainfall - 100) / 10;
          }
          if (GameplayMap.isRiver(iX, iY)) {
            latitude -= 10;
          } else if (GameplayMap.isAdjacentToRivers(iX, iY, 1)) {
            latitude -= 5;
          }
          if (latitude < 17) {
            TerrainBuilder.setBiomeType(iX, iY, g_TropicalBiome);
          } else if (latitude < 33) {
            TerrainBuilder.setBiomeType(iX, iY, g_PlainsBiome);
          } else if (latitude < 44) {
            TerrainBuilder.setBiomeType(iX, iY, g_DesertBiome);
          } else if (latitude < 58) {
            TerrainBuilder.setBiomeType(iX, iY, g_GrasslandBiome);
          } else {
            TerrainBuilder.setBiomeType(iX, iY, g_TundraBiome);
          }
        }
      }
    }
  }
}
function addFeatures(iWidth, iHeight) {
  console.log("Features");
  addPositionalFeatures(iWidth, iHeight);
  scatterFeatures(iWidth, iHeight);
  addIce(iWidth, iHeight);
  addAquaticFeatures(iWidth, iHeight);
}
function addPositionalFeatures(iWidth, iHeight) {
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const feature = GameplayMap.getFeatureType(iX, iY);
      if (GameplayMap.isWater(iX, iY) == false && feature == FeatureTypes.NO_FEATURE && GameplayMap.isNavigableRiver(iX, iY) == false) {
        if (GameplayMap.isCoastalLand(iX, iY)) {
          for (var featIdx = 0; featIdx < GameInfo.Features.length; featIdx++) {
            if (canAddFeature(
              iX,
              iY,
              featIdx,
              false,
              false,
              true,
              false,
              false,
              false,
              false,
              false,
              false
            )) {
              AddFeature(iX, iY, featIdx, 100, "Feature Scatter");
              break;
            }
          }
        } else if (GameplayMap.isAdjacentToRivers(iX, iY, 2)) {
          for (var featIdx = 0; featIdx < GameInfo.Features.length; featIdx++) {
            if (canAddFeature(
              iX,
              iY,
              featIdx,
              false,
              false,
              false,
              true,
              false,
              false,
              false,
              false,
              false
            )) {
              AddFeature(iX, iY, featIdx, 100, "Feature Scatter");
              break;
            }
          }
        } else {
          if (GameplayMap.isAdjacentToRivers(iX, iY, 1)) {
            continue;
          } else if (GameplayMap.isCoastalLand(iX, iY)) {
            continue;
          }
          for (var featIdx = 0; featIdx < GameInfo.Features.length; featIdx++) {
            if (!GameplayMap.isAdjacentToFeature(iX, iY, featIdx) && canAddFeature(
              iX,
              iY,
              featIdx,
              false,
              false,
              false,
              false,
              true,
              false,
              false,
              false,
              false
            )) {
              AddFeature(iX, iY, featIdx, 100, "Feature Scatter");
              break;
            }
          }
        }
      }
    }
  }
}
function scatterFeatures(iWidth, iHeight) {
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const feature = GameplayMap.getFeatureType(iX, iY);
      if (GameplayMap.isWater(iX, iY) == false && feature == FeatureTypes.NO_FEATURE && GameplayMap.isNavigableRiver(iX, iY) == false) {
        for (let featIdx = 0; featIdx < GameInfo.Features.length; featIdx++) {
          if (canAddFeature(
            iX,
            iY,
            featIdx,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
          )) {
            AddFeature(iX, iY, featIdx, 100, "Feature Scatter");
            break;
          }
        }
      }
    }
  }
}
function addAquaticFeatures(iWidth, iHeight) {
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const feature = GameplayMap.getFeatureType(iX, iY);
      if (GameplayMap.isWater(iX, iY) == true && feature == FeatureTypes.NO_FEATURE) {
        let latitude = GameplayMap.getPlotLatitude(iX, iY);
        if (latitude < 0) latitude = -1 * latitude;
        for (let featIdx = 0; featIdx < GameInfo.Features.length; featIdx++) {
          if (canAddFeature(
            iX,
            iY,
            featIdx,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
            false
          )) {
            if (GameInfo.Features[featIdx].MinLatitude <= latitude && GameInfo.Features[featIdx].MaxLatitude > latitude) {
              const iWeight = (latitude + 50) * 2;
              AddFeature(iX, iY, featIdx, iWeight, "Feature Reef");
              break;
            }
          }
        }
      }
    }
  }
  let skipPlotIndices = [];
  let skipPlot = false;
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const feature = GameplayMap.getFeatureType(iX, iY);
      for (let skipIndex = 0; skipIndex < skipPlotIndices.length; ++skipIndex) {
        const plot = GameplayMap.getLocationFromIndex(skipPlotIndices[skipIndex]);
        if (plot.x == iX && plot.y && iY) {
          skipPlot = true;
          break;
        }
      }
      if (!skipPlot) {
        if (GameplayMap.isWater(iX, iY) == true && feature == FeatureTypes.NO_FEATURE) {
          let latitude = GameplayMap.getPlotLatitude(iX, iY);
          if (latitude < 0) latitude = -1 * latitude;
          for (let featIdx = 0; featIdx < GameInfo.Features.length; featIdx++) {
            if (canAddFeature(
              iX,
              iY,
              featIdx,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              false,
              true
            )) {
              if (GameInfo.Features[featIdx].MinLatitude <= latitude && GameInfo.Features[featIdx].MaxLatitude > latitude) {
                if (shallowWaterAdjacencyCheck(iX, iY, "Feature Atoll Spawn Chance")) {
                  AddFeature(iX, iY, featIdx, 100, "Feature Atoll");
                  const neighbors = GameplayMap.getPlotIndicesInRadius(iX, iY, 1);
                  const iRollForClusterSize = TerrainBuilder.getRandomNumber(neighbors.length, "Feature Atoll Size");
                  const growthChancePercent = latitude <= 15 && latitude >= -15 ? 15 : 5;
                  for (let plotIndex = 0; plotIndex < iRollForClusterSize; ++plotIndex) {
                    const iLocation = GameplayMap.getLocationFromIndex(neighbors[plotIndex]);
                    if (canAddFeature(
                      iLocation.x,
                      iLocation.y,
                      featIdx,
                      false,
                      false,
                      false,
                      false,
                      false,
                      false,
                      false,
                      false,
                      true
                    )) {
                      if (shallowWaterAdjacencyCheck(iLocation.x, iLocation.y, "Feature Atoll Spawn Chance")) {
                        const iRoll = TerrainBuilder.getRandomNumber(100, "Feature Atoll");
                        if (iRoll < growthChancePercent) {
                          AddFeature(iLocation.x, iLocation.y, featIdx, 30, "Feature Atoll");
                          skipPlotIndices.push(neighbors[plotIndex]);
                        }
                      }
                    }
                  }
                }
                break;
              }
            }
          }
        }
      } else {
        skipPlot = false;
        continue;
      }
    }
  }
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const feature = GameplayMap.getFeatureType(iX, iY);
      if (GameplayMap.isWater(iX, iY) == true && feature == FeatureTypes.NO_FEATURE) {
        for (let featIdx = 0; featIdx < GameInfo.Features.length; featIdx++) {
          if (canAddFeature(
            iX,
            iY,
            featIdx,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            false
          )) {
            AddFeature(iX, iY, featIdx, 100, "Feature Lotus");
            break;
          }
        }
      }
    }
  }
}
function AddFeature(x, y, iCurrentFeatureIndex, iRandomRollMax, logMsg) {
  const iScatterChance = GameInfo.Features[iCurrentFeatureIndex].PlacementDensity;
  const iRoll = TerrainBuilder.getRandomNumber(iRandomRollMax, logMsg);
  if (iRoll < iScatterChance) {
    const featureParam = {
      Feature: iCurrentFeatureIndex,
      Direction: -1,
      Elevation: 0
    };
    TerrainBuilder.setFeatureType(x, y, featureParam);
  }
}
function shallowWaterAdjacencyCheck(x, y, log) {
  if (GameplayMap.isAdjacentToShallowWater(x, y)) {
    const spawnChance = TerrainBuilder.getRandomNumber(100, log);
    return spawnChance < 30;
  }
  return true;
}
function addIce(iWidth, iHeight) {
  for (let iY = 0; iY < iHeight; iY++) {
    for (let iX = 0; iX < iWidth; iX++) {
      const feature = GameplayMap.getFeatureType(iX, iY);
      if (GameplayMap.isWater(iX, iY) == true && feature == FeatureTypes.NO_FEATURE) {
        let latitude = GameplayMap.getPlotLatitude(iX, iY);
        if (latitude < 0) latitude = -1 * latitude - 5;
        if (latitude > 78) {
          for (let featIdx = 0; featIdx < GameInfo.Features.length; featIdx++) {
            if (canAddFeature(
              iX,
              iY,
              featIdx,
              false,
              false,
              false,
              false,
              false,
              false,
              true,
              false,
              false
            )) {
              const iScatterChance = GameInfo.Features[featIdx].PlacementDensity;
              let iScore = TerrainBuilder.getRandomNumber(100, "Feature Ice");
              iScore = iScore + latitude;
              if (GameplayMap.isAdjacentToLand(iX, iY)) {
                iScore = 0;
              }
              if (isAdjacentToNaturalWonder(iX, iY)) {
                iScore = 0;
              }
              if (iScore > iScatterChance) {
                const featureParam = {
                  Feature: featIdx,
                  Direction: -1,
                  Elevation: 0
                };
                TerrainBuilder.setFeatureType(iX, iY, featureParam);
                break;
              }
            }
          }
        }
      }
    }
  }
}
function canAddFeature(iX, iY, feature, bScatterable, bRiverMouth, bCoastal, bNearRiver, bIsolated, bReef, bIce, bInLake, bOpenWaters) {
  if (!bScatterable || GameInfo.Features[feature].PlacementClass == "SCATTER") {
    if (!bRiverMouth || GameInfo.Features[feature].PlacementClass == "RIVERMOUTH") {
      if (!bCoastal || GameInfo.Features[feature].PlacementClass == "COASTAL") {
        if (!bNearRiver || GameInfo.Features[feature].PlacementClass == "NEARRIVER") {
          if (!bIsolated || GameInfo.Features[feature].PlacementClass == "ISOLATED") {
            if (!bReef || GameInfo.Features[feature].PlacementClass == "REEF") {
              if (!bInLake || GameInfo.Features[feature].PlacementClass == "IN_LAKE") {
                if (!bOpenWaters || GameInfo.Features[feature].PlacementClass == "OPEN_WATERS") {
                  if (!bIce || GameInfo.Features[feature].PlacementClass == "ICE") {
                    return TerrainBuilder.canHaveFeature(iX, iY, feature);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return false;
}

export { addFeatures, designateBiomes };
//# sourceMappingURL=feature-biome-generator.js.map
