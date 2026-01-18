import { HexValidationSettings, RemoveBridgingCoastsOptions } from '../voronoi-hex.js';
import { MapDims, WrapType } from '../kd-tree.js';
import { GeneratorType } from '../voronoi_generators/map-generator.js';
import { UnifiedContinentsBase } from './unified-continents-base.js';
import '../../../core/scripts/MathHelpers.js';
import '../heap.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/voronoi.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/rbtree.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/vertex.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/edge.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/cell.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/diagram.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/halfedge.js';
import '../random-pcg-32.js';
import './map-common.js';
import '../voronoi-builder.js';
import '../voronoi_generators/continent-generator.js';
import '../quadtree.js';
import '../voronoi_rules/near-other-region.js';
import '../../../core/scripts/external/TypeScript-Voronoi-master/src/site.js';
import '../voronoi_rules/rules-base.js';
import '../voronoi-region.js';
import '../voronoi_rules/avoid-edge.js';
import '../voronoi_rules/avoid-other-regions.js';
import '../voronoi_rules/cell-area.js';
import '../voronoi_rules/near-map-center.js';
import '../voronoi_rules/near-neighbor.js';
import '../voronoi_rules/near-plate-boundary.js';
import '../voronoi_rules/near-region-seed.js';
import '../voronoi_rules/neighbors-in-region.js';
import '../voronoi_rules/prefer-latitude.js';

const shatteredSeasSettings = {
	generatorKey: 0,
	mapConfig: {
		totalLandmassSize: 45,
		maxSizeVariance: 15,
	},
	generatorConfig: {
		plate: {
			plateRotationMultiple: 5,
		},
		landmass: [
			{
				erosionPercent: 10,
				playerAreas: 2,
				coastalIslands: 12,
				coastalIslandsSize: 0.25,
			},
			{
				erosionPercent: 10,
				playerAreas: 2,
				coastalIslands: 12,
				coastalIslandsSize: 0.25,
			},
			{
				erosionPercent: 10,
				playerAreas: 2,
				coastalIslands: 12,
				coastalIslandsSize: 0.25,
			},
			{
				erosionPercent: 10,
				playerAreas: 2,
				coastalIslands: 12,
				coastalIslandsSize: 0.25,
			},
			{
				erosionPercent: 10,
				playerAreas: 2,
				coastalIslands: 12,
				coastalIslandsSize: 0.25,
			},
			{
				erosionPercent: 10,
				playerAreas: 2,
				coastalIslands: 12,
				coastalIslandsSize: 0.25,
			},
			{
				erosionPercent: 10,
				playerAreas: 2,
				coastalIslands: 12,
				coastalIslandsSize: 0.25,
			},
			{
				erosionPercent: 10,
				playerAreas: 2,
				coastalIslands: 12,
				coastalIslandsSize: 0.25,
			},
		],
		island: {
			totalSize: 5.5,
			variance: 1,
			meridianDistance: 3,
			erosionPercent: 15,
		},
		mountain: {
			percent: 12,
			randomize: 35,
		},
	},
	rulesConfig: {
		Plates: {
			"Cell Area.weight": 0.15,
			"Cell Area.isActive": true,
			"Near Neighbor.weight": 0.8,
			"Near Neighbor.isActive": true,
			"Near Neighbor.scaleFactor": 0.5,
			"Near Region Seed.weight": 0.02,
			"Near Region Seed.isActive": true,
			"Neighbors In Region.weight": 0.6,
			"Neighbors In Region.isActive": true,
			"Neighbors In Region.preferredNeighborCount": 6,
			"Neighbors In Region.deviation": 3,
		},
		Landmasses: {
			"Avoid Edge.weight": 1,
			"Avoid Edge.isActive": true,
			"Avoid Edge.poleDistanceFalloff": 2,
			"Avoid Edge.poleFalloffCurve": 0.2,
			"Avoid Edge.polePerturbationScale": 3,
			"Avoid Edge.polePerturbationWavelength": 2,
			"Avoid Edge.meridianDistanceFalloff": 6,
			"Avoid Edge.meridianFalloffCurve": 0.5,
			"Avoid Edge.avoidCorners": 12,
			"Cell Area.weight": 0.01,
			"Cell Area.isActive": true,
			"Near Neighbor.weight": 0.75,
			"Near Neighbor.isActive": true,
			"Near Region Seed.weight": 0.05,
			"Near Region Seed.isActive": true,
			"Near Region Seed.scaleFactor": 8,
			"Neighbors In Region.weight": 0.25,
			"Neighbors In Region.isActive": true,
			"Neighbors In Region.preferredNeighborCount": 3.5,
			"Neighbors In Region.deviation": 1.5,
			"Near Map Center.weight": 0.05,
			"Near Map Center.isActive": false,
			"Avoid Other Regions.weight": 1,
			"Avoid Other Regions.isActive": true,
			"Avoid Other Regions.minDistance": 2.5,
			"Avoid Other Regions.distanceFalloff": 3,
			"Avoid Other Regions.falloffCurve": 0.2,
			"Avoid Other Regions.regionType": 2,
			"Near Plate Boundary.weight": 0.75,
			"Near Plate Boundary.isActive": true,
			"Near Plate Boundary.scaleFactor": 1.5,
			"Prefer Latitude.weight": 0.76,
			"Prefer Latitude.isActive": true,
			"Prefer Latitude.overlap": 4,
			"Prefer Latitude.latitudes": [
				{
					latitude: 25,
					weight: 20,
				},
				{
					latitude: 45,
					weight: 20,
				},
				{
					latitude: 70,
					weight: 20,
				},
			],
			"Near Other Region.weight": 2,
			"Near Other Region.isActive": true,
			"Near Other Region.disableDistance": 3,
			"Near Other Region.scoreDistance": 15,
		},
		"Coastal Islands": {
			"Avoid Edge.weight": 1,
			"Avoid Edge.isActive": true,
			"Avoid Edge.poleDistanceFalloff": 2,
			"Avoid Edge.poleFalloffCurve": 0.2,
			"Avoid Edge.polePerturbationScale": 3,
			"Avoid Edge.polePerturbationWavelength": 2,
			"Avoid Edge.meridianDistanceFalloff": 5,
			"Avoid Edge.meridianFalloffCurve": 0.2,
			"Avoid Edge.avoidCorners": 12,
			"Near Neighbor.weight": 0.5,
			"Near Neighbor.isActive": true,
			"Avoid Other Landmass.weight": 1,
			"Avoid Other Landmass.isActive": true,
			"Avoid Other Landmass.minDistance": 2,
			"Avoid Other Landmass.distanceFalloff": 2,
			"Avoid Other Landmass.regionType": 2,
			"Avoid Other Landmass.regionId": 8,
			"Avoid Other Landmass.regionIdIsWhitelist": true,
			"Avoid Own Landmass.weight": 1,
			"Avoid Own Landmass.isActive": true,
			"Avoid Own Landmass.minDistance": 1,
			"Avoid Own Landmass.distanceFalloff": 2,
			"Avoid Own Landmass.regionType": 2,
			"Avoid Own Landmass.regionId": 8,
			"Avoid Islands.weight": 1,
			"Avoid Islands.isActive": true,
			"Avoid Islands.distanceFalloff": 2,
			"Avoid Islands.regionType": 3,
			"Near Plate Boundary.weight": 0.75,
			"Near Plate Boundary.isActive": true,
			"Near Plate Boundary.scaleFactor": 2,
			"Near Region Seed.weight": 0.3,
			"Near Region Seed.isActive": true,
			"Near Region Seed.scaleFactor": 15,
			"Near Region Seed.invert": 1,
		},
		Islands: {
			"Avoid Edge.weight": 1,
			"Avoid Edge.isActive": true,
			"Avoid Edge.poleDistanceFalloff": 4,
			"Avoid Edge.poleFalloffCurve": 0.5,
			"Avoid Edge.meridianDistance": 1,
			"Avoid Edge.meridianDistanceFalloff": 6,
			"Avoid Edge.meridianFalloffCurve": 0.5,
			"Avoid Edge.avoidCorners": 6,
			"Cell Area.weight": 0.15,
			"Cell Area.isActive": true,
			"Cell Area.scaleFactor": -0.2,
			"Near Neighbor.weight": 0.9,
			"Near Neighbor.isActive": true,
			"Near Neighbor.scaleFactor": 0.5,
			"Near Region Seed.weight": 0.03,
			"Near Region Seed.isActive": true,
			"Neighbors In Region.weight": 0.6,
			"Neighbors In Region.isActive": true,
			"Neighbors In Region.preferredNeighborCount": 1.5,
			"Neighbors In Region.deviation": 0.5,
			"Near Map Center.weight": 0.04,
			"Near Map Center.isActive": true,
			"Avoid Other Regions.weight": 1,
			"Avoid Other Regions.isActive": true,
			"Avoid Other Regions.falloffCurve": 0.15,
			"Avoid Other Regions.regionType": 2,
			"Near Plate Boundary.weight": 0.75,
			"Near Plate Boundary.isActive": true,
			"Near Plate Boundary.scaleFactor": 2,
			"Near Plate Boundary.directionInfluence": 0.8,
		},
		Mountains: {
			"Cell Area.weight": 0.3,
			"Cell Area.isActive": true,
			"Cell Area.invert": true,
			"Near Neighbor.weight": 0.25,
			"Near Neighbor.isActive": false,
			"Neighbors In Region.weight": 0.6,
			"Neighbors In Region.isActive": true,
			"Neighbors In Region.preferredNeighborCount": 6,
			"Neighbors In Region.deviation": 4,
			"Near Plate Boundary.weight": 0.75,
			"Near Plate Boundary.isActive": true,
			"Near Plate Boundary.scaleFactor": 1,
			"Near Plate Boundary.directionInfluence": 0.4,
		},
		Volcanoes: {
			"Cell Area.weight": 0.3,
			"Cell Area.isActive": true,
			"Cell Area.invert": true,
			"Neighbors In Region.weight": 0.9,
			"Neighbors In Region.isActive": true,
			"Neighbors In Region.preferredNeighborCount": 0,
		},
	},
};

class VoronoiShatteredSeas extends UnifiedContinentsBase {
  constructor() {
    const customSchema = {
      landmassFactor: {
        label: "Landmass Factor",
        description: "The number of main landmasses per player according to the standard player count of a specific map size.",
        default: 1,
        min: 0.5,
        max: 4,
        step: 0.1
      },
      totalPlayers: {
        label: "Total Players",
        description: "The number of total players for previewing purposes. This value is overridden in game.",
        default: 8,
        min: 1,
        max: 24,
        step: 1
      }
    };
    super(customSchema);
  }
  init(mapSize) {
    this.m_baseSchema.landmassCount.hidden = true;
    const tileCount = MapDims[mapSize].x * MapDims[mapSize].y;
    const landmassFactor = this.getTypedSettings().landmassFactor;
    this.m_settings.landmassCount = Math.round(tileCount * landmassFactor / 570);
    this.initInternal(
      mapSize,
      GeneratorType.Continent,
      shatteredSeasSettings,
      this.m_settings.voronoiCellCountMultiple,
      this.m_settings.voronoiRelaxationSteps,
      this.m_settings.wrapX == 1 ? WrapType.WrapX : WrapType.None
    );
    const hexValidationSettings = new HexValidationSettings();
    hexValidationSettings.removeBridgingLandmass = true;
    hexValidationSettings.removeBridgingCoasts = RemoveBridgingCoastsOptions.ISLANDS_ONLY;
    hexValidationSettings.firstIslandId = this.m_settings.landmassCount + 1;
    this.m_builder.getHexTiles().setValidationSettings(hexValidationSettings);
  }
  simulate() {
    const generatorSettings = this.getGenerator().getSettings();
    const landmassIds = Array.from({ length: generatorSettings.landmass.length }, (_v, i) => i);
    landmassIds.sort((a, b) => generatorSettings.landmass[b].size - generatorSettings.landmass[a].size);
    generatorSettings.landmass.forEach((value) => {
      value.playerAreas = 0;
    });
    for (let i = 0; i < this.getTypedSettings().totalPlayers; ++i) {
      const idx = landmassIds[i % landmassIds.length];
      ++generatorSettings.landmass[idx].playerAreas;
    }
    super.simulate();
  }
  createMajorPlayerAreas(valueFunction) {
    super.createMajorPlayerAreas(valueFunction);
    const generatorSettings = this.getGenerator().getSettings();
    let offset = 0;
    const offsets = [0].concat([
      ...generatorSettings.landmass.map((n) => {
        offset += n.playerAreas;
        return offset;
      })
    ]);
    this.getHexTiles().forAllTiles((tile) => {
      if (tile.landmassId > 0 && tile.landmassId <= this.m_settings.landmassCount) {
        if (tile.majorPlayerRegionId >= 0) {
          tile.majorPlayerRegionId += offsets[tile.landmassId - 1];
        }
        tile.landmassId = 1;
      } else if (tile.landmassId > this.m_settings.landmassCount) {
        tile.landmassId = 2;
      }
    });
  }
  static getName() {
    return "Shattered Seas";
  }
  getFilename() {
    return "shattered-seas.mapconfig.js";
  }
}

export { VoronoiShatteredSeas };
//# sourceMappingURL=shattered-seas.js.map
