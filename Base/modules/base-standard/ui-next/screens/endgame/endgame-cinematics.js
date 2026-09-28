import { ConstructibleHasTagType } from '../../../ui/utilities/utilities-tags.js';

const ENABLE_UNIT_CINEMATICS = false;
var POIType = /* @__PURE__ */ ((POIType2) => {
  POIType2["CITY"] = "City";
  POIType2["WONDER"] = "Wonder";
  POIType2["UNIT"] = "Unit";
  POIType2["BUILDING"] = "Building";
  POIType2["VICTORY"] = "Victory";
  return POIType2;
})(POIType || {});
const MAX_POINTS_OF_INTEREST = 10;
const MIN_CITY_POPULATION = 4;
const CAPITAL_SCORE = 100;
const POPULATION_SCORE = 1;
const WONDER_SCORE_AGE = 20;
const WONDER_SCORE_START = 50;
const WONDER_SCORE_DEC = 10;
const UNIT_PROMOTION_SCORE = 10;
const UNIT_FORMATION_SCORE = 5;
const MIN_UNIT_PROMOTION = 1;
const CINEMATIC_DURATION = 9.5;
const BASE_FLYOVER_CAMERA_PARAMS = {
  focusHeight: 10,
  cameraHeight: 85,
  focusRange: 64,
  targetDistance: 64 * 2.5,
  endpointRange: 64,
  curvature: 0.5,
  panStrength: 0.35,
  maxMovement: 150,
  primaryAngle: 180,
  duration: CINEMATIC_DURATION,
  easeInFactor: 1,
  easeOutFactor: 1
};
const CITY_CAMERA_PARAMS = {
  ...BASE_FLYOVER_CAMERA_PARAMS
};
const UNIT_CAMERA_PARAMS = {
  ...BASE_FLYOVER_CAMERA_PARAMS
};
const WONDER_CAMERA_PARAMS = {
  ...BASE_FLYOVER_CAMERA_PARAMS
};
const FIRST_FLYTHROUGH_CAMERA_PARAMS = {
  ...BASE_FLYOVER_CAMERA_PARAMS,
  easeInFactor: 1
  // Ease in only the first animation
};
const BASE_VICTORY_CAMERA_PARAMS = {
  focusHeight: 35,
  cameraHeight: 80,
  orbitRadius: 150,
  duration: 12,
  easeInFactor: 1.5,
  easeOutFactor: 1,
  arcHeight: 0,
  maxArcAngle: 60,
  leadInRange: 0,
  endAngleOffset: 10
};
const SCIENCE_VICTORY_CAMERA_PARAMS = {
  ...BASE_VICTORY_CAMERA_PARAMS,
  focusHeight: 75,
  cameraHeight: 150,
  orbitRadius: 190,
  duration: 12.8,
  easeInFactor: 2,
  easeOutFactor: 4,
  arcHeight: 10,
  maxArcAngle: -60
};
const MILITARY_VICTORY_CAMERA_PARAMS = {
  ...BASE_VICTORY_CAMERA_PARAMS
};
const DOMINATION_VICTORY_CAMERA_PARAMS = {
  ...BASE_VICTORY_CAMERA_PARAMS
};
const SCORE_VICTORY_CAMERA_PARAMS = {
  ...BASE_VICTORY_CAMERA_PARAMS
};
const CULTURE_VICTORY_CAMERA_PARAMS = {
  ...BASE_VICTORY_CAMERA_PARAMS
};
const ECONOMIC_VICTORY_CAMERA_PARAMS = {
  ...BASE_VICTORY_CAMERA_PARAMS
};
function getVictoryCinematicCameraParams(victoryClass) {
  if (victoryClass.length > 0) {
    const asset = victoryClass + "_CAMERA_SETTINGS";
    const params2 = Camera.findDynamicCameraSettings(asset);
    if (params2) {
      return params2;
    }
  }
  if (victoryClass == "VICTORY_CLASS_SCIENCE") {
    return SCIENCE_VICTORY_CAMERA_PARAMS;
  }
  if (victoryClass == "VICTORY_CLASS_MILITARY") {
    return MILITARY_VICTORY_CAMERA_PARAMS;
  }
  if (victoryClass == "VICTORY_CLASS_DOMINATION") {
    return DOMINATION_VICTORY_CAMERA_PARAMS;
  }
  if (victoryClass == "VICTORY_CLASS_SCORE") {
    return SCORE_VICTORY_CAMERA_PARAMS;
  }
  if (victoryClass == "VICTORY_CLASS_CULTURE") {
    return CULTURE_VICTORY_CAMERA_PARAMS;
  }
  if (victoryClass == "VICTORY_CLASS_ECONOMIC") {
    return ECONOMIC_VICTORY_CAMERA_PARAMS;
  }
  let params = Camera.findDynamicCameraSettings("GAME_VICTORY_DEFAULT_CAMERA_SETTINGS");
  if (!params) {
    params = Camera.findDynamicCameraSettings("DEFAULT_CAMERA_SETTINGS");
  }
  return params ? params : CITY_CAMERA_PARAMS;
}
class EndgameCinematicManager {
  pois = [];
  poiIndex = 0;
  playVFX = false;
  looping = false;
  running = false;
  camera = false;
  units = false;
  firstRun = false;
  timeout;
  lastPlot;
  currentPoi;
  cinematic;
  CinematicVFXModelGroup = null;
  onComplete;
  vfxQueue = [];
  awaitCinematicListener = this.awaitCinematic.bind(this);
  static instance = new EndgameCinematicManager();
  start(victory, onComplete) {
    if (this.running) {
      this.stop();
    }
    this.pois = this.getPointsOfInterest(victory);
    this.poiIndex = 0;
    this.looping = victory == void 0;
    this.playVFX = victory ? !victory.isDefeat : true;
    this.onComplete = onComplete;
    this.running = true;
    this.firstRun = true;
    this.CinematicVFXModelGroup = WorldUI.createModelGroup("CinematicVFXModelGroup");
    this.nextCinematic();
  }
  stop() {
    if (this.running) {
      this.endCinematic();
      if (this.CinematicVFXModelGroup) {
        this.CinematicVFXModelGroup.clear(true);
        this.CinematicVFXModelGroup.destroy();
        this.CinematicVFXModelGroup = null;
      }
      if (this.timeout != void 0) {
        window.clearTimeout(this.timeout);
        this.timeout = void 0;
      }
      this.pois = [];
      this.running = false;
    }
  }
  isCoastTile(plot) {
    const terrainType = GameplayMap.getTerrainType(plot.x, plot.y);
    return GameInfo.Terrains.lookup(terrainType)?.TerrainType === "TERRAIN_COAST";
  }
  startCinematic(poi) {
    if (poi.type == "Unit" /* UNIT */) {
      WorldUI.setUnitVisibility(true);
      this.units = true;
    }
    this.currentPoi = poi;
    this.lastPlot = poi.plot;
    if (poi.cinematic != void 0 && poi.cinematic) {
      this.cinematic = WorldUI.requestCinematic(poi.plot);
    } else if (poi.plot != void 0) {
      const surroundingPlots = [];
      surroundingPlots.push(poi.plot);
      for (let iDirection = 0; iDirection < DirectionTypes.NUM_DIRECTION_TYPES; iDirection++) {
        const adjacentPlot = GameplayMap.getAdjacentPlotLocation(poi.plot, iDirection);
        console.error("Adjacent Plot", iDirection);
        if (adjacentPlot && !this.isCoastTile(adjacentPlot)) {
          surroundingPlots.push(adjacentPlot);
        } else {
          surroundingPlots.push(poi.plot);
        }
      }
      if (this.CinematicVFXModelGroup) {
        this.CinematicVFXModelGroup.clear();
      }
      for (const plot of surroundingPlots) {
        const fireworksScale = 1;
        if (this.CinematicVFXModelGroup) {
          if (this.playVFX) {
            this.CinematicVFXModelGroup.addModelAtPlot(
              this.getCinematicPlotVFXAssetName(),
              plot,
              { x: 0, y: 0, z: 0 },
              { initialState: "REVEAL", placement: PlacementMode.WATER, scale: fireworksScale }
            );
          }
        }
      }
    }
    this.awaitCinematic();
  }
  awaitCinematic() {
    if (this.currentPoi == void 0 || this.camera) {
      return;
    }
    if (this.cinematic && !this.cinematic.isReady()) {
      window.requestAnimationFrame(this.awaitCinematicListener);
      return;
    }
    this.cinematic?.start();
    if (this.currentPoi.type == "Victory" /* VICTORY */) {
      Camera.pushDynamicCamera(this.currentPoi.plot, this.currentPoi.camera);
    } else {
      Camera.pushFlyoverCamera(this.currentPoi.plot, this.currentPoi.camera);
    }
    this.camera = true;
  }
  endCinematic() {
    if (this.cinematic) {
      this.cinematic.destroy();
      this.cinematic = void 0;
    }
    if (this.camera) {
      Camera.popCamera();
      this.camera = false;
    }
    if (this.units) {
      WorldUI.setUnitVisibility(false);
      this.units = false;
    }
    this.currentPoi = void 0;
  }
  nextCinematic() {
    this.endCinematic();
    if (this.pois.length === 0) {
      this.stop();
      this.onComplete?.();
      return;
    }
    if (!this.looping && this.poiIndex >= this.pois.length) {
      this.stop();
      this.onComplete?.();
      return;
    }
    if (this.lastPlot) {
      const MIN_DISTANCE = 3;
      const distance = (a, b) => {
        return GameplayMap.getPlotDistance(a.x, a.y, b.x, b.y);
      };
      const next = this.pois[this.poiIndex % this.pois.length];
      const dist = distance(this.lastPlot, next.plot);
      if (dist < MIN_DISTANCE) {
        const options = [];
        for (let i = 0; i < this.pois.length; i++) {
          const index = (this.poiIndex + i) % this.pois.length;
          if (distance(this.lastPlot, this.pois[index].plot) >= MIN_DISTANCE) {
            options.push(index);
          }
        }
        if (options.length > 0) {
          const swapIndex = options[Math.floor(Math.random() * options.length)];
          const nextIndex = this.poiIndex % this.pois.length;
          this.pois[nextIndex] = this.pois[swapIndex];
          this.pois[swapIndex] = next;
        }
      }
    }
    let poi = this.pois[this.poiIndex % this.pois.length];
    if (this.looping && this.firstRun) {
      poi = { ...poi, camera: FIRST_FLYTHROUGH_CAMERA_PARAMS };
      this.firstRun = false;
    }
    this.poiIndex++;
    this.startCinematic(poi);
    if (poi != void 0) {
      if (poi.camera != void 0 && poi.camera.duration != void 0) {
        this.timeout = window.setTimeout(this.nextCinematic.bind(this), poi.camera.duration * 1e3);
      } else {
        this.timeout = window.setTimeout(this.nextCinematic.bind(this), CINEMATIC_DURATION * 1e3);
      }
    }
  }
  getPointsOfInterest(victory) {
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      return [];
    }
    const results = [];
    const addCities = (scoreFunc) => {
      const playerCities = player.Cities;
      if (playerCities) {
        const cities = playerCities.getCities();
        for (const city of cities) {
          const score = scoreFunc(city);
          if (score > 0) {
            results.push({
              plot: city.location,
              desc: Locale.compose(city.name),
              score,
              type: "City" /* CITY */,
              camera: CITY_CAMERA_PARAMS
            });
          }
        }
      }
    };
    const addWonders = (scoreFunc) => {
      const wonders = player.Constructibles?.getWonders(player.id);
      if (wonders) {
        for (const wonder of wonders) {
          const constructible = Constructibles.getByComponentID(wonder);
          const info = constructible ? GameInfo.Constructibles.lookup(constructible.type) : void 0;
          if (constructible && info && constructible.complete && !constructible.damaged) {
            const score = scoreFunc(constructible);
            if (score > 0) {
              results.push({
                plot: constructible.location,
                desc: Locale.compose(info.Name),
                score,
                type: "Wonder" /* WONDER */,
                camera: WONDER_CAMERA_PARAMS
              });
            }
          }
        }
      }
    };
    const addBuildings = (scoreFunc) => {
      const constructibles = player.Constructibles?.getConstructibles();
      if (constructibles) {
        for (const constructible of constructibles) {
          const info = GameInfo.Constructibles.lookup(constructible.type);
          if (info && constructible.complete && !constructible.damaged) {
            const score = scoreFunc(constructible, info);
            if (score > 0) {
              results.push({
                plot: constructible.location,
                desc: Locale.compose(info.Name),
                score,
                type: "Building" /* BUILDING */,
                camera: CITY_CAMERA_PARAMS
              });
            }
          }
        }
      }
    };
    const addUnits = (scoreFunc) => {
      const playerUnits = player.Units?.getUnits();
      if (ENABLE_UNIT_CINEMATICS && playerUnits) {
        const excludedDistricts = [DistrictTypes.WONDER, DistrictTypes.URBAN, DistrictTypes.CITY_CENTER];
        const excludedActivities = [UnitActivityTypes.HEAL, UnitActivityTypes.SLEEP];
        for (const unit of playerUnits) {
          if (excludedActivities.includes(unit.activityType)) continue;
          const district = Districts.getAtLocation(unit.location);
          if (district && excludedDistricts.includes(district.type)) continue;
          const score = scoreFunc(unit);
          if (score > 0) {
            results.push({
              plot: unit.location,
              desc: `UNIT: ${unit.name}`,
              score,
              type: "Unit" /* UNIT */,
              camera: UNIT_CAMERA_PARAMS
            });
          }
        }
      }
    };
    const addCapitalFallback = () => {
      if (results.length == 0) {
        addCities((city) => {
          if (!city.isCapital) return 0;
          return CAPITAL_SCORE + city.population * POPULATION_SCORE;
        });
      }
    };
    let maxResults = MAX_POINTS_OF_INTEREST;
    if (victory != void 0) {
      maxResults = 1;
      switch (victory.victoryClass) {
        case "VICTORY_CLASS_SCIENCE": {
          player.Constructibles?.getConstructibles().forEach((constructible) => {
            const def = GameInfo.Constructibles.lookup(constructible.type);
            if (!constructible.complete || constructible.damaged) return;
            if (!def || def.ConstructibleType != "BUILDING_LAUNCH_PAD") return;
            const city = Cities.get(constructible.cityId);
            if (!city) return;
            const score = city.population + (city.isCapital ? 100 : 0);
            results.push({
              plot: constructible.location,
              desc: Locale.compose(def.Name),
              score,
              type: "Building" /* BUILDING */,
              camera: getVictoryCinematicCameraParams(victory.victoryClass),
              cinematic: true
            });
          });
          addCapitalFallback();
          break;
        }
        case "VICTORY_CLASS_CULTURE":
          addWonders((wonder) => {
            let age = 1;
            switch (wonder.ageControlled) {
              case Database.makeHash("AGE_EXPLORATION"):
                age = 2;
                break;
              case Database.makeHash("AGE_MODERN"):
                age = 3;
                break;
            }
            const maxTurns = Game.maxTurns > 0 ? Game.maxTurns : 1e3;
            age += wonder.turnControlled / maxTurns;
            return age * WONDER_SCORE_AGE;
          });
          addCapitalFallback();
          break;
        case "VICTORY_CLASS_ECONOMIC":
          addBuildings((building, def) => {
            if (ConstructibleHasTagType(def.ConstructibleType, "GOLD")) {
              const isCapital = Cities.get(building.cityId)?.isCapital ?? false;
              return def.Cost + (isCapital ? 200 : 100);
            }
            return 0;
          });
          addCapitalFallback();
          break;
        case "VICTORY_CLASS_MILITARY":
          addUnits((unit) => {
            const promotions = unit.Experience?.getNumPromotions;
            if (promotions) {
              if (MIN_UNIT_PROMOTION == 0 || promotions >= MIN_UNIT_PROMOTION) {
                const score = promotions * UNIT_PROMOTION_SCORE;
                return score + unit.formationUnitCount * UNIT_FORMATION_SCORE;
              }
            }
            return 0;
          });
          {
            const capital = player.Cities?.getCapital();
            const minPopulation = capital ? capital.population / 2 : MIN_CITY_POPULATION;
            addCities((city) => {
              if (city.isTown && !city.isOriginalCapital) return 0;
              if (city.originalOwner == GameContext.localPlayerID) return 0;
              if (city.population >= minPopulation) {
                const score = city.isOriginalCapital ? CAPITAL_SCORE : 0;
                return score + city.population * POPULATION_SCORE;
              }
              return 0;
            });
          }
          addCapitalFallback();
          break;
        default:
          addCapitalFallback();
          break;
      }
      for (const entry of results) {
        entry.camera = getVictoryCinematicCameraParams(victory.victoryClass);
        entry.type = "Victory" /* VICTORY */;
      }
    } else {
      addCities((city) => {
        if (city.isTown) return 0;
        if (city.population >= MIN_CITY_POPULATION || city.isCapital) {
          const score = city.isCapital ? CAPITAL_SCORE : 0;
          return score + city.population * POPULATION_SCORE;
        }
        return 0;
      });
      addUnits((unit) => {
        const promotions = unit.Experience?.getNumPromotions;
        if (promotions) {
          if (MIN_UNIT_PROMOTION == 0 || promotions >= MIN_UNIT_PROMOTION) {
            const score = promotions * UNIT_PROMOTION_SCORE;
            return score + unit.formationUnitCount * UNIT_FORMATION_SCORE;
          }
        }
        return 0;
      });
      let wonderScore = WONDER_SCORE_START;
      addWonders((_wonder) => {
        const score = wonderScore;
        wonderScore -= WONDER_SCORE_DEC;
        return score;
      });
      if (results.length < maxResults) {
        const playerCities = player.Cities;
        if (playerCities) {
          let cities = playerCities.getCities();
          cities.sort((a, b) => b.population - a.population);
          cities = cities.slice(0, maxResults);
          const missing = maxResults - results.length;
          const perCity = Math.ceil(missing / cities.length);
          for (const city of cities) {
            const districts = city.Districts?.getIdsOfType(DistrictTypes.URBAN);
            const plots = [];
            districts?.forEach((id) => {
              const district = Districts.get(id);
              if (district && !this.isCoastTile(district.location)) {
                plots.push(district.location);
              }
            });
            for (let i = 0; i < perCity; i++) {
              if (plots.length == 0) break;
              const index = Math.floor(Math.random() * plots.length);
              results.push({
                plot: plots[index],
                desc: Locale.compose(city.name),
                score: Math.random() * city.population * POPULATION_SCORE,
                type: "City" /* CITY */,
                camera: CITY_CAMERA_PARAMS
              });
              plots[index] = plots[plots.length - 1];
              plots.pop();
            }
          }
        }
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxResults);
  }
  getCinematicPlotVFXAssetName() {
    const vfxList = [
      "Cinematic_Victory_VFX",
      "Cinematic_Victory_VFX_02",
      "Cinematic_Victory_VFX_03",
      "Cinematic_Victory_VFX_04",
      "Cinematic_Victory_VFX_05",
      "Cinematic_Victory_VFX_06",
      "Cinematic_Victory_VFX_07"
    ];
    if (this.vfxQueue.length === 0) {
      this.vfxQueue = [...vfxList];
      for (let i = this.vfxQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.vfxQueue[i], this.vfxQueue[j]] = [this.vfxQueue[j], this.vfxQueue[i]];
      }
    }
    return this.vfxQueue.pop();
  }
}

export { EndgameCinematicManager };
//# sourceMappingURL=endgame-cinematics.js.map
