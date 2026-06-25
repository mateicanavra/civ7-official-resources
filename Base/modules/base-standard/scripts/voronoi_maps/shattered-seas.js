import { HexValidationSettings, RemoveBridgingLandmassOptions, VoronoiValidationSettings, SeparationFilterOptions } from '../hex-map.js';
import { PlayerRegion } from '../player-areas.js';
import { RegionType } from '../voronoi-types.js';
import shatteredSeasSettings from '../voronoi_data/shattered-seas.mapconfig.js';
import { UnifiedContinentsBase } from './unified-continents-base.js';

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
      distantFactor: {
        label: "distant Factor",
        description: "The number of distant landmasses per player according to the standard player count of a specific map size.",
        default: 0.33,
        min: 0,
        max: 1,
        step: 0.01
      }
    };
    super(customSchema, shatteredSeasSettings);
  }
  init(hexDims) {
    this.m_baseSchema.landmassCount.hidden = true;
    this.m_baseSchema.distantCount.hidden = true;
    this.initInternal(hexDims);
  }
  simulateInternal() {
    const tileCount = this.m_hexDims.x * this.m_hexDims.y;
    const landmassFactor = this.getSettings().landmassFactor;
    const distantFactor = this.getSettings().distantFactor;
    const playerCountFactor = 570;
    this.m_settings.landmassCount = Math.round(tileCount * landmassFactor / playerCountFactor);
    this.m_settings.distantCount = Math.round(tileCount * distantFactor / playerCountFactor);
    this.m_settings.enforceGroupConstraints = 1;
    this.m_settings.minDistantSpawnCenterDistance = 0.25;
    this.m_settings.maxDistantSpawnCenterDistance = 0.5;
    const hexValidationSettings = new HexValidationSettings();
    hexValidationSettings.removeBridgingPlayerLandmasses = RemoveBridgingLandmassOptions.FORCE_COASTS;
    this.getHexTiles().setValidationSettings(hexValidationSettings);
    super.simulateInternal();
  }
  getVoronoiValidationSettings() {
    const voronoiValidationSettings = new VoronoiValidationSettings();
    voronoiValidationSettings.forceOceans = SeparationFilterOptions.DIFFERENT_LANDMASS_GROUPS;
    voronoiValidationSettings.forceCoasts = SeparationFilterOptions.ALL;
    return voronoiValidationSettings;
  }
  /**
   * Creates major player areas by assigning players to landmasses in a round-robin fashion.
   *
   * Landmasses are sorted by size (largest first) and players are distributed across them.
   * Player area IDs are adjusted based on landmass offsets, and landmass IDs are normalized
   * (set to 1 for non-island continents, 0 otherwise).
   *
   * @param valueFunction - Optional function to evaluate tile values for area assignment
   * @remarks
   * - All landmasses should be close in size for balanced distribution
   * - The map is treated as a "pangaea" where player regions span across landmasses
   * - Non-island regions in group 0 have their landmassId set to 1, others to 0
   */
  createMajorPlayerAreas(valueFunction) {
    const regions = this.getGenerator().getLandmasses();
    const landmassIds = regions.reduce((out, value, index) => {
      if (value.groupId > 0 && value.type == RegionType.Landmass) out.push(index);
      return out;
    }, []);
    landmassIds.sort((a, b) => regions[b].cellCount - regions[a].cellCount);
    const playerRegions = new Array(landmassIds.length);
    for (let i = 0; i < playerRegions.length; ++i) {
      playerRegions[i] = new PlayerRegion();
      playerRegions[i].id = landmassIds[i];
      playerRegions[i].filter = (tile) => {
        const cell = this.getRegionCellForHex(tile.coord.x, tile.coord.y);
        return cell?.landmassId === landmassIds[i];
      };
    }
    for (let i = 0; i < this.getSettings().totalPlayers; ++i) {
      ++playerRegions[i % landmassIds.length].playerAreas;
    }
    super.createMajorPlayerAreas(valueFunction, playerRegions);
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
