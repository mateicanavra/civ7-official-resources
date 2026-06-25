import { HexValidationSettings, RemoveBridgingLandmassOptions, VoronoiValidationSettings, SeparationFilterOptions } from '../hex-map.js';
import { RandomImpl } from '../random-pcg-32.js';
import { MapDims, MapSize, RegionType } from '../voronoi-types.js';
import { VoronoiUtils } from '../voronoi-utils.js';
import fractalSettings from '../voronoi_data/fractal.mapconfig.js';
import { voronoiMapSchema } from './map-common.js';
import { UnifiedContinentsBase } from './unified-continents-base.js';

class VoronoiFractal extends UnifiedContinentsBase {
  constructor() {
    const customSchema = {
      ...voronoiMapSchema,
      minLandmassSeeds: {
        label: "Min Landmass Seeds",
        description: "",
        default: 4,
        min: 1,
        max: 10,
        step: 1
      },
      maxLandmassSeeds: {
        label: "Max Landmass Seeds",
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
      },
      landmassSeedSizeFactor: {
        label: "Landmass Seed Size Factor",
        description: "Adjusts how map sizes affect the number of landmass seeds relative to a standard map size. 0 means all map sizes are the same. Positive values will use more seeds on maps larger than standard, negative values will use fewer seeds on maps larger than standard.",
        default: 1,
        min: -2,
        max: 2,
        step: 0.1
      },
      forceAtLeastTwo: {
        label: "Force 2+ landmasses %",
        description: "Forces at least two landmasses to spawn a certain percentage of the time.",
        default: 75,
        min: 0,
        max: 100,
        step: 1
      },
      forceAtLeastThree: {
        label: "Force 3+ landmasses %",
        description: "Forces at least three landmasses to spawn a certain percentage of the time.",
        default: 20,
        min: 0,
        max: 100,
        step: 1
      }
    };
    super(customSchema, fractalSettings);
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
    const tileCountRatio = tileCount / standardTileCount - 1;
    const sizeSeedRatio = settings.landmassSeedSizeFactor * tileCountRatio;
    const landmassSeeds = VoronoiUtils.getRandomMinMax(
      settings.minLandmassSeeds,
      settings.maxLandmassSeeds,
      "Landmass Seed Variance"
    );
    settings.landmassCount = Math.round(landmassSeeds + sizeSeedRatio * landmassSeeds);
    const distantSeeds = VoronoiUtils.getRandomMinMax(
      settings.minDistantSeeds,
      settings.maxDistantSeeds,
      "Distant Landmass Seed Variance"
    );
    settings.distantCount = Math.round(distantSeeds + sizeSeedRatio * distantSeeds);
    settings.enforceGroupConstraints = 1;
    const randLandmassCount = RandomImpl.fRand("Force Min landmass count");
    settings.landmassGroupCount = randLandmassCount < settings.forceAtLeastThree / 100 ? 3 : randLandmassCount < settings.forceAtLeastTwo / 100 ? 2 : 1;
    const hexValidationSettings = new HexValidationSettings();
    hexValidationSettings.removeBridgingPlayerLandmasses = RemoveBridgingLandmassOptions.FORCE_OCEANS;
    hexValidationSettings.polarMargin = 1;
    this.getHexTiles().setValidationSettings(hexValidationSettings);
    super.simulateInternal();
  }
  getVoronoiValidationSettings() {
    const voronoiValidationSettings = new VoronoiValidationSettings();
    voronoiValidationSettings.forceOceans = SeparationFilterOptions.DIFFERENT_TYPES | SeparationFilterOptions.DIFFERENT_LANDMASS_GROUPS;
    voronoiValidationSettings.forceCoasts = SeparationFilterOptions.OFF;
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
    return "Fractal";
  }
  getFilename() {
    return "fractal.mapconfig.js";
  }
}

export { VoronoiFractal };
//# sourceMappingURL=fractal.js.map
