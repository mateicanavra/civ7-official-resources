import { RandomImpl } from '../random-pcg-32.js';
import { MapDims, VoronoiUtils } from '../kd-tree.js';
import { VoronoiMap } from './map-common.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/voronoi.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/rbtree.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/vertex.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/edge.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/cell.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/diagram.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/halfedge.js';
import '../../../core/scripts/MathHelpers.js';
import '../voronoi-builder.js';
import '../voronoi-hex.js';
import '../heap.js';
import '../voronoi_generators/continent-generator.js';
import '../quadtree.js';
import '../voronoi_rules/near-other-region.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/site.js';
import '../voronoi_rules/rules-base.js';
import '../voronoi-region.js';
import '../voronoi_generators/map-generator.js';
import '../voronoi_rules/avoid-edge.js';
import '../voronoi_rules/avoid-other-regions.js';
import '../voronoi_rules/cell-area.js';
import '../voronoi_rules/near-map-center.js';
import '../voronoi_rules/near-neighbor.js';
import '../voronoi_rules/near-plate-boundary.js';
import '../voronoi_rules/near-region-seed.js';
import '../voronoi_rules/neighbors-in-region.js';
import '../voronoi_rules/prefer-latitude.js';

class UnifiedContinentsBase extends VoronoiMap {
  m_baseSchema = {
    voronoiCellCountMultiple: {
      label: "Cell Count Multiple",
      description: "The number of voronoi cells to use relative to hexes.",
      default: 1,
      min: 0.5,
      max: 4,
      step: 0.1
    },
    voronoiRelaxationSteps: {
      label: "Cell Relaxation Steps",
      description: "The number times to relax the voronoi diagram from its original random positions.",
      default: 3,
      min: 0,
      max: 10,
      step: 1
    },
    totalLandmassSize: {
      label: "Total Landmass Size",
      description: "The total percentage of land to be taken up by the major landmasses.",
      default: 32,
      min: 20,
      max: 50,
      step: 0.25
    },
    maxSizeVariance: {
      label: "Max Size Variance",
      description: "The maximum difference allowed for between the largest and smallest continents as a percentage. For instance, 50% would mean the smallest continent can be half the size of the largest.",
      default: 20,
      min: 0,
      max: 50,
      step: 1
    },
    landmassCount: {
      label: "Landmass Count",
      description: "The number of major landmasses to spawn.",
      default: 4,
      min: 0,
      max: 12,
      step: 1
    },
    wrapX: {
      label: "Wrap Meridian",
      description: "Wrap the map around the meridian.",
      default: 0,
      min: 0,
      max: 1,
      step: 1
    }
  };
  m_settings;
  constructor(customSchema) {
    super();
    this.m_baseSchema = { ...this.m_baseSchema, ...customSchema };
    this.m_settings = this.createDefaultSettings();
  }
  initInternal(mapSize, generatorType, defaultGeneratorSettings, cellCountMultiple, relaxationSteps, wrap) {
    super.initInternal(mapSize, generatorType, defaultGeneratorSettings, cellCountMultiple, relaxationSteps, wrap);
    this.applySettings(mapSize);
  }
  // Called by subclasses after initInternal().
  applySettings(mapSize) {
    const generatorSettings = this.getGenerator().getSettings();
    const landmassCount = this.m_settings.landmassCount;
    generatorSettings.landmass = Array.from({ length: landmassCount }, () => ({
      ...generatorSettings.landmass[0]
    }));
    const totalSize = this.m_settings.totalLandmassSize;
    const maxSizeVariance = this.m_settings.maxSizeVariance * 0.01;
    const maxSizeVarianceComp = 1 - maxSizeVariance;
    const dims = MapDims[mapSize];
    const tileCount = dims.x * dims.y;
    const avgDim = dims.x + dims.y / 2;
    const landmassSeparationWidth = 2;
    const separationAxis = 2 * Math.sqrt(landmassCount) - 2;
    const landmassSeparationTiles = avgDim * separationAxis * landmassSeparationWidth;
    const usablePercentage = (tileCount - landmassSeparationTiles) / tileCount;
    const adjustedTotalSize = totalSize * usablePercentage;
    const maxSize = adjustedTotalSize / (1 + maxSizeVarianceComp + Math.max(0, landmassCount - 2) * (1 - maxSizeVariance / 2));
    const minSize = maxSize * maxSizeVarianceComp;
    let remaining = adjustedTotalSize;
    for (let i = 0; i < landmassCount; ++i) {
      const slotsLeft = landmassCount - i;
      let size = 0;
      if (slotsLeft == 1) {
        size = remaining;
      } else {
        const low = Math.max(minSize, remaining - maxSize * (slotsLeft - 1));
        const high = Math.min(maxSize, remaining - minSize * (slotsLeft - 1));
        const mean = remaining / slotsLeft;
        const t = VoronoiUtils.clamp((mean - low) / (high - low), 1e-6, 1 - 1e-6);
        const gamma = 1 / t - 1;
        const uniform = RandomImpl.fRand(`Landmass ${i + 1} Size Variance`);
        size = low + (high - low) * Math.pow(uniform, gamma);
      }
      remaining -= size;
      generatorSettings.landmass[i].size = size;
      generatorSettings.landmass[i].variance = 0;
      generatorSettings.landmass[i].spawnCenterDistance = 0.5 + RandomImpl.fRand(`Landmass ${i + 1} Spawn Distance`) * 0.25;
      generatorSettings.landmass[i].playerAreas = 1;
    }
    const settingsConfig = this.getGenerator().getGeneratorSettingsConfig();
    VoronoiUtils.lockGeneratorSetting("landmass.size", settingsConfig);
    VoronoiUtils.lockGeneratorSetting("landmass.variance", settingsConfig);
    VoronoiUtils.lockGeneratorSetting("landmass.spawnCenterDistance", settingsConfig);
    VoronoiUtils.unifyGeneratorSetting("landmass.erosionPercent", settingsConfig);
    VoronoiUtils.unifyGeneratorSetting("landmass.coastalIslands", settingsConfig);
    VoronoiUtils.unifyGeneratorSetting("landmass.coastalIslandsMinDistance", settingsConfig);
    VoronoiUtils.unifyGeneratorSetting("landmass.coastalIslandsMaxDistance", settingsConfig);
    VoronoiUtils.unifyGeneratorSetting("landmass.coastalIslandsSize", settingsConfig);
    VoronoiUtils.unifyGeneratorSetting("landmass.coastalIslandsSizeVariance", settingsConfig);
    this.m_builder.getGenerator().logSettings();
  }
  getSettings() {
    return this.getTypedSettings();
  }
  getTypedSettings() {
    return this.m_settings;
  }
  getSettingsConfig() {
    return this.m_baseSchema;
  }
}

export { UnifiedContinentsBase };
//# sourceMappingURL=unified-continents-base.js.map
