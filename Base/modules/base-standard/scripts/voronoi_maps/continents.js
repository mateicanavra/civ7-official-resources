import { RandomImpl } from '../random-pcg-32.js';
import { VoronoiUtils } from '../voronoi-utils.js';
import continentSettings from '../voronoi_data/continents.mapconfig.js';
import { continentGeneratorSchema, ContinentGenerator, continentGeneratorRulesSettings } from '../voronoi_generators/continent-generator.js';
import { voronoiMapSchema, VoronoiMap } from './map-common.js';

const continentsSchema = {
  ...voronoiMapSchema,
  totalLandmassSize: {
    label: "Total Landmass Size",
    description: "The total percentage of land to be taken up by the major landmasses.",
    default: 32,
    min: 20,
    max: 50,
    step: 0.25
  },
  minLandmassSize: {
    label: "Minimum Landmass Size",
    description: "The minimum size a specific landmass can be.",
    default: 12,
    min: 5,
    max: 30,
    step: 0.25
  }
};
class VoronoiContinents extends VoronoiMap {
  applyState;
  constructor() {
    const schema = VoronoiUtils.clone(continentGeneratorSchema);
    schema.landmass.children.data.size.locked = true;
    schema.landmass.children.data.variance.locked = true;
    schema.landmass.children.data.coastalIslands.unified = true;
    schema.landmass.children.data.coastalIslandsMaxDistance.unified = true;
    schema.landmass.children.data.coastalIslandsMinDistance.unified = true;
    schema.landmass.children.data.coastalIslandsSize.unified = true;
    schema.landmass.children.data.coastalIslandsSizeVariance.unified = true;
    schema.landmass.children.data.erosionPercent.unified = true;
    schema.landmass.children.data.erosionRandomness.unified = true;
    schema.landmass.children.data.erosionTime.unified = true;
    const generator = new ContinentGenerator(schema, continentGeneratorRulesSettings);
    super(
      continentsSchema,
      generator,
      generator.getDefaultGeneratorSettings(),
      generator.getDefaultRuleSettings(),
      continentSettings
    );
  }
  static getName() {
    return "Continents";
  }
  init(hexDims) {
    this.applyState = void 0;
    this.initInternal(hexDims);
  }
  applySettings() {
    const dims = this.m_hexDims;
    const generatorSettings = this.getGenerator().getTypedSettings();
    const totalPlayers = this.getSettings().totalPlayers;
    const landmassCount = generatorSettings.landmass.length;
    const totalSize = this.m_settings.totalLandmassSize;
    const minSize = this.m_settings.minLandmassSize;
    const tileCount = dims.x * dims.y;
    const avgDim = dims.x + dims.y / 2;
    const landmassSeparationWidth = 4;
    const landmassSeparationTiles = avgDim * (landmassCount - 1) * landmassSeparationWidth;
    const usablePercentage = (tileCount - landmassSeparationTiles) / tileCount;
    const adjustedTotalSize = totalSize * usablePercentage;
    const adjustedMinSize = minSize * usablePercentage;
    let minTotalSize = adjustedMinSize * landmassCount;
    if (adjustedMinSize > adjustedTotalSize) {
      console.error(
        `Minimum landmass size of ${minSize} is too large to fit ${landmassCount} landmasses with less than ${totalSize} total size.`
      );
      minTotalSize = adjustedTotalSize / landmassCount;
    }
    const remaining = adjustedTotalSize - minTotalSize;
    if (this.applyState == void 0) this.applyState = RandomImpl.getState();
    RandomImpl.setState(this.applyState);
    const cuts = Array.from(
      { length: landmassCount - 1 },
      (_value, index) => RandomImpl.fRand(`Landmass ${index + 1} Size Variance`) * remaining
    );
    cuts.sort((a, b) => a - b);
    const landmassSizes = [];
    let prev = 0;
    for (const cut of cuts) {
      landmassSizes.push(cut - prev + adjustedMinSize);
      prev = cut;
    }
    landmassSizes.push(remaining - prev + adjustedMinSize);
    generatorSettings.landmass.forEach((value, index) => {
      value.size = landmassSizes[index];
      value.variance = 2;
    });
    VoronoiUtils.generateLocationsAroundCircle(2, 0.4, 0.6).forEach((location, index) => {
      generatorSettings.landmass[index].xPos = location.x;
      generatorSettings.landmass[index].yPos = location.y;
    });
    const finalTotalSize = generatorSettings.landmass.reduce((acc, cur) => acc + cur.size, 0);
    let remainder = 0;
    console.log(
      `Creating ${totalPlayers} player positions for ${generatorSettings.landmass.length} landmasses with ${finalTotalSize} totalSize...`
    );
    for (const landmass of generatorSettings.landmass) {
      const sizeRatio = landmass.size / finalTotalSize;
      const playerAreas = totalPlayers * sizeRatio + remainder;
      landmass.playerAreas = Math.round(playerAreas);
      console.log(
        `  size ${landmass.size} / ${finalTotalSize} = sizeRatio of ${sizeRatio}. Assigning ${landmass.playerAreas} player areas.`
      );
      remainder = playerAreas - landmass.playerAreas;
    }
  }
  simulateInternal() {
    this.applySettings();
  }
  getSettingsConfig() {
    return this.m_baseSchema;
  }
  getFilename() {
    return "continents.mapconfig.js";
  }
}

export { VoronoiContinents, continentsSchema };
//# sourceMappingURL=continents.js.map
