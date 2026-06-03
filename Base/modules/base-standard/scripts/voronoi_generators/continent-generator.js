import { sub2, rotate2, add2, dot2, dot2_90 } from '../../../core/scripts/MathHelpers.js';
import { QuadTree, WrappedQuadTree } from '../quadtree.js';
import { WindContextDesc, WindContext } from '../utils/wind-context.js';
import { RegionType, TerrainType } from '../voronoi-types.js';
import { RuleAvoidEdge } from '../voronoi_rules/avoid-edge.js';
import { RuleCellArea } from '../voronoi_rules/cell-area.js';
import { RuleCoastalExposure } from '../voronoi_rules/coastal-exposure.js';
import { RuleNearMapCenter } from '../voronoi_rules/near-map-center.js';
import { RuleNearNeighbor } from '../voronoi_rules/near-neighbor.js';
import { RuleNearOtherRegion } from '../voronoi_rules/near-other-region.js';
import { RuleNearPlateBoundary } from '../voronoi_rules/near-plate-boundary.js';
import { RuleNearRegionSeed } from '../voronoi_rules/near-region-seed.js';
import { RulePreferLatitude } from '../voronoi_rules/prefer-latitude.js';
import { GetRuleSpec, ConstructRule } from '../voronoi_rules/registry.js';
import { WrappedKdTree, kdTree } from '../kd-tree.js';
import { RandomImpl } from '../random-pcg-32.js';
import { PlateRegion, LandmassRegion } from '../voronoi-region.js';
import { PlateBoundaryPosGetter, VoronoiUtils, RegionCell, WrapType, RegionCellPosGetter, Aabb2 } from '../voronoi-utils.js';
import { MapGenerator, GeneratorType } from './map-generator.js';
import { RuleAvoidOtherRegions } from '../voronoi_rules/avoid-other-regions.js';
import { RuleNeighborsInRegion } from '../voronoi_rules/neighbors-in-region.js';
import { Rule } from '../voronoi_rules/rules-base.js';

const plateDistributionDescription = "The distribution of sizes of plates is controlled by 'Plate Curve Power' and 'Plate Linear Strength'. This helps the world have a mix of plate sizes. The calculation is a lerp between y=x^(Plate Curve Power) and y=x (linear) based on 'Linear Strength'. A 'Linear Strength' of 1 will mean all the plates are about the same size, less than that and the distribution becomes more curved. 'Plate Curve Power' affects the steepness of the curve";
const continentGeneratorSchema = {
  plate: {
    groupLabel: "Plates",
    children: {
      type: "configs",
      data: {
        factor: {
          label: "Plate Factor",
          description: "Number of tectonic plates to spawn per 100 tiles.",
          min: 0,
          max: 2,
          default: 0.38,
          step: 0.01
        },
        curvePower: {
          label: "Plate Curve Power",
          description: plateDistributionDescription,
          min: 1,
          max: 50,
          default: 4,
          step: 1
        },
        linearStrength: {
          label: "Plate Linear Strength",
          description: plateDistributionDescription,
          min: 0,
          max: 1,
          default: 0.6,
          step: 0.01
        },
        useUniqueVoronoi: {
          label: "Use Unique Voronoi",
          description: "Causes the plate generation to create it's own unique voronoi diagram instead of using the same one as the rest of the map. This allows using fewer cells for plates, leading to more blobby shapes and higher performance.",
          min: 0,
          max: 1,
          default: 1,
          step: 1
        },
        voronoiCellRatio: {
          label: "Cell Count Multiple²",
          description: "When 'Use Unique Voronoi' is on, this affects the ratio of plate voronoi cells relative to the rest of the map, squared.",
          min: 1e-3,
          max: 1,
          default: 0.25,
          step: 1e-3
        },
        plateRotationMultiple: {
          label: "Plate Rotation Multiple",
          description: "A scalar for plate rotation. This is useful since larger plates on big maps will move more around the edges of the plate than smaller ones for the same rotation value.",
          min: 0,
          max: 10,
          default: 1,
          step: 0.1
        }
      }
    }
  },
  landmass: {
    groupLabel: "Landmass",
    childCount: 2,
    children: {
      type: "configs",
      data: {
        enabled: {
          label: "Enabled",
          description: "Controls if this landmass is created. Useful for quickly turning on and off a landmass without removing its settings entirely.",
          min: 0,
          max: 1,
          default: 1,
          step: 1
        },
        groupId: {
          label: "Group Id",
          description: "Controls which group of landmasses this landmass belongs to.",
          min: 0,
          max: 10,
          default: 0,
          step: 1,
          visible: false,
          locked: true
        },
        size: {
          label: "Size %",
          description: "The size of the landmass as a percentage of total map area.",
          min: 5,
          max: 40,
          default: 17,
          step: 0.1
        },
        variance: {
          label: "Variance +/- %",
          description: "The random variance (plus or minus) percentage of the total size.",
          min: 0,
          max: 10,
          default: 1,
          step: 0.01
        },
        xPos: {
          label: "X Position",
          description: "The X position of the landmass as a percentage of total map width.",
          min: 0,
          max: 1,
          step: 0.01,
          default: 0.5,
          visible: false,
          locked: true
        },
        yPos: {
          label: "Y Position",
          description: "The Y position of the landmass as a percentage of total map height.",
          min: 0,
          max: 1,
          default: 0.5,
          step: 0.01,
          visible: false,
          locked: true
        },
        erosionPercent: {
          label: "Erosion Percent",
          description: "The percent of cells in this region to erode.",
          min: 0,
          max: 25,
          step: 0.1,
          default: 8
        },
        erosionTime: {
          label: "Erosion Time",
          description: "This affects how many iterations it takes to erode a tile. High values will cause erosion to be more spread out, low values will cause it to be more concentrated.",
          min: 0,
          max: 1,
          step: 0.01,
          default: 0.5
        },
        erosionRandomness: {
          label: "Erosion Randomness",
          description: "How random erosion selection is. 0 means it always erodes the highest scoring tile, 1 means it's completely random.",
          min: 0,
          max: 1,
          step: 0.01,
          default: 0.25
        },
        playerAreas: {
          label: "Player Areas",
          description: "The number of player areas to spawn on this landmass.",
          min: 0,
          max: 20,
          default: 4
        },
        coastalIslands: {
          label: "Coastal Islands",
          description: "The number of spawn locations for coastal islands. These are cells just off the coast of landmasses, not too close to other landmasses or islands, which are used to add land to the landmass they spawn near. They follow their own grow rules.",
          min: 0,
          max: 20,
          default: 8
        },
        coastalIslandsMinDistance: {
          label: "Coastal Islands Min Distance",
          description: "The minimum distance from the landmass for coastal islands to spawn",
          min: 1,
          max: 4,
          default: 2,
          step: 0.1
        },
        coastalIslandsMaxDistance: {
          label: "Coastal Islands max Distance",
          description: "The maximum distance from the landmass for coastal islands to spawn",
          min: 1,
          max: 4,
          default: 3,
          step: 0.1
        },
        coastalIslandsSize: {
          label: "Coastal Islands Size %",
          description: "The total amount of land area to create as coastal islands around this landmass as a percent of map size.",
          min: 0,
          max: 5,
          default: 1,
          step: 0.01
        },
        coastalIslandsSizeVariance: {
          label: "Coastal Islands Size Variance %",
          description: "The random variance (plus or minus) percentage of the total coastal island size.",
          min: 0,
          max: 5,
          default: 0.5,
          step: 0.01
        }
      }
    }
  },
  island: {
    groupLabel: "Islands",
    children: {
      type: "configs",
      data: {
        factor: {
          label: "Factor",
          description: "The number of distant land islands to spawn per 100 tiles.",
          min: 0,
          max: 2,
          default: 0.3,
          step: 0.01
        },
        minSize: {
          label: "Minimum Size %",
          description: "The minimum size of -each- island as a percentage of total map size.",
          min: 0,
          max: 4,
          default: 0.33,
          step: 0.01
        },
        maxSize: {
          label: "Maximum Size %",
          description: "The maximum size of -each- island as a percentage of total map size.",
          min: 0,
          max: 4,
          default: 2,
          step: 0.01
        },
        totalSize: {
          label: "Size %",
          description: "The total size of all islands combined as a percentage of total map size.",
          min: 0,
          max: 10,
          default: 4,
          step: 0.01
        },
        variance: {
          label: "Variance +/- %",
          description: "The random plus or minus variance in the total size of all islands as a percentage of total map size.",
          min: 0,
          max: 2,
          default: 0.2,
          step: 0.01
        },
        poleDistance: {
          label: "Pole Distance Hexes",
          description: "The minimum distance from the poles that distant land islands can spawn.",
          min: 0,
          max: 10,
          default: 5
        },
        meridianDistance: {
          label: "Meridian Distance Hexes",
          description: "The minimum distance from the meridian that distant land islands can spawn.",
          min: 0,
          max: 10,
          default: 5
        },
        landmassDistance: {
          label: "Min Landmass Distance Hexes",
          description: "The minimum distance from the major landmasses that distant land islands can spawn.",
          min: 0,
          max: 15,
          default: 4
        },
        islandDistance: {
          label: "Min Island Distance Hexes",
          description: "The minimum distance from other islands that distant land islands can spawn.",
          min: 0,
          max: 15,
          default: 3
        },
        erosionPercent: {
          label: "Erosion Percent",
          description: "The percent of cells on any given distant land island to erode.",
          min: 0,
          max: 50,
          default: 20
        },
        erosionTime: {
          label: "Erosion Time",
          description: "This affects how many iterations it takes to erode a tile. High values will cause erosion to be more spread out, low values will cause it to be more concentrated.",
          min: 0,
          max: 1,
          step: 0.01,
          default: 0.5
        },
        erosionRandomness: {
          label: "Erosion Randomness",
          description: "How random erosion selection is. 0 means it always erodes the highest scoring tile, 1 means it's completely random.",
          min: 0,
          max: 1,
          step: 0.01,
          default: 0.25
        }
      }
    }
  },
  mountain: {
    groupLabel: "Mountains",
    children: {
      type: "configs",
      data: {
        percent: {
          label: "Percent of Land",
          description: "The percentage of all land that should be mountainous",
          min: 0,
          max: 50,
          default: 8,
          step: 0.1
        },
        variance: {
          label: "Variance Percent",
          description: "The random +/- percent to the total area covered by mountains",
          min: 0,
          max: 10,
          default: 2,
          step: 0.1
        },
        randomize: {
          label: "Randomize",
          description: "The randomization applied to mountain scores",
          min: 0,
          max: 100,
          default: 2,
          step: 1
        }
      }
    }
  },
  volcano: {
    groupLabel: "Volcanos",
    children: {
      type: "configs",
      data: {
        percent: {
          label: "Percent of Mountains",
          description: "The percentage of all mountains that should be volcanos",
          min: 0,
          max: 50,
          default: 15,
          step: 0.1
        },
        variance: {
          label: "Variance Percent",
          description: "The random +/- percent to the total number of mountains that are volcanos",
          min: 0,
          max: 10,
          default: 5,
          step: 0.1
        },
        randomize: {
          label: "Randomize",
          description: "The randomization applied to volcano scores",
          min: 0,
          max: 100,
          default: 10,
          step: 1
        }
      }
    }
  },
  elevation: {
    groupLabel: "Elevation",
    children: {
      type: "configs",
      data: {}
    }
  }
};
const continentGeneratorRulesSettings = {
  Plates: {
    "Cell Area": { className: RuleCellArea.getName(), weight: 0.15 },
    "Near Neighbor": { className: RuleNearNeighbor.getName(), weight: 0.8, config: { scaleFactor: 0.5 } },
    "Near Region Seed": { className: RuleNearRegionSeed.getName(), weight: 0.02 },
    "Neighbors In Region": {
      className: RuleNeighborsInRegion.getName(),
      weight: 0.6,
      config: { preferredNeighborCount: 6, deviation: 3 }
    }
  },
  Landmasses: {
    "Avoid Edge": {
      className: RuleAvoidEdge.getName(),
      config: {
        poleDistance: 2,
        poleDistanceFalloff: 6,
        poleFalloffCurve: 0.2,
        meridianDistance: 2,
        meridianDistanceFalloff: 6,
        meridianFalloffCurve: 0.3,
        avoidCorners: 12
      }
    },
    "Cell Area": { className: RuleCellArea.getName(), weight: 0.1 },
    "Near Neighbor": { className: RuleNearNeighbor.getName(), weight: 0.5 },
    "Near Region Seed": { className: RuleNearRegionSeed.getName(), weight: 0.05, config: { scaleFactor: 8 } },
    "Neighbors In Region": {
      className: RuleNeighborsInRegion.getName(),
      weight: 0.25,
      config: { preferredNeighborCount: 4, deviation: 1.5 }
    },
    "Near Map Center": { className: RuleNearMapCenter.getName(), weight: 0.05 },
    "Avoid Other Regions": {
      className: RuleAvoidOtherRegions.getName(),
      config: { minDistance: 4, distanceFalloff: 8, falloffCurve: 0.2 }
    },
    "Avoid Other Region Groups": {
      className: RuleAvoidOtherRegions.getName(),
      config: { minDistance: 4, distanceFalloff: 8, falloffCurve: 0.2 }
    },
    "Near Plate Boundary": {
      className: RuleNearPlateBoundary.getName(),
      weight: 0.75,
      config: { scaleFactor: 3, directionInfluence: 0.5 }
    },
    "Prefer Latitude": { className: RulePreferLatitude.getName(), weight: 0.5 },
    "Near Other Region": { className: RuleNearOtherRegion.getName(), weight: 0.5, isActive: false }
  },
  "Coastal Islands": {
    "Avoid Edge": {
      className: RuleAvoidEdge.getName(),
      config: {
        poleDistance: 2,
        poleDistanceFalloff: 4,
        poleFalloffCurve: 0.2,
        meridianDistance: 2,
        meridianDistanceFalloff: 10,
        meridianFalloffCurve: 0.3,
        avoidCorners: 12
      }
    },
    "Near Neighbor": { className: RuleNearNeighbor.getName(), weight: 0.5 },
    "Avoid Other Regions": {
      className: RuleAvoidOtherRegions.getName(),
      config: { minDistance: 4, distanceFalloff: 2, falloffCurve: 0.25 }
    },
    "Avoid Other Region Groups": {
      className: RuleAvoidOtherRegions.getName(),
      config: { minDistance: 4, distanceFalloff: 8, falloffCurve: 0.2 }
    },
    "Avoid Own Region": {
      className: RuleAvoidOtherRegions.getName(),
      config: { minDistance: 0.25, distanceFalloff: 2, falloffCurve: 0.25 }
    },
    "Avoid Islands": {
      className: RuleAvoidOtherRegions.getName(),
      config: { minDistance: 4, distanceFalloff: 2, falloffCurve: 0.25 }
    },
    "Near Plate Boundary": {
      className: RuleNearPlateBoundary.getName(),
      weight: 0.75,
      config: { scaleFactor: 3, directionInfluence: 0.5 }
    },
    "Near Region Seed": {
      className: RuleNearRegionSeed.getName(),
      weight: 0.3,
      config: { scaleFactor: 15, invert: 1 }
    }
  },
  Islands: {
    "Avoid Edge": {
      className: RuleAvoidEdge.getName(),
      config: {
        poleDistance: 2,
        poleDistanceFalloff: 8,
        poleFalloffCurve: 0.5,
        meridianDistance: 2,
        meridianDistanceFalloff: 10,
        meridianFalloffCurve: 0.3,
        avoidCorners: 12
      }
    },
    "Cell Area": { className: RuleCellArea.getName(), weight: 0.15 },
    "Near Neighbor": { className: RuleNearNeighbor.getName(), weight: 0.9, config: { scaleFactor: 0.5 } },
    "Near Region Seed": { className: RuleNearRegionSeed.getName(), weight: 0.03 },
    "Neighbors In Region": {
      className: RuleNeighborsInRegion.getName(),
      weight: 0.6,
      config: { preferredNeighborCount: 1.5, deviation: 0.5 }
    },
    "Near Map Center": { className: RuleNearMapCenter.getName(), weight: 0.04 },
    "Avoid Other Regions": {
      className: RuleAvoidOtherRegions.getName(),
      config: { minDistance: 4, distanceFalloff: 4, falloffCurve: 0.15 }
    },
    "Near Plate Boundary": {
      className: RuleNearPlateBoundary.getName(),
      weight: 0.75,
      config: { scaleFactor: 2, directionInfluence: 0.8 }
    }
  },
  Erosion: {
    "Neighbors In Region": {
      className: RuleNeighborsInRegion.getName(),
      weight: 0.6,
      config: { preferredNeighborCount: 1, deviation: 3 }
    },
    "Near Plate Boundary": {
      className: RuleNearPlateBoundary.getName(),
      weight: 0.75,
      config: { scaleFactor: 1, directionInfluence: 0.4, invert: true }
    },
    "Wave Exposure": {
      className: RuleCoastalExposure.getName(),
      weight: 0.5,
      config: { exposureFactor: 0.5, alignment: -1, tolerance: 1 }
    }
  },
  Mountains: {
    "Cell Area": { className: RuleCellArea.getName(), weight: 0.3, config: { invert: true } },
    "Near Neighbor": { className: RuleNearNeighbor.getName(), weight: 0.25 },
    "Neighbors In Region": {
      className: RuleNeighborsInRegion.getName(),
      weight: 0.6,
      config: { preferredNeighborCount: 6, deviation: 4 }
    },
    "Near Plate Boundary": {
      className: RuleNearPlateBoundary.getName(),
      weight: 0.75,
      config: { scaleFactor: 1, directionInfluence: 0.4 }
    }
  },
  Volcanoes: {
    "Cell Area": { className: RuleCellArea.getName(), weight: 0.3, config: { invert: true } },
    "Neighbors In Region": {
      className: RuleNeighborsInRegion.getName(),
      weight: 0.9,
      config: { preferredNeighborCount: 0, deviation: 1 }
    }
  },
  Elevation: {
    "Near Plate Boundary": {
      className: RuleNearPlateBoundary.getName(),
      weight: 0.75,
      config: { scaleFactor: 1, directionInfluence: 0.4 }
    },
    "Cell Area": { className: RuleCellArea.getName(), weight: 0.3, config: { invert: true } },
    "Near Neighbor": { className: RuleNearNeighbor.getName(), weight: 0.25 },
    "Avoid Other Regions": {
      className: RuleAvoidOtherRegions.getName(),
      config: { minDistance: 0, distanceFalloff: 10, falloffCurve: 0.15 }
    }
  }
};
const getAvoidOwnRegionFilter = (regionId) => (ctx, item) => ctx.region.getRegionIdForCell(item) === regionId;
const getAvoidOtherRegionsFilter = (thisRegionId) => (ctx, item) => {
  const cellRegionId = ctx.region.getRegionIdForCell(item);
  return cellRegionId != thisRegionId && cellRegionId != 0 && cellRegionId != ctx.region.id;
};
const getAvoidOtherRegionGroupsFilter = () => (ctx, item) => {
  const cellRegion = ctx.regions[ctx.region.getRegionIdForCell(item)];
  return cellRegion.type != RegionType.Ocean && cellRegion.groupId != ctx.region.groupId;
};
const getAvoidIslandsFilter = () => (ctx, item) => ctx.regions[ctx.region.getRegionIdForCell(item)].type === RegionType.Island;
class ContinentGenerator extends MapGenerator {
  m_generatorSettingsSchema;
  m_ruleSettings;
  m_plateRegions = [];
  m_landmassRegions = [];
  m_plateBoundaries = new WrappedKdTree(PlateBoundaryPosGetter);
  m_platesDiagram;
  m_plateCells = [];
  m_rules;
  constructor(generatorSchema, rulesSettings) {
    super();
    this.m_generatorSettingsSchema = generatorSchema;
    this.m_ruleSettings = rulesSettings;
    this.constructRules();
  }
  getDefaultGeneratorSettings() {
    return MapGenerator.buildDefaultSettings(this.m_generatorSettingsSchema);
  }
  getDefaultRuleSettings() {
    const defaults = {};
    for (const [ruleCategory, rulesForCategory] of Object.entries(this.m_ruleSettings)) {
      const cat = defaults[ruleCategory] = {};
      for (const [ruleName, ruleSettings] of Object.entries(rulesForCategory)) {
        const ruleSpec = GetRuleSpec(ruleSettings.className);
        cat[ruleName] = {
          isActive: Boolean(ruleSettings.isActive) || true,
          weight: Number(ruleSettings.weight) || 1,
          ...Rule.createDefaultsFromSpecs(ruleSpec)
        };
      }
    }
    return defaults;
  }
  getSchema() {
    return this.m_generatorSettingsSchema;
  }
  constructRules() {
    const rules = {};
    for (const [ruleCategory, rulesForCategory] of Object.entries(this.m_ruleSettings)) {
      const cat = rules[ruleCategory] = {};
      for (const [ruleName, ruleSettings] of Object.entries(rulesForCategory)) {
        const rule = ConstructRule(ruleSettings.className);
        cat[ruleName] = rule;
      }
    }
    this.m_rules = rules;
    this.m_rules.Landmasses["Near Plate Boundary"].init(this.m_plateBoundaries);
    this.m_rules["Coastal Islands"]["Near Plate Boundary"].init(this.m_plateBoundaries);
    this.m_rules.Islands["Near Plate Boundary"].init(this.m_plateBoundaries);
    this.m_rules.Mountains["Near Plate Boundary"].init(this.m_plateBoundaries);
    this.m_rules.Elevation["Near Plate Boundary"].init(this.m_plateBoundaries);
    this.m_rules.Erosion["Near Plate Boundary"].init(this.m_plateBoundaries);
    this.m_rules.Erosion["Neighbors In Region"].inRegionCheck = (ctx, _thisCell, neighborCell) => {
      return ctx.region.getRegionIdForCell(neighborCell) === ctx.region.id && neighborCell.terrainType === TerrainType.Flat;
    };
    const windDesc = new WindContextDesc();
    this.m_rules.Erosion["Wave Exposure"].init(
      [TerrainType.Flat],
      new WindContext(windDesc)
    );
    const volcanoNeighborRule = this.m_rules.Volcanoes["Neighbors In Region"];
    volcanoNeighborRule.inRegionCheck = (_ctx, thisCell, neighborCell) => {
      return thisCell.terrainType === neighborCell.terrainType;
    };
  }
  getType() {
    return GeneratorType.Continent;
  }
  getTypedSettings() {
    return this.getSettings();
  }
  getRules() {
    return this.m_rules;
  }
  getLandmassRegions() {
    return this.m_landmassRegions;
  }
  simulate() {
    for (const regionCell of this.m_regionCells) {
      regionCell.reset();
    }
    VoronoiUtils.performanceMarker("Grow Plates");
    this.growPlates();
    VoronoiUtils.performanceMarker("Grow Landmasses");
    this.growLandmasses();
    VoronoiUtils.performanceMarker("Grow Islands");
    this.growIslands();
    VoronoiUtils.performanceMarker("Grow Coastal Islands");
    this.growCoastalIslands();
    VoronoiUtils.performanceMarker("Force Polar Margin");
    this.forcePoles();
    VoronoiUtils.performanceMarker("Mark Land and Ocean Tiles");
    this.markLandAndOcean();
    VoronoiUtils.performanceMarker("Remove Lakes");
    this.removeLakes();
    VoronoiUtils.performanceMarker("Add Coasts & Costal Erosion");
    this.addCoasts();
    VoronoiUtils.performanceMarker("Add Mountains & Volcanos");
    this.addMountains();
  }
  clearTempCellData() {
    for (const regionCell of this.m_regionCells) {
      regionCell.currentScore = 0;
      regionCell.regionConsiderationBits = 0n;
      regionCell.ruleConsideration = false;
    }
  }
  choosePlateToGrow(power, linearStrength, plateCount) {
    const x = RandomImpl.fRand("Plate Growth");
    const curve = plateCount * Math.pow(x, power);
    const linear = plateCount * x;
    return Math.floor(VoronoiUtils.lerp(curve, linear, linearStrength));
  }
  growPlates() {
    const area = this.m_worldDims.x * this.m_worldDims.y;
    const plateCount = Math.round(this.getTypedSettings().plate.factor * 0.01 * area) + 1;
    const power = this.getTypedSettings().plate.curvePower;
    const linearStrength = this.getTypedSettings().plate.linearStrength;
    const useUniqueDiagram = this.getTypedSettings().plate.useUniqueVoronoi;
    let voronoiCellRatio = this.getTypedSettings().plate.voronoiCellRatio;
    voronoiCellRatio *= voronoiCellRatio;
    const plateRotationMultiple = this.getTypedSettings().plate.plateRotationMultiple;
    const bbox = { xl: 0, xr: this.m_worldDims.x, yt: 0, yb: this.m_worldDims.y };
    const sites = VoronoiUtils.createRandomSites(plateCount, bbox.xr, bbox.yb);
    const diagram = VoronoiUtils.computeVoronoi(sites, bbox, 5);
    this.m_plateCells = this.m_regionCells;
    let cellKdTree = this.m_kdTree;
    if (useUniqueDiagram) {
      const cellCount = Math.floor(this.m_hexDims.x * this.m_hexDims.y * voronoiCellRatio);
      const sites2 = VoronoiUtils.createRandomSites(cellCount, bbox.xr, bbox.yb);
      this.m_platesDiagram = VoronoiUtils.computeVoronoi(sites2, bbox, 2, this.m_wrap);
      this.m_plateCells = this.m_platesDiagram.cells.map((cell, index) => {
        const area2 = VoronoiUtils.calculateCellArea(cell);
        const regionCell = new RegionCell(cell, index, area2);
        return regionCell;
      });
      if (this.m_wrap == WrapType.None) {
        cellKdTree = new kdTree(RegionCellPosGetter);
      } else {
        cellKdTree = new WrappedKdTree(
          RegionCellPosGetter,
          new Aabb2({ x: 0, y: 0 }, this.m_worldDims),
          this.m_wrap
        );
      }
      cellKdTree.build(this.m_plateCells);
    } else {
      this.m_platesDiagram = void 0;
    }
    this.m_plateRegions = diagram.cells.map((cell, index) => {
      const region = new PlateRegion("Plate" + index, index, 0, bbox.xr * bbox.yb);
      region.seedLocation = { x: cell.site.x, y: cell.site.y };
      const regionCell = cellKdTree.search(region.seedLocation).data;
      region.considerationList.push({ id: regionCell.id, score: 1 });
      return region;
    });
    for (const region of this.m_plateRegions) {
      region.prepareGrowth(
        this.m_plateCells,
        this.m_plateRegions,
        this.m_rules.Plates,
        this.m_worldDims,
        this.m_plateRegions,
        this.m_wrapDistOpts
      );
      region.growStep();
    }
    const regionFull = new Array(plateCount).fill(false);
    let growingCount = plateCount;
    while (growingCount > 0) {
      let plateToGrow = this.choosePlateToGrow(power, linearStrength, plateCount);
      if (regionFull[plateToGrow]) {
        plateToGrow = 0;
        while (regionFull[plateToGrow]) {
          ++plateToGrow;
        }
      }
      const canGrow = this.m_plateRegions[plateToGrow].growStep();
      if (!canGrow) {
        regionFull[plateToGrow] = true;
        --growingCount;
      }
    }
    if (useUniqueDiagram) {
      for (const regionCell of this.m_regionCells) {
        const plateCell = cellKdTree.search(regionCell.cell.site).data;
        regionCell.plateId = plateCell?.plateId;
      }
    }
    for (const plateRegion of this.m_plateRegions) {
      plateRegion.logStats();
    }
    const plateBoundaries = [];
    for (const plateCell of this.m_plateCells) {
      plateCell.ruleConsideration = true;
      for (const neighborId of plateCell.cell.getNeighborIds()) {
        const neighbor = this.m_plateCells[neighborId];
        if (neighbor.plateId !== plateCell.plateId && !neighbor.ruleConsideration) {
          const pos = {
            x: (plateCell.cell.site.x + neighbor.cell.site.x) * 0.5,
            y: (plateCell.cell.site.y + neighbor.cell.site.y) * 0.5
          };
          const normal = VoronoiUtils.normalize({
            x: neighbor.cell.site.x - plateCell.cell.site.x,
            y: neighbor.cell.site.y - plateCell.cell.site.y
          });
          const calculateMovement = (plate, pos2) => {
            const relPos = sub2(pos2, plate.seedLocation);
            const angularMovement = plate.m_rotation * Math.PI / 180 * plateRotationMultiple;
            const rotatedPos = rotate2(relPos, angularMovement);
            const rotationMovement = sub2(relPos, rotatedPos);
            const movement = add2(rotationMovement, plate.m_movement);
            return movement;
          };
          const plate1Movement = calculateMovement(this.m_plateRegions[plateCell.plateId], pos);
          const plate2Movement = calculateMovement(this.m_plateRegions[neighbor.plateId], pos);
          const subduction = dot2(normal, plate1Movement) - dot2(normal, plate2Movement);
          const sliding = Math.abs(dot2_90(normal, plate1Movement) - dot2_90(normal, plate2Movement));
          plateBoundaries.push({
            pos,
            normal,
            plateSubduction: subduction,
            plateSliding: sliding,
            id1: plateCell.plateId,
            id2: neighbor.plateId
          });
        }
      }
    }
    this.m_plateBoundaries.bounds = new Aabb2({ x: 0, y: 0 }, this.m_worldDims);
    this.m_plateBoundaries.wrapType = this.m_wrap;
    this.m_plateBoundaries.build(plateBoundaries);
  }
  growLandmasses() {
    this.m_landmassRegions = this.buildLandmassRegions();
    for (const region of this.m_landmassRegions) {
      region.considerationList = [];
    }
    for (let i = 1; i < this.m_landmassRegions.length; i++) {
      const cell = this.m_kdTree.search(this.m_landmassRegions[i].seedLocation).data;
      this.m_landmassRegions[i].considerationList.push({ id: cell.id, score: 1 });
    }
    const growingRegions = this.m_landmassRegions.slice(1);
    const quadRegion = new Aabb2({ x: 0, y: 0 }, this.m_worldDims);
    const quadGetPos = (item) => item.cell.site;
    const quadTree = this.m_wrap == WrapType.None ? new QuadTree(quadRegion, quadGetPos) : new WrappedQuadTree(quadRegion, quadGetPos, void 0, void 0, this.m_wrap);
    const landmassRules = this.getRules().Landmasses;
    for (const [ruleName, rule] of Object.entries(landmassRules)) {
      if (!rule.isActive) continue;
      if (rule.name == RuleAvoidOtherRegions.getName()) {
        const avoidOtherRegionsRule = rule;
        avoidOtherRegionsRule.setQuadTree(quadTree);
        if (ruleName == "Avoid Other Region Groups") {
          avoidOtherRegionsRule.setFilter(getAvoidOtherRegionGroupsFilter());
        }
      } else if (rule.name == RuleNearOtherRegion.getName()) {
        const regionPositions = this.m_landmassRegions.reduce((acc, value) => {
          if (value.id > 0) {
            acc.push({ regionId: value.id, pos: value.seedLocation });
          }
          return acc;
        }, []);
        rule.buildFromDelaunayTriangulation(
          regionPositions,
          { xl: 0, xr: this.m_worldDims.x, yt: 0, yb: this.m_worldDims.y },
          this.m_wrap
        );
        rule.setQuadTree(quadTree);
      }
    }
    for (const region of growingRegions) {
      region.prepareGrowth(
        this.m_regionCells,
        this.m_landmassRegions,
        landmassRules,
        this.m_worldDims,
        this.m_plateRegions,
        this.m_wrapDistOpts
      );
      region.SetQuadTree(quadTree);
    }
    let regionIndex = 0;
    while (growingRegions.length > 0) {
      if (!growingRegions[regionIndex].growStep()) {
        growingRegions.splice(regionIndex, 1);
      } else {
        regionIndex++;
      }
      regionIndex %= growingRegions.length;
    }
  }
  growIslands() {
    const area = this.getUsableArea();
    const islandSettings = this.getTypedSettings().island;
    let islandMinSize = islandSettings.minSize;
    let islandMaxSize = islandSettings.maxSize;
    const islandCount = Math.round(islandSettings.factor * area * 0.01);
    const randsForIndices = Array.from({ length: islandCount }, () => RandomImpl.fRand("Island Index"));
    if (islandMinSize > islandMaxSize) {
      console.log("Error: Island min size is larger than max size. Capping min size to the max size");
      islandMinSize = islandMaxSize;
    }
    if (islandMinSize * islandCount > islandSettings.totalSize - islandSettings.variance) {
      console.log("Error: Island min size is too large. Capping value to total size / the number of islands.");
      islandMinSize = (islandSettings.totalSize - islandSettings.variance) / islandCount;
    }
    if (islandMaxSize * islandCount < islandSettings.totalSize + islandSettings.variance) {
      console.log("Error: Island max size is too small. Capping value to total size / the number of islands.");
      islandMaxSize = (islandSettings.totalSize + islandSettings.variance) / islandCount;
    }
    const finalTotalSize = islandSettings.totalSize + RandomImpl.fRand("Island Size Variance") * islandSettings.variance * 2 - islandSettings.variance;
    const maxMinDifference = islandMaxSize - islandMinSize;
    let randomSizeRemaining = finalTotalSize - islandMinSize * islandCount;
    const islandSizes = Array.from({ length: islandCount }, () => islandMinSize);
    for (let i = 0; i < islandSizes.length - 1; ++i) {
      const maxAdded = Math.min(maxMinDifference, randomSizeRemaining);
      const averageRandomSize = randomSizeRemaining / islandCount;
      const randomPower = Math.log(averageRandomSize / maxAdded) / Math.log(0.5);
      const randomSize = Math.pow(RandomImpl.fRand("Island Random Size"), randomPower) * maxAdded;
      randomSizeRemaining -= randomSize;
      islandSizes[i] += randomSize;
    }
    islandSizes[islandSizes.length - 1] += randomSizeRemaining;
    console.log(`Creating ${islandSizes.length} islands. Sizes: ${islandSizes}`);
    const maxLandmassCellCount = Math.max(...this.m_landmassRegions.map((r) => r.cellCount));
    const commonIslandsRegion = new LandmassRegion(
      "Islands",
      this.m_landmassRegions.length,
      0,
      RegionType.Island,
      0,
      0
    );
    commonIslandsRegion.minOrder = maxLandmassCellCount;
    this.m_landmassRegions.push(commonIslandsRegion);
    const landmassesKdTree = this.m_wrap == WrapType.None ? new kdTree(RegionCellPosGetter) : new WrappedKdTree(
      RegionCellPosGetter,
      new Aabb2({ x: 0, y: 0 }, this.m_worldDims),
      this.m_wrap
    );
    landmassesKdTree.build(
      this.m_regionCells.filter(
        (value) => this.m_landmassRegions[value.landmassId].type === RegionType.Landmass
      )
    );
    for (let i = 0; i < islandCount; ++i) {
      const islandKdTree = this.m_wrap == WrapType.None ? new kdTree(RegionCellPosGetter) : new WrappedKdTree(
        RegionCellPosGetter,
        new Aabb2({ x: 0, y: 0 }, this.m_worldDims),
        this.m_wrap
      );
      islandKdTree.build(
        this.m_regionCells.filter(
          (value) => this.m_landmassRegions[value.landmassId].type === RegionType.Island
        )
      );
      Object.values(this.m_rules.Islands).forEach((rule) => rule.prepare());
      const scoreCtx = {
        cells: this.m_regionCells,
        region: commonIslandsRegion,
        regions: this.m_landmassRegions,
        plateRegions: this.m_plateRegions,
        m_worldDims: this.m_worldDims,
        totalArea: 0,
        cellCount: 0,
        rules: this.m_rules.Islands,
        wrap: this.m_wrapDistOpts
      };
      const islandSeedCandidates = [];
      for (const regionCell of this.m_regionCells) {
        const x = regionCell.cell.site.x;
        const y = regionCell.cell.site.y;
        if (x < islandSettings.meridianDistance || x > this.m_worldDims.x - islandSettings.meridianDistance || y < islandSettings.poleDistance || y > this.m_worldDims.y - islandSettings.poleDistance || regionCell.landmassId > 0)
          continue;
        const distanceToLandmass = Math.sqrt(landmassesKdTree.search({ x, y }).distSq);
        const nearestIsland = islandKdTree.search({ x, y });
        const distanceToIsland = nearestIsland ? Math.sqrt(nearestIsland.distSq) : Infinity;
        if (distanceToLandmass > islandSettings.landmassDistance && distanceToIsland > islandSettings.islandDistance) {
          let score = 0;
          for (const rule of Object.values(this.m_rules.Islands)) {
            if (rule.isActive) {
              score += rule.score(regionCell, scoreCtx) * rule.weight;
            }
          }
          score *= distanceToIsland === Infinity ? 1 : distanceToIsland;
          islandSeedCandidates.push([score, regionCell]);
        }
      }
      if (islandSeedCandidates.length == 0) {
        console.log("Failed to find any candidate locations for island.");
        break;
      }
      islandSeedCandidates.sort((a, b) => a[0] - b[0]);
      const randomIndex = Math.floor(
        VoronoiUtils.lerp(islandSeedCandidates.length * 0.9, islandSeedCandidates.length, randsForIndices[i])
      );
      const finalIslandSize = islandSizes[i] * 0.01 * area;
      const islandRegion = new LandmassRegion(
        "Island" + String(i),
        this.m_landmassRegions.length,
        0,
        RegionType.Island,
        finalIslandSize,
        0
      );
      islandRegion.seedLocation = islandSeedCandidates[randomIndex][1].cell.site;
      this.m_landmassRegions.push(islandRegion);
      islandRegion.prepareGrowth(
        this.m_regionCells,
        this.m_landmassRegions,
        this.m_rules.Islands,
        this.m_worldDims,
        this.m_plateRegions,
        this.m_wrapDistOpts
      );
      islandRegion.considerationList.push({ id: islandSeedCandidates[randomIndex][1].id, score: 1 });
      while (islandRegion.growStep()) {
        continue;
      }
      islandRegion.logStats();
      this.m_landmassRegions.pop();
      this.m_regionCells.forEach((value) => {
        if (value.landmassId === islandRegion.id) {
          value.landmassId = commonIslandsRegion.id;
          value.landmassOrder += maxLandmassCellCount;
        }
      });
    }
  }
  growCoastalIslands() {
    const oceanCells = this.m_regionCells.filter((cell) => cell.landmassId === 0);
    for (let i = 1; i < this.m_landmassRegions.length; ++i) {
      const landmassRegion = this.m_landmassRegions[i];
      if (landmassRegion.type !== RegionType.Landmass) {
        continue;
      }
      const landmassSettings = this.getTypedSettings().landmass[i - 1];
      let coastalIslandSpawnCount = landmassSettings.coastalIslands;
      if (coastalIslandSpawnCount === 0) {
        continue;
      }
      const minLandmassRange = landmassSettings.coastalIslandsMinDistance;
      const maxLandmassRange = landmassSettings.coastalIslandsMaxDistance;
      const nearCoastCells = oceanCells.filter((cell) => {
        let nearRegion = false;
        const filterCallback = (considerCell) => {
          if (considerCell.landmassId === landmassRegion.id) {
            if (VoronoiUtils.distanceBetweenSites(
              cell.cell.site,
              considerCell.cell.site,
              this.m_wrapDistOpts
            ) > minLandmassRange) {
              nearRegion = true;
            } else {
              return VoronoiUtils.RegionCellFilterResult.HaltFail;
            }
          } else if (considerCell.landmassId > 0) {
            return VoronoiUtils.RegionCellFilterResult.HaltFail;
          }
          return VoronoiUtils.RegionCellFilterResult.Continue;
        };
        const filterResult = VoronoiUtils.regionCellAreaFilter(
          cell,
          this.m_regionCells,
          maxLandmassRange,
          filterCallback,
          this.m_wrapDistOpts
        );
        return filterResult === VoronoiUtils.RegionCellFilterResult.Continue ? nearRegion : false;
      });
      console.log(
        "Checking " + nearCoastCells.length + " cells near landmass " + landmassRegion.id + " for coastal island spots"
      );
      const coastalIslandRegionId = this.m_landmassRegions.length;
      let minOtherLandmassRange = 4;
      for (const [ruleName, rule] of Object.entries(this.m_rules["Coastal Islands"])) {
        if (rule instanceof RuleAvoidOtherRegions) {
          const avoidOtherRegionsRule = rule;
          if (ruleName === "Avoid Own Region") {
            avoidOtherRegionsRule.setFilter(getAvoidOwnRegionFilter(landmassRegion.id));
            console.log(`setting islands for landmass ${landmassRegion.id} to slightly avoid self.`);
          } else if (ruleName === "Avoid Other Regions") {
            avoidOtherRegionsRule.setFilter(getAvoidOtherRegionsFilter(landmassRegion.id));
            minOtherLandmassRange = Math.min(
              avoidOtherRegionsRule.configValues.minDistance,
              minOtherLandmassRange
            );
            console.log(
              `setting islands for landmass ${landmassRegion.id} to strongly avoid other regions.`
            );
          } else if (ruleName === "Avoid Other Region Groups") {
            avoidOtherRegionsRule.setFilter(getAvoidOtherRegionGroupsFilter());
            minOtherLandmassRange = Math.min(
              avoidOtherRegionsRule.configValues.minDistance,
              minOtherLandmassRange
            );
            console.log(
              `setting islands for landmass ${landmassRegion.id} to strongly avoid other region groups.`
            );
          } else if (ruleName === "Avoid Islands") {
            avoidOtherRegionsRule.setFilter(getAvoidIslandsFilter());
            console.log(
              `setting islands for landmass ${landmassRegion.id} to strongly avoid distant islands.`
            );
          }
        }
      }
      const islandSpawnList = nearCoastCells.filter((cell) => {
        const filterCallback = (considerCell) => {
          if (considerCell.landmassId != 0 && considerCell.landmassId != landmassRegion.id) {
            return VoronoiUtils.RegionCellFilterResult.HaltFail;
          }
          return VoronoiUtils.RegionCellFilterResult.Continue;
        };
        const filterResult = VoronoiUtils.regionCellAreaFilter(
          cell,
          this.m_regionCells,
          minOtherLandmassRange,
          filterCallback,
          this.m_wrapDistOpts
        );
        return filterResult === VoronoiUtils.RegionCellFilterResult.Continue;
      });
      const area = this.getUsableArea();
      const coastalIslandSize = landmassSettings.coastalIslandsSize;
      let coastalIslandSizeVariance = landmassSettings.coastalIslandsSizeVariance;
      coastalIslandSizeVariance *= RandomImpl.fRand("Coastal Island Size Variance") * 2 - 1;
      const finalIslandSize = (coastalIslandSize + coastalIslandSizeVariance) * 0.01 * area;
      const coastalIslandRegion = new LandmassRegion(
        "CoastalIsland",
        coastalIslandRegionId,
        landmassRegion.groupId,
        RegionType.CoastalIsland,
        finalIslandSize,
        0
      );
      this.m_landmassRegions.push(coastalIslandRegion);
      coastalIslandRegion.seedLocation = landmassRegion.seedLocation;
      coastalIslandRegion.prepareGrowth(
        this.m_regionCells,
        this.m_landmassRegions,
        this.m_rules["Coastal Islands"],
        this.m_worldDims,
        this.m_plateRegions,
        this.m_wrapDistOpts
      );
      console.log("Found " + islandSpawnList.length + " cells for coastal island spots");
      if (islandSpawnList.length == 0) continue;
      let scoredIslandSpawnList = islandSpawnList.map(
        (value) => {
          return { cell: value, score: coastalIslandRegion.scoreSingleCell(value) };
        }
      );
      scoredIslandSpawnList = scoredIslandSpawnList.filter((value) => value.score > 0);
      coastalIslandSpawnCount = Math.min(coastalIslandSpawnCount, scoredIslandSpawnList.length);
      scoredIslandSpawnList.sort((a, b) => b.score - a.score);
      scoredIslandSpawnList = scoredIslandSpawnList.slice(
        0,
        Math.max(coastalIslandSpawnCount, scoredIslandSpawnList.length * 0.5)
      );
      VoronoiUtils.shuffle(scoredIslandSpawnList, coastalIslandSpawnCount);
      scoredIslandSpawnList = scoredIslandSpawnList.slice(0, coastalIslandSpawnCount);
      scoredIslandSpawnList.forEach((tuple) => {
        coastalIslandRegion.considerationList.push({ id: tuple.cell.id, score: tuple.score });
      });
      let coastalCellCount = 0;
      while (coastalIslandRegion.growStep()) {
        ++coastalCellCount;
      }
      this.m_landmassRegions.pop();
      this.m_regionCells.forEach((cell) => {
        if (cell.landmassId == coastalIslandRegion.id) {
          cell.landmassId = landmassRegion.id;
          cell.landmassOrder += landmassRegion.cellCount;
        }
      });
      landmassRegion.cellCount += coastalCellCount;
    }
  }
  forcePoles() {
    for (const cell of this.m_regionCells) {
      const minDist = 2;
      if (cell.cell.site.y < minDist || cell.cell.site.y > this.m_worldDims.y - minDist) {
        cell.landmassId = 0;
      }
    }
  }
  markLandAndOcean() {
    for (const cell of this.m_regionCells) {
      cell.terrainType = cell.landmassId > 0 ? TerrainType.Flat : TerrainType.Ocean;
    }
  }
  removeLakes() {
    this.clearTempCellData();
    for (let cell of this.m_regionCells) {
      if (cell.terrainType == TerrainType.Ocean && cell.regionConsiderationBits == 0n) {
        let isInlandSea = false;
        let neighboringLandmassId = 0;
        const considerationList = [cell];
        const lakeList = [];
        cell.ruleConsideration = true;
        while (considerationList.length > 0) {
          cell = considerationList.pop();
          cell.regionConsiderationBits = 1n;
          lakeList.push(cell);
          let neighborsLand = false;
          for (const neighborId of cell.cell.getNeighborIds()) {
            const neighbor = this.m_regionCells[neighborId];
            if (!neighbor.ruleConsideration) {
              if (neighbor.terrainType == TerrainType.Ocean) {
                neighbor.ruleConsideration = true;
                considerationList.push(neighbor);
              } else {
                neighborsLand = true;
                neighboringLandmassId = neighbor.landmassId;
              }
            }
          }
          if (!neighborsLand) {
            isInlandSea = true;
          }
        }
        if (isInlandSea) {
          lakeList.forEach((cell2) => {
            cell2.ruleConsideration = false;
          });
        } else {
          lakeList.forEach((cell2) => {
            cell2.ruleConsideration = false;
            cell2.terrainType = TerrainType.Flat;
            cell2.landmassId = neighboringLandmassId;
          });
        }
      }
    }
  }
  addCoasts() {
    for (const region of this.m_landmassRegions) {
      if (region.id === 0) continue;
      const coastalCells = [];
      let erosionTime = region.type === RegionType.Landmass ? this.getTypedSettings().landmass[region.id - 1].erosionTime : this.getTypedSettings().island.erosionTime;
      erosionTime *= erosionTime;
      const addToCoastalCells = (cell, time) => {
        coastalCells.push(cell);
        cell.regionConsiderationBits = time;
      };
      const removeFromCoastalCells = (idx) => {
        const cell = VoronoiUtils.swapAndPop(coastalCells, idx);
        cell.regionConsiderationBits = 0n;
        cell.currentScore = 0;
        return cell;
      };
      const regionCells = this.m_regionCells.filter((cell) => cell.landmassId === region.id);
      for (const regionCell of regionCells) {
        regionCell.regionConsiderationBits = 0n;
        let isByCoast = false;
        for (const neighborId of regionCell.cell.getNeighborIds()) {
          const neighbor = this.m_regionCells[neighborId];
          if (neighbor.terrainType == TerrainType.Ocean) {
            isByCoast = true;
            neighbor.terrainType = TerrainType.Coast;
            neighbor.landmassId = region.id;
            neighbor.landmassOrder = region.minOrder + region.cellCount;
            region.cellCount++;
          }
        }
        if (isByCoast) {
          addToCoastalCells(regionCell, 1n);
        }
      }
      const erosionPercent = region.type === RegionType.Landmass ? this.getTypedSettings().landmass[region.id - 1].erosionPercent : this.getTypedSettings().island.erosionPercent;
      const erosionFactor = VoronoiUtils.clamp(0.01 * erosionPercent, 0, 1);
      const cellsToErode = erosionFactor * regionCells.length;
      const scoreCtx = {
        cells: this.m_regionCells,
        region,
        regions: this.m_landmassRegions,
        plateRegions: this.m_plateRegions,
        m_worldDims: this.m_worldDims,
        totalArea: 0,
        cellCount: 0,
        rules: this.m_rules.Erosion,
        wrap: this.m_wrapDistOpts
      };
      const calculateErosionScore = (cells) => {
        cells.forEach((value) => {
          value.currentScore = 0;
        });
        for (const rule of Object.values(this.m_rules.Erosion)) {
          if (rule.isActive) {
            rule.scoreCells(cells, scoreCtx, (cell) => this.m_landmassRegions[cell.landmassId]);
          }
        }
      };
      calculateErosionScore(coastalCells);
      coastalCells.sort((a, b) => a.currentScore - b.currentScore);
      const randomness = region.type === RegionType.Landmass ? this.getTypedSettings().landmass[region.id - 1].erosionRandomness : this.getTypedSettings().island.erosionRandomness;
      const randFactor = randomness * randomness;
      for (let i = 0; i < cellsToErode && coastalCells.length > 0; ++i) {
        const rand = RandomImpl.fRand("Random Coast");
        const idxToRemove = Math.min(
          Math.floor(Math.pow(rand, randFactor) * coastalCells.length),
          coastalCells.length - 1
        );
        const cell = removeFromCoastalCells(idxToRemove);
        cell.terrainType = TerrainType.Coast;
        const neighbors = cell.cell.getNeighborIds();
        for (const neighborId of neighbors) {
          const neighbor = this.m_regionCells[neighborId];
          if (neighbor.landmassId == region.id && neighbor.terrainType == TerrainType.Flat) {
            calculateErosionScore([neighbor]);
            if (neighbor.regionConsiderationBits == 0n) {
              addToCoastalCells(neighbor, BigInt(i));
            }
          }
        }
        coastalCells.sort((a, b) => {
          const aStepAge = i + 2 - Number(a.regionConsiderationBits);
          const aAgeFactor = 1 + aStepAge * erosionTime;
          const bStepAge = i + 2 - Number(b.regionConsiderationBits);
          const bAgeFactor = 1 + bStepAge * erosionTime;
          return a.currentScore * aAgeFactor - b.currentScore * bAgeFactor;
        });
      }
      for (const cell of coastalCells) {
        cell.regionConsiderationBits = 0n;
        cell.currentScore = 0;
      }
      console.log(
        `Eroded ${cellsToErode} cells on landmass ${region.id} from a total of ${regionCells.length} cells.`
      );
    }
  }
  addMountains() {
    const scoreCtx = {
      cells: this.m_regionCells,
      region: this.m_landmassRegions[1],
      regions: this.m_landmassRegions,
      plateRegions: this.m_plateRegions,
      m_worldDims: this.m_worldDims,
      totalArea: 0,
      cellCount: 0,
      rules: this.m_rules.Mountains,
      wrap: this.m_wrapDistOpts
    };
    for (const rule of Object.values(this.m_rules.Mountains)) {
      if (rule.isActive) {
        rule.scoreAllCells(
          (cell) => cell.terrainType == TerrainType.Flat,
          scoreCtx,
          (cell) => this.m_landmassRegions[cell.landmassId]
        );
      }
    }
    const mountainSettings = this.getTypedSettings().mountain;
    const scoredCells = this.m_regionCells.filter((cell) => cell.currentScore > 0);
    scoredCells.sort((a, b) => b.currentScore - a.currentScore);
    const mountainVariance = (RandomImpl.fRand("Mountain Variance") * 2 - 1) * mountainSettings.variance;
    const percentMountains = (mountainSettings.percent + mountainVariance) * 0.01;
    const totalMountains = Math.round(scoredCells.length * percentMountains);
    const totalMountainsToConsider = totalMountains + mountainSettings.randomize * 0.01 * (scoredCells.length - totalMountains);
    let mountainCells = scoredCells.slice(0, totalMountainsToConsider);
    VoronoiUtils.shuffle(mountainCells, totalMountains);
    mountainCells = mountainCells.slice(0, totalMountains);
    mountainCells.forEach((cell) => {
      cell.terrainType = TerrainType.Mountainous;
      cell.currentScore = 0;
    });
    scoreCtx.rules = this.m_rules.Volcanoes;
    for (const rule of Object.values(this.m_rules.Volcanoes)) {
      if (rule.isActive) {
        rule.scoreCells(mountainCells, scoreCtx, (cell) => this.m_landmassRegions[cell.landmassId]);
      }
    }
    const volcanoSettings = this.getTypedSettings().volcano;
    const scoredVolcanoCells = mountainCells.filter((cell) => cell.currentScore > 0);
    scoredVolcanoCells.sort((a, b) => b.currentScore - a.currentScore);
    const volcanoVariance = (RandomImpl.fRand("Volcano Variance") * 2 - 1) * volcanoSettings.variance;
    const percentVolcanos = (volcanoSettings.percent + volcanoVariance) * 0.01;
    const totalVolcanos = Math.round(mountainCells.length * percentVolcanos);
    const totalVolcanosToConsider = totalVolcanos + volcanoSettings.randomize * 0.01 * (scoredVolcanoCells.length - totalVolcanos);
    let volcanoCells = scoredVolcanoCells.slice(0, totalVolcanosToConsider);
    VoronoiUtils.shuffle(volcanoCells, totalVolcanos);
    volcanoCells = volcanoCells.slice(0, totalVolcanos);
    volcanoCells.forEach((cell) => {
      cell.terrainType = TerrainType.Volcano;
    });
    this.m_regionCells.forEach((cell) => {
      cell.currentScore = 0;
    });
  }
  calculateElevation() {
    const scoreCtx = {
      cells: this.m_regionCells,
      region: this.m_landmassRegions[1],
      regions: this.m_landmassRegions,
      plateRegions: this.m_plateRegions,
      m_worldDims: this.m_worldDims,
      totalArea: 0,
      cellCount: 0,
      rules: this.m_rules.Elevation,
      wrap: this.m_wrapDistOpts
    };
    const quadRegion = new Aabb2({ x: 0, y: 0 }, this.m_worldDims);
    const quadGetPos = (item) => item.cell.site;
    const oceanQuadTree = new QuadTree(quadRegion, quadGetPos);
    for (const cell of this.m_regionCells) {
      if (cell.landmassId == 0) {
        oceanQuadTree.insert(cell);
      }
    }
    const elevationRules = Object.values(this.m_rules.Elevation);
    for (const rule of elevationRules) {
      if (rule.isActive) {
        if (rule.name == RuleAvoidOtherRegions.getName()) {
          const avoidOtherRegionsRule = rule;
          avoidOtherRegionsRule.setQuadTree(oceanQuadTree);
          avoidOtherRegionsRule.setFilter(
            (ctx, item) => ctx.region.getRegionIdForCell(item) == 0
          );
        }
        rule.scoreAllCells(
          (cell) => cell.terrainType != TerrainType.Ocean && cell.terrainType != TerrainType.Coast,
          scoreCtx,
          (cell) => this.m_landmassRegions[cell.landmassId]
        );
      }
    }
    this.m_regionCells.forEach((cell) => {
      cell.elevation = cell.currentScore / elevationRules.length;
      cell.currentScore = 0;
    });
  }
  buildLandmassRegions() {
    const regions = [new LandmassRegion("ocean", 0, 0, RegionType.Ocean, 0, 0)];
    const area = this.getUsableArea();
    const numLandmasses = this.getTypedSettings().landmass.length;
    for (let i = 0; i < numLandmasses; ++i) {
      const landmassSettings = this.getTypedSettings().landmass[i];
      if (!landmassSettings.enabled) {
        continue;
      }
      const landmassSize = landmassSettings.size * 0.01 * area + landmassSettings.variance * 0.01 * area * RandomImpl.fRand("Landmass " + i + " size variance") - landmassSettings.variance * 0.5;
      const landmassPlayerAreas = landmassSettings.playerAreas;
      const landmass = new LandmassRegion(
        "landmass" + i,
        1 + i,
        landmassSettings.groupId,
        RegionType.Landmass,
        landmassSize,
        landmassPlayerAreas
      );
      landmass.seedLocation.x = landmassSettings.xPos * this.m_worldDims.x;
      landmass.seedLocation.y = landmassSettings.yPos * this.m_worldDims.y;
      regions.push(landmass);
    }
    return regions;
  }
  getLandmasses() {
    return this.m_landmassRegions;
  }
  getPlates() {
    return this.m_plateRegions;
  }
  getPlateCells() {
    return this.m_plateCells;
  }
  getPlatesDiagram() {
    return this.m_platesDiagram || this.m_diagram;
  }
  getUsableArea() {
    const meridianMargin = 2;
    const polarMargin = 2;
    const width = this.m_worldDims.x - meridianMargin * 2;
    const height = this.m_worldDims.y - polarMargin * 2;
    return width * height;
  }
}

export { ContinentGenerator, continentGeneratorRulesSettings, continentGeneratorSchema };
//# sourceMappingURL=continent-generator.js.map
