import continentSettings from '../voronoi_data/continents.mapconfig.js';
import { voronoiMapSchema } from './map-common.js';
import { UnifiedContinentsBase } from './unified-continents-base.js';

function buildContinentsSettings(source) {
  const result = { ...source };
  result.landmassCount = 2;
  result.distantCount = 0;
  result.landmassGroupCount = 2;
  result.minLandmassSpawnCenterDistance = 0.4;
  result.maxLandmassSpawnCenterDistance = 0.6;
  return result;
}
class VoronoiContinents extends UnifiedContinentsBase {
  constructor() {
    super(voronoiMapSchema, continentSettings);
  }
  static getName() {
    return "Continents";
  }
  init(hexDims) {
    this.m_baseSchema.landmassCount.hidden = true;
    this.m_baseSchema.distantCount.hidden = true;
    this.m_baseSchema.landmassGroupCount.hidden = true;
    this.m_baseSchema.totalDistantSize.hidden = true;
    this.m_baseSchema.maxDistantSizeVariance.hidden = true;
    this.initInternal(hexDims);
  }
  simulateInternal() {
    super.placeDefaultSection(buildContinentsSettings(this.m_settings));
  }
  getFilename() {
    return "continents.mapconfig.js";
  }
}

export { VoronoiContinents, buildContinentsSettings };
//# sourceMappingURL=continents.js.map
