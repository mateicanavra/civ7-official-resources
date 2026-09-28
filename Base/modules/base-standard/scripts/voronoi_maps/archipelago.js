import { HexValidationSettings, RemoveBridgingLandmassOptions, VoronoiValidationSettings, SeparationFilterOptions } from '../hex-map.js';
import { MapDims, MapSize, RegionType } from '../voronoi-types.js';
import { VoronoiUtils } from '../voronoi-utils.js';
import archipelagoSettings from '../voronoi_data/archipelago.mapconfig.js';
import { UnifiedContinentsBase } from './unified-continents-base.js';

const archipelagoMapSchema = {
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
function buildArchipelagoSettings(source, hexDims) {
  const result = { ...source };
  result.groupBalancedMode = 0;
  const tileCount = hexDims.x * hexDims.y;
  const standardTileCount = MapDims[MapSize.Standard].x * MapDims[MapSize.Standard].y;
  const tileCountRatio = tileCount / standardTileCount;
  const landmassSeeds = VoronoiUtils.getRandomMinMax(
    source.minLandmassSeeds,
    source.minLandmassSeeds + source.landmassSeedVariance,
    "Landmass Seed Variance"
  );
  result.landmassCount = Math.round(landmassSeeds * tileCountRatio * 2);
  result.distantCount = VoronoiUtils.getRandomMinMax(
    source.minDistantSeeds,
    source.maxDistantSeeds,
    "Distant Landmass Seed Variance"
  );
  result.landmassGroupCount = 2;
  result.minLandmassSpawnCenterDistance = 0.25;
  result.maxLandmassSpawnCenterDistance = 0.9;
  result.minDistantSpawnCenterDistance = 0.1;
  result.maxDistantSpawnCenterDistance = 0.9;
  return result;
}
class VoronoiArchipelago extends UnifiedContinentsBase {
  constructor() {
    super(archipelagoMapSchema, archipelagoSettings);
  }
  init(hexDims) {
    this.m_baseSchema.landmassCount.hidden = true;
    this.m_baseSchema.landmassGroupCount.hidden = true;
    this.m_baseSchema.distantCount.hidden = true;
    this.initInternal(hexDims);
  }
  simulateInternal() {
    const hexValidationSettings = new HexValidationSettings();
    hexValidationSettings.removeBridgingPlayerLandmasses = RemoveBridgingLandmassOptions.FORCE_OCEANS;
    hexValidationSettings.polarMargin = 1;
    this.getHexTiles().setValidationSettings(hexValidationSettings);
    super.placeDefaultSection(buildArchipelagoSettings(this.m_settings, this.m_hexDims));
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

export { VoronoiArchipelago, archipelagoMapSchema, buildArchipelagoSettings };
//# sourceMappingURL=archipelago.js.map
