import { HexValidationSettings, RemoveBridgingLandmassOptions, VoronoiValidationSettings, SeparationFilterOptions } from '../hex-map.js';
import { RandomImpl } from '../random-pcg-32.js';
import { RegionType } from '../voronoi-types.js';
import { VoronoiUtils } from '../voronoi-utils.js';
import shuffleSettings from '../voronoi_data/shuffle.mapconfig.js';
import { continentGeneratorSchema } from '../voronoi_generators/continent-generator.js';
import { archipelagoMapSchema, buildArchipelagoSettings } from './archipelago.js';
import { buildContinentsSettings } from './continents.js';
import { fractalMapSchema, buildFractalSettings } from './fractal.js';
import { shatteredSeasMapSchema, buildShatteredSeasSettings } from './shattered-seas.js';
import { unifiedSectionSchema, UnifiedContinentsBase } from './unified-continents-base.js';

var SectionType = /* @__PURE__ */ ((SectionType2) => {
  SectionType2[SectionType2["Continents"] = 0] = "Continents";
  SectionType2[SectionType2["Fractal"] = 1] = "Fractal";
  SectionType2[SectionType2["Archipelago"] = 2] = "Archipelago";
  SectionType2[SectionType2["ShatteredSeas"] = 3] = "ShatteredSeas";
  return SectionType2;
})(SectionType || {});
const additionalShuffleSettingsSchema = {
  totalSizeScale: {
    label: "Total Size Scale",
    description: "The scale of the total landmass size for this map type relative to the base value.",
    default: 1,
    min: 0.5,
    max: 1.5,
    step: 0.01
  },
  coastalIslands: { ...continentGeneratorSchema.landmass.children.data.coastalIslands },
  coastalIslandsMaxDistance: { ...continentGeneratorSchema.landmass.children.data.coastalIslandsMaxDistance },
  coastalIslandsMinDistance: { ...continentGeneratorSchema.landmass.children.data.coastalIslandsMinDistance },
  coastalIslandsSize: { ...continentGeneratorSchema.landmass.children.data.coastalIslandsSize },
  coastalIslandsSizeVariance: { ...continentGeneratorSchema.landmass.children.data.coastalIslandsSizeVariance }
};
const shuffleMapSchema = {
  sectionCount: {
    label: "Section Count",
    description: "The number of sections to divide the map into when shuffling.",
    default: 2,
    min: 1,
    max: 8,
    step: 1
  },
  sectionSizeVariance: {
    label: "Section Size Variance",
    description: "The maximum variance in section size between sections, as a percentage. For instance, 25 would mean tha the smallest section would be 25% smaller than the largest section.",
    default: 25,
    min: 0,
    max: 80,
    step: 1
  },
  continentsWeight: {
    label: "Continents Weight",
    description: "The relative weight of the continents generator when picking a generator for each section.",
    default: 1,
    min: 0,
    max: 2,
    step: 0.01
  },
  fractalWeight: {
    label: "Fractal Weight",
    description: "The relative weight of the fractal generator when picking a generator for each section.",
    default: 1,
    min: 0,
    max: 2,
    step: 0.01
  },
  archipelagoWeight: {
    label: "Archipelago Weight",
    description: "The relative weight of the archipelago generator when picking a generator for each section.",
    default: 1,
    min: 0,
    max: 2,
    step: 0.01
  },
  shatteredSeasWeight: {
    label: "Shattered Seas Weight",
    description: "The relative weight of the shattered seas generator when picking a generator for each section.",
    default: 1,
    min: 0,
    max: 2,
    step: 0.01
  },
  continentsSettings: {
    label: "Continents Settings",
    description: "The settings to use when the map is generated as a continents map.",
    children: {
      ...unifiedSectionSchema,
      ...additionalShuffleSettingsSchema,
      totalLandmassSize: { ...unifiedSectionSchema.totalLandmassSize, hidden: true }
    }
  },
  fractalSettings: {
    label: "Fractal Settings",
    description: "The settings to use when the map is generated as a fractal map.",
    children: {
      ...unifiedSectionSchema,
      ...fractalMapSchema,
      ...additionalShuffleSettingsSchema,
      totalLandmassSize: { ...unifiedSectionSchema.totalLandmassSize, hidden: true }
    }
  },
  archipelagoSettings: {
    label: "Archipelago Settings",
    description: "The settings to use when the map is generated as a archipelago map.",
    children: {
      ...unifiedSectionSchema,
      ...archipelagoMapSchema,
      ...additionalShuffleSettingsSchema,
      totalLandmassSize: { ...unifiedSectionSchema.totalLandmassSize, hidden: true }
    }
  },
  shatteredSeasSettings: {
    label: "Shattered Seas Settings",
    description: "The settings to use when the map is generated as a shattered seas map.",
    children: {
      ...unifiedSectionSchema,
      ...shatteredSeasMapSchema,
      ...additionalShuffleSettingsSchema,
      totalLandmassSize: { ...unifiedSectionSchema.totalLandmassSize, hidden: true }
    }
  }
};
class VoronoiShuffle extends UnifiedContinentsBase {
  m_sectionTypes = [];
  constructor() {
    super(
      shuffleMapSchema,
      shuffleSettings,
      Object.keys(SectionType).filter((key) => isNaN(Number(key)))
    );
    const schema = this.getGenerator().getSchema();
    const landmassData = schema.landmass.children.data;
    landmassData.coastalIslands.unified = false;
    landmassData.coastalIslands.visible = false;
    landmassData.coastalIslandsMinDistance.unified = false;
    landmassData.coastalIslandsMinDistance.visible = false;
    landmassData.coastalIslandsMaxDistance.unified = false;
    landmassData.coastalIslandsMaxDistance.visible = false;
    landmassData.coastalIslandsSize.unified = false;
    landmassData.coastalIslandsSize.visible = false;
    landmassData.coastalIslandsSizeVariance.unified = false;
    landmassData.coastalIslandsSizeVariance.visible = false;
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
    const sectionAreas = this.buildSectionAreas();
    const sections = sectionAreas.map((area) => this.buildSectionFor(area));
    this.placeSections(sections);
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
  getSectionWeights() {
    return [
      this.m_settings.continentsWeight,
      this.m_settings.fractalWeight,
      this.m_settings.archipelagoWeight,
      this.m_settings.shatteredSeasWeight
    ];
  }
  getSectionTypes(count) {
    const typeWeights = this.getSectionWeights();
    const totalTypeWeight = typeWeights.reduce((a, b) => a + b, 0);
    const sectionTypes = [];
    for (let i = 0; i < count; ++i) {
      const randWeight = RandomImpl.fRand("Section type") * totalTypeWeight;
      let currentWeight = 0;
      for (let j = 0; j < typeWeights.length; ++j) {
        if (j === typeWeights.length - 1) {
          sectionTypes.push(j);
          break;
        } else if (randWeight < typeWeights[j] + currentWeight) {
          sectionTypes.push(j);
          break;
        }
        currentWeight += typeWeights[j];
      }
    }
    return sectionTypes;
  }
  buildSectionAreas() {
    const count = this.m_settings.sectionCount;
    const tau = 2 * Math.PI;
    const startOffset = RandomImpl.fRand("Section start offset") * tau;
    const variance = this.m_settings.sectionSizeVariance * 0.01;
    const [minSize, maxSize] = VoronoiUtils.computeBoundedPartitionRange(count, tau, variance);
    const sectionSizes = VoronoiUtils.distributeTotal(tau, minSize, maxSize, count);
    const areas = [];
    let currentOffset = startOffset;
    this.m_sectionTypes = this.getSectionTypes(count);
    for (let i = 0; i < count; ++i) {
      areas.push({
        type: this.m_sectionTypes[i],
        startRadians: currentOffset,
        sweepRadians: sectionSizes[i]
      });
      currentOffset += sectionSizes[i];
    }
    return areas;
  }
  buildSectionFor(area) {
    const generatorSettings = this.getGenerator().getSettings();
    const landmassDefaults = { ...generatorSettings.landmass[0] };
    const root = this.m_settings;
    const hex = this.m_hexDims;
    const copyAdditionalShuffleSettings = (source) => {
      landmassDefaults.coastalIslands = source.coastalIslands;
      landmassDefaults.coastalIslandsMaxDistance = source.coastalIslandsMaxDistance;
      landmassDefaults.coastalIslandsMinDistance = source.coastalIslandsMinDistance;
      landmassDefaults.coastalIslandsSize = source.coastalIslandsSize;
      landmassDefaults.coastalIslandsSizeVariance = source.coastalIslandsSizeVariance;
    };
    let sectionSettings;
    switch (area.type) {
      case 0 /* Continents */:
        sectionSettings = buildContinentsSettings({ ...root, ...root.continentsSettings });
        copyAdditionalShuffleSettings(root.continentsSettings);
        sectionSettings.totalLandmassSize = root.totalLandmassSize * root.continentsSettings.totalSizeScale;
        break;
      case 1 /* Fractal */:
        sectionSettings = buildFractalSettings({ ...root, ...root.fractalSettings }, hex);
        copyAdditionalShuffleSettings(root.fractalSettings);
        sectionSettings.totalLandmassSize = root.totalLandmassSize * root.fractalSettings.totalSizeScale;
        break;
      case 2 /* Archipelago */:
        sectionSettings = buildArchipelagoSettings({ ...root, ...root.archipelagoSettings }, hex);
        copyAdditionalShuffleSettings(root.archipelagoSettings);
        sectionSettings.totalLandmassSize = root.totalLandmassSize * root.archipelagoSettings.totalSizeScale;
        break;
      case 3 /* ShatteredSeas */:
        sectionSettings = buildShatteredSeasSettings({ ...root, ...root.shatteredSeasSettings }, hex);
        copyAdditionalShuffleSettings(root.shatteredSeasSettings);
        sectionSettings.totalLandmassSize = root.totalLandmassSize * root.shatteredSeasSettings.totalSizeScale;
        break;
    }
    return this.buildSection(
      sectionSettings,
      area.startRadians,
      area.sweepRadians,
      landmassDefaults,
      SectionType[area.type]
    );
  }
  getChosenMapTypes() {
    return this.m_sectionTypes;
  }
  static getName() {
    return "Shuffle";
  }
  getFilename() {
    return "shuffle.mapconfig.js";
  }
}

export { SectionType, VoronoiShuffle, shuffleMapSchema };
//# sourceMappingURL=shuffle.js.map
