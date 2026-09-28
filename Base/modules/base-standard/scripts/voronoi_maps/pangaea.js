import { RandomImpl } from '../random-pcg-32.js';
import { ContinentGenerator, continentGeneratorSchema, continentGeneratorRulesSettings } from '../voronoi_generators/continent-generator.js';
import pangaeaSettings from '../voronoi_data/pangaea.mapconfig.js';
import { VoronoiMap, voronoiMapSchema } from './map-common.js';

class VoronoiPangaea extends VoronoiMap {
  constructor() {
    const generator = new ContinentGenerator(
      { ...continentGeneratorSchema },
      { ...continentGeneratorRulesSettings }
    );
    super(
      { ...voronoiMapSchema },
      generator,
      generator.getDefaultGeneratorSettings(),
      generator.getDefaultRuleSettings(),
      pangaeaSettings
    );
  }
  static getName() {
    return "Pangaea";
  }
  init(hexDims) {
    this.initInternal(hexDims);
  }
  simulateInternal() {
    const settings = this.getGenerator().getSettings();
    settings.landmass[0].playerAreas = this.getSettings().totalPlayers;
    settings.landmass[0].xPos = 0.4 + RandomImpl.fRand("Pangaea seed x") * 0.2;
    settings.landmass[0].yPos = 0.4 + RandomImpl.fRand("Pangaea seed y") * 0.2;
  }
  getFilename() {
    return "pangaea.mapconfig.js";
  }
}

export { VoronoiPangaea };
//# sourceMappingURL=pangaea.js.map
