import { HexValidationSettings, RemoveBridgingLandmassOptions, VoronoiValidationSettings, SeparationFilterOptions } from '../hex-map.js';
import { RandomImpl } from '../random-pcg-32.js';
import { MapDims, MapSize, RegionType } from '../voronoi-types.js';
import { VoronoiUtils } from '../voronoi-utils.js';
import fractalSettings from '../voronoi_data/fractal.mapconfig.js';
import { UnifiedContinentsBase, unifiedContinentsSchema } from './unified-continents-base.js';

const fractalMapSchema = {
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
function buildFractalSettings(source, hexDims) {
  const result = { ...source };
  result.groupBalancedMode = 0;
  const tileCount = hexDims.x * hexDims.y;
  const standardTileCount = MapDims[MapSize.Standard].x * MapDims[MapSize.Standard].y;
  const tileCountRatio = tileCount / standardTileCount - 1;
  const sizeSeedRatio = source.landmassSeedSizeFactor * tileCountRatio;
  const landmassSeeds = VoronoiUtils.getRandomMinMax(
    source.minLandmassSeeds,
    source.maxLandmassSeeds,
    "Landmass Seed Variance"
  );
  result.landmassCount = Math.round(landmassSeeds + sizeSeedRatio * landmassSeeds);
  const distantSeeds = VoronoiUtils.getRandomMinMax(
    source.minDistantSeeds,
    source.maxDistantSeeds,
    "Distant Landmass Seed Variance"
  );
  result.distantCount = Math.round(distantSeeds + sizeSeedRatio * distantSeeds);
  const randLandmassCount = RandomImpl.fRand("Force Min landmass count");
  result.landmassGroupCount = randLandmassCount < source.forceAtLeastThree / 100 ? 3 : randLandmassCount < source.forceAtLeastTwo / 100 ? 2 : 1;
  return result;
}
class VoronoiFractal extends UnifiedContinentsBase {
  constructor() {
    const customSchema = {
      ...unifiedContinentsSchema,
      ...fractalMapSchema
    };
    super(customSchema, fractalSettings);
  }
  init(hexDims) {
    this.m_baseSchema.landmassCount.hidden = true;
    this.m_baseSchema.distantCount.hidden = true;
    this.initInternal(hexDims);
  }
  simulateInternal() {
    const hexValidationSettings = new HexValidationSettings();
    hexValidationSettings.removeBridgingPlayerLandmasses = RemoveBridgingLandmassOptions.FORCE_OCEANS;
    hexValidationSettings.polarMargin = 1;
    this.getHexTiles().setValidationSettings(hexValidationSettings);
    super.placeDefaultSection(buildFractalSettings(this.m_settings, this.m_hexDims));
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

export { VoronoiFractal, buildFractalSettings, fractalMapSchema };
//# sourceMappingURL=fractal.js.map
