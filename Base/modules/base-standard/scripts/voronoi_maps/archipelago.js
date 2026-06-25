import { HexValidationSettings, RemoveBridgingLandmassOptions, VoronoiValidationSettings, SeparationFilterOptions } from '../hex-map.js';
import { MapDims, MapSize, RegionType } from '../voronoi-types.js';
import { VoronoiUtils } from '../voronoi-utils.js';
import archipelagoSettings from '../voronoi_data/archipelago.mapconfig.js';
import { voronoiMapSchema } from './map-common.js';
import { UnifiedContinentsBase } from './unified-continents-base.js';

class VoronoiArchipelago extends UnifiedContinentsBase {
  constructor() {
    const customSchema = {
      ...voronoiMapSchema,
      minLandmassSeeds: {
        label: "Min Landmass Seeds Per Continent",
        description: "",
        default: 12,
        min: 1,
        max: 20,
        step: 1
      },
      landmassSeedVariance: {
        label: "Landmass Seed Variance",
        description: "",
        default: 8,
        min: 1,
        max: 20,
        step: 1
      },
      minDistantSeeds: {
        label: "Min Distant Land Seeds",
        description: "",
        default: 2,
        min: 1,
        max: 10,
        step: 1
      },
      maxDistantSeeds: {
        label: "Max Distant Land Seeds",
        description: "",
        default: 4,
        min: 1,
        max: 20,
        step: 1
      }
    };
    super(customSchema, archipelagoSettings);
  }
  init(hexDims) {
    this.m_baseSchema.landmassCount.hidden = true;
    this.m_baseSchema.distantCount.hidden = true;
    this.initInternal(hexDims);
  }
  simulateInternal() {
    const settings = this.m_settings;
    settings.distantSeedsBalancedMode = 0;
    const tileCount = this.m_hexDims.x * this.m_hexDims.y;
    const standardTileCount = MapDims[MapSize.Standard].x * MapDims[MapSize.Standard].y;
    const tileCountRatio = tileCount / standardTileCount;
    const landmassSeeds = VoronoiUtils.getRandomMinMax(
      settings.minLandmassSeeds,
      settings.minLandmassSeeds + settings.landmassSeedVariance,
      "Landmass Seed Variance"
    );
    settings.landmassCount = Math.round(landmassSeeds * tileCountRatio * 2);
    settings.distantCount = VoronoiUtils.getRandomMinMax(
      settings.minDistantSeeds,
      settings.maxDistantSeeds,
      "Distant Landmass Seed Variance"
    );
    settings.landmassGroupCount = 2;
    settings.minLandmassSpawnCenterDistance = 0.25;
    settings.maxLandmassSpawnCenterDistance = 0.9;
    settings.minDistantLandmassSpawnCenterDistance = 0.1;
    settings.maxDistantLandmassSpawnCenterDistance = 0.9;
    settings.enforceGroupConstraints = 1;
    const hexValidationSettings = new HexValidationSettings();
    hexValidationSettings.removeBridgingPlayerLandmasses = RemoveBridgingLandmassOptions.FORCE_OCEANS;
    hexValidationSettings.polarMargin = 1;
    this.getHexTiles().setValidationSettings(hexValidationSettings);
    super.simulateInternal();
  }
  getVoronoiValidationSettings() {
    const voronoiValidationSettings = new VoronoiValidationSettings();
    voronoiValidationSettings.forceOceans = SeparationFilterOptions.DIFFERENT_TYPES | SeparationFilterOptions.DIFFERENT_LANDMASS_GROUPS;
    voronoiValidationSettings.forceCoasts = SeparationFilterOptions.DIFFERENT_LANDMASSES;
    return voronoiValidationSettings;
  }
  getPlayerLandmassFromCell(cell) {
    if (cell.landmassId > 0) {
      const landmass = this.m_generator.getLandmasses()[cell.landmassId];
      if (landmass.type === RegionType.Island || landmass.playerAreas === 0) {
        return 0;
      }
      return landmass.groupId;
    }
    return -1;
  }
  static getName() {
    return "Archipelago";
  }
  getFilename() {
    return "archipelago.mapconfig.js";
  }
}

export { VoronoiArchipelago };
//# sourceMappingURL=archipelago.js.map
