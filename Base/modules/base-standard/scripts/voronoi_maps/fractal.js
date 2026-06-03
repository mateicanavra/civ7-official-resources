import { RandomImpl } from '../random-pcg-32.js';
import { HexValidationSettings, RemoveBridgingCoastsOptions } from '../voronoi-hex.js';
import { MapDims, MapSize } from '../voronoi-types.js';
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
    hexValidationSettings.removeBridgingLandmass = false;
    hexValidationSettings.removeBridgingCoasts = RemoveBridgingCoastsOptions.DIFFERENT_TYPES | RemoveBridgingCoastsOptions.DIFFERENT_LANDMASS_GROUPS;
    hexValidationSettings.polarMargin = 1;
    this.getHexTiles().setValidationSettings(hexValidationSettings);
    super.simulateInternal();
  }
  createMajorPlayerAreas(valueFunction) {
    if (this.m_hexStats == null) {
      console.warn("Hex stats not found when creating major player areas, calculating now...");
      this.m_hexStats = this.getHexTiles().calculatePlayerLandmasses();
    }
    const totalTiles = this.m_hexDims.x * this.m_hexDims.y;
    const distantTileLandCount = this.m_hexStats.landmass[0].land;
    const distantTileCoastCount = this.m_hexStats.landmass[0].coast;
    const totalLandTiles = this.m_hexStats.landmass.reduce(
      (sum, landmass, idx) => sum + (idx > 0 ? landmass.land : 0),
      0
    );
    const totalCoastTiles = this.m_hexStats.landmass.reduce(
      (sum, landmass, idx) => sum + (idx > 0 ? landmass.coast : 0),
      0
    );
    console.log(
      `Ratios: ${(totalLandTiles / totalTiles).toPrecision(3)} player land,  ${(totalCoastTiles / totalTiles).toPrecision(3)} player coast, ${(distantTileLandCount / totalTiles).toPrecision(3)} distant land, ${(distantTileCoastCount / totalTiles).toPrecision(3)} distant coast,`
    );
    const minScore = 50;
    const calcScore = (landmass) => landmass.land + landmass.coast * 0.6;
    const eligible = (score) => score >= minScore;
    const totalSpaceScore = this.m_hexStats.landmass.reduce(
      (p, c, idx) => idx > 0 && eligible(calcScore(c)) ? p + calcScore(c) : p,
      0
    );
    const totalPlayers = this.getSettings().totalPlayers;
    console.log(`Total score is ${totalSpaceScore}, ignoring regions lower than ${minScore}`);
    const playerAreas = [];
    const remainders = [];
    let playersAllocated = 0;
    for (let i = 1; i < this.m_hexStats.landmass.length; ++i) {
      const playerLandmass = this.m_hexStats.landmass[i];
      const spaceScore = calcScore(playerLandmass);
      const spaceRatio = eligible(spaceScore) ? spaceScore / totalSpaceScore : 0;
      const exactPlayerCount = spaceRatio * totalPlayers;
      const playerCount = Math.floor(spaceRatio * totalPlayers);
      playersAllocated += playerCount;
      const id = i + 1;
      const playerRegion = {
        id,
        playerAreas: playerCount,
        filter: (tile) => tile.playerLandmassId == i
      };
      playerAreas.push(playerRegion);
      remainders.push({ frac: exactPlayerCount - playerCount, idx: i - 1 });
    }
    let playersLeft = totalPlayers - playersAllocated;
    remainders.sort((a, b) => b.frac - a.frac || a.idx - b.idx);
    for (let i = 0; i < remainders.length && playersLeft > 0; ++i, --playersLeft) {
      ++playerAreas[remainders[i].idx].playerAreas;
    }
    super.createMajorPlayerAreas(valueFunction, playerAreas);
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
